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

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

const responseCache = new Map<string, CacheEntry>();
const inFlightGets = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;

function clearApiCache(): void {
  responseCache.clear();
  inFlightGets.clear();
  cacheGeneration += 1;
}

function getCacheTtl(path: string): number {
  if (path === '/api/v1/settings' || path === '/api/v1/categories/all') return 5 * 60_000;
  if (path === '/api/v1/products/all' || path === '/api/v1/customers/all') return 60_000;
  return 0;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  clearApiCache();
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  clearApiCache();
  localStorage.removeItem(TOKEN_KEY);
}

/** Emitted when any API call is rejected with 401 so the AuthProvider can
 * end the session (expired/invalid token) without each caller caring. */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

async function executeRequest<T>(path: string, options: RequestInit): Promise<T> {
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

export function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  if (method !== 'GET') {
    // Mutations can affect list counts, dashboard totals, and lookup data.
    clearApiCache();
    return executeRequest<T>(path, options);
  }

  const token = getStoredToken() ?? 'anonymous';
  const cacheKey = `${token}:${path}`;
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value as T);
  }
  if (cached) responseCache.delete(cacheKey);

  const pending = inFlightGets.get(cacheKey);
  if (pending) return pending as Promise<T>;

  const generation = cacheGeneration;
  const request = executeRequest<T>(path, options)
    .then((value) => {
      const ttl = getCacheTtl(path);
      if (ttl > 0 && generation === cacheGeneration) {
        responseCache.set(cacheKey, { value, expiresAt: Date.now() + ttl });
      }
      return value;
    })
    .finally(() => {
      if (inFlightGets.get(cacheKey) === request) inFlightGets.delete(cacheKey);
    });

  inFlightGets.set(cacheKey, request);
  return request;
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
  // FormData must pass through untouched — the browser sets the multipart
  // Content-Type and boundary. JSON.stringify(new FormData()) yields "{}",
  // silently dropping the file and making FastAPI reject the request.
  return apiRequest<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
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
