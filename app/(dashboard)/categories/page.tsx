"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CategoryDialog from "@/components/CategoryDialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  
  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const utils = trpc.useUtils();

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    },
  });

  const incomeCategories = categories?.filter((cat) => cat.type === "income") || [];
  const expenseCategories = categories?.filter((cat) => cat.type === "expense") || [];

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Circle;
  };

  const handleDelete = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate({ id: categoryToDelete });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
  };

  if (accountsLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Você ainda não possui nenhuma conta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Categorias</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas categorias de transações</p>
        </div>
        {selectedAccount && (
          <CategoryDialog accountId={selectedAccount}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </CategoryDialog>
        )}
      </div>

      {/* Categorias de Receita */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Categorias de Receita</h2>
        {categoriesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : incomeCategories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => {
              const IconComponent = getIcon(category.icon || "Circle");
              const iconBgColor = category.color || "#10B981";
              const iconColor = category.color || "#10B981";
              
              return (
                <Card key={category.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${iconBgColor}20` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-lg">{category.name}</p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Receita
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            Nenhuma categoria de receita encontrada
          </div>
        )}
      </div>

      {/* Categorias de Despesa */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Categorias de Despesa</h2>
        {categoriesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : expenseCategories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => {
              const IconComponent = getIcon(category.icon || "Circle");
              const iconBgColor = category.color || "#EF4444";
              const iconColor = category.color || "#EF4444";
              
              return (
                <Card key={category.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${iconBgColor}20` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-lg">{category.name}</p>
                      <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                        Despesa
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            Nenhuma categoria de despesa encontrada
          </div>
        )}
      </div>

      {/* Dialog de Edição */}
      {editingCategory && selectedAccount && (
        <CategoryDialog
          accountId={selectedAccount}
          category={editingCategory}
          onSuccess={() => setEditingCategory(null)}
        >
          <div style={{ display: "none" }} />
        </CategoryDialog>
      )}

      {/* Alert Dialog de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
