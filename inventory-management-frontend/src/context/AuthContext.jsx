import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (creds) => {
    // We do NOT use try/catch here. We let the error bubble up to the component.
    const res = await authApi.login(creds);
    
    if (res.success) {
      const { accessToken, refreshToken, user: u } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
    }
    return res;
  }, []);

  const register = useCallback(async (creds) => {
    const res = await authApi.register(creds);
    if (res.success) {
      const { accessToken, refreshToken, user: u } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('refreshToken');
      if (token) await authApi.logout(token);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isInventoryStaff: user?.role === 'INVENTORY_STAFF',
    isSalesExecutive: user?.role === 'SALES_EXECUTIVE',
    login,
    register,
    logout,
    loading
  }), [user, loading, login, register, logout]);

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};