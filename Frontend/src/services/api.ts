import { API_CONFIG, getApiUrl } from '../config/api';
import { secureStorage } from '../utils/secureStorage';
import type { LoginCredentials, LoginResponse, RegisterData, User } from '../types/auth';

/**
 * API client for making authenticated requests
 */
class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(error);
        if (Array.isArray(errorJson.violations) && errorJson.violations.length > 0) {
          errorMessage = errorJson.violations.map((v: any) => v.message).join('; ');
        } else if (errorJson['hydra:description']) {
          errorMessage = errorJson['hydra:description'];
        } else {
          errorMessage = errorJson.message || errorJson.error || response.statusText;
        }
      } catch {
        errorMessage = error || response.statusText;
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    return this.handleResponse<LoginResponse>(response);
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: JSON.stringify(data),
    });

    return this.handleResponse<User>(response);
  }

  /**
   * Get current user data
   */
  async getCurrentUser(userId: string): Promise<User> {
    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.USER}/${userId}`), {
      method: 'GET',
      headers: await this.getHeaders(true),
    });

    return this.handleResponse<User>(response);
  }

  /**
   * Refresh token (if your backend supports it)
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFRESH), {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return this.handleResponse<LoginResponse>(response);
  }
}

export const apiClient = new ApiClient();
