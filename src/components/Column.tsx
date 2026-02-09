import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column as ColumnType, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { COLUMN_CONFIG } from '@/utils/constants';
import { PlusIcon } from './icons';

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

  const config = COLUMN_CONFIG[column.id];
  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className="flex flex-col h-full min-w-[300px] max-w-[350px]">
      <div
        className={`flex items-center justify-between p-4 rounded-t-lg border-2 ${
          isOver ? 'border-primary-500 bg-primary-50' : config.color
        } transition-colors`}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-800">{column.title}</h2>
          <span className="bg-white text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          aria-label={`Adicionar tarefa em ${column.title}`}
        >
          <PlusIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-3 overflow-y-auto rounded-b-lg ${
          isOver ? 'bg-primary-50' : 'bg-gray-50'
        } transition-colors min-h-[400px]`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
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
