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
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ScheduledPaymentDialogProps {
  children: React.ReactNode;
  accountId: number;
  payment?: any;
  initialDate?: Date;
  onSuccess?: () => void;
}

export default function ScheduledPaymentDialog({ children, accountId, payment, initialDate, onSuccess }: ScheduledPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(payment?.description || "");
  const [amount, setAmount] = useState(payment?.amount ? (payment.amount / 100).toFixed(2) : "");
  const [dueDate, setDueDate] = useState(
    payment?.dueDate 
      ? new Date(payment.dueDate).toISOString().split("T")[0] 
      : initialDate 
        ? initialDate.toISOString().split("T")[0]
        : ""
  );
  const [categoryId, setCategoryId] = useState<string>(payment?.categoryId?.toString() || "");
  const [creditCardId, setCreditCardId] = useState<string>(payment?.creditCardId?.toString() || "");
  const [isRecurring, setIsRecurring] = useState(payment?.isRecurring || false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    payment?.recurrenceFrequency || "monthly"
  );
  const [isPriority, setIsPriority] = useState(payment?.isPriority || false);

  const utils = trpc.useUtils();

  const { data: categories } = trpc.categories.list.useQuery({ accountId }, { enabled: !!accountId });
  const { data: creditCards } = trpc.creditCards.list.useQuery({ accountId }, { enabled: !!accountId });

  useEffect(() => {
    if (open && !payment) {
      setDescription("");
      setAmount("");
      setDueDate("");
      setCategoryId("");
      setCreditCardId("");
      setIsRecurring(false);
      setRecurrenceFrequency("monthly");
      setIsPriority(false);
    } else if (open && payment) {
      setDescription(payment.description || "");
      setAmount(payment.amount ? (payment.amount / 100).toFixed(2) : "");
      setDueDate(payment.dueDate ? new Date(payment.dueDate).toISOString().split("T")[0] : "");
      setCategoryId(payment.categoryId?.toString() || "");
      setCreditCardId(payment.creditCardId?.toString() || "");
      setIsRecurring(payment.isRecurring || false);
      setRecurrenceFrequency(payment.recurrenceFrequency || "monthly");
      setIsPriority(payment.isPriority || false);
    }
  }, [open, payment]);

  const createMutation = trpc.scheduledPayments.create.useMutation({
    onSuccess: () => {
      toast.success("Pagamento agendado criado com sucesso!");
      setOpen(false);
      utils.scheduledPayments.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const updateMutation = trpc.scheduledPayments.update.useMutation({
    onSuccess: () => {
      toast.success("Pagamento agendado atualizado com sucesso!");
      setOpen(false);
      utils.scheduledPayments.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Por favor, informe a descrição");
      return;
    }

    if (!categoryId) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Por favor, informe um valor válido");
      return;
    }

    if (!dueDate) {
      toast.error("Por favor, informe a data de vencimento");
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (payment) {
      updateMutation.mutate({
        id: payment.id,
        description: description.trim(),
        amount: amountInCents,
        dueDate,
        isPriority,
      });
    } else {
      createMutation.mutate({
        accountId,
        categoryId: parseInt(categoryId),
        creditCardId: creditCardId ? parseInt(creditCardId) : undefined,
        description: description.trim(),
        amount: amountInCents,
        dueDate,
        isRecurring,
        recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
        isPriority,
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
            <DialogTitle>{payment ? "Editar Agendamento" : "Novo Pagamento Agendado"}</DialogTitle>
            <DialogDescription>
              {payment ? "Atualize os dados do pagamento agendado" : "Agende um pagamento futuro"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Conta de luz, Aluguel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value || "")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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

            <div className="grid gap-2">
              <Label htmlFor="creditCard">Cartão de Crédito (opcional)</Label>
              <Select value={creditCardId || undefined} onValueChange={(value) => setCreditCardId(value || "")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {creditCards && creditCards.length > 0 ? (
                    creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id.toString()}>
                        {card.name} (••{card.lastFourDigits})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum cartão disponível</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {!payment && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                    disabled={isPending}
                  />
                  <Label htmlFor="isRecurring" className="cursor-pointer">
                    Pagamento recorrente
                  </Label>
                </div>

                {isRecurring && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurrenceFrequency">Frequência</Label>
                    <Select
                      value={recurrenceFrequency}
                      onValueChange={(value) => setRecurrenceFrequency(value as "daily" | "weekly" | "monthly" | "yearly")}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPriority"
                checked={isPriority}
                onCheckedChange={(checked) => setIsPriority(checked as boolean)}
                disabled={isPending}
              />
              <Label htmlFor="isPriority" className="cursor-pointer">
                Prioridade alta
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {payment ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

