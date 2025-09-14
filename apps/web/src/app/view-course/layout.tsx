'use client'

import React, { useState, useEffect } from 'react';
import { Header, OverlaySidebar } from '@/components/layout';

interface ViewCourseLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for view-course route group
 * This layout uses the shared Header component with an overlay sidebar
 */
export default function ViewCourseLayout({ children }: ViewCourseLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOverlaySidebarOpen, setIsOverlaySidebarOpen] = useState(false);

  // Check if we're on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleToggleOverlaySidebar = () => {
    setIsOverlaySidebarOpen(prev => !prev);
  };

  const handleCloseOverlaySidebar = () => {
    setIsOverlaySidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    console.log('Course page search query:', query);
    // TODO: Implement course-specific search functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Header - with overlay sidebar toggle */}
      <Header
        sidebarOpen={isOverlaySidebarOpen}
        onToggleSidebar={handleToggleOverlaySidebar}
        onSearch={handleSearch}
      />
      
      {/* Overlay Sidebar */}
      <OverlaySidebar
        isOpen={isOverlaySidebarOpen}
        onClose={handleCloseOverlaySidebar}
      />
      
      {/* Main Content - no sidebar margin */}
      <main className="bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
        <div className="min-h-full bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
          {children}
        </div>
      </main>
    </div>
  );
}