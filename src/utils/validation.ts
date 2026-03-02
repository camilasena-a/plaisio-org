import type { Task, TaskStatus, Column } from '@/types';

/**
 * Valida se uma string é um TaskStatus válido
 */
export function isValidTaskStatus(status: string): status is TaskStatus {
  return ['todo', 'in-progress', 'done'].includes(status);
}

/**
 * Valida se uma string é uma prioridade válida
 */
export function isValidPriority(priority: string): priority is Task['priority'] {
  return ['low', 'medium', 'high'].includes(priority);
}

/**
 * Valida se uma string é uma data ISO válida
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}/);
}

/**
 * Valida os dados de uma tarefa antes de salvar
 * 
 * @param taskData - Dados da tarefa a serem validados
 * @returns Objeto com isValid (boolean) e errors (array de strings)
 */
export function validateTask(
  taskData: Partial<Task> | Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validação do título
  if (!taskData.title || typeof taskData.title !== 'string') {
    errors.push('O título é obrigatório');
  } else if (taskData.title.trim().length < 3) {
    errors.push('O título deve ter pelo menos 3 caracteres');
  } else if (taskData.title.trim().length > 200) {
    errors.push('O título não pode ter mais de 200 caracteres');
  }

  // Validação da descrição
  if (taskData.description && taskData.description.length > 2000) {
    errors.push('A descrição não pode ter mais de 2000 caracteres');
  }

  // Validação do status
  if (taskData.status && !isValidTaskStatus(taskData.status)) {
    errors.push('Status inválido');
  }

  // Validação da prioridade
  if (taskData.priority && !isValidPriority(taskData.priority)) {
    errors.push('Prioridade inválida');
  }

  // Validação da data de entrega
  if (taskData.dueDate && !isValidDate(taskData.dueDate)) {
    errors.push('Data de entrega inválida');
  }

  // Validação da matéria
  if (taskData.subject && taskData.subject.trim().length > 100) {
    errors.push('A matéria não pode ter mais de 100 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida uma coluna completa
 */
export function validateColumn(column: Partial<Column>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!column.id || !isValidTaskStatus(column.id)) {
    errors.push('ID da coluna inválido');
  }

  if (!column.title || typeof column.title !== 'string' || column.title.trim().length === 0) {
    errors.push('Título da coluna é obrigatório');
  }

  if (!Array.isArray(column.tasks)) {
    errors.push('Tarefas devem ser um array');
  } else {
    // Valida cada tarefa na coluna
    column.tasks.forEach((task, index) => {
      const taskValidation = validateTask(task);
      if (!taskValidation.isValid) {
        errors.push(`Tarefa ${index + 1}: ${taskValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida um array de colunas
 */
export function validateColumns(columns: Column[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(columns)) {
    errors.push('Colunas devem ser um array');
    return { isValid: false, errors };
  }

  if (columns.length === 0) {
    errors.push('Deve haver pelo menos uma coluna');
  }

  columns.forEach((column, index) => {
    const columnValidation = validateColumn(column);
    if (!columnValidation.isValid) {
      errors.push(`Coluna ${index + 1}: ${columnValidation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
