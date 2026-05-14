'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/auth';
import { useLogout, useUser } from '@/hooks/useAuth';

/**
 * Professional Menu Page - Facebook-style user menu
 * Mobile-optimized with comprehensive app navigation and user options
 */

// Menu sections data
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

const menuSections = [
  {
    title: 'Quick Nav',
    items: [
      { icon: 'fa-home', label: 'Home', path: '/', badge: null },
      { icon: 'fa-bookmark', label: 'Wishlists', path: '/wishlists', badge: null },
      { icon: 'fa-history', label: 'Recently Viewed', path: '/history', badge: null }
    ]
  },
  {
    title: 'Resources',
    items: [
      { icon: 'fa-certificate', label: 'Certificates', path: '/certificates', badge: null },
      { icon: 'fa-book-open', label: 'Training Materials', path: '/training-materials', badge: null },
      { icon: 'fa-download', label: 'Downloads', path: '/downloads', badge: null },
      { icon: 'fa-bullhorn', label: 'Announcements', path: '/announcements', badge: null }
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: 'fa-life-ring', label: 'Support', path: '/support', badge: null },
      { icon: 'fa-question-circle', label: 'FAQs', path: '/faqs', badge: null },
      { icon: 'fa-envelope', label: 'Contact Us', path: '/contact-us', badge: null }
    ]
  },
  {
    title: 'General',
    items: [
      { icon: 'fa-info-circle', label: 'About Us', path: '/about', badge: null },
      { icon: 'fa-newspaper', label: 'Blogs', path: '/blogs', badge: null },
      { icon: 'fa-file-contract', label: 'Terms & Conditions', path: '/terms-and-conditions', badge: null },
      { icon: 'fa-user-shield', label: 'Privacy Policy', path: '/privacy-policy', badge: null }
    ]
  }
];

type MenuStats = {
  activeCoursesCount: number;
  certificatesCount: number;
};

export default function MenuPage() {
  const router = useRouter();
  const { logout, isLoggingOut } = useLogout();
  const { user, displayName, isLoading } = useUser();
  const [menuStats, setMenuStats] = useState<MenuStats | null>(null);
  const [isLoadingMenuStats, setIsLoadingMenuStats] = useState(true);

  const handleMenuItemClick = (path: string) => {
    router.push(path as any);
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user?.id) {
      setMenuStats(null);
      setIsLoadingMenuStats(false);
      return;
    }

    const userId = user.id;
    let isCancelled = false;

    async function loadMenuStats() {
      setIsLoadingMenuStats(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/trainee-summary?userId=${userId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch menu stats: ${response.status}`);
        }

        const data = await response.json();
        if (!isCancelled) {
          setMenuStats(data?.success ? data.data?.stats ?? null : null);
        }
      } catch (error) {
        console.error('Failed to load menu stats', error);
        if (!isCancelled) {
          setMenuStats(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMenuStats(false);
        }
      }
    }

    loadMenuStats();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, isLoading]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) {
      return null;
    }

    const createdAt = new Date(user.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [user?.createdAt]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* User Profile Section */}
      <div className="bg-[var(--card-background)] border-b border-[var(--card-border)]">
        <div className="px-4 pt-8 pb-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Menu</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Navigate menus and support</p>
          </div>
          <button
            onClick={() => handleMenuItemClick('/portal/account')}
            className="w-full flex items-center space-x-4 rounded-xl bg-[var(--background)] p-4 text-left border border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  <div className="h-4 w-52 max-w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <UserAvatar size="xl" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  {user?.role && (
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{user.role}</span>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <i className="fa fa-chevron-right text-gray-600 dark:text-gray-400 text-sm"></i>
            </div>
          </button>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {isLoading || isLoadingMenuStats ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] animate-pulse">
                  <div className="h-7 w-14 mx-auto rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-3 w-16 mx-auto mt-2 rounded bg-gray-200 dark:bg-gray-800"></div>
                </div>
              ))
            ) : (
              <>
                <div className="text-center p-3 bg-blue-50 dark:bg-[#3028a3]/20 rounded-lg border border-blue-100 dark:border-[#3028a3]/30">
                  <div className="text-lg font-bold text-[#201a7c] dark:text-[#5c54e0]">{menuStats?.activeCoursesCount ?? 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Courses</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{menuStats?.certificatesCount ?? 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Certificates</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{memberSince ?? '--'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Member Since</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 py-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">{section.title}</h3>
            <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--card-border)] overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleMenuItemClick(item.path)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-[var(--card-border)] last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <i className={`fa ${item.icon} text-gray-600 dark:text-gray-400`}></i>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    <i className="fa fa-chevron-right text-gray-400 dark:text-gray-500 text-sm"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}


      </div>

      {/* Sign Out Section */}
      <div className="px-4 mb-6">
        <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--card-border)] overflow-hidden">
          <div className="border-t border-[var(--card-border)] py-1">
            <button
              onClick={async () => {
                try {
                  await logout();
                  router.replace('/signin' as any);
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <svg className="w-4 h-4 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 pb-20">
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Grandline Maritime Training</p>
          <p>Version 1.0.0</p>
          <p className="mt-2">© 2024 Grandline Maritime Training Center</p>
        </div>
      </div>


    </div>
  );
}
