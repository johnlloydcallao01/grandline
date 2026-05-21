'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLogout, useUser } from '@/hooks/useAuth';

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

const pageTitles: Record<string, string> = {
  '/': 'Instructor Dashboard',
};

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const { user, displayName, initials } = useUser();
  const { logout, isLoggingOut } = useLogout();

  const pageTitle = pageTitles[pathname] ?? 'Instructor Workspace';
  const userInitials = useMemo(() => initials || 'GI', [initials]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedDesktopDropdown = desktopDropdownRef.current?.contains(target);
      const clickedMobileDropdown = mobileDropdownRef.current?.contains(target);

      if (!clickedDesktopDropdown && !clickedMobileDropdown) {
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="hidden min-h-[72px] items-center justify-between px-4 lg:flex">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`rounded-full p-2 text-slate-100 transition-colors hover:bg-white/10 ${sidebarOpen ? 'bg-white/5' : ''}`}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Grandline Maritime</p>
            <h1 className="font-display text-xl font-semibold text-white">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            Instructor Portal
          </div>
          <div className="relative" ref={desktopDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full p-1 text-slate-100 transition-colors hover:bg-white/10"
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.profilePicture?.alt || `${displayName || 'Instructor'} profile picture`}
                  className="h-10 w-10 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] font-semibold text-white">
                  {userInitials}
                </div>
              )}
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt={user?.profilePicture?.alt || `${displayName || 'Instructor'} profile picture`}
                        className="h-12 w-12 rounded-full border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-semibold text-white">
                        {userInitials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName || 'Instructor'}
                      </p>
                      <p className="truncate text-sm text-slate-400">
                        {user?.email || 'No email available'}
                      </p>
                      <p className="mt-1 text-xs font-medium capitalize text-sky-400">
                        {user?.role || 'instructor'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-4 py-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-200">
                      <div>
                        <span className="text-slate-400">Name:</span> {displayName || 'Not set'}
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span> {user?.email || 'Not set'}
                      </div>
                      <div>
                        <span className="text-slate-400">Role:</span> {user?.role || 'instructor'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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

      <div className="flex h-14 items-center justify-between px-4 lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Grandline</p>
          <h1 className="font-display text-base font-semibold text-white">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={mobileDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100"
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.profilePicture?.alt || `${displayName || 'Instructor'} profile picture`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="font-semibold">{userInitials}</span>
              )}
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
                <div className="border-b border-white/10 px-4 py-4">
                  <p className="truncate text-sm font-semibold text-white">{displayName || 'Instructor'}</p>
                  <p className="truncate text-sm text-slate-400">{user?.email || 'No email available'}</p>
                  <p className="mt-1 text-xs font-medium capitalize text-sky-400">{user?.role || 'instructor'}</p>
                </div>
                <div className="space-y-3 px-4 py-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    <div>
                      <span className="text-slate-400">Name:</span> {displayName || 'Not set'}
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-400">Email:</span> {user?.email || 'Not set'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-100"
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
