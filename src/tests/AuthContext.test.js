import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

jest.mock('../services/authService');

describe('AuthContext', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  });

  test('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('registers a new user successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      tier: 'free',
      scansRemaining: 5
    };

    authService.register.mockResolvedValue({
      token: 'mock_token',
      user: mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.register('test@test.com', 'password123', 'Test User');
    });

    await waitFor(() => {
      expect(response.success).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(result.current.user.email).toBe('test@test.com');
      expect(localStorage.getItem('tulip_token')).toBe('mock_token');
    });
  });

  test('handles registration error', async () => {
    authService.register.mockRejectedValue(new Error('Email already exists'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.register('test@test.com', 'password123', 'Test User');
    });

    await waitFor(() => {
      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already exists');
      expect(result.current.user).toBeNull();
    });
  });

  test('logs in user successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      tier: 'free',
      scansRemaining: 5
    };

    authService.login.mockResolvedValue({
      token: 'mock_token',
      user: mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.login('test@test.com', 'password123');
    });

    await waitFor(() => {
      expect(response.success).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(result.current.user.email).toBe('test@test.com');
    });
  });

  test('logs out user', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      tier: 'free',
      scansRemaining: 5
    };

    authService.login.mockResolvedValue({
      token: 'mock_token',
      user: mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('tulip_token')).toBeNull();
  });

  test('decrements scans correctly', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      tier: 'free',
      scansRemaining: 5,
      scansThisMonth: 0
    };

    authService.login.mockResolvedValue({
      token: 'mock_token',
      user: mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });

    act(() => {
      result.current.decrementScans();
    });

    expect(result.current.user.scansRemaining).toBe(4);
    expect(result.current.user.scansThisMonth).toBe(1);
  });

  test('does not decrement when scans are unlimited', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      tier: 'premium',
      scansRemaining: Infinity,
      scansThisMonth: 10
    };

    authService.login.mockResolvedValue({
      token: 'mock_token',
      user: mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });

    act(() => {
      result.current.decrementScans();
    });

    expect(result.current.user.scansRemaining).toBe(Infinity);
  });

  test('renders loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(false);
  });
});