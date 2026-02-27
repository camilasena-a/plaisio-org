import { useEffect } from 'react';
import { useUndoRedoStore } from '@/store/useUndoRedoStore';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import { UndoIcon, RedoIcon } from './icons';

export function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useUndoRedoStore();
  const { restoreState } = useStore();
  const { addToast } = useToastStore();

  const handleUndo = () => {
    const state = undo();
    if (state) {
      restoreState(state.columns, state.monthStartDate, state.monthEndDate);
      addToast('Ação desfeita', 'success');
    }
  };

  const handleRedo = () => {
    const state = redo();
    if (state) {
      restoreState(state.columns, state.monthStartDate, state.monthEndDate);
      addToast('Ação refeita', 'success');
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Não intercepta se estiver em um input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) {
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className={`p-2 rounded-lg transition-all duration-200 ${
          canUndo()
            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 active:scale-95'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Desfazer (Ctrl+Z)"
        title="Desfazer (Ctrl+Z)"
      >
        <UndoIcon className="w-5 h-5" />
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className={`p-2 rounded-lg transition-all duration-200 ${
          canRedo()
            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 active:scale-95'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Refazer (Ctrl+Y ou Ctrl+Shift+Z)"
        title="Refazer (Ctrl+Y ou Ctrl+Shift+Z)"
      >
        <RedoIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
