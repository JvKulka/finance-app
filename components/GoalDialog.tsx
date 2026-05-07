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
import { convertFromBaseCurrency, getAppCurrencySymbol, parseCurrencyInput } from "@/lib/i18n/currency";
import { useSystemPreferences } from "@/lib/i18n/preferences";

interface GoalDialogProps {
  children: React.ReactNode;
  accountId: number;
  goal?: any;
  onSuccess?: () => void;
}

export default function GoalDialog({ children, accountId, goal, onSuccess }: GoalDialogProps) {
  const { currency } = useSystemPreferences();
  const currencySymbol = getAppCurrencySymbol(currency);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(
    goal?.targetAmount ? String(convertFromBaseCurrency(goal.targetAmount, currency)) : ""
  );
  const [currentAmount, setCurrentAmount] = useState(
    goal?.currentAmount ? String(convertFromBaseCurrency(goal.currentAmount, currency)) : "0"
  );
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
      setCurrentAmount("0");
      setDeadline("");
      setType("savings");
      setCategoryId("");
    } else if (open && goal) {
      setName(goal.name || "");
      setTargetAmount(goal.targetAmount ? String(convertFromBaseCurrency(goal.targetAmount, currency)) : "");
      setCurrentAmount(goal.currentAmount ? String(convertFromBaseCurrency(goal.currentAmount, currency)) : "0");
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "");
      setType(goal.type || "savings");
      setCategoryId(goal.categoryId?.toString() || "");
    }
  }, [open, goal, currency]);

  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("¡Objetivo creado con éxito!");
      setOpen(false);
      utils.goals.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error al crear el objetivo: ${error.message}`);
    },
  });

  const updateMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      toast.success("¡Objetivo actualizado con éxito!");
      setOpen(false);
      utils.goals.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error al actualizar el objetivo: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, ingresá el nombre del objetivo");
      return;
    }

    const targetValue = parseCurrencyInput(targetAmount, { currency });
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      toast.error("Por favor, ingresá un monto objetivo válido");
      return;
    }

    const currentRaw = parseCurrencyInput(currentAmount || "0", { currency });
    const currentValue = Number.isFinite(currentRaw) ? Math.max(currentRaw, 0) : 0;

    if (goal) {
      updateMutation.mutate({
        id: goal.id,
        name: name.trim(),
        targetAmount: targetValue,
        currentAmount: currentValue,
        deadline: deadline || undefined,
      });
    } else {
      createMutation.mutate({
        accountId,
        name: name.trim(),
        targetAmount: targetValue,
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
            <DialogTitle>{goal ? "Editar Objetivo" : "Nuevo Objetivo"}</DialogTitle>
            <DialogDescription>
              {goal ? "Actualizá los datos del objetivo" : "Creá un nuevo objetivo financiero"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Objetivo</Label>
              <Input
                id="name"
                placeholder="Ej: Fondo de emergencia, Viaje"
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
                  <SelectItem value="savings">Ahorro</SelectItem>
                  <SelectItem value="spending_limit">Límite de Gasto</SelectItem>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="emergency_fund">Fondo de Emergencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Amount and Current Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Monto Objetivo ({currencySymbol})</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentAmount">Monto Actual ({currencySymbol})</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label htmlFor="deadline">Plazo (opcional)</Label>
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
              <Label htmlFor="category">Categoría (opcional)</Label>
              <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value || "")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Ninguna" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No hay categorías disponibles</div>
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
              {goal ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

