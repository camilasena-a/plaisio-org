import { useEffect } from 'react';

interface KeyboardShortcuts {
  'ctrl+n'?: () => void;
  'ctrl+k'?: () => void;
  escape?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N ou Cmd+N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && shortcuts['ctrl+n']) {
        e.preventDefault();
        shortcuts['ctrl+n']();
        return;
      }

      // Ctrl+K ou Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && shortcuts['ctrl+k']) {
        e.preventDefault();
        shortcuts['ctrl+k']();
        return;
      }

      // Escape
      if (e.key === 'Escape' && shortcuts.escape) {
        shortcuts.escape();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
