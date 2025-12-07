'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth';
import { MobileFooter } from '@/components/layout';

/**
 * Standalone layout for full-page course listings
 * Removes default header/footer and provides a simple back navigation header
 */
export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname.includes('/available')) return 'Available Courses';
    if (pathname.includes('/featured')) return 'Featured Courses';
    return 'Courses';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col relative">
        <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm">
          <div className="h-14 px-2.5 flex items-center gap-2">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.back()}
              className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-white text-[#333] shadow-md border border-gray-200"
            >
              <i className="fas fa-arrow-left leading-none text-[0.9rem]"></i>
            </button>
            <h1 className="text-base font-normal text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        <MobileFooter hideAt="lg" />
      </div>
    </ProtectedRoute>
  );
}
