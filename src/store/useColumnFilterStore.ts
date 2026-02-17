import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaskStatus } from '@/types';

type Priority = 'low' | 'medium' | 'high';

interface ColumnFilterState {
  // Mapeia cada coluna para um array de prioridades selecionadas
  // Se vazio, mostra todas as prioridades
  columnFilters: Record<TaskStatus, Priority[]>;
  
  // Toggle uma prioridade em uma coluna específica
  togglePriority: (columnId: TaskStatus, priority: Priority) => void;
  
  // Limpa todos os filtros de uma coluna (mostra todas as prioridades)
  clearColumnFilter: (columnId: TaskStatus) => void;
  
  // Verifica se uma prioridade está filtrada em uma coluna
  isPriorityFiltered: (columnId: TaskStatus, priority: Priority) => boolean;
  
  // Verifica se há algum filtro ativo em uma coluna
  hasActiveFilter: (columnId: TaskStatus) => boolean;
}

const initialFilters: Record<TaskStatus, Priority[]> = {
  'todo': [],
  'in-progress': [],
  'done': [],
};

export const useColumnFilterStore = create<ColumnFilterState>()(
  persist(
    (set, get) => ({
      columnFilters: initialFilters,
      
      togglePriority: (columnId, priority) => {
        set((state) => {
          const currentFilters = state.columnFilters[columnId] || [];
          const isFiltered = currentFilters.includes(priority);
          
          let newFilters: Priority[];
          if (isFiltered) {
            // Remove a prioridade do filtro
            newFilters = currentFilters.filter((p) => p !== priority);
          } else {
            // Adiciona a prioridade ao filtro
            newFilters = [...currentFilters, priority];
          }
          
          return {
            columnFilters: {
              ...state.columnFilters,
              [columnId]: newFilters,
            },
          };
        });
      },
      
      clearColumnFilter: (columnId) => {
        set((state) => ({
          columnFilters: {
            ...state.columnFilters,
            [columnId]: [],
          },
        }));
      },
      
      isPriorityFiltered: (columnId, priority) => {
        const filters = get().columnFilters[columnId] || [];
        return filters.includes(priority);
      },
      
      hasActiveFilter: (columnId) => {
        const filters = get().columnFilters[columnId] || [];
        return filters.length > 0;
      },
    }),
    {
      name: 'plaisio-column-filters-storage',
    }
  )
);
