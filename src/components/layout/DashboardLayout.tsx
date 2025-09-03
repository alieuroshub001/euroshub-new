"use client"
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import GlobalHeader from './GlobalHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Routes that should not show the header
  const noHeaderRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-otp'
  ];

  // Check if current route should show header
  const shouldShowHeader = !noHeaderRoutes.includes(pathname) && status === 'authenticated';

  return (
    <>
      {shouldShowHeader && <GlobalHeader />}
      <main className={shouldShowHeader ? 'min-h-screen bg-gray-50' : ''}>
        {children}
      </main>
    </>
  );
}