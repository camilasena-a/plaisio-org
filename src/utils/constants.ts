import type { TaskStatus } from '@/types';

export const COLUMN_CONFIG: Record<TaskStatus, { title: string; color: string }> = {
  'todo': {
    title: 'A Fazer',
    color: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  },
  'in-progress': {
    title: 'Em Progresso',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
  },
  'done': {
    title: 'Concluído',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
  },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  medium: { label: 'Média', color: 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200' },
  high: { label: 'Alta', color: 'bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200' },
} as const;
