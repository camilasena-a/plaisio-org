import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSubjectFilterStore } from '@/store/useSubjectFilterStore';
import { FilterIcon, XIcon } from './icons';

export function SubjectFilter() {
  const { columns } = useStore();
  const { selectedSubject, setSubject, clearFilter } = useSubjectFilterStore();
  const [isOpen, setIsOpen] = useState(false);

  // Extrai todas as matérias únicas das tarefas
  const subjects = useMemo(() => {
    const allSubjects = columns
      .flatMap((col) => col.tasks)
      .map((task) => task.subject)
      .filter((subject): subject is string => Boolean(subject));
    
    return Array.from(new Set(allSubjects)).sort();
  }, [columns]);

  if (subjects.length === 0) {
    return null; // Não mostra se não há matérias
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
          selectedSubject
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
        }`}
        aria-label="Filtrar por matéria"
        title="Filtrar por matéria"
      >
        <FilterIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {selectedSubject || 'Matéria'}
        </span>
        {selectedSubject && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFilter();
            }}
            className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800/50 rounded p-0.5"
            aria-label="Limpar filtro"
          >
            <XIcon className="w-3 h-3" />
          </button>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-20 min-w-[200px] max-h-64 overflow-y-auto">
            <div className="space-y-1">
              <button
                onClick={() => {
                  clearFilter();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                  !selectedSubject
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Todas as matérias
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              {subjects.map((subject) => {
                const count = columns
                  .flatMap((col) => col.tasks)
                  .filter((task) => task.subject === subject).length;

                return (
                  <button
                    key={subject}
                    onClick={() => {
                      setSubject(subject);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      selectedSubject === subject
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{subject}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
