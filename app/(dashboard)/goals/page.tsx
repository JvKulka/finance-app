"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import GoalDialog from "@/components/GoalDialog";
import { Edit, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/i18n/currency";
import { useSystemPreferences } from "@/lib/i18n/preferences";
import { useI18n } from "@/lib/i18n/useI18n";

export default function GoalsPage() {
  const { t } = useI18n();
  const { language, currency } = useSystemPreferences();
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
          <p className="text-muted-foreground">{t("common.noAccounts")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t("goals.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("goals.subtitle")}</p>
        </div>
        {selectedAccount && (
          <GoalDialog accountId={selectedAccount}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t("goals.newGoal")}
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  {selectedAccount && (
                    <GoalDialog accountId={selectedAccount} goal={goal}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </GoalDialog>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t("goals.progress")}</span>
                      <span className="font-medium">
                        {formatCurrency(goal.currentAmount, { language, currency })} /{" "}
                        {formatCurrency(goal.targetAmount, { language, currency })}
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
                    {t("goals.status")}: {goal.status === "active" ? t("goals.active") : goal.status === "completed" ? t("goals.completed") : t("goals.paused")}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {t("goals.noneFound")}
          </div>
        )}
      </div>
    </div>
  );
}

