'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from "@/components/ui/ImageWrapper";
import { useRouter } from 'next/navigation';
import { HeaderProps } from '@/types';
// Authentication removed

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Authentication removed - no user data
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMyPortalClick = () => {
    router.push('/portal');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Authentication removed - no logout functionality

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
    <>
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
        <button
          onClick={() => router.push('/notifications')}
          className="w-[10%] h-10 bg-white rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <i className="fas fa-bell text-gray-600 text-lg"></i>
        </button>

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
                onChange={(e: any) => setSearchQuery(e.target.value)}
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
        <div className="flex items-center space-x-4">
          {/* My Portal Button */}
          <button
            onClick={handleMyPortalClick}
            className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: '#fff',
              color: '#201a7c',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(32, 26, 124, 0.25)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.15)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            My Portal
          </button>

          {/* Profile Placeholder - No Authentication */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
            >
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu - No Authentication */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* No User Info - Authentication Disabled */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        Guest User
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        No authentication
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-600 font-medium">
                          Public Access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items - No Authentication */}
                <div className="py-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
