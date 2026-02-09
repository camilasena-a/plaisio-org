import type { TaskStatus } from '@/types';

export const COLUMN_CONFIG: Record<TaskStatus, { title: string; color: string }> = {
  'todo': {
    title: 'A Fazer',
    color: 'bg-gray-100 border-gray-300',
  },
  'in-progress': {
    title: 'Em Progresso',
    color: 'bg-blue-50 border-blue-300',
  },
  'done': {
    title: 'Concluído',
    color: 'bg-green-50 border-green-300',
  },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-gray-200 text-gray-700' },
  medium: { label: 'Média', color: 'bg-yellow-200 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-red-200 text-red-800' },
} as const;
