'use client';

import * as React from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthProvider } from '@encreasl/auth';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout - Professional layout with proper authentication
 * Login page gets NO AuthProvider, protected pages get AuthProvider + AdminDashboard
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // If it's the login page, NO AuthProvider - completely isolated
  if (pathname === '/admin/login') {
    return children;
  }

  // For protected pages only, wrap with AuthProvider and AdminDashboard
  return (
    <AuthProvider
      config={{
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api',
        requiredRole: 'admin',
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </AuthProvider>
  );
}
