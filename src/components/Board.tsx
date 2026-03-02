import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';
import type { Task, TaskStatus } from '@/types';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { COLUMN_CONFIG } from '@/utils/constants';

interface BoardProps {
  /** Callback chamado quando o usuário quer adicionar uma nova tarefa */
  onAddTask: (status: TaskStatus) => void;
  /** Callback chamado quando o usuário quer editar uma tarefa */
  onEditTask: (task: Task) => void;
  /** Callback chamado quando o usuário quer deletar uma tarefa */
  onDeleteTask: (taskId: string) => void;
  /** Callback opcional chamado quando o usuário quer visualizar detalhes de uma tarefa */
  onViewTask?: (task: Task) => void;
}

/**
 * Componente principal do board Kanban
 * Gerencia o drag and drop de tarefas entre colunas
 * 
 * @param props - Propriedades do componente
 * @returns Componente do board com colunas e funcionalidade de drag and drop
 * 
 * @example
 * ```tsx
 * <Board
 *   onAddTask={(status) => handleAddTask(status)}
 *   onEditTask={(task) => handleEditTask(task)}
 *   onDeleteTask={(id) => handleDeleteTask(id)}
 *   onViewTask={(task) => handleViewTask(task)}
 * />
 * ```
 */
export function Board({ onAddTask, onEditTask, onDeleteTask, onViewTask }: BoardProps) {
  const { columns, moveTaskBetweenColumns, reorderTasks } = useStore();
  const { addToast } = useToastStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);

    if (!activeTask) return;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === active.id)
    );
    
    if (!sourceColumn) return;

    // Verifica se o destino é uma coluna ou uma tarefa
    const destinationColumn = columns.find((col) => col.id === over.id);
    const destinationTask = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === over.id);

    // Se o destino é uma coluna (não uma tarefa)
    if (destinationColumn && !destinationTask) {
      // Move para a coluna (no final)
      if (sourceColumn.id !== destinationColumn.id) {
        moveTaskBetweenColumns(
          active.id as string,
          sourceColumn.id,
          destinationColumn.id as TaskStatus,
          destinationColumn.tasks.length
        );
        const destinationTitle = COLUMN_CONFIG[destinationColumn.id].title;
        addToast(`Tarefa movida para "${destinationTitle}"`, 'success');
      }
      return;
    }

    // Se o destino é uma tarefa, encontra a coluna dela
    if (destinationTask) {
      const targetColumn = columns.find((col) =>
        col.tasks.some((t) => t.id === over.id)
      );

      if (!targetColumn) return;

      // Se está na mesma coluna, apenas reordena
      if (sourceColumn.id === targetColumn.id) {
        const oldIndex = sourceColumn.tasks.findIndex((t) => t.id === active.id);
        const newIndex = targetColumn.tasks.findIndex((t) => t.id === over.id);

        if (oldIndex !== newIndex) {
          reorderTasks(sourceColumn.id, oldIndex, newIndex);
        }
      } else {
        // Move entre colunas
        const destinationIndex = targetColumn.tasks.findIndex(
          (t) => t.id === over.id
        );
        moveTaskBetweenColumns(
          active.id as string,
          sourceColumn.id,
          targetColumn.id as TaskStatus,
          destinationIndex
        );
        const destinationTitle = COLUMN_CONFIG[targetColumn.id].title;
        addToast(`Tarefa movida para "${destinationTitle}"`, 'success');
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const task = columns
              .flatMap((col) => col.tasks)
              .find((t) => t.id === active.id);
            return `Arrastando tarefa: ${task?.title || 'tarefa desconhecida'}`;
          },
          onDragOver({ active, over }) {
            if (!over) return '';
            const task = columns
              .flatMap((col) => col.tasks)
              .find((t) => t.id === active.id);
            const destinationColumn = columns.find((col) => col.id === over.id);
            if (destinationColumn) {
              return `Movendo para coluna: ${destinationColumn.title}`;
            }
            return '';
          },
          onDragEnd({ active, over }) {
            if (!over) return '';
            const destinationColumn = columns.find((col) => col.id === over.id);
            if (destinationColumn) {
              return `Tarefa movida para: ${destinationColumn.title}`;
            }
            return '';
          },
        },
      }}
    >
      <div
        className="flex gap-6 p-6 overflow-x-auto h-full justify-center custom-scrollbar"
        role="region"
        aria-label="Board Kanban com colunas de tarefas"
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onViewTask={onViewTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90" role="status" aria-live="polite">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
