'use client';

import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react';
import { auth, onAuthStateChanged, logout as firebaseLogout, type User } from '@/lib/firebase';
import { syncUser, type DbUser } from '@/lib/api';

interface AuthState {
  firebaseUser: User | null;
  dbUser:       DbUser | null;
  loading:      boolean;
  signOut:      () => Promise<void>;
  refreshUser:  () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  firebaseUser: null,
  dbUser:       null,
  loading:      true,
  signOut:      async () => {},
  refreshUser:  async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser]             = useState<DbUser | null>(null);
  const [loading, setLoading]           = useState(true);

  const loadDbUser = useCallback(async (user: User) => {
    try {
      const db = await syncUser();
      setDbUser(db);
    } catch (err) {
      console.error('Failed to sync user to DB:', err);
    }
  }, []);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadDbUser(user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadDbUser]);

  const signOut = async () => {
    await firebaseLogout();
    setFirebaseUser(null);
    setDbUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) await loadDbUser(firebaseUser);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
