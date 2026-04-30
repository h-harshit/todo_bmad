import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardColumn } from './BoardColumn';
import type { Task } from '../types';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', status: 'todo', user_id: 'u1', created_at: '', updated_at: '' },
  { id: '2', title: 'Task 2', status: 'todo', user_id: 'u1', created_at: '', updated_at: '' },
];

describe('BoardColumn', () => {
  const mockOnMove = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnAddTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders column title', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    expect(screen.getByText('To do')).toBeInTheDocument();
  });

  it('renders all tasks in column', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={mockTasks} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('shows task count badge', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={mockTasks} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    expect(screen.getByText('No tasks')).toBeInTheDocument();
  });

  it('renders add task input only in TODO column', () => {
    const { rerender } = render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} onAddTask={mockOnAddTask} />
    );
    expect(screen.getByPlaceholderText('+ Add a task')).toBeInTheDocument();

    rerender(
      <BoardColumn title="In progress" status="in_progress" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} onAddTask={mockOnAddTask} />
    );
    expect(screen.queryByPlaceholderText('+ Add a task')).not.toBeInTheDocument();
  });

  it('submits task with entered title', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} onAddTask={mockOnAddTask} />
    );
    const input = screen.getByPlaceholderText('+ Add a task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.submit(input.closest('form')!);
    expect(mockOnAddTask).toHaveBeenCalledWith('New Task');
  });

  it('clears input after submission', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} onAddTask={mockOnAddTask} />
    );
    const input = screen.getByPlaceholderText('+ Add a task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.submit(input.closest('form')!);
    expect(input.value).toBe('');
  });

  it('does not submit empty task', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} onAddTask={mockOnAddTask} />
    );
    const input = screen.getByPlaceholderText('+ Add a task') as HTMLInputElement;
    fireEvent.submit(input.closest('form')!);
    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  it('trims whitespace from task title', () => {
    render(
      <BoardColumn title="To do" status="todo" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} onAddTask={mockOnAddTask} />
    );
    const input = screen.getByPlaceholderText('+ Add a task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '  New Task  ' } });
    fireEvent.submit(input.closest('form')!);
    expect(mockOnAddTask).toHaveBeenCalledWith('New Task');
  });

  it('calls onMove when task is dropped', () => {
    const { container } = render(
      <BoardColumn title="In progress" status="in_progress" tasks={[]} onMove={mockOnMove} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    const column = container.firstChild as HTMLElement;
    const getData = vi.fn().mockReturnValue('task-123');
    fireEvent.drop(column, { dataTransfer: { getData } });
    expect(mockOnMove).toHaveBeenCalledWith('task-123', 'in_progress');
  });
});
