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
    <div className="min-h-screen bg-white">
      {/* Shared Header - only visible on desktop */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:z-50">
        <Header
          sidebarOpen={isOverlaySidebarOpen}
          onToggleSidebar={handleToggleOverlaySidebar}
          onSearch={handleSearch}
        />
      </div>
      
      {/* Overlay Sidebar - only on desktop */}
      <div className="hidden lg:block">
        <OverlaySidebar
          isOpen={isOverlaySidebarOpen}
          onClose={handleCloseOverlaySidebar}
        />
      </div>
      
      {/* Mobile/Tablet Sticky Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-[5px] md:px-4 py-2">
          {/* Back Arrow */}
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Ellipsis Menu */}
          <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white">
        {children}
      </div>
    </div>
  );
}