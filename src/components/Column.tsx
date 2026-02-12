import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column as ColumnType, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { COLUMN_CONFIG } from '@/utils/constants';
import { PlusIcon } from './icons';
import { useStore } from '@/store/useStore';

interface ColumnProps {
  column: ColumnType;
  onAddTask: (status: ColumnType['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({ column, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const { columns } = useStore();
  const config = COLUMN_CONFIG[column.id];
  const taskIds = column.tasks.map((task) => task.id);

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
              {column.tasks.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(column.id)}
            className={`p-2 rounded-lg transition-all duration-200 ${config.buttonTextColor} ${config.buttonHoverColor} hover:scale-110 active:scale-95`}
            aria-label={`Adicionar tarefa em ${column.title}`}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
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
          {column.tasks.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
              Nenhuma tarefa ainda
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
