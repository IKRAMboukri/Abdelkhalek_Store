import { post, get, del, setStoredToken, clearStoredToken, getStoredToken } from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  active: boolean;
}

interface RawTokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    active: boolean;
  };
}

export function getToken(): string | null {
  return getStoredToken();
}

function mapUser(raw: RawTokenResponse['user']): AuthUser {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    role: raw.role,
    avatar: raw.avatar,
    active: raw.active,
  };
}

export class AuthService {
  async login(email: string, password: string): Promise<AuthUser> {
    const raw = await post<RawTokenResponse>('/api/v1/auth/login', {
      email: email.trim(),
      password,
    });
    setStoredToken(raw.access_token);
    return mapUser(raw.user);
  }

  async me(): Promise<AuthUser | null> {
    const raw = await get<{ id: number; name: string; email: string; role: string; avatar: string; active: boolean }>(
      '/api/v1/auth/me',
    );
    return raw ? mapUser(raw) : null;
  }

  async logout(): Promise<void> {
    try {
      await del('/api/v1/auth/logout');
    } finally {
      // The JWT is stateless: clearing the stored token ends the session
      // client-side regardless of the server response.
      clearStoredToken();
    }
  }
}
