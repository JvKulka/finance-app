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
import { convertFromBaseCurrency, getAppCurrencySymbol, parseCurrencyInput } from "@/lib/i18n/currency";
import { useSystemPreferences } from "@/lib/i18n/preferences";
import { useI18n } from "@/lib/i18n/useI18n";

interface ScheduledPaymentDialogProps {
  children: React.ReactNode;
  accountId: number;
  payment?: any;
  initialDate?: Date;
  onSuccess?: () => void;
}

export default function ScheduledPaymentDialog({ children, accountId, payment, initialDate, onSuccess }: ScheduledPaymentDialogProps) {
  const { locale } = useI18n();
  const isPt = locale === "pt";
  const { currency } = useSystemPreferences();
  const currencySymbol = getAppCurrencySymbol(currency);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(payment?.description || "");
  const [amount, setAmount] = useState(
    payment?.amount ? String(convertFromBaseCurrency(payment.amount, currency)) : ""
  );
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
      setAmount(payment.amount ? String(convertFromBaseCurrency(payment.amount, currency)) : "");
      setDueDate(payment.dueDate ? new Date(payment.dueDate).toISOString().split("T")[0] : "");
      setCategoryId(payment.categoryId?.toString() || "");
      setCreditCardId(payment.creditCardId?.toString() || "");
      setIsRecurring(payment.isRecurring || false);
      setRecurrenceFrequency(payment.recurrenceFrequency || "monthly");
      setIsPriority(payment.isPriority || false);
    }
  }, [open, payment, currency]);

  const createMutation = trpc.scheduledPayments.create.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Pagamento programado criado com sucesso!" : "¡Pago programado creado con éxito!");
      setOpen(false);
      utils.scheduledPayments.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao criar pagamento programado" : "Error al crear el pago programado"}: ${error.message}`);
    },
  });

  const updateMutation = trpc.scheduledPayments.update.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Pagamento programado atualizado com sucesso!" : "¡Pago programado actualizado con éxito!");
      setOpen(false);
      utils.scheduledPayments.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao atualizar pagamento programado" : "Error al actualizar el pago programado"}: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error(isPt ? "Por favor, informe a descrição" : "Por favor, ingresá la descripción");
      return;
    }

    if (!categoryId) {
      toast.error(isPt ? "Por favor, selecione uma categoria" : "Por favor, seleccioná una categoría");
      return;
    }

    const amountValue = parseCurrencyInput(amount, { currency });
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error(isPt ? "Por favor, informe um valor válido" : "Por favor, ingresá un monto válido");
      return;
    }

    if (!dueDate) {
      toast.error(isPt ? "Por favor, informe a data de vencimento" : "Por favor, ingresá la fecha de vencimiento");
      return;
    }

    if (payment) {
      updateMutation.mutate({
        id: payment.id,
        description: description.trim(),
        amount: amountValue,
        dueDate,
        isPriority,
      });
    } else {
      createMutation.mutate({
        accountId,
        categoryId: parseInt(categoryId),
        creditCardId: creditCardId ? parseInt(creditCardId) : undefined,
        description: description.trim(),
        amount: amountValue,
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
            <DialogTitle>{payment ? (isPt ? "Editar Pagamento Programado" : "Editar Pago Programado") : (isPt ? "Novo Pagamento Programado" : "Nuevo Pago Programado")}</DialogTitle>
            <DialogDescription>
              {payment
                ? isPt ? "Atualize os dados do pagamento programado" : "Actualizá los datos del pago programado"
                : isPt ? "Programe um pagamento futuro" : "Programá un pago futuro"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">{isPt ? "Descrição" : "Descripción"}</Label>
              <Input
                id="description"
                placeholder={isPt ? "Ex: Conta de luz, Aluguel" : "Ej: Factura de luz, Alquiler"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">{isPt ? "Valor" : "Monto"} ({currencySymbol})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">{isPt ? "Data de Vencimento" : "Fecha de Vencimiento"}</Label>
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
              <Label htmlFor="category">{isPt ? "Categoria" : "Categoría"}</Label>
              <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value || "")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder={isPt ? "Selecione uma categoria" : "Seleccioná una categoría"} />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">{isPt ? "Não há categorias disponíveis" : "No hay categorías disponibles"}</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creditCard">{isPt ? "Cartão de Crédito (opcional)" : "Tarjeta de Crédito (opcional)"}</Label>
              <Select value={creditCardId || undefined} onValueChange={(value) => setCreditCardId(value || "")} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder={isPt ? "Nenhum" : "Ninguna"} />
                </SelectTrigger>
                <SelectContent>
                  {creditCards && creditCards.length > 0 ? (
                    creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id.toString()}>
                        {card.name} (••{card.lastFourDigits})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">{isPt ? "Não há cartões disponíveis" : "No hay tarjetas disponibles"}</div>
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
                    {isPt ? "Pagamento recorrente" : "Pago recurrente"}
                  </Label>
                </div>

                {isRecurring && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurrenceFrequency">{isPt ? "Frequência" : "Frecuencia"}</Label>
                    <Select
                      value={recurrenceFrequency}
                      onValueChange={(value) => setRecurrenceFrequency(value as "daily" | "weekly" | "monthly" | "yearly")}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{isPt ? "Diário" : "Diario"}</SelectItem>
                        <SelectItem value="weekly">{isPt ? "Semanal" : "Semanal"}</SelectItem>
                        <SelectItem value="monthly">{isPt ? "Mensal" : "Mensual"}</SelectItem>
                        <SelectItem value="yearly">{isPt ? "Anual" : "Anual"}</SelectItem>
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
                {isPt ? "Prioridade alta" : "Prioridad alta"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {isPt ? "Cancelar" : "Cancelar"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {payment ? (isPt ? "Atualizar" : "Actualizar") : (isPt ? "Criar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

