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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TransactionDialogProps {
  children: React.ReactNode;
  accountId: number;
  transaction?: any;
  onSuccess?: () => void;
}

export default function TransactionDialog({ children, accountId, transaction, onSuccess }: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">(transaction?.type || "expense");
  const [categoryId, setCategoryId] = useState<string>(transaction?.categoryId?.toString() || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [amount, setAmount] = useState(transaction?.amount ? (transaction.amount / 100).toFixed(2) : "");
  const [transactionDate, setTransactionDate] = useState(
    transaction?.transactionDate ? format(new Date(transaction.transactionDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || "");
  const [status, setStatus] = useState<"paid" | "pending">(transaction?.status || "paid");
  const [expenseType, setExpenseType] = useState<"fixed" | "variable">(transaction?.expenseType || "variable");
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);
  const [creditCardId, setCreditCardId] = useState<string>(transaction?.creditCardId?.toString() || "");

  const utils = trpc.useUtils();

  // Fetch categories
  const { data: categories } = trpc.categories.list.useQuery(
    { accountId },
    { enabled: !!accountId }
  );

  // Fetch credit cards
  const { data: creditCards } = trpc.creditCards.list.useQuery(
    { accountId },
    { enabled: !!accountId }
  );

  // Filter categories by type
  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  // Reset category when type changes
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.id.toString() === categoryId)) {
      setCategoryId("");
    }
  }, [type, filteredCategories, categoryId]);

  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transação criada com sucesso!");
      setOpen(false);
      resetForm();
      utils.transactions.list.invalidate();
      utils.dashboard.summary.invalidate();
      utils.dashboard.expensesByCategory.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar transação: ${error.message}`);
    },
  });

  const updateMutation = trpc.transactions.update.useMutation({
    onSuccess: () => {
      toast.success("Transação atualizada com sucesso!");
      setOpen(false);
      utils.transactions.list.invalidate();
      utils.dashboard.summary.invalidate();
      utils.dashboard.expensesByCategory.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar transação: ${error.message}`);
    },
  });

  const resetForm = () => {
    setType("expense");
    setCategoryId("");
    setDescription("");
    setAmount("");
    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
    setPaymentMethod("");
    setStatus("paid");
    setExpenseType("variable");
    setIsRecurring(false);
    setCreditCardId("");
  };

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

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (transaction) {
      // Update existing transaction
      updateMutation.mutate({
        id: transaction.id,
        categoryId: parseInt(categoryId),
        creditCardId: creditCardId ? parseInt(creditCardId) : undefined,
        description: description.trim(),
        amount: amountInCents,
        transactionDate,
        paymentMethod: paymentMethod || undefined,
        status,
        expenseType: type === "expense" ? expenseType : undefined,
      });
    } else {
      // Create new transaction
      createMutation.mutate({
        accountId,
        categoryId: parseInt(categoryId),
        creditCardId: creditCardId ? parseInt(creditCardId) : undefined,
        description: description.trim(),
        amount: amountInCents,
        type,
        transactionDate,
        paymentMethod: paymentMethod || undefined,
        status,
        expenseType: type === "expense" ? expenseType : undefined,
        isRecurring,
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
            <DialogTitle>{transaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
            <DialogDescription>
              {transaction ? "Atualize os dados da transação" : "Registre uma nova receita ou despesa"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Type */}
            {!transaction && (
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(value) => setType(value as "income" | "expense")} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Ex: Compra no supermercado"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={2}
              />
            </div>

            {/* Amount and Date */}
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Payment Method and Credit Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento (opcional)</Label>
                <Select value={paymentMethod || undefined} onValueChange={(value) => setPaymentMethod(value || "")} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="debito">Cartão de Débito</SelectItem>
                    <SelectItem value="credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
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
            </div>

            {/* Status and Expense Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Situação</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as "paid" | "pending")} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {type === "expense" && (
                <div className="grid gap-2">
                  <Label htmlFor="expenseType">Tipo de Despesa</Label>
                  <Select
                    value={expenseType}
                    onValueChange={(value) => setExpenseType(value as "fixed" | "variable")}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixa</SelectItem>
                      <SelectItem value="variable">Variável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
