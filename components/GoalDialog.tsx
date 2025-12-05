import { useState, useEffect } from "react";
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

interface GoalDialogProps {
  children: React.ReactNode;
  accountId: number;
  goal?: any;
  onSuccess?: () => void;
}

export default function GoalDialog({ children, accountId, goal, onSuccess }: GoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount ? (goal.targetAmount / 100).toFixed(2) : "");
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount ? (goal.currentAmount / 100).toFixed(2) : "0.00");
  const [deadline, setDeadline] = useState(
    goal?.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : ""
  );
  const [type, setType] = useState<"savings" | "spending_limit" | "income" | "emergency_fund">(goal?.type || "savings");
  const [categoryId, setCategoryId] = useState<string>(goal?.categoryId?.toString() || "");

  const utils = trpc.useUtils();

  // Fetch categories
  const { data: categories } = trpc.categories.list.useQuery(
    { accountId },
    { enabled: !!accountId }
  );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && !goal) {
      setName("");
      setTargetAmount("");
      setCurrentAmount("0.00");
      setDeadline("");
      setType("savings");
      setCategoryId("");
    } else if (open && goal) {
      setName(goal.name || "");
      setTargetAmount(goal.targetAmount ? (goal.targetAmount / 100).toFixed(2) : "");
      setCurrentAmount(goal.currentAmount ? (goal.currentAmount / 100).toFixed(2) : "0.00");
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "");
      setType(goal.type || "savings");
      setCategoryId(goal.categoryId?.toString() || "");
    }
  }, [open, goal]);

  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("Meta criada com sucesso!");
      setOpen(false);
      utils.goals.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });

  const updateMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("Meta atualizada com sucesso!");
      setOpen(false);
      utils.goals.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar meta: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, informe o nome da meta");
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error("Por favor, informe um valor alvo válido");
      return;
    }

    const targetAmountInCents = Math.round(parseFloat(targetAmount) * 100);
    const currentAmountInCents = Math.round(parseFloat(currentAmount || "0") * 100);

    if (goal) {
      // Update existing goal
      updateMutation.mutate({
        id: goal.id,
        name: name.trim(),
        targetAmount: targetAmountInCents,
        currentAmount: currentAmountInCents,
        deadline: deadline || undefined,
      });
    } else {
      // Create new goal
      createMutation.mutate({
        accountId,
        name: name.trim(),
        targetAmount: targetAmountInCents,
        deadline: deadline || undefined,
        type,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{goal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
            <DialogDescription>
              {goal ? "Atualize os dados da meta" : "Crie uma nova meta financeira"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input
                id="name"
                placeholder="Ex: Reserva de emergência, Viagem"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as "savings" | "spending_limit" | "income" | "emergency_fund")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Economia</SelectItem>
                  <SelectItem value="spending_limit">Limite de Gasto</SelectItem>
                  <SelectItem value="income">Renda</SelectItem>
                  <SelectItem value="emergency_fund">Reserva de Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Amount and Current Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Valor Alvo (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Category (optional) */}
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value || "")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma categoria disponível</div>
                  )}
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

