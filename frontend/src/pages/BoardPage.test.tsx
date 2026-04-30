import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BoardPage } from './BoardPage';
import { AuthProvider } from '../context/authContext';
import * as apiModule from '../api/api';

vi.mock('../api/api');

const mockUser = { id: '1', email: 'test@example.com' };
const mockTasks = [
  { id: '1', title: 'Task 1', status: 'todo', user_id: '1', created_at: '', updated_at: '' },
  { id: '2', title: 'Task 2', status: 'in_progress', user_id: '1', created_at: '', updated_at: '' },
  { id: '3', title: 'Task 3', status: 'done', user_id: '1', created_at: '', updated_at: '' },
];

const renderBoardPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <BoardPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('BoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders board columns', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByText('To do')).toBeInTheDocument();
      expect(screen.getByText('In progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('loads tasks on mount', async () => {
    const mockApiGet = vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);

    renderBoardPage();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/tasks');
    });
  });

  it('displays tasks in correct columns', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });
  });

  it('creates new task', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce([]);
    const mockApiPostTask = vi.spyOn(apiModule, 'apiPost').mockResolvedValue({
      id: '4', title: 'New Task', status: 'todo', user_id: '1', created_at: '', updated_at: '',
    });

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('+ Add a task')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('+ Add a task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(mockApiPostTask).toHaveBeenCalledWith('/tasks', { title: 'New Task' });
    });
  });

  it('moves task between columns via drag and drop', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);
    const mockApiPatch = vi.spyOn(apiModule, 'apiPatch').mockResolvedValue({
      id: '1', title: 'Task 1', status: 'in_progress', user_id: '1', created_at: '', updated_at: '',
    });

    const { container } = renderBoardPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const inProgressColumn = screen.getByText('In progress').closest('[class*="border-t-blue"]') as HTMLElement;
    expect(inProgressColumn).toBeTruthy();

    const getData = vi.fn().mockReturnValue('1');
    fireEvent.drop(inProgressColumn, { dataTransfer: { getData } });

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/tasks/1/status', { status: 'in_progress' });
    });
  });

  it('edits task', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);
    const mockApiPut = vi.spyOn(apiModule, 'apiPut').mockResolvedValue({
      id: '1', title: 'Updated Task', status: 'todo', user_id: '1', created_at: '', updated_at: '',
    });

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Task 1'));
    const input = screen.getByDisplayValue('Task 1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith('/tasks/1', { title: 'Updated Task' });
    });
  });

  it('deletes task', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);
    const mockApiDelete = vi.spyOn(apiModule, 'apiDelete').mockResolvedValue(undefined);

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const moreButtons = screen.getAllByTitle('More options');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockApiDelete).toHaveBeenCalledWith('/tasks/1');
    });
  });

  it('shows error message on failed operation', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce([]);
    vi.spyOn(apiModule, 'apiPost').mockRejectedValueOnce(new Error('Failed'));

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('+ Add a task')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('+ Add a task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
    });
  });

  it('displays user email', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('logs out user', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTasks);
    const mockApiPost = vi.spyOn(apiModule, 'apiPost').mockResolvedValue(undefined);

    renderBoardPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /log out/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/logout', {});
    });
  });

  it('shows loading state initially', () => {
    vi.spyOn(apiModule, 'apiGet').mockImplementation(() => new Promise(() => {}));

    renderBoardPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays empty state for each column', async () => {
    vi.spyOn(apiModule, 'apiGet')
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce([]);

    renderBoardPage();

    await waitFor(() => {
      const emptyMessages = screen.getAllByText('No tasks');
      expect(emptyMessages.length).toBe(3);
    });
  });
});
