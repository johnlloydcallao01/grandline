'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
        {/* Logo - 70% */}
        <div className="w-[70%] flex items-center justify-start">
          <Image
            src="/calsiter-inc-logo.png"
            alt="Calsiter Inc Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </div>

        {/* Heart/Favorites Icon - 10% */}
        <div className="w-[10%] h-10 bg-white rounded-md flex items-center justify-center">
          <i className="fa fa-heart text-gray-600 text-lg"></i>
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
      <div className="hidden lg:flex items-center justify-between px-4 py-2">
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
            width={150}
            height={40}
            className="h-10 w-auto"
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
            <button
              type="button"
              className="ml-2 p-2 hover:bg-gray-100 rounded-full text-gray-700"
              aria-label="Voice search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right section - Desktop */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
            aria-label="Create"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
            aria-label="Apps"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 3l5 5-5 5" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-base font-semibold cursor-pointer">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
