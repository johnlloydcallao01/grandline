"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CourseCategory } from '@/server';
import { CourseCategoryCarousel } from '@/components/sections/CourseCategoryCarousel';
import { CoursesGrid } from '@/components/sections/CoursesGrid';
import { CoursesCarousel } from '@/components/sections/CoursesCarousel';
import { useCourses } from '@/hooks/useCourses';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCourseCategories } from '@/hooks/useCourseCategories';
import { CategoryCircleSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export function HomeCoursesSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialIdFromUrl = (() => {
    const v = searchParams.get('course-category');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  })();
  const [categoryId, setCategoryId] = useState<number | undefined>(initialIdFromUrl);
  const { courses, isLoading, isLoadingMore, hasMore, loadMore } = useCourses({ status: 'published', limit: 4, page: 1, category: typeof categoryId === 'number' ? String(categoryId) : undefined });

  useEffect(() => {
    const targetInitial = 8;
    if (!isLoading && courses.length < targetInitial && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [isLoading, isLoadingMore, hasMore, courses.length, categoryId, loadMore]);


  const { categories, isLoading: loadingCategories } = useCourseCategories();
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 1024);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const hasMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(isLoadingMore);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);

  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      if (!hasMoreRef.current) {
        clearInterval(interval);
        return;
      }
      if (!isLoadingMoreRef.current) {
        void loadMore();
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isMobile, categoryId, loadMore]);

  const displayCourses = useMemo(() => {
    return courses;
  }, [courses]);

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      <div className="bg-white border-b border-gray-200">
        {loadingCategories ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex space-x-6 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (<CategoryCircleSkeleton key={i} />))}
          </div>
        ) : (
          <CourseCategoryCarousel
            categories={categories as CourseCategory[]}
            onCategoryChange={(id) => {
              setCategoryId(id);
              const params = new URLSearchParams(searchParams.toString());
              if (typeof id === 'number') {
                params.set('course-category', String(id));
                router.replace(`/?${params.toString()}`, { scroll: false });
              } else {
                params.delete('course-category');
                const qs = params.toString();
                router.replace(qs ? `/?${qs}` : '/', { scroll: false });
              }
            }}
          />
        )}
      </div>
      <div className="hidden lg:block">
        <CoursesGrid
          courses={displayCourses}
          isLoading={isLoading}
          skeletonCount={categoryId ? 4 : 8}
        />
      </div>
      <CoursesCarousel courses={displayCourses} isLoading={isLoading} skeletonCount={categoryId ? 4 : 8} />
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {hasMore && (
          isLoadingMore ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (<CardSkeleton key={i} />))}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Load More
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
