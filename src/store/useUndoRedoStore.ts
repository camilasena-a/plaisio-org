import { create } from 'zustand';
import type { Column } from '@/types';

interface HistoryState {
  past: Array<{ columns: Column[]; monthStartDate: string; monthEndDate: string }>;
  present: { columns: Column[]; monthStartDate: string; monthEndDate: string } | null;
  future: Array<{ columns: Column[]; monthStartDate: string; monthEndDate: string }>;
  maxHistorySize: number;
}

interface UndoRedoActions {
  saveState: (columns: Column[], monthStartDate: string, monthEndDate: string) => void;
  undo: () => { columns: Column[]; monthStartDate: string; monthEndDate: string } | null;
  redo: () => { columns: Column[]; monthStartDate: string; monthEndDate: string } | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useUndoRedoStore = create<HistoryState & UndoRedoActions>((set, get) => ({
  past: [],
  present: null,
  future: [],
  maxHistorySize: 50,

  saveState: (columns, monthStartDate, monthEndDate) => {
    const state = { columns, monthStartDate, monthEndDate };
    const { present, past, maxHistorySize } = get();

    // Não salva se o estado é igual ao atual
    if (present && JSON.stringify(present) === JSON.stringify(state)) {
      return;
    }

    set({
      past: present ? [...past.slice(-maxHistorySize + 1), present] : past,
      present: state,
      future: [], // Limpa o futuro quando uma nova ação é feita
    });
  },

  undo: () => {
    const { past, present } = get();
    if (past.length === 0 || !present) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      present: previous,
      future: [present, ...get().future],
    });

    return previous;
  },

  redo: () => {
    const { future, present } = get();
    if (future.length === 0 || !present) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...get().past, present],
      present: next,
      future: newFuture,
    });

    return next;
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },

  clearHistory: () => {
    set({
      past: [],
      present: null,
      future: [],
    });
  },
}));
