// src/__tests__/hooks/useAuth.test.jsx
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

// Mock the API
jest.mock('../../api/authApi');

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
        },
      },
    };

    authApi.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login('test@example.com', 'password');
      expect(response.success).toBe(true);
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
  });

  it('should handle login failure', async () => {
    authApi.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login('test@example.com', 'wrong');
      expect(response.success).toBe(false);
      expect(response.message).toBe('Invalid credentials');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout correctly', async () => {
    // First login
    const mockResponse = {
      success: true,
      data: {
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        user: { id: 1, email: 'test@example.com', role: 'ADMIN' },
      },
    };

    authApi.login.mockResolvedValue(mockResponse);
    authApi.logout.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should restore session from localStorage', () => {
    localStorage.setItem('accessToken', 'stored-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'stored@example.com',
      role: 'ADMIN',
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user.email).toBe('stored@example.com');
  });
});