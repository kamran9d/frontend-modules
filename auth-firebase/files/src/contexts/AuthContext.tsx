"use client";
import React, { createContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { authService } from '@/services/auth.service';
import { AuthContextType, SignInCredentials, SignUpCredentials, User } from '@/types/auth';

function mapFirebaseUser(fbUser: FirebaseUser): User {
  const providerId = fbUser.providerData[0]?.providerId;
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    name: fbUser.displayName ?? fbUser.email ?? '',
    avatarUrl: fbUser.photoURL ?? undefined,
    provider: providerId === 'google.com' ? 'google' : providerId === 'github.com' ? 'github' : 'email',
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser) => {
      setUser(fbUser ? mapFirebaseUser(fbUser) : null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async ({ email, password }: SignInCredentials): Promise<void> => {
    await authService.signIn(email, password);
  };

  const signUp = async ({ name, email, password }: SignUpCredentials): Promise<void> => {
    await authService.signUp(name, email, password);
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
  };

  const signInWithGoogle = async (): Promise<void> => {
    await authService.signInWithGoogle();
  };

  const signInWithGithub = async (): Promise<void> => {
    await authService.signInWithGithub();
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await authService.sendPasswordReset(email);
  };

  const refreshSession = async (): Promise<void> => {
    if (firebaseAuth.currentUser) {
      await firebaseAuth.currentUser.getIdToken(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGithub,
        sendPasswordReset,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
