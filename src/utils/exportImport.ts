import type { Task, Column } from '@/types';

export interface ExportData {
  columns: Column[];
  monthStartDate: string;
  monthEndDate: string;
  exportedAt: string;
  version: string;
}

/**
 * Exporta todas as tarefas e configurações para JSON
 */
export function exportData(columns: Column[], monthStartDate: string, monthEndDate: string): void {
  const data: ExportData = {
    columns,
    monthStartDate,
    monthEndDate,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `plaisio-org-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta tarefas para CSV
 */
export function exportToCSV(columns: Column[]): void {
  const allTasks = columns.flatMap((col) => col.tasks);
  
  if (allTasks.length === 0) {
    throw new Error('Não há tarefas para exportar');
  }

  const headers = ['Título', 'Descrição', 'Status', 'Prioridade', 'Matéria', 'Data de Entrega', 'Criada em', 'Atualizada em'];
  const rows = allTasks.map((task) => [
    task.title,
    task.description || '',
    task.status === 'todo' ? 'A Fazer' : task.status === 'in-progress' ? 'Em Progresso' : 'Concluído',
    task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta',
    task.subject || '',
    task.dueDate || '',
    new Date(task.createdAt).toLocaleString('pt-BR'),
    new Date(task.updatedAt).toLocaleString('pt-BR'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `plaisio-org-tarefas-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida e importa dados de um arquivo JSON
 */
export function importData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as ExportData;

        // Validação básica
        if (!data.columns || !Array.isArray(data.columns)) {
          throw new Error('Formato inválido: colunas não encontradas');
        }

        if (!data.columns.every((col) => col.id && col.title && Array.isArray(col.tasks))) {
          throw new Error('Formato inválido: estrutura de colunas incorreta');
        }

        // Valida tarefas
        for (const col of data.columns) {
          for (const task of col.tasks) {
            if (!task.id || !task.title || !task.status || !task.priority) {
              throw new Error('Formato inválido: tarefa incompleta encontrada');
            }
          }
        }

        resolve(data);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Erro ao importar arquivo'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(file);
  });
}

/**
 * Cria um input de arquivo e retorna uma Promise com o arquivo selecionado
 */
export function selectFile(accept = '.json'): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Nenhum arquivo selecionado'));
      }
    };
    input.oncancel = () => {
      reject(new Error('Seleção cancelada'));
    };
    input.click();
  });
}
