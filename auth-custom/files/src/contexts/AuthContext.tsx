"use client";
import React, { createContext, useCallback, useEffect, useReducer } from 'react';
import { AuthContextType, AuthState, SignInCredentials, SignUpCredentials } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { tokenStorage } from '@/lib/auth-tokens';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

type Action =
  | { type: 'SET_USER'; payload: AuthState['user'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SIGN_OUT' };

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SIGN_OUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const refreshSession = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      dispatch({ type: 'SET_USER', payload: null });
      return;
    }
    try {
      const tokens = await authService.refresh(refreshToken);
      tokenStorage.setAccessToken(tokens.accessToken);
      tokenStorage.setRefreshToken(tokens.refreshToken);
      const user = await authService.me();
      dispatch({ type: 'SET_USER', payload: user });
    } catch {
      tokenStorage.clearTokens();
      dispatch({ type: 'SIGN_OUT' });
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = async (credentials: SignInCredentials): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user, tokens } = await authService.signIn(credentials);
      tokenStorage.setAccessToken(tokens.accessToken);
      tokenStorage.setRefreshToken(tokens.refreshToken);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user, tokens } = await authService.signUp(credentials);
      tokenStorage.setAccessToken(tokens.accessToken);
      tokenStorage.setRefreshToken(tokens.refreshToken);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
    } finally {
      tokenStorage.clearTokens();
      dispatch({ type: 'SIGN_OUT' });
    }
  };

  const signInWithGoogle = (): void => {
    window.location.href = authService.googleOAuthUrl();
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, signInWithGoogle, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
