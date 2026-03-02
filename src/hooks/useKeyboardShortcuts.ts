import { useEffect, useRef } from 'react';

interface KeyboardShortcuts {
  'ctrl+n'?: () => void;
  'ctrl+k'?: () => void;
  escape?: () => void;
}

/**
 * Hook para gerenciar atalhos de teclado de forma otimizada
 * Evita re-renderizações desnecessárias usando useRef
 * 
 * @param shortcuts - Objeto com as funções de callback para cada atalho
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   'ctrl+n': () => handleNewTask(),
 *   'ctrl+k': () => handleSearch(),
 *   escape: () => handleClose(),
 * });
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  // Usa useRef para manter a referência mais recente sem causar re-renderizações
  const shortcutsRef = useRef(shortcuts);
  
  // Atualiza a referência sempre que shortcuts mudar
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentShortcuts = shortcutsRef.current;
      
      // Ctrl+N ou Cmd+N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentShortcuts['ctrl+n']) {
        e.preventDefault();
        currentShortcuts['ctrl+n']();
        return;
      }

      // Ctrl+K ou Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && currentShortcuts['ctrl+k']) {
        e.preventDefault();
        currentShortcuts['ctrl+k']();
        return;
      }

      // Escape
      if (e.key === 'Escape' && currentShortcuts.escape) {
        currentShortcuts.escape();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Array vazio - o listener só é criado uma vez
}
