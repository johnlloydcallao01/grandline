'use client';

import * as React from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout - Simple layout for admin pages
 * Authentication is now handled by middleware
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // If it's the login page, don't wrap with AdminDashboard
  if (pathname === '/admin/login') {
    return children;
  }

  // For all other admin pages, wrap with AdminDashboard
  return (
    <AdminDashboard>
      {children}
    </AdminDashboard>
  );
}
