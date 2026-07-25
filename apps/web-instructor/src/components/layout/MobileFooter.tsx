'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';

interface MobileFooterProps {
  hideAt?: 'md' | 'lg';
}

export function MobileFooter({ hideAt = 'md' }: MobileFooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initials } = useUser();

  const navigationItems: Array<{ id: string; label: string; icon?: React.ReactNode; path?: string; isProfile?: boolean }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      path: '/',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/courses',
    },
    {
      id: 'students',
      label: 'Students',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/students',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/schedule',
    },
    {
      id: 'profile',
      label: 'Profile',
      path: undefined,
      isProfile: true,
    },
  ];

  const isActive = (path: string | undefined) => {
    if (!path) return false;
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  const userInitials = initials || 'GI';

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-[55px] ${hideAt === 'lg' ? 'lg:hidden' : 'md:hidden'}`}>
      <div className="flex items-center justify-around h-full px-1 pb-safe">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.path && handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${item.isProfile ? 'relative' : 'p-1'}`}
            aria-label={item.label}
          >
            {item.isProfile ? (
              <div className="flex flex-col items-center justify-center -mt-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-semibold text-white shadow-lg ring-2 ring-white">
                  {userInitials}
                </div>
                <span className="text-[10px] font-medium leading-none text-gray-500 mt-1">
                  {item.label}
                </span>
              </div>
            ) : (
              <>
                <div className={`mb-0.5 ${isActive(item.path) ? 'text-gray-900' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-medium leading-none ${isActive(item.path) ? 'text-gray-900' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
