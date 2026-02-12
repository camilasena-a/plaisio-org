import { useStore } from '@/store/useStore';
import { formatWeekRange, getNextWeek, getPreviousWeek } from '@/utils/date';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

export function WeekSelector() {
  const { weekStartDate, weekEndDate, updateWeek, initializeWeek } = useStore();

  const handlePreviousWeek = () => {
    const { startDate, endDate } = getPreviousWeek(weekStartDate);
    updateWeek(startDate, endDate);
  };

  const handleNextWeek = () => {
    const { startDate, endDate } = getNextWeek(weekStartDate);
    updateWeek(startDate, endDate);
  };

  const handleCurrentWeek = () => {
    initializeWeek();
  };

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      {/* Seção Esquerda - Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Plaisio Org</h1>
      </div>

      {/* Seção Central - Datas da Semana */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
          aria-label="Semana anterior"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" />
        </button>

        <div className="text-center min-w-[250px] hover:scale-105 transition-transform duration-200 cursor-default">
          <div className="text-sm text-gray-600 dark:text-gray-400">Semana de</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatWeekRange(weekStartDate, weekEndDate)}
          </div>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
          aria-label="Próxima semana"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" />
        </button>
      </div>

      {/* Seção Direita - Controles */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={handleCurrentWeek}
          className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
        >
          Semana Atual
        </button>

        <ThemeToggle />
      </div>
    </div>
  );
}
