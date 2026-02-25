import { useMemo, useState, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column as ColumnType, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { COLUMN_CONFIG, PRIORITY_CONFIG } from '@/utils/constants';
import { PlusIcon, FilterIcon, XIcon } from './icons';
import { useStore } from '@/store/useStore';
import { useColumnFilterStore } from '@/store/useColumnFilterStore';
import { sortTasksByDueDateAndPriority, isTaskInMonth, getPreviousMonth, getMonthDates } from '@/utils/date';

interface ColumnProps {
  column: ColumnType;
  onAddTask: (status: ColumnType['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask?: (task: Task) => void;
}

export const Column = memo(function Column({ column, onAddTask, onEditTask, onDeleteTask, onViewTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const { columns, monthStartDate, monthEndDate } = useStore();
  const { columnFilters, togglePriority, clearColumnFilter, hasActiveFilter } = useColumnFilterStore();
  const config = COLUMN_CONFIG[column.id];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const activeFilters = columnFilters[column.id] || [];
  const hasFilter = hasActiveFilter(column.id);
  
  // Filtra e ordena as tarefas
  const sortedTasks = useMemo(() => {
    let tasksToShow = column.tasks;
    
    // Para tarefas concluídas, mostra apenas do mês atual ou anterior (histórico recente)
    if (column.id === 'done') {
      // Verifica se estamos visualizando o mês atual
      const today = new Date();
      const currentMonthDates = getMonthDates(today);
      const isCurrentMonth = monthStartDate === currentMonthDates.startDate && monthEndDate === currentMonthDates.endDate;
      
      if (isCurrentMonth) {
        // Se estamos no mês atual, mostra tarefas do mês atual e anterior
        const previousMonth = getPreviousMonth(monthStartDate);
        tasksToShow = tasksToShow.filter((task) => 
          isTaskInMonth(task.dueDate, monthStartDate, monthEndDate) ||
          isTaskInMonth(task.dueDate, previousMonth.startDate, previousMonth.endDate)
        );
      } else {
        // Se estamos em outro mês, mostra apenas tarefas concluídas desse mês
        tasksToShow = tasksToShow.filter((task) => 
          isTaskInMonth(task.dueDate, monthStartDate, monthEndDate)
        );
      }
    } else {
      // Para outras colunas, filtra por mês selecionado normalmente
      tasksToShow = tasksToShow.filter((task) => 
        isTaskInMonth(task.dueDate, monthStartDate, monthEndDate)
      );
    }
    
    // Se há filtros ativos, filtra por prioridade
    if (hasFilter && activeFilters.length > 0) {
      tasksToShow = tasksToShow.filter((task) => activeFilters.includes(task.priority));
    }
    
    // Ordena por data de entrega e depois por prioridade
    return sortTasksByDueDateAndPriority(tasksToShow);
  }, [column.tasks, column.id, activeFilters, hasFilter, monthStartDate, monthEndDate]);
  
  const taskIds = sortedTasks.map((task) => task.id);
  
  const handleTogglePriority = (priority: 'low' | 'medium' | 'high') => {
    togglePriority(column.id, priority);
  };
  
  const handleClearFilter = () => {
    clearColumnFilter(column.id);
    setIsFilterOpen(false);
  };

  // Calcular progresso da coluna
  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const columnProgress = totalTasks > 0 ? (column.tasks.length / totalTasks) * 100 : 0;

  return (
    <div className="flex flex-col h-full min-w-[300px] max-w-[350px] group">
      <div
        className={`flex flex-col rounded-t-lg border-2 transition-all duration-200 ${
          isOver 
            ? `${config.borderColor} ${config.hoverColor} shadow-lg scale-[1.02]` 
            : `${config.headerColor} ${config.borderColor} group-hover:shadow-md`
        }`}
      >
        {/* Header com indicador de progresso */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 flex-1">
            <h2 className={`font-bold ${config.headerTextColor}`}>
              {column.title}
            </h2>
            <span className={`bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full border ${config.borderColor}`}>
              {sortedTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Botão de filtro */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  hasFilter
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : `${config.buttonTextColor} ${config.buttonHoverColor}`
                } hover:scale-110 active:scale-95`}
                aria-label={`Filtrar por prioridade em ${column.title}`}
                title="Filtrar por prioridade"
              >
                <FilterIcon className="w-5 h-5" />
              </button>
              
              {/* Dropdown de filtro */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-20 min-w-[180px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Filtrar por prioridade
                      </span>
                      {hasFilter && (
                        <button
                          onClick={handleClearFilter}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          aria-label="Limpar filtros"
                          title="Limpar filtros"
                        >
                          <XIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(['low', 'medium', 'high'] as const).map((priority) => {
                        const isSelected = activeFilters.includes(priority);
                        const priorityConfig = PRIORITY_CONFIG[priority];
                        return (
                          <label
                            key={priority}
                            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePriority(priority)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400"
                            />
                            <span className={`text-sm ${priorityConfig.color} px-2 py-1 rounded-full`}>
                              {priorityConfig.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {activeFilters.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Selecione para filtrar
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Botão adicionar tarefa */}
            <button
              onClick={() => onAddTask(column.id)}
              className={`p-2 rounded-lg transition-all duration-200 ${config.buttonTextColor} ${config.buttonHoverColor} hover:scale-110 active:scale-95`}
              aria-label={`Adicionar tarefa em ${column.title}`}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        {totalTasks > 0 && (
          <div className="px-4 pb-3">
            <div className="h-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${config.progressColor}`}
                style={{ width: `${columnProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-3 overflow-y-auto rounded-b-lg transition-all duration-200 ${
          isOver 
            ? config.hoverColor
            : `${config.color} group-hover:bg-opacity-80`
        } min-h-[400px]`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {sortedTasks.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
              {column.tasks.length === 0 ? (
                <>
                  <p className="mb-2">Nenhuma tarefa ainda</p>
                  <p className="text-xs opacity-75">Clique no botão + para adicionar</p>
                </>
              ) : (
                <>
                  <p className="mb-2">Nenhuma tarefa neste mês</p>
                  <p className="text-xs opacity-75">Tente navegar para outro mês</p>
                </>
              )}
            </div>
          ) : (
            sortedTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <TaskCard
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onView={onViewTask}
                />
              </div>
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada: só re-renderiza se as tarefas da coluna mudaram
  const prevTaskIds = prevProps.column.tasks.map(t => t.id).join(',');
  const nextTaskIds = nextProps.column.tasks.map(t => t.id).join(',');
  
  return (
    prevProps.column.id === nextProps.column.id &&
    prevTaskIds === nextTaskIds &&
    prevProps.column.tasks.length === nextProps.column.tasks.length
  );
});
