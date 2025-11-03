import { useEffect, useState, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';
import { secureStorage } from '../utils/secureStorage';
import {
  decodeToken,
  isTokenExpired,
  willTokenExpireSoon,
  getUserFromToken,
  getTokenTimeToExpiry
} from '../utils/jwt';
import { API_CONFIG } from '../config/api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthState
} from '../types/auth';

/**
 * Custom hook for authentication with JWT management
 * Features:
 * - Login/Register/Logout
 * - Persistent token storage
 * - Automatic token refresh
 * - Token expiration handling
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Update authentication state
   */
  const updateAuthState = useCallback((
    token: string | null,
    user: User | null,
    error: string | null = null
  ) => {
    setState({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading: false,
      error,
    });

    apiClient.setToken(token);
  }, []);

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((token: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeToExpiry = getTokenTimeToExpiry(token);
    const refreshTime = Math.max(
      0,
      (timeToExpiry - API_CONFIG.TOKEN_REFRESH_THRESHOLD) * 1000
    );

    console.log(`Token will be refreshed in ${refreshTime / 1000} seconds`);

    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, refreshTime);
  }, []);

  /**
   * Load stored authentication data on mount
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
      ]);

      if (storedToken && !isTokenExpired(storedToken)) {
        let user = storedUser;

        if (!user) {
          user = getUserFromToken(storedToken);
        }

        updateAuthState(storedToken, user);
        scheduleTokenRefresh(storedToken);
      } else {
        await secureStorage.clearAll();
        updateAuthState(null, null);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      updateAuthState(null, null, 'Failed to load authentication data');
    }
  }, [updateAuthState, scheduleTokenRefresh]);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await apiClient.login(credentials);

      await secureStorage.saveToken(response.token);
      if (response.refresh_token) {
        await secureStorage.saveRefreshToken(response.refresh_token);
      }
      const user = getUserFromToken(response.token);

      try {
        if (user?.id) {
          const fullUser = await apiClient.getCurrentUser(user.id);
          await secureStorage.saveUser(fullUser);
          updateAuthState(response.token, fullUser);
        } else {
          try {
            const users = await apiClient.getUsers();
            const match = users.find(u => (u.email && u.email === user?.email) || (u.nickname && u.nickname === user?.email));
            if (match) {
              await secureStorage.saveUser(match);
              updateAuthState(response.token, match);
            } else {
              await secureStorage.saveUser(user);
              updateAuthState(response.token, user);
            }
          } catch (err) {
            console.warn('Could not fetch users collection to resolve full user:', err);
            await secureStorage.saveUser(user);
            updateAuthState(response.token, user);
          }
        }
      } catch (error) {
        console.warn('Could not fetch full user data:', error);
        await secureStorage.saveUser(user);
        updateAuthState(response.token, user);
      }
      scheduleTokenRefresh(response.token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateAuthState(null, null, errorMessage);
      throw error;
    }
  }, [updateAuthState, scheduleTokenRefresh]);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await apiClient.register(data);
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      updateAuthState(null, null, errorMessage);
      throw error;
    }
  }, [login, updateAuthState]);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      const [currentToken, refreshToken] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getRefreshToken(),
      ]);

      if (!currentToken) {
        throw new Error('No token to refresh');
      }
      if (!willTokenExpireSoon(currentToken, API_CONFIG.TOKEN_REFRESH_THRESHOLD)) {
        scheduleTokenRefresh(currentToken);
        return;
      }

      if (refreshToken) {
        try {
          const response = await apiClient.refreshToken(refreshToken);

          await secureStorage.saveToken(response.token);
          if (response.refresh_token) {
            await secureStorage.saveRefreshToken(response.refresh_token);
          }

          const user = await secureStorage.getUser();
          updateAuthState(response.token, user);
          scheduleTokenRefresh(response.token);

          return;
        } catch (error) {
          console.warn('Refresh token failed:', error);
        }
      }


      await logout();
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
    }
  }, [updateAuthState, scheduleTokenRefresh]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      await secureStorage.clearAll();
      updateAuthState(null, null);
    } catch (error) {
      console.error('Error during logout:', error);
      updateAuthState(null, null, 'Logout completed with errors');
    }
  }, [updateAuthState]);

  /**
   * Check token validity periodically
   */
  useEffect(() => {
    if (state.token && !isTokenExpired(state.token)) {
      if (willTokenExpireSoon(state.token, API_CONFIG.TOKEN_REFRESH_THRESHOLD)) {
        refreshToken();
      }
    } else if (state.token) {
      logout();
    }
  }, [state.token]);

  /**
   * Load stored auth on mount
   */
  useEffect(() => {
    loadStoredAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [loadStoredAuth]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshToken,
  };
};