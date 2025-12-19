"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CreateAccountDialog from "@/components/CreateAccountDialog";
import TransactionDialog from "@/components/TransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownIcon, ArrowUpIcon, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

type PeriodFilter = "today" | "last7days" | "currentMonth" | "custom";

type ExpenseByCategory = {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: number;
};

export default function Dashboard() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("currentMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Get user accounts
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = trpc.accounts.list.useQuery(undefined, {
    retry: false,
  });

  // Set default account when loaded
  useMemo(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  // Calculate date range based on filter
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
        if (customStartDate && customEndDate) {
          start = startOfDay(new Date(customStartDate));
          end = endOfDay(new Date(customEndDate));
        } else {
          start = startOfMonth(now);
          end = endOfMonth(now);
        }
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

  // Fetch dashboard data
  const { data: summary, isLoading: summaryLoading, error: summaryError } = trpc.dashboard.summary.useQuery(
    {
      accountId: selectedAccount!,
      ...dateRange,
    },
    {
      enabled: !!selectedAccount,
      retry: false,
    }
  );

  const { data: expensesByCategory, isLoading: expensesLoading, error: expensesError } = trpc.dashboard.expensesByCategory.useQuery(
    {
      accountId: selectedAccount!,
      ...dateRange,
    },
    {
      enabled: !!selectedAccount,
      retry: false,
    }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const isLoading = accountsLoading || summaryLoading || expensesLoading;

  if (accountsLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Erro ao carregar contas</p>
          <p className="text-sm text-muted-foreground">{accountsError.message}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Você ainda não possui nenhuma conta.</p>
          <CreateAccountDialog>
            <Button>Criar primeira conta</Button>
          </CreateAccountDialog>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral das suas finanças</p>
        </div>
        <TransactionDialog accountId={selectedAccount!}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        </TransactionDialog>
      </div>

      {/* Period Filters */}
      <div className="flex gap-2 flex-wrap items-end">
        <Button
          variant={periodFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPeriodFilter("today");
            setCustomStartDate("");
            setCustomEndDate("");
          }}
        >
          Hoje
        </Button>
        <Button
          variant={periodFilter === "last7days" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPeriodFilter("last7days");
            setCustomStartDate("");
            setCustomEndDate("");
          }}
        >
          Últimos 7 dias
        </Button>
        <Button
          variant={periodFilter === "currentMonth" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPeriodFilter("currentMonth");
            setCustomStartDate("");
            setCustomEndDate("");
          }}
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

        {/* Custom Date Range Inputs */}
        {periodFilter === "custom" && (
          <>
            <div className="grid gap-2">
              <Label className="text-sm">Data Inicial</Label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Data Final</Label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance Card */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(summary?.balance || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(dateRange.startDate), "dd MMM", { locale: ptBR })} -{" "}
                  {format(new Date(dateRange.endDate), "dd MMM", { locale: ptBR })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(summary?.income || 0)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1 text-green-500" />
                  Entradas do período
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(summary?.expense || 0)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowDownIcon className="w-3 h-3 mr-1 text-destructive" />
                  Saídas do período
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expenses by Category - Pie Chart */}
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
                    label={(entry: ExpenseByCategory) => `${entry.categoryName}: ${formatCurrency(entry.total)}`}
                  >
                    {expensesByCategory.map((entry: ExpenseByCategory, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "oklch(0.19 0.02 240)",
                      border: "1px solid oklch(0.25 0.02 240)",
                      borderRadius: "8px",
                    }}
                  />
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

        {/* Result Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div
                    className={`text-4xl font-bold ${
                      (summary?.balance || 0) >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(summary?.balance || 0)}
                  </div>
                  {summary && summary.income > 0 && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm">
                      {((summary.expense / summary.income) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Receitas</span>
                    <span className="font-medium text-green-500">{formatCurrency(summary?.income || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Despesas</span>
                    <span className="font-medium text-destructive">{formatCurrency(summary?.expense || 0)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

