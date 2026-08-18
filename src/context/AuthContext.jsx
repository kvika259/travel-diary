import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('travel-diary-token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Ошибка ${res.status}`);
  }

  return res.json();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('travel-diary-token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('travel-diary-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('travel-diary-token', data.token);
    localStorage.setItem('travel-diary-user', JSON.stringify(data.user));
  }, []);

  const register = useCallback(async (username, email, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('travel-diary-token', data.token);
    localStorage.setItem('travel-diary-user', JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('travel-diary-token');
    localStorage.removeItem('travel-diary-user');
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    apiFetch,
  }), [token, user, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { apiFetch };