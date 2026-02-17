import type { ApiResponse, Login } from '@treino/shared';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './storage';

const API_URL = 'http://192.168.2.116:3333';

export interface AuthUser {
  id: string;
  email: string;
  role: 'COACH' | 'ATHLETE';
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Auth API (raw fetch, no interceptor to avoid circular refresh)

export const authApi = {
  async login(data: Login): Promise<ApiResponse<LoginResponse>> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async refresh(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return res.json();
  },

  async me(): Promise<ApiResponse<AuthUser>> {
    const accessToken = await getAccessToken();
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  },

  async logout(refreshToken: string): Promise<void> {
    const accessToken = await getAccessToken();
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// General API client with 401 interceptor

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearTokens();
      throw new Error('No refresh token');
    }

    const refreshRes = await authApi.refresh(refreshToken);
    if (refreshRes.success) {
      await setTokens(refreshRes.data.accessToken, refreshToken);
      return request<T>(path, options);
    }

    await clearTokens();
    throw new Error('Token refresh failed');
  }

  return res.json();
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
