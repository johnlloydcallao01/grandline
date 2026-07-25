'use client';

import { useState, useEffect } from 'react';
import { Header, Sidebar, MobileFooter } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const hideInstantLoadingScreen = () => {
      const loadingScreen = document.getElementById('instant-loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    };

    const timer = setTimeout(hideInstantLoadingScreen, 100);
    return () => clearTimeout(timer);
  }, []);

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
      setSidebarOpen(prev => !prev);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        {/* Main Content */}
        <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-20'}`}>
          <div className="min-h-full px-[10px] pb-20 lg:pb-0">
            {children}
          </div>
        </main>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
    </ProtectedRoute>
  );
}
