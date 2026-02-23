import { useEffect } from 'react';
import type { Task } from '@/types';
import { PRIORITY_CONFIG } from '@/utils/constants';
import { formatDate, isTaskOverdue, isTaskDueToday } from '@/utils/date';
import { XIcon, EditIcon, TrashIcon, CalendarIcon, AlertIcon } from './icons';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailsModal({
  isOpen,
  task,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate ? isTaskOverdue(task.dueDate) : false;
  const isDueToday = task.dueDate ? isTaskDueToday(task.dueDate) : false;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'A Fazer';
      case 'in-progress':
        return 'Em Progresso';
      case 'done':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'done':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalhes da Tarefa
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              aria-label="Editar tarefa"
              title="Editar"
            >
              <EditIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Título
            </label>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task.title}
            </h3>
          </div>

          {/* Descrição */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Descrição
              </label>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Informações */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Status
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {getStatusLabel(task.status)}
              </span>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Prioridade
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}
              >
                {priorityConfig.label}
              </span>
            </div>

            {/* Matéria */}
            {task.subject && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Matéria
                </label>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {task.subject}
                </span>
              </div>
            )}

            {/* Data de Entrega */}
            {task.dueDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Data de Entrega
                </label>
                <div
                  className={`flex items-center gap-2 ${
                    isOverdue
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : isDueToday
                      ? 'text-yellow-700 dark:text-yellow-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(task.dueDate)}</span>
                  {isOverdue && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-red-500 dark:bg-red-600 text-white flex items-center gap-1">
                      <AlertIcon className="w-3 h-3" />
                      Vencida
                    </span>
                  )}
                  {isDueToday && !isOverdue && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950">
                      Hoje
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Datas de criação e atualização */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">Criada em:</span>{' '}
                {new Date(task.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {task.updatedAt !== task.createdAt && (
                <div>
                  <span className="font-medium">Atualizada em:</span>{' '}
                  {new Date(task.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onDelete(task.id)}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Excluir Tarefa
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
