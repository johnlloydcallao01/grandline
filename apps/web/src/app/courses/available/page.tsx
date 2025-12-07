'use client';

import React from 'react';
import { CoursesGrid } from '@/components/sections/CoursesGrid';
import { useCourses } from '@/hooks/useCourses';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useSearchParams } from 'next/navigation';

export default function AvailableCoursesPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('course-category') || undefined;

  const { courses, isLoading, isLoadingMore, hasMore, loadMore } = useCourses({
    status: 'published',
    limit: 12,
    category: categoryId
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto">
        <CoursesGrid
          courses={courses}
          isLoading={isLoading}
          skeletonCount={8}
          title=""
          paddingClass="p-4 md:p-6"
        />
        {(hasMore || isLoadingMore) && (
          <div className="mt-8 flex justify-center pb-8">
            {isLoadingMore ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-6">
                {Array.from({ length: 4 }).map((_, i) => (<CardSkeleton key={i} />))}
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
