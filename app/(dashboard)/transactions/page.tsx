"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionDialog from "@/components/TransactionDialog";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function TransactionsPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  
  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  
  // Set default account when loaded
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
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
          <h1 className="text-3xl font-bold text-primary">Transações</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas transações financeiras</p>
        </div>
        <TransactionDialog accountId={selectedAccount!}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        </TransactionDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.transactionDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.status === "paid" ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

