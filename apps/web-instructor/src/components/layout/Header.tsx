'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLogout, useUser } from '@/hooks/useAuth';
import { MessengerPanel } from './MessengerPanel';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSearch?: (query: string) => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Instructor Dashboard',
};

export function Header({ sidebarOpen, onToggleSidebar, onSearch }: HeaderProps) {
  const pathname = usePathname();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, displayName, initials } = useUser();
  const { logout, isLoggingOut } = useLogout();

  const pageTitle = pageTitles[pathname] ?? 'Instructor Workspace';
  const userInitials = useMemo(() => initials || 'GI', [initials]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const profilePictureUrl = user?.profilePicture?.cloudinaryURL || user?.profilePicture?.url || null;

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]">
      <div className="flex min-h-16 items-center justify-between px-4 py-2">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`rounded-full p-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${sidebarOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src="/calsiter-inc-logo.png"
                alt="Grandline Maritime Logo"
                fill
                sizes="(max-width: 768px) 40px, 40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Grandline Maritime</p>
              <h1 className="font-display text-base font-semibold text-gray-900 dark:text-gray-100">{pageTitle}</h1>
            </div>
          </div>
        </div>

        {/* Center search - hidden on small screens to preserve header space */}
        <div className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8">
          <form onSubmit={handleSearch} className="flex">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search instructor panel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] bg-[var(--card-background)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Messenger Icon */}
          <button
            onClick={() => setIsMessengerOpen(true)}
            className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Messenger"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full p-1 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.profilePicture?.alt || `${displayName || 'Instructor'} profile picture`}
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
                  {userInitials}
                </div>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                {/* User Info Section */}
                <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt={user?.profilePicture?.alt || `${displayName || 'Instructor'} profile picture`}
                        className="h-12 w-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-semibold text-white">
                        {userInitials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {displayName || 'Instructor'}
                      </p>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || 'No email available'}
                      </p>
                      <p className="mt-1 text-xs font-medium capitalize text-sky-600 dark:text-sky-400">
                        {user?.role || 'instructor'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className={`h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
      <MessengerPanel isOpen={isMessengerOpen} onClose={() => setIsMessengerOpen(false)} />
    </>
  );
}
