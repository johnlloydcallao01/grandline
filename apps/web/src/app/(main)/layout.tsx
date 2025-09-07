'use client'

import { useState, useEffect } from 'react'
import { Header, Sidebar, MobileFooter } from '@/components/layout'

/**
 * Main App Layout - Persistent layout for all main app pages
 * 
 * This layout provides:
 * - Persistent Header and Sidebar that never re-render during navigation
 * - Proper SPA behavior where only the page content changes
 * - Sidebar state that persists across all routes in this group
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)

  // Hide instant loading screen when main app loads
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

    // Small delay to ensure smooth transition
    const timer = setTimeout(hideInstantLoadingScreen, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if we're on desktop and update sidebar visibility accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const isLargeScreen = window.innerWidth >= 1024 // lg breakpoint
      setIsDesktop(isLargeScreen)

      // On mobile/tablet, always keep sidebar closed
      if (!isLargeScreen) {
        setSidebarOpen(false)
      }
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    // Only allow toggling on desktop
    if (isDesktop) {
      setSidebarOpen(prev => !prev)
    }
  }

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
    // TODO: Implement search functionality
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header - Persistent across all pages */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onSearch={handleSearch}
      />

      {/* Sidebar - Persistent across all pages */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area - Only this changes during navigation */}
      <main
        className={`transition-all duration-300 bg-gray-50 ${
          sidebarOpen ? 'lg:ml-60' : 'lg:ml-20'
        }`}
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="min-h-full bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
          {children}
        </div>
      </main>

      {/* Mobile Footer - Only for main app pages */}
      <MobileFooter />
    </div>
  )
}
