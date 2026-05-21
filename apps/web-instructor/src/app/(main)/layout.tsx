'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth';
import { Header, Sidebar } from '@/components/layout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setIsDesktop(isLargeScreen);

      if (!isLargeScreen) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isDesktop) {
      setSidebarOpen((prev) => !prev);
      return;
    }

    setSidebarOpen((prev) => !prev);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        <main
          className={`bg-[var(--background)] transition-all duration-300 pt-14 lg:pt-[72px] ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-20'}`}
        >
          <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 lg:min-h-[calc(100vh-72px)] lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
