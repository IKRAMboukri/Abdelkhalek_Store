import { API_BASE_URL } from '@/constants';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

const TOKEN_KEY = 'furniture_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Emitted when any API call is rejected with 401 so the AuthProvider can
 * end the session (expired/invalid token) without each caller caring. */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body != null && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Cannot reach the API server. Is the backend running?');
  }
  if (response.status === 204) {
    return undefined as T;
  }
  let data: Json = null;
  try {
    data = (await response.json()) as Json;
  } catch {
    data = null;
  }
  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login')) {
      // Expired/invalid session: drop the token and let the app react.
      clearStoredToken();
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }
    const detail =
      data != null && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, detail);
  }
  return data as T;
}

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await get<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) });
}

export async function del(path: string): Promise<boolean> {
  await apiRequest<void>(path, { method: 'DELETE' });
  return true;
}

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
