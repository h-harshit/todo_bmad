import { useState } from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  onMove: (taskId: string, status: string) => void;
  onEdit: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
  onAddTask?: (title: string) => void;
}

const COLUMN_STYLES: Record<string, { accent: string; badge: string; dot: string }> = {
  todo: {
    accent: 'border-t-gray-400',
    badge: 'bg-gray-100 text-gray-700',
    dot: 'bg-gray-400',
  },
  in_progress: {
    accent: 'border-t-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  done: {
    accent: 'border-t-green-500',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
};

export function BoardColumn({
  title,
  status,
  tasks,
  onMove,
  onEdit,
  onDelete,
  onAddTask,
}: BoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const styles = COLUMN_STYLES[status] || COLUMN_STYLES.todo;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (title && onAddTask) {
      onAddTask(title);
      setNewTaskTitle('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onMove(taskId, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-gray-50 rounded-xl border-t-4 ${styles.accent} transition-all ${
        isDragOver ? 'bg-blue-50 ring-2 ring-blue-400 ring-offset-2' : ''
      }`}
    >
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</h2>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 px-3 pb-3 space-y-2 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              {isDragOver ? 'Drop here' : 'No tasks'}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>

      {status === 'todo' && onAddTask && (
        <form onSubmit={handleAddTask} className="p-3 border-t border-gray-200">
          <input
            type="text"
            name="new-task"
            aria-label="Add a new task"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="+ Add a task"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          />
        </form>
      )}
    </div>
  );
}
