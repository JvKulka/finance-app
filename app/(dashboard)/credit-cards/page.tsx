"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CreditCardDialog from "@/components/CreditCardDialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CreditCardsPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  
  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const { data: creditCards, isLoading: creditCardsLoading, refetch } = trpc.creditCards.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  const deleteMutation = trpc.creditCards.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Cartões de Crédito</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus cartões de crédito</p>
        </div>
        {selectedAccount && (
          <CreditCardDialog accountId={selectedAccount} onSuccess={() => refetch()}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cartão
            </Button>
          </CreditCardDialog>
        )}
      </div>

      {creditCardsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : creditCards && creditCards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {creditCards.map((card) => {
            // Converter cor hex para RGB e adicionar opacidade
            const hexToRgb = (hex: string) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result
                ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                  }
                : { r: 59, g: 130, b: 246 }; // fallback azul
            };
            const rgb = hexToRgb(card.color);
            const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
            
            return (
            <Card 
              key={card.id} 
              className="relative" 
              style={{ 
                borderColor: card.color,
                backgroundColor: backgroundColor,
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  <div className="flex gap-2">
                    <CreditCardDialog accountId={selectedAccount!} card={card} onSuccess={() => refetch()}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </CreditCardDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Cartão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o cartão {card.name}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate({ id: card.id })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Últimos 4 dígitos</p>
                  <p className="text-lg font-semibold">•••• {card.lastFourDigits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bandeira</p>
                  <p className="font-medium">{card.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Limite</p>
                  <p className="text-lg font-semibold">{formatCurrency(card.creditLimit)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fechamento</p>
                    <p className="font-medium">Dia {card.closingDay}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="font-medium">Dia {card.dueDay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Nenhum cartão cadastrado
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
