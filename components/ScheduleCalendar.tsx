"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ScheduledPaymentDialog from "@/components/ScheduledPaymentDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleCalendarProps {
  scheduledPayments: any[];
  accountId: number;
  onPaymentUpdate: () => void;
  initialDate?: Date;
}

export default function ScheduleCalendar({ scheduledPayments, accountId, onPaymentUpdate, initialDate }: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<any[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Adicionar dias vazios no início para alinhar com o primeiro dia da semana
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // Agrupar pagamentos por data
  const paymentsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    scheduledPayments?.forEach((payment) => {
      if (!payment.isPaid) {
        const dateKey = format(new Date(payment.dueDate), "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(payment);
      }
    });
    return grouped;
  }, [scheduledPayments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const payments = paymentsByDate[dateKey] || [];
    setSelectedDay(day);
    setSelectedPayments(payments);
  };

  const getPaymentsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return paymentsByDate[dateKey] || [];
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <Card>
        <CardContent className="p-4">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {/* Dias vazios no início */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="h-[120px]" />
            ))}

            {/* Dias do mês */}
            {daysInMonth.map((day) => {
              const dayPayments = getPaymentsForDay(day);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const hasPayments = dayPayments.length > 0;
              const paymentCount = dayPayments.length;
              const visiblePayments = dayPayments.slice(0, 2);
              const hiddenCount = paymentCount - 2;

              return (
                <div
                  key={day.toISOString()}
                  className={`h-[120px] border rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-accent flex flex-col ${
                    isCurrentDay ? "border-primary border-2 bg-primary/5" : "border-border"
                  } ${!isCurrentMonth ? "opacity-40" : ""} ${hasPayments ? "bg-card" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex items-center justify-between mb-1 flex-shrink-0">
                    <span className={`text-sm font-semibold ${isCurrentDay ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {paymentCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                        {paymentCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden space-y-1 min-h-0">
                    {visiblePayments.map((payment) => (
                      <div
                        key={payment.id}
                        className={`text-[11px] px-1.5 py-1 rounded ${
                          payment.isPriority
                            ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30"
                            : "bg-primary/10 text-primary"
                        }`}
                        title={payment.description}
                      >
                        <div className="truncate font-medium">{payment.description}</div>
                        <div className="text-[10px] opacity-90 mt-0.5">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                    ))}
                    {hiddenCount > 0 && (
                      <div className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                        +{hiddenCount} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Dia */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              {selectedPayments.length > 0
                ? `${selectedPayments.length} pagamento(s) agendado(s)`
                : "Nenhum pagamento agendado para este dia"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {selectedPayments.length > 0 ? (
              selectedPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-3 border rounded-lg ${
                    payment.isPriority ? "border-yellow-500 bg-yellow-500/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <ScheduledPaymentDialog
                      accountId={accountId}
                      payment={payment}
                      onSuccess={onPaymentUpdate}
                    >
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </ScheduledPaymentDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum pagamento agendado para este dia.</p>
                {selectedDay && (
                  <div className="mt-4">
                    <ScheduledPaymentDialog
                      accountId={accountId}
                      initialDate={selectedDay}
                      onSuccess={() => {
                        onPaymentUpdate();
                        setSelectedDay(null);
                      }}
                    >
                      <Button variant="outline">
                        Criar Agendamento
                      </Button>
                    </ScheduledPaymentDialog>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

