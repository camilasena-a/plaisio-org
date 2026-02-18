import { format, startOfWeek, endOfWeek, addDays, parseISO, startOfDay, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export function getWeekDates(date: Date) {
  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Segunda-feira
  const endDate = endOfWeek(date, { weekStartsOn: 1 }); // Domingo
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

export function getMonthDates(date: Date) {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

export function formatDate(dateString: string): string {
  // Usa parseISO para evitar problemas de timezone
  const date = parseISO(dateString);
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}

export function formatWeekRange(startDate: string, endDate: string): string {
  const start = format(parseISO(startDate), "dd 'de' MMMM", { locale: ptBR });
  const end = format(parseISO(endDate), "dd 'de' MMMM", { locale: ptBR });
  return `${start} - ${end}`;
}

export function formatMonthRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Se é o mesmo mês, mostra apenas o mês e ano
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return format(start, "MMMM 'de' yyyy", { locale: ptBR });
  }
  
  // Caso contrário, mostra o range completo
  const startFormatted = format(start, "dd 'de' MMMM", { locale: ptBR });
  const endFormatted = format(end, "dd 'de' MMMM", { locale: ptBR });
  return `${startFormatted} - ${endFormatted}`;
}

export function getNextWeek(currentStartDate: string): { startDate: string; endDate: string } {
  const date = parseISO(currentStartDate);
  const nextWeek = addDays(date, 7);
  return getWeekDates(nextWeek);
}

export function getPreviousWeek(currentStartDate: string): { startDate: string; endDate: string } {
  const date = parseISO(currentStartDate);
  const previousWeek = addDays(date, -7);
  return getWeekDates(previousWeek);
}

export function getNextMonth(currentStartDate: string): { startDate: string; endDate: string } {
  const date = parseISO(currentStartDate);
  const nextMonth = addMonths(date, 1);
  return getMonthDates(nextMonth);
}

export function getPreviousMonth(currentStartDate: string): { startDate: string; endDate: string } {
  const date = parseISO(currentStartDate);
  const previousMonth = addMonths(date, -1);
  return getMonthDates(previousMonth);
}

export function isTaskOverdue(dueDate: string): boolean {
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(dueDate));
  
  return due < today;
}

export function isTaskDueToday(dueDate: string): boolean {
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(dueDate));
  
  return due.getTime() === today.getTime();
}

/**
 * Verifica se uma tarefa pertence à semana selecionada
 * Se a tarefa não tem dueDate, ela só aparece na semana atual
 */
export function isTaskInWeek(dueDate: string | undefined, weekStartDate: string, weekEndDate: string): boolean {
  // Se não tem dueDate, mostra apenas na semana atual
  if (!dueDate) {
    const currentWeek = getWeekDates(new Date());
    return weekStartDate === currentWeek.startDate && weekEndDate === currentWeek.endDate;
  }
  
  const taskDate = startOfDay(parseISO(dueDate));
  const weekStart = startOfDay(parseISO(weekStartDate));
  const weekEnd = startOfDay(parseISO(weekEndDate));
  
  return taskDate >= weekStart && taskDate <= weekEnd;
}

/**
 * Verifica se uma tarefa pertence ao mês selecionado
 * Se a tarefa não tem dueDate, ela só aparece no mês atual
 */
export function isTaskInMonth(dueDate: string | undefined, monthStartDate: string, monthEndDate: string): boolean {
  // Se não tem dueDate, mostra apenas no mês atual
  if (!dueDate) {
    const currentMonth = getMonthDates(new Date());
    return monthStartDate === currentMonth.startDate && monthEndDate === currentMonth.endDate;
  }
  
  const taskDate = startOfDay(parseISO(dueDate));
  const monthStart = startOfDay(parseISO(monthStartDate));
  const monthEnd = startOfDay(parseISO(monthEndDate));
  
  return taskDate >= monthStart && taskDate <= monthEnd;
}

/**
 * Ordena tarefas por data de entrega e depois por prioridade
 * Ordem: tarefas com data (mais próximas primeiro) > tarefas sem data (ordenadas por prioridade)
 */
export function sortTasksByDueDateAndPriority<T extends { dueDate?: string; priority: 'low' | 'medium' | 'high' }>(
  tasks: T[]
): T[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return [...tasks].sort((a, b) => {
    // Se ambas têm data de entrega, ordena por data
    if (a.dueDate && b.dueDate) {
      const dateA = parseISO(a.dueDate).getTime();
      const dateB = parseISO(b.dueDate).getTime();
      
      if (dateA !== dateB) {
        return dateA - dateB; // Mais próximas primeiro
      }
      
      // Se a data é igual, ordena por prioridade
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    // Se apenas uma tem data, a com data vem primeiro
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Se nenhuma tem data, ordena apenas por prioridade
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
