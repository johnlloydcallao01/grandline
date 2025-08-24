'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HeaderProps } from '@/types';

/**
 * Header component with navigation, search, and user controls
 * 
 * @param sidebarOpen - Whether the sidebar is currently open
 * @param onToggleSidebar - Function to toggle sidebar state
 * @param onSearch - Optional search handler function
 */
export function Header({
  sidebarOpen,
  onToggleSidebar,
  onSearch
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleSignInClick = () => {
    router.push('/signin');
  };

  // Scroll detection for header visibility (mobile/tablet only)
  useEffect(() => {
    const handleScroll = () => {
      // Only apply scroll behavior on mobile/tablet (below lg breakpoint)
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint

      if (isDesktop) {
        setIsHeaderVisible(true); // Always show header on desktop
        return;
      }

      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true);
      }
      // Hide header when scrolling down (but not immediately)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    const handleResize = () => {
      // Reset header visibility on resize
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        setIsHeaderVisible(true);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className={`lg:sticky lg:top-0 fixed top-0 left-0 right-0 bg-white z-50 lg:transition-none transition-transform duration-300 ease-in-out ${
      isHeaderVisible ? 'translate-y-0' : 'lg:translate-y-0 -translate-y-full'
    }`}>
      {/* Mobile Header - matches the exact design */}
      <div className="lg:hidden flex items-center px-3 py-1.5 space-x-1 sm:space-x-2 h-14">
        {/* Logo - 80% */}
        <div className="w-[80%] flex items-center justify-start">
          <Image
            src="/calsiter-inc-logo.png"
            alt="Calsiter Inc Logo"
            width={210}
            height={56}
            className="h-14 w-auto"
            priority
          />
        </div>

        {/* Bell/Notifications Icon - 10% */}
        <div className="w-[10%] h-10 bg-white rounded-md flex items-center justify-center">
          <i className="fas fa-bell text-gray-600 text-lg"></i>
        </div>

        {/* Search Icon - 10% */}
        <div className="w-[10%] h-10 bg-white rounded-md flex items-center justify-center">
          <i className="fa fa-search text-gray-600 text-lg"></i>
        </div>
      </div>

      {/* Desktop Header - existing design */}
      <div className="hidden lg:flex items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle button - only visible on desktop */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 hover:bg-gray-100 rounded-full text-gray-800 transition-colors ${
              sidebarOpen ? 'bg-gray-50' : ''
            }`}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image
            src="/calsiter-inc-logo.png"
            alt="Calsiter Inc Logo"
            width={270}
            height={72}
            className="h-16 w-auto"
            priority
          />
        </div>

        {/* Center search - Desktop */}
        <div className="flex flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="flex w-full">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 text-gray-700"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

          </form>
        </div>

        {/* Right section - Desktop */}
        <div className="flex items-center">
          <button
            onClick={handleSignInClick}
            className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: '#fff',
              color: '#201a7c',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(32, 26, 124, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.15)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
