import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import type { Task } from '@/types';
import { SearchIcon, XIcon } from './icons';

interface SearchBarProps {
  onTaskSelect?: (task: Task) => void;
}

export function SearchBar({ onTaskSelect }: SearchBarProps) {
  const { columns } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Busca tarefas
  const searchResults = searchQuery.trim()
    ? columns
        .flatMap((col) => col.tasks)
        .filter((task) => {
          const query = searchQuery.toLowerCase();
          return (
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.subject?.toLowerCase().includes(query)
          );
        })
        .slice(0, 10) // Limita a 10 resultados
    : [];

  // Abre busca com Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fecha com Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        handleTaskSelect(searchResults[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleArrowKeys);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [isOpen, searchResults, selectedIndex]);

  // Scroll para o item selecionado
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleTaskSelect = (task: Task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
        aria-label="Buscar tarefas (Ctrl+K)"
        title="Buscar tarefas (Ctrl+K)"
      >
        <SearchIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar tarefas...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
        onClick={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
      />
      
      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar por título, descrição ou matéria..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Limpar busca"
              >
                <XIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-96 overflow-y-auto"
          >
            {searchQuery.trim() && searchResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Nenhuma tarefa encontrada</p>
                <p className="text-sm mt-1">Tente buscar por título, descrição ou matéria</p>
              </div>
            ) : searchQuery.trim() && searchResults.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((task, index) => {
                  const column = columns.find((col) => col.tasks.some((t) => t.id === task.id));
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={task.id}
                      onClick={() => handleTaskSelect(task)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        isSelected ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {task.subject && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                {task.subject}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {column?.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Digite para buscar tarefas</p>
                <p className="text-sm mt-1">Use as setas ↑↓ para navegar, Enter para selecionar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
