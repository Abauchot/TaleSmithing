import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

/**
 * Storage utility for securely storing authentication data
 * Uses SecureStore on native platforms and localStorage on web
 */
class SecureStorage {
  private isWeb(): boolean {
    return Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Save token to secure storage
   */
  async saveToken(token: string): Promise<void> {
    try {
      if (this.isWeb()) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  /**
   * Get token from secure storage
   */
  async getToken(): Promise<string | null> {
    try {
      if (this.isWeb()) {
        return window.localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Save refresh token to secure storage
   */
  async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      if (this.isWeb()) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw new Error('Failed to save refresh token');
    }
  }

  /**
   * Get refresh token from secure storage
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      if (this.isWeb()) {
        return window.localStorage.getItem(REFRESH_TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Save user data to secure storage
   */
  async saveUser(user: any): Promise<void> {
    try {
      const userData = JSON.stringify(user);
      if (this.isWeb()) {
        window.localStorage.setItem(USER_KEY, userData);
      } else {
        await SecureStore.setItemAsync(USER_KEY, userData);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Get user data from secure storage
   */
  async getUser(): Promise<any | null> {
    try {
      let userData: string | null;
      if (this.isWeb()) {
        userData = window.localStorage.getItem(USER_KEY);
      } else {
        userData = await SecureStore.getItemAsync(USER_KEY);
      }
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data from secure storage
   */
  async clearAll(): Promise<void> {
    try {
      if (this.isWeb()) {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear authentication data');
    }
  }
}

export const secureStorage = new SecureStorage();
