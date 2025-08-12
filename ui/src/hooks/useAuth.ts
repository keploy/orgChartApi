import React, { createContext, useContext, useState, useCallback } from 'react';
import { login, register, deregister, AuthResponse, UserAuth } from '../api/client';

interface AuthContextValue {
  user: { username: string } | null;
  token: string | null;
  loading: boolean;
  handleLogin: (creds: UserAuth) => Promise<void>;
  handleRegister: (creds: UserAuth) => Promise<void>;
  handleLogout: () => void;
  handleDeregister: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Seed from localStorage immediately so refresh doesn't cause a redirect flicker
  const initialToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const initialUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const [user, setUser] = useState<{ username: string } | null>(initialToken && initialUser ? { username: initialUser } : null);
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(false);

  const persist = (data: AuthResponse) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', data.username);
    setToken(data.token);
    setUser({ username: data.username });
  };

  const handleLogin = useCallback(async (creds: UserAuth) => {
    setLoading(true);
    try { persist(await login(creds)); } finally { setLoading(false); }
  }, []);

  const handleRegister = useCallback(async (creds: UserAuth) => {
    setLoading(true);
    try { persist(await register(creds)); } finally { setLoading(false); }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }, []);

  const handleDeregister = useCallback(async (username: string) => {
    setLoading(true);
    try {
      await deregister(username);
      if (user?.username === username) handleLogout();
    } finally { setLoading(false); }
  }, [handleLogout, user?.username]);

  const value: AuthContextValue = { user, token, loading, handleLogin, handleRegister, handleLogout, handleDeregister };
  // Avoid JSX so file can remain .ts
  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
