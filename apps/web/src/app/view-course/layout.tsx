'use client'

import React, { useState } from 'react';
import { Header, OverlaySidebar } from '@/components/layout';

interface ViewCourseLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for view-course route group
 * This layout uses the shared Header component with an overlay sidebar
 */
export default function ViewCourseLayout({ children }: ViewCourseLayoutProps) {
  const [isOverlaySidebarOpen, setIsOverlaySidebarOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof history !== 'undefined' && (history as any).scrollRestoration !== undefined) {
        (history as any).scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
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

  const handleShare = async () => {
    try {
      if (typeof window === 'undefined') return;
      const url = window.location.href;
      if (!url) return;
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ url });
        setIsActionsOpen(false);
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
        setIsActionsOpen(false);
        return;
      }
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard');
      setIsActionsOpen(false);
    } catch {
      alert('Unable to share this link right now.');
    }
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
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 py-[3px]">
        <div className="flex items-center justify-between">
          {/* Back Arrow */}
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors
"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Ellipsis Menu */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setIsActionsOpen(true)}
          >
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

      {isActionsOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <button
            className="absolute inset-0 w-full h-full"
            aria-label="Close share options"
            onClick={() => setIsActionsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">Options</span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Close"
                onClick={() => setIsActionsOpen(false)}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-900"
              onClick={handleShare}
            >
              <i className="fa fa-share-alt text-gray-600" />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
