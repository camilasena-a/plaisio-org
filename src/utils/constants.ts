import type { TaskStatus } from '@/types';

export const COLUMN_CONFIG: Record<TaskStatus, { 
  title: string; 
  color: string; 
  headerColor: string; 
  headerTextColor: string;
  progressColor: string;
  hoverColor: string;
  buttonHoverColor: string;
  buttonTextColor: string;
  borderColor: string;
}> = {
  'todo': {
    title: 'A Fazer',
    color: 'bg-gray-50 dark:bg-gray-800/50',
    headerColor: 'bg-slate-100 dark:bg-slate-800',
    headerTextColor: 'text-slate-700 dark:text-slate-300',
    progressColor: 'bg-slate-400 dark:bg-slate-600',
    hoverColor: 'bg-slate-50 dark:bg-slate-800/80',
    buttonHoverColor: 'hover:bg-slate-300 dark:hover:bg-slate-700/50',
    buttonTextColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-400 dark:border-slate-600',
  },
  'in-progress': {
    title: 'Em Progresso',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    headerColor: 'bg-blue-200 dark:bg-blue-900/40',
    headerTextColor: 'text-blue-700 dark:text-blue-300',
    progressColor: 'bg-blue-500 dark:bg-blue-600',
    hoverColor: 'bg-blue-50 dark:bg-blue-900/20',
    buttonHoverColor: 'hover:bg-blue-300 dark:hover:bg-blue-800/50',
    buttonTextColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500 dark:border-blue-600',
  },
  'done': {
    title: 'Concluído',
    color: 'bg-emerald-50 dark:bg-emerald-950/30',
    headerColor: 'bg-emerald-200 dark:bg-emerald-900/40',
    headerTextColor: 'text-emerald-700 dark:text-emerald-300',
    progressColor: 'bg-emerald-500 dark:bg-emerald-600',
    hoverColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    buttonHoverColor: 'hover:bg-emerald-300 dark:hover:bg-emerald-800/50',
    buttonTextColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500 dark:border-emerald-600',
  },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  medium: { label: 'Média', color: 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200' },
  high: { label: 'Alta', color: 'bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200' },
} as const;
