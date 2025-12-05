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

interface CreditCardDialogProps {
  children: React.ReactNode;
  accountId: number;
  card?: any;
  onSuccess?: () => void;
}

const BRAND_OPTIONS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Outro"];
const COLOR_OPTIONS = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Verde", value: "#10B981" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Preto", value: "#1F2937" },
  { name: "Dourado", value: "#F59E0B" },
];

export default function CreditCardDialog({ children, accountId, card, onSuccess }: CreditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(card?.name || "");
  const [lastFourDigits, setLastFourDigits] = useState(card?.lastFourDigits || "");
  const [brand, setBrand] = useState(card?.brand || "Visa");
  const [color, setColor] = useState(card?.color || "#3B82F6");
  const [creditLimit, setCreditLimit] = useState(card?.creditLimit ? (card.creditLimit / 100).toFixed(2) : "");
  const [closingDay, setClosingDay] = useState(card?.closingDay?.toString() || "10");
  const [dueDay, setDueDay] = useState(card?.dueDay?.toString() || "15");

  const utils = trpc.useUtils();

  useEffect(() => {
    if (open && !card) {
      setName("");
      setLastFourDigits("");
      setBrand("Visa");
      setColor("#3B82F6");
      setCreditLimit("");
      setClosingDay("10");
      setDueDay("15");
    } else if (open && card) {
      setName(card.name || "");
      setLastFourDigits(card.lastFourDigits || "");
      setBrand(card.brand || "Visa");
      setColor(card.color || "#3B82F6");
      setCreditLimit(card.creditLimit ? (card.creditLimit / 100).toFixed(2) : "");
      setClosingDay(card.closingDay?.toString() || "10");
      setDueDay(card.dueDay?.toString() || "15");
    }
  }, [open, card]);

  const createMutation = trpc.creditCards.create.useMutation({
    onSuccess: () => {
      toast.success("Cartão criado com sucesso!");
      setOpen(false);
      utils.creditCards.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar cartão: ${error.message}`);
    },
  });

  const updateMutation = trpc.creditCards.update.useMutation({
    onSuccess: () => {
      toast.success("Cartão atualizado com sucesso!");
      setOpen(false);
      utils.creditCards.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cartão: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, informe o nome do cartão");
      return;
    }

    if (!lastFourDigits || lastFourDigits.length !== 4 || !/^\d{4}$/.test(lastFourDigits)) {
      toast.error("Por favor, informe os últimos 4 dígitos do cartão");
      return;
    }

    if (!creditLimit || parseFloat(creditLimit) <= 0) {
      toast.error("Por favor, informe um limite válido");
      return;
    }

    const creditLimitInCents = Math.round(parseFloat(creditLimit) * 100);
    const closingDayNum = parseInt(closingDay);
    const dueDayNum = parseInt(dueDay);

    if (card) {
      updateMutation.mutate({
        id: card.id,
        name: name.trim(),
        lastFourDigits,
        brand,
        color,
        creditLimit: creditLimitInCents,
        closingDay: closingDayNum,
        dueDay: dueDayNum,
      });
    } else {
      createMutation.mutate({
        accountId,
        name: name.trim(),
        lastFourDigits,
        brand,
        color,
        creditLimit: creditLimitInCents,
        closingDay: closingDayNum,
        dueDay: dueDayNum,
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
            <DialogTitle>{card ? "Editar Cartão" : "Novo Cartão de Crédito"}</DialogTitle>
            <DialogDescription>
              {card ? "Atualize os dados do cartão" : "Adicione um novo cartão de crédito"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Cartão</Label>
              <Input
                id="name"
                placeholder="Ex: Nubank, Itaú"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastFourDigits">Últimos 4 Dígitos</Label>
                <Input
                  id="lastFourDigits"
                  placeholder="1234"
                  value={lastFourDigits}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setLastFourDigits(value);
                  }}
                  disabled={isPending}
                  required
                  maxLength={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Bandeira</Label>
                <Select value={brand} onValueChange={setBrand} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Cor</Label>
              <div className="grid grid-cols-6 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`h-10 w-full rounded border-2 ${
                      color === c.value ? "border-primary" : "border-border"
                    }`}
                    style={{ backgroundColor: c.value }}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creditLimit">Limite (R$)</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="closingDay">Dia de Fechamento</Label>
                <Input
                  id="closingDay"
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDay">Dia de Vencimento</Label>
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {card ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

