/**
 * Utilitários para gerenciamento seguro do LocalStorage
 * Trata erros comuns como quota excedida, storage desabilitado, etc.
 */

/**
 * Verifica se o LocalStorage está disponível
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém um item do LocalStorage com tratamento de erros
 * 
 * @param key - Chave do item
 * @param defaultValue - Valor padrão caso não encontre ou ocorra erro
 * @returns O valor do LocalStorage ou o valor padrão
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage não está disponível');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Erro ao ler do LocalStorage (chave: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * Salva um item no LocalStorage com tratamento de erros
 * 
 * @param key - Chave do item
 * @param value - Valor a ser salvo
 * @returns true se salvou com sucesso, false caso contrário
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage não está disponível');
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException) {
      // Quota excedida
      if (error.code === 22 || error.code === 1014) {
        console.error('LocalStorage: Quota excedida. Limite de armazenamento atingido.');
        // Aqui você pode implementar uma estratégia de limpeza automática
        // ou notificar o usuário
      } else {
        console.error('Erro ao salvar no LocalStorage:', error);
      }
    } else {
      console.error('Erro desconhecido ao salvar no LocalStorage:', error);
    }
    return false;
  }
}

/**
 * Remove um item do LocalStorage com tratamento de erros
 */
export function removeStorageItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover do LocalStorage (chave: ${key}):`, error);
    return false;
  }
}

/**
 * Limpa todo o LocalStorage com tratamento de erros
 */
export function clearStorage(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar LocalStorage:', error);
    return false;
  }
}

/**
 * Obtém o tamanho aproximado usado no LocalStorage (em bytes)
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Obtém o tamanho máximo aproximado do LocalStorage (em bytes)
 * Nota: O limite varia entre navegadores (geralmente 5-10MB)
 */
export function getStorageQuota(): number {
  // Limite padrão estimado (5MB)
  return 5 * 1024 * 1024;
}

/**
 * Verifica se há espaço suficiente no LocalStorage
 */
export function hasStorageSpace(requiredBytes: number): boolean {
  const used = getStorageSize();
  const quota = getStorageQuota();
  return used + requiredBytes < quota;
}
