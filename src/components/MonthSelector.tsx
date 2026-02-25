import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatMonthRange, getNextMonth, getPreviousMonth, isTaskInMonth, isTaskOverdue } from '@/utils/date';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { ExportImportMenu } from './ExportImportMenu';

export function MonthSelector() {
  const { monthStartDate, monthEndDate, updateMonth, initializeMonth, columns } = useStore();
  
  // Calcula estatísticas do mês
  const monthStats = useMemo(() => {
    const allTasks = columns.flatMap(col => col.tasks);
    const monthTasks = allTasks.filter(task => 
      isTaskInMonth(task.dueDate, monthStartDate, monthEndDate)
    );
    
    const total = monthTasks.length;
    const done = monthTasks.filter(t => t.status === 'done').length;
    const overdue = monthTasks.filter(t => t.dueDate && isTaskOverdue(t.dueDate)).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    
    return { total, done, overdue, progress };
  }, [columns, monthStartDate, monthEndDate]);

  const handlePreviousMonth = () => {
    const { startDate, endDate } = getPreviousMonth(monthStartDate);
    updateMonth(startDate, endDate);
  };

  const handleNextMonth = () => {
    const { startDate, endDate } = getNextMonth(monthStartDate);
    updateMonth(startDate, endDate);
  };

  const handleCurrentMonth = () => {
    initializeMonth();
  };

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      {/* Seção Esquerda - Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Plaisio Org</h1>
      </div>

      {/* Seção Central - Datas do Mês */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
          aria-label="Mês anterior"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" />
        </button>

        <div className="text-center min-w-[250px] hover:scale-105 transition-transform duration-200 cursor-default">
          <div className="text-sm text-gray-600 dark:text-gray-400">Mês de</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatMonthRange(monthStartDate, monthEndDate)}
          </div>
          {/* Estatísticas do mês */}
          {monthStats.total > 0 && (
            <div className="flex items-center justify-center gap-3 mt-2 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {monthStats.total} tarefa{monthStats.total !== 1 ? 's' : ''}
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {monthStats.done} concluída{monthStats.done !== 1 ? 's' : ''}
              </span>
              {monthStats.overdue > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {monthStats.overdue} vencida{monthStats.overdue !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
          aria-label="Próximo mês"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" />
        </button>
      </div>

      {/* Seção Direita - Controles */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchBar onTaskSelect={(task) => {
          // Scroll para a tarefa será implementado quando integrarmos com o Board
          window.dispatchEvent(new CustomEvent('task-selected', { detail: task }));
        }} />
        
        <ExportImportMenu />
        
        <button
          onClick={handleCurrentMonth}
          className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
        >
          Mês Atual
        </button>

        <ThemeToggle />
      </div>
    </div>
  );
}
