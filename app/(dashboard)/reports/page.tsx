"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

type PeriodFilter = "today" | "last7days" | "currentMonth" | "custom";

export default function ReportsPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("currentMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();

  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (periodFilter) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "last7days":
        start = startOfDay(subDays(now, 7));
        end = endOfDay(now);
        break;
      case "currentMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "custom":
        start = customStartDate ? new Date(customStartDate) : startOfMonth(now);
        end = customEndDate ? new Date(customEndDate) : endOfMonth(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, [periodFilter, customStartDate, customEndDate]);

  const { data: summary, isLoading: summaryLoading } = trpc.dashboard.summary.useQuery(
    {
      accountId: selectedAccount!,
      ...dateRange,
    },
    {
      enabled: !!selectedAccount,
    }
  );

  const { data: expensesByCategory, isLoading: expensesLoading } = trpc.dashboard.expensesByCategory.useQuery(
    {
      accountId: selectedAccount!,
      ...dateRange,
    },
    {
      enabled: !!selectedAccount,
    }
  );

  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.list.useQuery(
    {
      accountId: selectedAccount!,
      ...dateRange,
    },
    {
      enabled: !!selectedAccount,
    }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  // Preparar dados para gráfico de barras mensal
  const monthlyData = useMemo(() => {
    if (!transactions) return [];
    
    const grouped = transactions.reduce((acc: any, t: any) => {
      const month = format(new Date(t.transactionDate), "MMM", { locale: ptBR });
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === "income") {
        acc[month].income += t.amount;
      } else {
        acc[month].expense += t.amount;
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }, [transactions]);

  const isLoading = accountsLoading || summaryLoading || expensesLoading || transactionsLoading;

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
      <div>
        <h1 className="text-3xl font-bold text-primary">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Análises e relatórios financeiros</p>
      </div>

      {/* Filtros de Período */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={periodFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriodFilter("today")}
        >
          Hoje
        </Button>
        <Button
          variant={periodFilter === "last7days" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriodFilter("last7days")}
        >
          Últimos 7 dias
        </Button>
        <Button
          variant={periodFilter === "currentMonth" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriodFilter("currentMonth")}
        >
          Mês atual
        </Button>
        <Button
          variant={periodFilter === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriodFilter("custom")}
        >
          Personalizado
        </Button>
      </div>

      {periodFilter === "custom" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Data Inicial</Label>
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Data Final</Label>
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(summary?.income || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(summary?.expense || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className={`text-2xl font-bold ${(summary?.balance || 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatCurrency(summary?.balance || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : expensesByCategory && expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    dataKey="total"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.categoryName}: ${formatCurrency(entry.total)}`}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhuma despesa neste período
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Receitas" />
                  <Bar dataKey="expense" fill="#EF4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
