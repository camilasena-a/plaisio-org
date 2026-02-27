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
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask?: (task: Task) => void;
}

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
    >
      <div className="flex gap-6 p-6 overflow-x-auto h-full justify-center custom-scrollbar">
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
          <div className="rotate-3 opacity-90">
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
