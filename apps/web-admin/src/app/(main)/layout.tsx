'use client';

import * as React from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ProtectedRoute } from '@/components/auth';
import { usePathname } from 'next/navigation';
import { MessengerProvider } from '@encreasl/ui/messenger-context';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout - Protected layout for admin pages
 * Combines authentication protection with AdminDashboard wrapper
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, token } = useAuth();
  const messengerApiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

  // If it's the login page, don't wrap with AdminDashboard or ProtectedRoute
  if (pathname === '/signin') {
    return <MessengerProvider token={token} userId={user?.id} apiBaseUrl={messengerApiBase}>{children}</MessengerProvider>;
  }

  // For all other admin pages, wrap with ProtectedRoute and AdminDashboard
  return (
    <MessengerProvider token={token} userId={user?.id} apiBaseUrl={messengerApiBase}>
      <ProtectedRoute redirectTo="/signin">
        <AdminDashboard>
          {children}
        </AdminDashboard>
      </ProtectedRoute>
    </MessengerProvider>
  );
}
