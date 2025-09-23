'use client';

import * as React from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ProtectedRoute } from '@/components/auth';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout - Protected layout for admin pages
 * Combines authentication protection with AdminDashboard wrapper
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // If it's the login page, don't wrap with AdminDashboard or ProtectedRoute
  if (pathname === '/signin') {
    return children;
  }

  // For all other admin pages, wrap with ProtectedRoute and AdminDashboard
  return (
    <ProtectedRoute redirectTo="/signin">
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </ProtectedRoute>
  );
}
