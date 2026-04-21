import { AuthTokens, SignInCredentials, SignUpCredentials, User } from '@/types/auth';
import { tokenStorage } from '@/lib/auth-tokens';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const accessToken = tokenStorage.getAccessToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((error as { message?: string }).message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  signIn: (credentials: SignInCredentials): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  signUp: (credentials: SignUpCredentials): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  signOut: (): Promise<void> =>
    request<void>('/auth/signout', { method: 'POST' }),

  me: (): Promise<User> =>
    request<User>('/auth/me'),

  refresh: (refreshToken: string): Promise<AuthTokens> =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  googleOAuthUrl: (): string => `${API_BASE}/auth/google`,
};
