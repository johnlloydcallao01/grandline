'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from "@/components/ui/ImageWrapper";
import { useRouter } from 'next/navigation';
import { useTraineeAuth } from '@encreasl/auth';
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Get auth state and functions
  const { user, isAuthenticated, logout } = useTraineeAuth();

  const handlePortalClick = () => {
    router.push('/portal');
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logout initiated...');
      await logout();
      setIsProfileDropdownOpen(false);
      console.log('✅ Logout successful, redirecting...');
      router.push('/signin');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still redirect to signin even if logout fails
      router.push('/signin');
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return user.email;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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
          <button
            onClick={handlePortalClick}
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
            <i className="fa fa-graduation-cap text-lg"></i>
            My Portal
          </button>

          {/* Professional Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            {isAuthenticated ? (
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Profile menu"
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#201a7c] to-[#ab3b43] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-32">
                    {user?.email}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => router.push('/signin')}
                className="px-4 py-2 bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Sign In
              </button>
            )}

            {/* Professional Dropdown Menu */}
            {isProfileDropdownOpen && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#201a7c] to-[#ab3b43] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user?.email}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 font-medium capitalize">
                          {user?.role || 'Trainee'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      router.push('/portal');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa fa-graduation-cap w-4 h-4 mr-3 text-gray-400"></i>
                    My Learning Portal
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      router.push('/profile');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa fa-user w-4 h-4 mr-3 text-gray-400"></i>
                    Profile Settings
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <i className="fa fa-sign-out-alt w-4 h-4 mr-3 text-red-500"></i>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
