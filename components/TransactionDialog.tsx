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
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2, X, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { supabaseClient } from "@/lib/supabase/client";

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
  const [transactionDate, setTransactionDate] = useState(() => {
    if (transaction?.transactionDate) {
      // Format date in local timezone to avoid timezone issues
      const date = new Date(transaction.transactionDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // Default to today in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || "");
  const [status, setStatus] = useState<"paid" | "pending">(transaction?.status || "paid");
  const [expenseType, setExpenseType] = useState<"fixed" | "variable">(transaction?.expenseType || "variable");
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);
  const [creditCardId, setCreditCardId] = useState<string>(transaction?.creditCardId?.toString() || "");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
    onSuccess: async (result) => {
      toast.success("Transação criada com sucesso!");
      
      // Upload files after creation
      if (files.length > 0 && result.transactionId) {
        await uploadFiles(result.transactionId);
      }
      
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
    onSuccess: async () => {
      toast.success("Transação atualizada com sucesso!");
      
      // Upload files after update
      if (files.length > 0 && transaction?.id) {
        await uploadFiles(transaction.id);
      }
      
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
    setFiles([]);
  };

  // Fetch attachments if editing
  const { data: attachments } = trpc.transactions.getAttachments.useQuery(
    { transactionId: transaction?.id! },
    { enabled: !!transaction?.id }
  );

  const uploadAttachmentMutation = trpc.transactions.uploadAttachment.useMutation();
  const deleteAttachmentMutation = trpc.transactions.deleteAttachment.useMutation();

  const getAttachmentUrl = (filePath: string) => {
    const { data } = supabaseClient.storage
      .from('transaction-attachments')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Validar tamanho (máximo 10MB por arquivo)
      const maxSize = 10 * 1024 * 1024;
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`Arquivo ${file.name} excede o tamanho máximo de 10MB`);
          return false;
        }
        return true;
      });
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachmentMutation.mutateAsync({ id: attachmentId });
      toast.success("Anexo removido com sucesso!");
      utils.transactions.getAttachments.invalidate({ transactionId: transaction?.id! });
    } catch (error: any) {
      toast.error(`Erro ao remover anexo: ${error.message}`);
    }
  };

  const uploadFiles = async (transactionId: number) => {
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("transactionId", transactionId.toString());

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao fazer upload");
        }

        const data = await response.json();

        await uploadAttachmentMutation.mutateAsync({
          transactionId,
          fileName: data.fileName,
          filePath: data.filePath,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
        });
      }
      toast.success("Arquivos enviados com sucesso!");
      setFiles([]);
    } catch (error: any) {
      toast.error(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploadingFiles(false);
    }
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
            {/* Type and Category */}
            {!transaction ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={type} onValueChange={(value) => setType(value as "income" | "expense")} disabled={isPending}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Category */}
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} disabled={isPending}>
                    <SelectTrigger className="w-full">
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
              </div>
            ) : (
              /* Category - Full width when editing */
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={isPending}>
                  <SelectTrigger className="w-full">
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
            )}

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
                className="w-full"
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>

            {/* Payment Method and Credit Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento (opcional)</Label>
                <Select value={paymentMethod || undefined} onValueChange={(value) => setPaymentMethod(value || "")} disabled={isPending}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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
                    <SelectTrigger className="w-full">
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

            {/* File Upload */}
            <div className="grid gap-2">
              <Label htmlFor="files">Anexos (opcional)</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isPending || uploadingFiles}
                className="w-full"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, JPG, PNG, DOC, DOCX. Máximo 10MB por arquivo.
              </p>
              
              {/* Selected files */}
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isPending || uploadingFiles}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing attachments (when editing) */}
              {transaction && attachments && attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  <Label className="text-sm">Anexos existentes:</Label>
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={getAttachmentUrl(attachment.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {attachment.fileName}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        disabled={isPending || uploadingFiles}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || uploadingFiles}>
              {(isPending || uploadingFiles) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingFiles ? "Enviando arquivos..." : transaction ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
