import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Task, TaskStatus } from '@/types';
import { Board } from './components/Board';
import { TaskModal } from './components/TaskModal';
import { WeekSelector } from './components/WeekSelector';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useToastStore } from '@/store/useToastStore';

function App() {
  const { addTask, updateTask, deleteTask } = useStore();
  const { addToast } = useToastStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  
  // Estados para o modal de confirmação
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      addToast('Tarefa excluída com sucesso', 'success');
      setTaskToDelete(null);
    }
    setIsConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      addToast('Tarefa atualizada com sucesso', 'success');
    } else {
      addTask(taskData);
      addToast('Tarefa criada com sucesso', 'success');
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <WeekSelector />
      <div className="flex-1 overflow-hidden">
        <Board
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        initialTask={editingTask}
        initialStatus={initialStatus}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
      <ToastContainer />
    </div>
  );
}

export default App;
