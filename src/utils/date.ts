import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export function getWeekDates(date: Date) {
  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Segunda-feira
  const endDate = endOfWeek(date, { weekStartsOn: 1 }); // Domingo
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
}

export function formatWeekRange(startDate: string, endDate: string): string {
  const start = format(new Date(startDate), "dd 'de' MMMM", { locale: ptBR });
  const end = format(new Date(endDate), "dd 'de' MMMM", { locale: ptBR });
  return `${start} - ${end}`;
}

export function getNextWeek(currentStartDate: string): { startDate: string; endDate: string } {
  const date = new Date(currentStartDate);
  const nextWeek = addDays(date, 7);
  return getWeekDates(nextWeek);
}

export function getPreviousWeek(currentStartDate: string): { startDate: string; endDate: string } {
  const date = new Date(currentStartDate);
  const previousWeek = addDays(date, -7);
  return getWeekDates(previousWeek);
}

export function isTaskOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}

export function isTaskDueToday(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due.getTime() === today.getTime();
}
