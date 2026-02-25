import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import { exportData, exportToCSV, importData, selectFile } from '@/utils/exportImport';
import { DownloadIcon, UploadIcon } from './icons';

export function ExportImportMenu() {
  const { columns, monthStartDate, monthEndDate, updateMonth } = useStore();
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    try {
      exportData(columns, monthStartDate, monthEndDate);
      addToast('Dados exportados com sucesso!', 'success');
      setIsOpen(false);
    } catch (error) {
      addToast('Erro ao exportar dados', 'error');
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(columns);
      addToast('Tarefas exportadas para CSV!', 'success');
      setIsOpen(false);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao exportar CSV', 'error');
      console.error(error);
    }
  };

  const handleImport = async () => {
    try {
      const file = await selectFile('.json');
      const data = await importData(file);

      // Confirmação antes de importar
      const confirmed = window.confirm(
        'Importar dados substituirá todas as tarefas atuais. Deseja continuar?'
      );

      if (!confirmed) return;

      // Atualiza o store usando as actions
      const { updateMonth } = useStore.getState();
      useStore.setState({
        columns: data.columns,
      });
      updateMonth(data.monthStartDate, data.monthEndDate);

      addToast('Dados importados com sucesso!', 'success');
      setIsOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message !== 'Seleção cancelada') {
        addToast(`Erro ao importar: ${error.message}`, 'error');
        console.error(error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Exportar/Importar dados"
        title="Exportar/Importar dados"
      >
        <DownloadIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-20 min-w-[200px]">
            <div className="space-y-1">
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Exportar JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Exportar CSV
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={handleImport}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                Importar JSON
              </button>
            </div>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
