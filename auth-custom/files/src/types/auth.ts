export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'email' | 'google';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => void;
  refreshSession: () => Promise<void>;
}
