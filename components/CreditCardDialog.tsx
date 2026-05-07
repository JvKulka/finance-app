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
import { useI18n } from "@/lib/i18n/useI18n";

interface CreditCardDialogProps {
  children: React.ReactNode;
  accountId: number;
  card?: any;
  onSuccess?: () => void;
}

const BRAND_OPTIONS = ["Visa", "Mastercard", "American Express", "Cabal", "Maestro", "Otro"];
const COLOR_OPTIONS = [
  { name: "Verde claro", value: "#2ECC71" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Verde", value: "#10B981" },
  { name: "Violeta", value: "#8B5CF6" },
  { name: "Negro", value: "#1F2937" },
  { name: "Dorado", value: "#F59E0B" },
];

export default function CreditCardDialog({ children, accountId, card, onSuccess }: CreditCardDialogProps) {
  const { locale } = useI18n();
  const isPt = locale === "pt";
  const { currency } = useSystemPreferences();
  const currencySymbol = getAppCurrencySymbol(currency);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(card?.name || "");
  const [lastFourDigits, setLastFourDigits] = useState(card?.lastFourDigits || "");
  const [brand, setBrand] = useState(card?.brand || "Visa");
  const [color, setColor] = useState(card?.color || "#2ECC71");
  const [creditLimit, setCreditLimit] = useState(
    card?.creditLimit ? String(convertFromBaseCurrency(card.creditLimit, currency)) : ""
  );
  const [closingDay, setClosingDay] = useState(card?.closingDay?.toString() || "10");
  const [dueDay, setDueDay] = useState(card?.dueDay?.toString() || "15");

  const utils = trpc.useUtils();

  useEffect(() => {
    if (open && !card) {
      setName("");
      setLastFourDigits("");
      setBrand("Visa");
      setColor("#2ECC71");
      setCreditLimit("");
      setClosingDay("10");
      setDueDay("15");
    } else if (open && card) {
      setName(card.name || "");
      setLastFourDigits(card.lastFourDigits || "");
      setBrand(card.brand || "Visa");
      setColor(card.color || "#2ECC71");
      setCreditLimit(card.creditLimit ? String(convertFromBaseCurrency(card.creditLimit, currency)) : "");
      setClosingDay(card.closingDay?.toString() || "10");
      setDueDay(card.dueDay?.toString() || "15");
    }
  }, [open, card, currency]);

  const createMutation = trpc.creditCards.create.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Cartão criado com sucesso!" : "¡Tarjeta creada con éxito!");
      setOpen(false);
      utils.creditCards.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao criar cartão" : "Error al crear la tarjeta"}: ${error.message}`);
    },
  });

  const updateMutation = trpc.creditCards.update.useMutation({
    onSuccess: () => {
      toast.success(isPt ? "Cartão atualizado com sucesso!" : "¡Tarjeta actualizada con éxito!");
      setOpen(false);
      utils.creditCards.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`${isPt ? "Erro ao atualizar cartão" : "Error al actualizar la tarjeta"}: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(isPt ? "Por favor, informe o nome do cartão" : "Por favor, ingresá el nombre de la tarjeta");
      return;
    }

    if (!lastFourDigits || lastFourDigits.length !== 4 || !/^\d{4}$/.test(lastFourDigits)) {
      toast.error(isPt ? "Por favor, informe os últimos 4 dígitos do cartão" : "Por favor, ingresá los últimos 4 dígitos de la tarjeta");
      return;
    }

    const creditLimitValue = parseCurrencyInput(creditLimit, { currency });
    if (!Number.isFinite(creditLimitValue) || creditLimitValue <= 0) {
      toast.error(isPt ? "Por favor, informe um limite válido" : "Por favor, ingresá un límite válido");
      return;
    }

    const closingDayNum = parseInt(closingDay);
    const dueDayNum = parseInt(dueDay);

    if (card) {
      updateMutation.mutate({
        id: card.id,
        name: name.trim(),
        lastFourDigits,
        brand,
        color,
        creditLimit: creditLimitValue,
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
        creditLimit: creditLimitValue,
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
            <DialogTitle>{card ? (isPt ? "Editar Cartão" : "Editar Tarjeta") : (isPt ? "Novo Cartão de Crédito" : "Nueva Tarjeta de Crédito")}</DialogTitle>
            <DialogDescription>
              {card
                ? isPt ? "Atualize os dados do cartão" : "Actualizá los datos de la tarjeta"
                : isPt ? "Adicione um novo cartão de crédito" : "Agregá una nueva tarjeta de crédito"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{isPt ? "Nome do Cartão" : "Nombre de la Tarjeta"}</Label>
              <Input
                id="name"
                placeholder={isPt ? "Ex: Visa Itaú, Mastercard Nubank" : "Ej: Visa Itaú, Mastercard Continental"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastFourDigits">{isPt ? "Últimos 4 Dígitos" : "Últimos 4 Dígitos"}</Label>
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
                <Label htmlFor="brand">{isPt ? "Bandeira" : "Marca"}</Label>
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
              <Label htmlFor="color">{isPt ? "Cor" : "Color"}</Label>
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
              <Label htmlFor="creditLimit">{isPt ? "Limite" : "Límite"} ({currencySymbol})</Label>
              <Input
                id="creditLimit"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="closingDay">{isPt ? "Dia de Fechamento" : "Día de Cierre"}</Label>
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
                <Label htmlFor="dueDay">{isPt ? "Dia de Vencimento" : "Día de Vencimiento"}</Label>
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
              {isPt ? "Cancelar" : "Cancelar"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {card ? (isPt ? "Atualizar" : "Actualizar") : (isPt ? "Criar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

