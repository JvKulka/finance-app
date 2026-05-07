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
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/useI18n";

interface CreateAccountDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateAccountDialog({ children, onSuccess }: CreateAccountDialogProps) {
  const { locale } = useI18n();
  const isPt = locale === "pt";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"personal" | "business">("personal");
  const utils = trpc.useUtils();

  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: async () => {
      toast.success(isPt ? "Conta criada com sucesso!" : "¡Cuenta creada con éxito!");
      setOpen(false);
      setName("");
      setType("personal");
      await utils.accounts.list.invalidate();

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
      toast.error(`${isPt ? "Erro ao criar conta" : "Error al crear la cuenta"}: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isPt ? "Por favor, informe o nome da conta" : "Por favor, ingresá el nombre de la cuenta");
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
            <DialogTitle>{isPt ? "Criar Nova Conta" : "Crear Nueva Cuenta"}</DialogTitle>
            <DialogDescription>
              {isPt
                ? "Crie uma conta para começar a gerenciar suas finanças. Você pode criar contas separadas para uso pessoal e empresarial."
                : "Creá una cuenta para empezar a gestionar tus finanzas. Podés crear cuentas separadas para uso personal y empresarial."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{isPt ? "Nome da Conta" : "Nombre de la Cuenta"}</Label>
              <Input
                id="name"
                placeholder={isPt ? "Ex: Conta Pessoal, Empresa X" : "Ej: Cuenta Personal, Empresa X"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">{isPt ? "Tipo de Conta" : "Tipo de Cuenta"}</Label>
              <Select value={type} onValueChange={(value) => setType(value as "personal" | "business")} disabled={createMutation.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">{isPt ? "Empresarial" : "Empresarial"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
              {isPt ? "Cancelar" : "Cancelar"}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPt ? "Criar Conta" : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
