import { StateStorage } from 'zustand/middleware';
import { getStorageItem, setStorageItem, removeStorageItem, isLocalStorageAvailable } from './storage';
import { useToastStore } from '@/store/useToastStore';

/**
 * Storage customizado para Zustand com tratamento de erros
 * Implementa a interface StateStorage do Zustand
 */
export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = getStorageItem(name, null);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.error(`Erro ao obter item do storage (${name}):`, error);
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      const success = setStorageItem(name, parsed);
      
      if (!success) {
        // Notifica o usuário se não conseguir salvar
        const { addToast } = useToastStore.getState();
        addToast(
          'Não foi possível salvar os dados. Verifique se há espaço suficiente no navegador.',
          'error'
        );
      }
    } catch (error) {
      console.error(`Erro ao salvar item no storage (${name}):`, error);
      const { addToast } = useToastStore.getState();
      addToast('Erro ao salvar dados. Algumas alterações podem não ter sido salvas.', 'error');
    }
  },
  
  removeItem: (name: string): void => {
    try {
      removeStorageItem(name);
    } catch (error) {
      console.error(`Erro ao remover item do storage (${name}):`, error);
    }
  },
};

/**
 * Verifica se o storage está disponível e mostra aviso se não estiver
 */
export function checkStorageAvailability(): boolean {
  if (!isLocalStorageAvailable()) {
    const { addToast } = useToastStore.getState();
    addToast(
      'O armazenamento local não está disponível. Seus dados não serão salvos automaticamente.',
      'error'
    );
    return false;
  }
  return true;
}
