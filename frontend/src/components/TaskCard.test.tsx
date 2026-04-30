import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  status: 'todo',
  user_id: 'user1',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('TaskCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('enters edit mode when clicking title', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Test Task'));
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('saves edited task on save button click', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Test Task'));
    const input = screen.getByDisplayValue('Test Task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockOnEdit).toHaveBeenCalledWith('1', 'Updated Task');
  });

  it('cancels edit on cancel button click', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Test Task'));
    const input = screen.getByDisplayValue('Test Task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnEdit).not.toHaveBeenCalled();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('saves on Enter key in edit mode', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Test Task'));
    const input = screen.getByDisplayValue('Test Task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated Task' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnEdit).toHaveBeenCalledWith('1', 'Updated Task');
  });

  it('cancels on Escape key in edit mode', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Test Task'));
    const input = screen.getByDisplayValue('Test Task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated Task' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(mockOnEdit).not.toHaveBeenCalled();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('opens menu with edit and delete options', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByTitle('More options'));
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('shows delete confirmation modal', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByTitle('More options'));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText('Delete task?')).toBeInTheDocument();
  });

  it('calls onDelete on confirmation', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByTitle('More options'));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('cancels delete on cancel button', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByTitle('More options'));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete task?')).not.toBeInTheDocument();
  });

  it('is draggable', () => {
    const { container } = render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const card = container.querySelector('[draggable="true"]');
    expect(card).toBeInTheDocument();
  });

  it('sets taskId on drag start', () => {
    const { container } = render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const card = container.querySelector('[draggable="true"]') as HTMLElement;
    const setData = vi.fn();
    fireEvent.dragStart(card, {
      dataTransfer: { setData, effectAllowed: '' },
    });
    expect(setData).toHaveBeenCalledWith('taskId', '1');
  });
});
