"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import GoalDialog from "@/components/GoalDialog";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function GoalsPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  
  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const { data: goals, isLoading: goalsLoading } = trpc.goals.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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
          <h1 className="text-3xl font-bold text-primary">Metas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe suas metas financeiras</p>
        </div>
        {selectedAccount && (
          <GoalDialog accountId={selectedAccount}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Meta
            </Button>
          </GoalDialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goalsLoading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        ) : goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status: {goal.status === "active" ? "Ativa" : goal.status === "completed" ? "Concluída" : "Pausada"}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhuma meta encontrada
          </div>
        )}
      </div>
    </div>
  );
}

