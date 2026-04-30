import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './authContext';
import * as apiModule from '../api/api';

vi.mock('../api/api');

const mockUser = { id: '1', email: 'test@example.com' };

const TestComponent = () => {
  const { user, loading, logout } = useAuth();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {user && <div>{user.email}</div>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user on successful auth check', async () => {
    vi.spyOn(apiModule, 'apiGet').mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.spyOn(apiModule, 'apiGet').mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('clears loading state after auth check', async () => {
    vi.spyOn(apiModule, 'apiGet').mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('sets user to null on auth failure', async () => {
    vi.spyOn(apiModule, 'apiGet').mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('checks auth on mount', async () => {
    const mockApiGet = vi.spyOn(apiModule, 'apiGet').mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/auth/me');
    });
  });

  it('throws error when useAuth used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('provides logout function', async () => {
    vi.spyOn(apiModule, 'apiGet').mockResolvedValue(mockUser);

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    logoutButton.click();

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });
});
