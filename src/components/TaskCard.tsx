import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { PRIORITY_CONFIG } from '@/utils/constants';
import { formatDate, isTaskOverdue, isTaskDueToday } from '@/utils/date';
import { TrashIcon, EditIcon, CalendarIcon, AlertIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onView?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onView }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate ? isTaskOverdue(task.dueDate) : false;
  const isDueToday = task.dueDate ? isTaskDueToday(task.dueDate) : false;

  // Determina as cores do card baseado na prioridade ou status de vencimento
  const getCardStyles = () => {
    // Prioridade: vencido > vence hoje > prioridade normal
    if (isOverdue) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/10',
        border: 'border-red-500 dark:border-red-600',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/20',
      };
    }
    if (isDueToday) {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/10',
        border: 'border-yellow-400 dark:border-yellow-500',
        hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/20',
      };
    }
    // Usa as cores da prioridade
    return {
      bg: priorityConfig.cardBg,
      border: priorityConfig.cardBorder,
      hover: priorityConfig.cardHover,
    };
  };

  const cardStyles = getCardStyles();

  // Handler para clique no card (não interfere com drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Salva a posição inicial do mouse
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Não abre o modal se:
    // - Estiver arrastando
    // - Estiver clicando nos botões de ação
    // - Houver movimento significativo do mouse (drag)
    if (
      isDragging ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('svg')
    ) {
      return;
    }

    // Verifica se houve movimento do mouse (drag)
    if (mouseDownPos) {
      const deltaX = Math.abs(e.clientX - mouseDownPos.x);
      const deltaY = Math.abs(e.clientY - mouseDownPos.y);
      
      // Se o mouse se moveu mais de 5px, considera como drag
      if (deltaX > 5 || deltaY > 5) {
        setMouseDownPos(null);
        return;
      }
    }

    setMouseDownPos(null);
    
    if (onView) {
      onView(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onClick={handleCardClick}
      className={`group ${cardStyles.bg} rounded-lg shadow-sm border-2 ${cardStyles.border} p-4 cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging 
          ? 'ring-2 ring-primary-500 scale-105 shadow-xl z-50' 
          : `hover:shadow-lg hover:scale-[1.02] ${cardStyles.hover} ${onView ? 'cursor-pointer' : ''}`
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex-1 pr-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Editar tarefa"
          >
            <EditIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Deletar tarefa"
          >
            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {isOverdue && (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 dark:bg-red-600 text-white flex items-center gap-1">
            <AlertIcon className="w-3 h-3" />
            Vencida
          </span>
        )}

        {isDueToday && !isOverdue && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950">
            Hoje
          </span>
        )}

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}
        >
          {priorityConfig.label}
        </span>

        {task.subject && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            {task.subject}
          </span>
        )}

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400 font-semibold' 
              : isDueToday
              ? 'text-yellow-700 dark:text-yellow-400 font-semibold'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            <CalendarIcon className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
