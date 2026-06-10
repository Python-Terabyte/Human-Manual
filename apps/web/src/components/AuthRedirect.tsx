'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AuthRedirect({ to = '/dashboard' }: { to?: string }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace(to);
    }
  }, [loading, firebaseUser, router, to]);

  return null;
}
