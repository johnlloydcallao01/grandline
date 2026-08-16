'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header, Sidebar } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { MessengerProvider } from '@encreasl/ui/messenger-context';
import { useAuth } from '@/hooks/useAuth';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, token } = useAuth();
  const messengerApiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

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

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when the mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <ProtectedRoute>
      <MessengerProvider token={token} userId={user?.id} apiBaseUrl={messengerApiBase}>
        <div className="min-h-screen bg-[var(--background)]">
          {/* Header */}
          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onToggleMobileSidebar={toggleMobileSidebar}
          />

          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={closeMobileSidebar}
          />

          {/* Main Content */}
          <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-20'}`}>
            <div className="min-h-full px-[10px] pb-20 lg:pb-0">
              {children}
            </div>
          </main>

        </div>
      </MessengerProvider>
    </ProtectedRoute>
  );
}
