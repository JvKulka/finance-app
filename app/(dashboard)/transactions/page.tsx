"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TransactionDialog from "@/components/TransactionDialog";
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
import { Plus, Edit, Trash2, Filter, X, Calendar as CalendarIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, addMonths, subMonths } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ptBR } from "date-fns/locale/pt-BR";

type PeriodFilter = "all" | "today" | "last7days" | "currentMonth" | "selectedMonth" | "custom";

export default function TransactionsPage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [accountFilter, setAccountFilter] = useState<string>("");
  const [creditCardFilter, setCreditCardFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  
  // Set default account when loaded
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  // Get categories for filter
  const { data: categories } = trpc.categories.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  // Get credit cards for filter
  const { data: creditCards } = trpc.creditCards.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    if (periodFilter === "all") {
      return { startDate: undefined, endDate: undefined };
    }

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
      case "selectedMonth":
        start = startOfMonth(currentMonth);
        end = endOfMonth(currentMonth);
        break;
      case "custom":
        start = customStartDate ? startOfDay(customStartDate) : startOfMonth(now);
        end = customEndDate ? endOfDay(customEndDate) : endOfMonth(now);
        break;
      default:
        return { startDate: undefined, endDate: undefined };
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, [periodFilter, customStartDate, customEndDate, currentMonth]);

  // Build filters object
  const filters = useMemo(() => {
    return {
      accountId: selectedAccount!,
      ...dateRange,
      categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
      type: typeFilter ? (typeFilter as "income" | "expense") : undefined,
    };
  }, [selectedAccount, dateRange, categoryFilter, typeFilter]);

  const { data: transactions, isLoading: transactionsLoading, refetch } = trpc.transactions.list.useQuery(
    filters,
    { enabled: !!selectedAccount }
  );

  // Get users for filter (only if we have transactions to extract unique users)
  const uniqueUsers = useMemo(() => {
    if (!transactions) return [];
    const userMap = new Map();
    transactions.forEach((t) => {
      if (t.user) {
        userMap.set(t.user.id, t.user);
      }
    });
    return Array.from(userMap.values());
  }, [transactions]);

  // Filter transactions on client side
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    let filtered = transactions;
    
    // Filter by description
    if (descriptionFilter) {
      const searchTerm = descriptionFilter.toLowerCase();
      filtered = filtered.filter((t) => 
        t.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by user
    if (userFilter) {
      filtered = filtered.filter((t) => t.user?.id.toString() === userFilter);
    }
    
    // Filter by account
    if (accountFilter) {
      filtered = filtered.filter((t) => t.account?.id.toString() === accountFilter);
    }
    
    // Filter by credit card
    if (creditCardFilter) {
      filtered = filtered.filter((t) => t.creditCard?.id.toString() === creditCardFilter);
    }
    
    return filtered;
  }, [transactions, descriptionFilter, userFilter, accountFilter, creditCardFilter]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (periodFilter !== "all") count++;
    if (descriptionFilter) count++;
    if (categoryFilter) count++;
    if (typeFilter) count++;
    if (accountFilter) count++;
    if (creditCardFilter) count++;
    if (userFilter) count++;
    return count;
  }, [periodFilter, descriptionFilter, categoryFilter, typeFilter, accountFilter, creditCardFilter, userFilter]);

  // Clear all filters
  const clearFilters = () => {
    setPeriodFilter("all");
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setDescriptionFilter("");
    setCategoryFilter("");
    setTypeFilter("");
    setAccountFilter("");
    setCreditCardFilter("");
    setUserFilter("");
  };

  const deleteMutation = trpc.transactions.delete.useMutation({
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

  const formatDate = (date: Date | string) => {
    // Ensure we're working with a Date object and format in local timezone
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Extract date components to avoid timezone conversion issues
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
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
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <TransactionDialog accountId={selectedAccount!} onSuccess={() => refetch()}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </TransactionDialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <CardTitle>Filtros</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="space-y-4">
              {/* Filtros em duas colunas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Coluna Esquerda */}
                <div className="space-y-4">
                  {/* Filtro de Descrição */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Descrição</Label>
                    <Input
                      placeholder="Buscar por descrição..."
                      value={descriptionFilter}
                      onChange={(e) => setDescriptionFilter(e.target.value)}
                      className="h-9 w-full"
                    />
                  </div>

                  {/* Filtro de Tipo */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Tipo</Label>
                    <Select 
                      value={typeFilter || undefined} 
                      onValueChange={(value) => setTypeFilter(value || "")}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de Conta Bancária */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Conta Bancária</Label>
                    <Select 
                      value={accountFilter || undefined} 
                      onValueChange={(value) => setAccountFilter(value || "")}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Todas as contas" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-4">
                  {/* Filtro de Criado por */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Criado por</Label>
                    <Select 
                      value={userFilter || undefined} 
                      onValueChange={(value) => setUserFilter(value || "")}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Todos os usuários" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de Categoria */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Categoria</Label>
                    <Select 
                      value={categoryFilter || undefined} 
                      onValueChange={(value) => setCategoryFilter(value || "")}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de Cartão de Crédito */}
                  <div className="grid gap-1.5">
                    <Label className="text-sm">Cartão de Crédito</Label>
                    <Select 
                      value={creditCardFilter || undefined} 
                      onValueChange={(value) => setCreditCardFilter(value || "")}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Todos os cartões" />
                      </SelectTrigger>
                      <SelectContent>
                        {creditCards?.map((card) => (
                          <SelectItem key={card.id} value={card.id.toString()}>
                            {card.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Seção de Período no final */}
              <div className="space-y-2 pt-2 border-t">
                <Label>Período</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Navegação de Mês */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const newMonth = subMonths(currentMonth, 1);
                        setCurrentMonth(newMonth);
                        setPeriodFilter("selectedMonth");
                        setCustomStartDate(undefined);
                        setCustomEndDate(undefined);
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[140px] text-center capitalize">
                      {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const newMonth = addMonths(currentMonth, 1);
                        setCurrentMonth(newMonth);
                        setPeriodFilter("selectedMonth");
                        setCustomStartDate(undefined);
                        setCustomEndDate(undefined);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Botões de Período */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={periodFilter === "today" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setPeriodFilter("today");
                        setCurrentMonth(new Date());
                        setCustomStartDate(undefined);
                        setCustomEndDate(undefined);
                      }}
                    >
                      Hoje
                    </Button>
                    <Button
                      type="button"
                      variant={periodFilter === "last7days" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setPeriodFilter("last7days");
                        setCurrentMonth(new Date());
                        setCustomStartDate(undefined);
                        setCustomEndDate(undefined);
                      }}
                    >
                      Últimos 7 dias
                    </Button>
                    <Button
                      type="button"
                      variant={periodFilter === "currentMonth" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setPeriodFilter("currentMonth");
                        setCurrentMonth(new Date());
                        setCustomStartDate(undefined);
                        setCustomEndDate(undefined);
                      }}
                    >
                      Mês atual
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant={periodFilter === "custom" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPeriodFilter("custom")}
                          className="gap-2"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          Personalizado
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Data Inicial</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {customStartDate ? format(customStartDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-4">
                                  <Input
                                    type="date"
                                    value={customStartDate ? format(customStartDate, "yyyy-MM-dd") : ""}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setCustomStartDate(new Date(e.target.value));
                                        setPeriodFilter("custom");
                                      }
                                    }}
                                    className="w-full"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Final</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {customEndDate ? format(customEndDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-4">
                                  <Input
                                    type="date"
                                    value={customEndDate ? format(customEndDate, "yyyy-MM-dd") : ""}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setCustomEndDate(new Date(e.target.value));
                                        setPeriodFilter("custom");
                                      }
                                    }}
                                    className="w-full"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

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
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conta Bancária</TableHead>
                    <TableHead>Cartão de Crédito</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <Badge
                            style={{
                              backgroundColor: transaction.category.color,
                              color: "white",
                            }}
                            className="border-0"
                          >
                            {transaction.category.name}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === "income" ? "default" : "destructive"}
                          className="border-0"
                        >
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.account?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {transaction.creditCard?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {transaction.user?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TransactionDialog
                            accountId={selectedAccount!}
                            transaction={transaction}
                            onSuccess={() => refetch()}
                          >
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TransactionDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a transação "{transaction.description}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate({ id: transaction.id })}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

