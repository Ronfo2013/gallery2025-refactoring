import { useState, useEffect } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import app from '../firebaseConfig';
import { logger } from '@/utils/logger';

const auth = getAuth(app);

export const useFirebaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAuthenticated(true);
      logger.info('✅ Admin logged in successfully');
      return true;
    } catch (error: any) {
      logger.error('❌ Login failed:', error);

      // Handle specific error codes
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error('Email o password non corretti');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Troppi tentativi falliti. Riprova più tardi');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email non valida');
      } else {
        throw new Error('Errore durante il login. Riprova');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      logger.info('✅ Admin logged out successfully');
    } catch (error) {
      logger.error('❌ Logout failed:', error);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      logger.info('✅ Password reset email sent to:', email);
    } catch (error: any) {
      logger.error('❌ Password reset failed:', error);

      // Handle specific error codes
      if (error.code === 'auth/user-not-found') {
        throw new Error('Nessun account trovato con questa email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email non valida');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Troppi tentativi. Riprova più tardi');
      } else {
        throw new Error("Errore durante l'invio dell'email. Riprova");
      }
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    currentUser: user,
    login,
    logout,
    resetPassword,
  };
};
