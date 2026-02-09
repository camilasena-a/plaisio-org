import { useStore } from '@/store/useStore';
import { formatWeekRange, getNextWeek, getPreviousWeek } from '@/utils/date';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from './icons';

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
    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        <CalendarIcon className="w-5 h-5 text-gray-600" />
        <h1 className="text-xl font-bold text-gray-900">Plaisio Org</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center min-w-[250px]">
          <div className="text-sm text-gray-600">Semana de</div>
          <div className="font-semibold text-gray-900">
            {formatWeekRange(weekStartDate, weekEndDate)}
          </div>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Próxima semana"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={handleCurrentWeek}
          className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          Semana Atual
        </button>
      </div>
    </div>
  );
}
