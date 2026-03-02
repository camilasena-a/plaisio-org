import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, Column } from '@/types';
import { getMonthDates } from '@/utils/date';
import { useUndoRedoStore } from './useUndoRedoStore';
import { validateTask, validateColumns } from '@/utils/validation';
import { useToastStore } from './useToastStore';
import { zustandStorage, checkStorageAvailability } from '@/utils/zustandStorage';

interface StoreState {
  columns: Column[];
  monthStartDate: string;
  monthEndDate: string;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex?: number) => void;
  reorderTasks: (status: TaskStatus, startIndex: number, endIndex: number) => void;
  moveTaskBetweenColumns: (
    taskId: string,
    sourceStatus: TaskStatus,
    destinationStatus: TaskStatus,
    destinationIndex: number
  ) => void;
  updateMonth: (startDate: string, endDate: string) => void;
  initializeMonth: () => void;
  restoreState: (columns: Column[], monthStartDate: string, monthEndDate: string) => void;
}

const initialColumns: Column[] = [
  { id: 'todo', title: 'A Fazer', tasks: [] },
  { id: 'in-progress', title: 'Em Progresso', tasks: [] },
  { id: 'done', title: 'Concluído', tasks: [] },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => {
      const { startDate, endDate } = getMonthDates(new Date());
      
      return {
        columns: initialColumns,
        monthStartDate: startDate,
        monthEndDate: endDate,
        
        addTask: (taskData) => {
          // Validação dos dados antes de adicionar
          const validation = validateTask(taskData);
          if (!validation.isValid) {
            const { addToast } = useToastStore.getState();
            addToast(`Erro ao criar tarefa: ${validation.errors.join(', ')}`, 'error');
            console.error('Erro de validação ao adicionar tarefa:', validation.errors);
            return;
          }

          try {
            const newTask: Task = {
              ...taskData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            set((state) => {
              const newColumns = state.columns.map((col) =>
                col.id === taskData.status
                  ? { ...col, tasks: [...col.tasks, newTask] }
                  : col
              );
              
              // Salva no histórico
              useUndoRedoStore.getState().saveState(newColumns, state.monthStartDate, state.monthEndDate);
              
              return { columns: newColumns };
            });
          } catch (error) {
            const { addToast } = useToastStore.getState();
            addToast('Erro ao adicionar tarefa. Tente novamente.', 'error');
            console.error('Erro ao adicionar tarefa:', error);
          }
        },
        
        updateTask: (taskId, updates) => {
          // Validação dos dados antes de atualizar
          const validation = validateTask(updates);
          if (!validation.isValid) {
            const { addToast } = useToastStore.getState();
            addToast(`Erro ao atualizar tarefa: ${validation.errors.join(', ')}`, 'error');
            console.error('Erro de validação ao atualizar tarefa:', validation.errors);
            return;
          }

          try {
            set((state) => {
              const taskExists = state.columns.some((col) =>
                col.tasks.some((task) => task.id === taskId)
              );

              if (!taskExists) {
                const { addToast } = useToastStore.getState();
                addToast('Tarefa não encontrada', 'error');
                return state;
              }

              const newColumns = state.columns.map((col) => ({
                ...col,
                tasks: col.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                    : task
                ),
              }));
              
              // Salva no histórico
              useUndoRedoStore.getState().saveState(newColumns, state.monthStartDate, state.monthEndDate);
              
              return { columns: newColumns };
            });
          } catch (error) {
            const { addToast } = useToastStore.getState();
            addToast('Erro ao atualizar tarefa. Tente novamente.', 'error');
            console.error('Erro ao atualizar tarefa:', error);
          }
        },
        
        deleteTask: (taskId) => {
          set((state) => {
            const newColumns = state.columns.map((col) => ({
              ...col,
              tasks: col.tasks.filter((task) => task.id !== taskId),
            }));
            
            // Salva no histórico
            useUndoRedoStore.getState().saveState(newColumns, state.monthStartDate, state.monthEndDate);
            
            return { columns: newColumns };
          });
        },
        
        moveTask: (taskId, newStatus, newIndex) => {
          set((state) => {
            let taskToMove: Task | undefined;
            const updatedColumns = state.columns.map((col) => {
              const taskIndex = col.tasks.findIndex((t) => t.id === taskId);
              if (taskIndex !== -1) {
                taskToMove = col.tasks[taskIndex];
                return {
                  ...col,
                  tasks: col.tasks.filter((t) => t.id !== taskId),
                };
              }
              return col;
            });
            
            if (!taskToMove) return state;
            
            const targetColumn = updatedColumns.find((col) => col.id === newStatus);
            if (!targetColumn) return state;
            
            const newTasks = [...targetColumn.tasks];
            if (newIndex !== undefined) {
              newTasks.splice(newIndex, 0, taskToMove);
            } else {
              newTasks.push(taskToMove);
            }
            
            return {
              columns: updatedColumns.map((col) =>
                col.id === newStatus ? { ...col, tasks: newTasks } : col
              ),
            };
          });
        },
        
        reorderTasks: (status, startIndex, endIndex) => {
          set((state) => {
            const newColumns = state.columns.map((col) => {
              if (col.id !== status) return col;
              
              const newTasks = [...col.tasks];
              const [removed] = newTasks.splice(startIndex, 1);
              newTasks.splice(endIndex, 0, removed);
              
              return { ...col, tasks: newTasks };
            });
            
            // Salva no histórico apenas se realmente mudou
            const oldTasks = state.columns.find(c => c.id === status)?.tasks || [];
            const newTasks = newColumns.find(c => c.id === status)?.tasks || [];
            if (JSON.stringify(oldTasks.map(t => t.id)) !== JSON.stringify(newTasks.map(t => t.id))) {
              useUndoRedoStore.getState().saveState(newColumns, state.monthStartDate, state.monthEndDate);
            }
            
            return { columns: newColumns };
          });
        },
        
        moveTaskBetweenColumns: (
          taskId,
          sourceStatus,
          destinationStatus,
          destinationIndex
        ) => {
          set((state) => {
            let taskToMove: Task | undefined;
            const updatedColumns = state.columns.map((col) => {
              if (col.id === sourceStatus) {
                const taskIndex = col.tasks.findIndex((t) => t.id === taskId);
                if (taskIndex !== -1) {
                  taskToMove = col.tasks[taskIndex];
                  return {
                    ...col,
                    tasks: col.tasks.filter((t) => t.id !== taskId),
                  };
                }
              }
              return col;
            });
            
            if (!taskToMove) return state;
            
            const targetColumn = updatedColumns.find((col) => col.id === destinationStatus);
            if (!targetColumn) return state;
            
            const newTasks = [...targetColumn.tasks];
            newTasks.splice(destinationIndex, 0, taskToMove);
            
            const finalColumns = updatedColumns.map((col) =>
              col.id === destinationStatus ? { ...col, tasks: newTasks } : col
            );
            
            // Salva no histórico
            useUndoRedoStore.getState().saveState(finalColumns, state.monthStartDate, state.monthEndDate);
            
            return { columns: finalColumns };
          });
        },
        
        updateMonth: (startDate, endDate) => {
          set({ monthStartDate: startDate, monthEndDate: endDate });
        },
        
        initializeMonth: () => {
          const { startDate, endDate } = getMonthDates(new Date());
          set({ monthStartDate: startDate, monthEndDate: endDate });
        },
        
        restoreState: (columns, monthStartDate, monthEndDate) => {
          // Validação antes de restaurar o estado
          const validation = validateColumns(columns);
          if (!validation.isValid) {
            const { addToast } = useToastStore.getState();
            addToast(`Erro ao restaurar dados: ${validation.errors.join(', ')}`, 'error');
            console.error('Erro de validação ao restaurar estado:', validation.errors);
            return;
          }

          try {
            set({ columns, monthStartDate, monthEndDate });
          } catch (error) {
            const { addToast } = useToastStore.getState();
            addToast('Erro ao restaurar dados. Tente novamente.', 'error');
            console.error('Erro ao restaurar estado:', error);
          }
        },
      };
    },
    {
      name: 'plaisio-org-storage',
      storage: zustandStorage,
      partialize: (state) => ({
        columns: state.columns,
        monthStartDate: state.monthStartDate,
        monthEndDate: state.monthEndDate,
      }),
      onRehydrateStorage: () => (state) => {
        // Verifica disponibilidade do storage após reidratação
        checkStorageAvailability();
        if (state) {
          // Valida os dados após reidratação
          const validation = validateColumns(state.columns);
          if (!validation.isValid) {
            console.warn('Dados inválidos encontrados após reidratação:', validation.errors);
            const { addToast } = useToastStore.getState();
            addToast('Alguns dados podem estar corrompidos. Verifique suas tarefas.', 'error');
          }
        }
      },
    }
  )
);
