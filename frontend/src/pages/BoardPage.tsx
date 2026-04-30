import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { BoardColumn } from '../components/BoardColumn';
import { useAuth } from '../context/authContext';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../api/api';

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    loadTasks();
  }, [user, navigate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/tasks');
      setTasks(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setTasks([]);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title: string) => {
    try {
      const newTask = await apiPost('/tasks', { title });
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleMoveTask = async (taskId: string, status: string) => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current || current.status === status) return;

    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: status as Task['status'] } : t)));
    try {
      const updated = await apiPatch(`/tasks/${taskId}/status`, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setTasks(tasks);
      setError('Failed to move task');
    }
  };

  const handleEditTask = async (taskId: string, title: string) => {
    try {
      const updated = await apiPut(`/tasks/${taskId}`, { title });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiDelete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost('/auth/logout', {});
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      logout();
      navigate('/login', { replace: true });
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">todo_bmad</h1>
              {user && <p className="text-xs text-gray-500">{user.email}</p>}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-medium">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your board</h2>
              <p className="text-sm text-gray-500 mt-1">Drag tasks between columns to update their status.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BoardColumn
                title="To do"
                status="todo"
                tasks={todoTasks}
                onAddTask={handleAddTask}
                onMove={handleMoveTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
              <BoardColumn
                title="In progress"
                status="in_progress"
                tasks={inProgressTasks}
                onMove={handleMoveTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
              <BoardColumn
                title="Done"
                status="done"
                tasks={doneTasks}
                onMove={handleMoveTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
