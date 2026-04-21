import {
  GithubAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export const authService = {
  signIn: (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(firebaseAuth, email, password),

  signUp: async (name: string, email: string, password: string): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(credential.user, { displayName: name });
    return credential;
  },

  signOut: (): Promise<void> => firebaseSignOut(firebaseAuth),

  signInWithGoogle: (): Promise<UserCredential> =>
    signInWithPopup(firebaseAuth, googleProvider),

  signInWithGithub: (): Promise<UserCredential> =>
    signInWithPopup(firebaseAuth, githubProvider),

  sendPasswordReset: (email: string): Promise<void> =>
    sendPasswordResetEmail(firebaseAuth, email),
};
