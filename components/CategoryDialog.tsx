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
import * as Icons from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryDialogProps {
  children: React.ReactNode;
  accountId: number;
  category?: any;
  onSuccess?: () => void;
}

// Popular Lucide icons for categories
const ICON_OPTIONS = [
  "Wallet",
  "Briefcase",
  "TrendingUp",
  "ShoppingCart",
  "DollarSign",
  "Utensils",
  "Car",
  "Home",
  "Heart",
  "GraduationCap",
  "Gamepad2",
  "ShoppingBag",
  "FileText",
  "ShoppingBasket",
  "MoreHorizontal",
  "Coffee",
  "Smartphone",
  "Laptop",
  "Plane",
  "Gift",
  "Music",
  "Film",
  "Book",
  "Dumbbell",
  "Shirt",
  "Zap",
  "Droplet",
  "Wifi",
  "Phone",
  "CreditCard",
];

const COLOR_OPTIONS = [
  { name: "Verde", value: "#2ECC71" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F97316" },
  { name: "Amarelo", value: "#F59E0B" },
  { name: "Ciano", value: "#06B6D4" },
  { name: "Cinza", value: "#64748B" },
  { name: "Índigo", value: "#6366F1" },
];

export default function CategoryDialog({ children, accountId, category, onSuccess }: CategoryDialogProps) {
  const [open, setOpen] = useState(!!category);
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState<"income" | "expense">(category?.type || "expense");
  const [icon, setIcon] = useState(category?.icon || "Circle");
  const [color, setColor] = useState(category?.color || "#2ECC71");

  const utils = trpc.useUtils();

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      setOpen(false);
      resetForm();
      utils.categories.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso!");
      setOpen(false);
      resetForm();
      utils.categories.list.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar categoria: ${error.message}`);
    },
  });

  const resetForm = () => {
    if (category) {
      setName(category.name || "");
      setType(category.type || "expense");
      setIcon(category.icon || "Circle");
      setColor(category.color || "#2ECC71");
    } else {
      setName("");
      setType("expense");
      setIcon("Circle");
      setColor("#2ECC71");
    }
  };

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setType(category.type || "expense");
      setIcon(category.icon || "Circle");
      setColor(category.color || "#2ECC71");
      setOpen(true);
    } else {
      resetForm();
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, informe o nome da categoria");
      return;
    }

    if (category) {
      // Update existing category
      updateMutation.mutate({
        id: category.id,
        name: name.trim(),
        icon,
        color,
      });
    } else {
      // Create new category
      createMutation.mutate({
        accountId,
        name: name.trim(),
        type,
        icon,
        color,
        isDefault: false,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Circle;
  };

  const SelectedIcon = getIcon(icon);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen && category) {
          onSuccess?.();
        }
      }}
    >
      {!category && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {category ? "Atualize os dados da categoria" : "Crie uma nova categoria para organizar suas transações"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                placeholder="Ex: Alimentação, Transporte"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Type (only for new categories) */}
            {!category && (
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

            {/* Icon Preview */}
            <div className="grid gap-2">
              <Label>Pré-visualização</Label>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <SelectedIcon className="w-8 h-8" style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold">{name || "Nome da Categoria"}</p>
                  <p className="text-sm text-muted-foreground">
                    {type === "income" ? "Receita" : "Despesa"}
                  </p>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="grid gap-2">
              <Label htmlFor="color">Cor</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    className={`w-full h-10 rounded-md border-2 transition-all ${
                      color === colorOption.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => setColor(colorOption.value)}
                    disabled={isPending}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="grid gap-2">
              <Label htmlFor="icon">Ícone</Label>
              <ScrollArea className="h-48 border rounded-lg p-2">
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((iconName) => {
                    const IconComponent = getIcon(iconName);
                    return (
                      <button
                        key={iconName}
                        type="button"
                        className={`w-full h-12 flex items-center justify-center rounded-md border-2 transition-all hover:bg-accent ${
                          icon === iconName ? "border-primary bg-accent" : "border-transparent"
                        }`}
                        onClick={() => setIcon(iconName)}
                        disabled={isPending}
                        title={iconName}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
