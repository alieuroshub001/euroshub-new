"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/dashboard' }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  // Don't render children if user is authenticated
  if (status === 'authenticated') {
    return null;
  }

  return <>{children}</>;
}