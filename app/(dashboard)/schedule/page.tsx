"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduledPaymentDialog from "@/components/ScheduledPaymentDialog";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import { Plus, Check, Star, StarOff, Trash2, Edit, Calendar, List } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

export default function SchedulePage() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  
  const { data: accounts, isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const { data: scheduledPayments, isLoading: paymentsLoading, refetch } = trpc.scheduledPayments.list.useQuery(
    { accountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  const markAsPaidMutation = trpc.scheduledPayments.markAsPaid.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const togglePriorityMutation = trpc.scheduledPayments.togglePriority.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.scheduledPayments.delete.useMutation({
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
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  // Separar pagamentos por status
  const paidPayments = scheduledPayments?.filter((p) => p.isPaid) || [];
  const pendingPayments = scheduledPayments?.filter((p) => !p.isPaid) || [];
  const sortedPending = [...pendingPayments].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });

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
          <h1 className="text-3xl font-bold text-primary">Agenda</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus pagamentos agendados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-r-none"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>
          {selectedAccount && (
            <ScheduledPaymentDialog accountId={selectedAccount} onSuccess={() => refetch()}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </Button>
            </ScheduledPaymentDialog>
          )}
        </div>
      </div>

      {paymentsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : viewMode === "calendar" ? (
        <ScheduleCalendar
          scheduledPayments={scheduledPayments || []}
          accountId={selectedAccount!}
          onPaymentUpdate={() => refetch()}
        />
      ) : (
        <>
          {/* Pagamentos Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Pendentes ({sortedPending.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedPending.length > 0 ? (
                <div className="space-y-2">
                  {sortedPending.map((payment) => (
                    <div
                      key={payment.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        payment.isPriority ? "border-yellow-500 bg-yellow-500/10" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{payment.description}</p>
                          {payment.isPriority && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          {payment.isRecurring && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Recorrente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.dueDate)} • {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePriorityMutation.mutate({ id: payment.id, isPriority: !payment.isPriority })}
                        >
                          {payment.isPriority ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate({ id: payment.id })}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <ScheduledPaymentDialog accountId={selectedAccount!} payment={payment} onSuccess={() => refetch()}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </ScheduledPaymentDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate({ id: payment.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pagamento pendente
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagamentos Realizados */}
          {paidPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Realizados ({paidPayments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paidPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg opacity-60"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium line-through">{payment.description}</p>
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                            Pago
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.dueDate)} • {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
