'use client';

import { ProtectedRoute } from '@/components/auth';
import { InstructorDashboard } from '@/components/InstructorDashboard';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <InstructorDashboard>
        {children}
      </InstructorDashboard>
    </ProtectedRoute>
  );
}
