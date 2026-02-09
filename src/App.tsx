import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Task, TaskStatus } from '@/types';
import { Board } from './components/Board';
import { TaskModal } from './components/TaskModal';
import { WeekSelector } from './components/WeekSelector';

function App() {
  const { addTask, updateTask, deleteTask } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');

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
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
    </div>
  );
}

export default App;
