import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateAccountDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateAccountDialog({ children, onSuccess }: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"personal" | "business">("personal");
  const utils = trpc.useUtils();

  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: async () => {
      toast.success("Conta criada com sucesso!");
      setOpen(false);
      setName("");
      setType("personal");
      await utils.accounts.list.invalidate();
      
      // Seed categories for the new account
      try {
        const response = await fetch("/api/seed-categories", { method: "POST" });
        if (response.ok) {
          await utils.categories.list.invalidate();
        }
      } catch (error) {
        console.error("Failed to seed categories:", error);
      }
      
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar conta: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, informe o nome da conta");
      return;
    }
    createMutation.mutate({ name: name.trim(), type });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Conta</DialogTitle>
            <DialogDescription>
              Crie uma conta para começar a gerenciar suas finanças. Você pode criar contas separadas para uso pessoal e
              empresarial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                placeholder="Ex: Conta Pessoal, Empresa X"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Conta</Label>
              <Select value={type} onValueChange={(value) => setType(value as "personal" | "business")} disabled={createMutation.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="business">Empresarial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
