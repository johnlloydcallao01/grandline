'use client';

import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout - Wraps all admin pages with authentication and dashboard layout
 *
 * This layout ensures:
 * 1. Authentication is checked once at the layout level
 * 2. Dashboard layout (header, sidebar) persists across navigation
 * 3. Only the content area changes during navigation (true SPA behavior)
 * 4. Login page is rendered without dashboard layout
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // If it's the login page, don't wrap with AdminDashboard
  if (pathname === '/admin/login') {
    return (
      <AuthGuard>
        {children}
      </AuthGuard>
    );
  }

  // For all other admin pages, wrap with AdminDashboard
  return (
    <AuthGuard>
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </AuthGuard>
  );
}
