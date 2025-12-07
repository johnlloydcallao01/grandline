"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CourseCategory } from '@/server';
import { CourseCategoryCarousel } from '@/components/sections/CourseCategoryCarousel';
import { CoursesGrid } from '@/components/sections/CoursesGrid';
import { CoursesCarousel } from '@/components/sections/CoursesCarousel';
import { useCourses } from '@/hooks/useCourses';
import { useFeaturedCourses } from '@/hooks/useFeaturedCourses';
import { useRouter, useSearchParams } from 'next/navigation';
import { CardSkeleton } from '@/components/ui/Skeleton';

export function HomeCoursesSection({ categories }: { categories: CourseCategory[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialIdFromUrl = (() => {
    const v = searchParams.get('course-category');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  })();
  const [categoryId, setCategoryId] = useState<number | undefined>(initialIdFromUrl);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const { courses, isLoading, isLoadingMore, hasMore, loadMore, totalCourses } = useCourses({ status: 'published', limit: isMobile ? 4 : 8, page: 1, category: typeof categoryId === 'number' ? String(categoryId) : undefined });
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const displayCourses = useMemo(() => {
    const filtered = (Array.isArray(courses) ? courses : []).filter((c) => c.status === 'published');
    return filtered.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });
  }, [courses]);

  // Featured Courses (only when no category filter)
  const showFeatured = typeof categoryId !== 'number';
  const { courses: featuredCourses, isLoading: isLoadingFeatured, isLoadingMore: isLoadingMoreFeatured, hasMore: hasMoreFeatured, loadMore: loadMoreFeatured, totalCourses: totalFeaturedCourses } = useFeaturedCourses(isMobile ? 4 : 8);
  const [visibleFeaturedCount, setVisibleFeaturedCount] = useState<number>(8);
  const featuredDisplay = useMemo(() => {
    return (Array.isArray(featuredCourses) ? featuredCourses : []).filter((c) => c.status === 'published' && c.isFeatured);
  }, [featuredCourses]);

  const [categoriesState, setCategoriesState] = useState<CourseCategory[]>(Array.isArray(categories) ? categories : []);
  useEffect(() => {
    setCategoriesState(Array.isArray(categories) ? categories : []);
  }, [categories]);

  useEffect(() => {
    try {
      const entries = (performance.getEntriesByType('navigation') as any) || [];
      const isReload = entries[0] && entries[0].type === 'reload';
      if (isReload) {
        (async () => {
          const res = await fetch('/api/course-categories?fresh=1', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data?.categories) ? data.categories : Array.isArray(data?.docs) ? data.docs : [];
            if (Array.isArray(arr) && arr.length >= 0) setCategoriesState(arr as CourseCategory[]);
          }
        })();
      }
    } catch { void 0 }
  }, []);

  const availableCoursesLink = totalCourses > 8
    ? (categoryId ? `/courses/available?course-category=${categoryId}` : '/courses/available')
    : undefined;

  const featuredCoursesLink = totalFeaturedCourses > 8 ? '/courses/featured' : undefined;

  useEffect(() => {
    const targetInitial = 8;
    if (!isLoading && displayCourses.length < targetInitial && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [isLoading, isLoadingMore, hasMore, displayCourses.length, categoryId, loadMore]);

  useEffect(() => {
    const targetInitial = 8;
    if (showFeatured && !isLoadingFeatured && featuredDisplay.length < targetInitial && hasMoreFeatured && !isLoadingMoreFeatured) {
      loadMoreFeatured();
    }
  }, [showFeatured, isLoadingFeatured, isLoadingMoreFeatured, hasMoreFeatured, featuredDisplay.length, loadMoreFeatured]);


  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 1024);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    setVisibleCount(isMobile ? 4 : 8);
    setVisibleFeaturedCount(isMobile ? 4 : 8);
  }, [isMobile]);

  const hasMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(isLoadingMore);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);

  // Removed continuous mobile auto-loading; we only fetch up to initial 8 via effect above

  // Removed continuous mobile auto-loading for featured; we only fetch up to initial 8


  return (
    <div className="bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      <div className="bg-white border-b border-gray-200">
        <CourseCategoryCarousel
          categories={categoriesState as CourseCategory[]}
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
      </div>
      <div className="hidden lg:block">
        <CoursesGrid
          courses={displayCourses.slice(0, Math.min(visibleCount, displayCourses.length))}
          isLoading={isLoading}
          skeletonCount={categoryId ? 4 : 8}
          title="Available Courses"
          viewAllLink={availableCoursesLink}
        />
      </div>
      {typeof categoryId === 'number' ? (
        <div className="lg:hidden">
          <CoursesGrid
            title="Available Courses"
            courses={displayCourses}
            isLoading={isLoading}
            skeletonCount={4}
            paddingClass="p-[10px]"
            viewAllLink={availableCoursesLink}
          />
        </div>
      ) : (
        <CoursesCarousel
          courses={displayCourses.slice(0, 8)}
          isLoading={isLoading}
          skeletonCount={8}
          title="Available Courses"
          viewAllLink={availableCoursesLink}
        />
      )}
      <div className="hidden lg:block max-w-7xl mx-auto p-[10px]">
        {(displayCourses.length > visibleCount || hasMore) && (
          isLoadingMore ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (<CardSkeleton key={i} />))}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const nextVisible = visibleCount + 4;
                  setVisibleCount(nextVisible);
                  if (displayCourses.length < nextVisible && hasMore && !isLoadingMore) {
                    loadMore();
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-[10px] text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Load More
              </button>
            </div>
          )
        )}
      </div>

      {showFeatured && (
        <>
          <div className="hidden lg:block">
            <CoursesGrid
              title="Featured Courses"
              courses={featuredDisplay.slice(0, Math.min(visibleFeaturedCount, featuredDisplay.length))}
              isLoading={isLoadingFeatured}
              skeletonCount={8}
              viewAllLink={featuredCoursesLink}
            />
          </div>
          <CoursesCarousel
            courses={featuredDisplay.slice(0, 8)}
            isLoading={isLoadingFeatured}
            skeletonCount={8}
            title="Featured Courses"
            viewAllLink={featuredCoursesLink}
          />
          <div className="hidden lg:block max-w-7xl mx-auto p-[10px]">
            {(featuredDisplay.length > visibleFeaturedCount || hasMoreFeatured) && (
              isLoadingMoreFeatured ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (<CardSkeleton key={i} />))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const nextVisible = visibleFeaturedCount + 4;
                      setVisibleFeaturedCount(nextVisible);
                      if (featuredDisplay.length < nextVisible && hasMoreFeatured && !isLoadingMoreFeatured) {
                        loadMoreFeatured();
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-[10px] text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Load More
                  </button>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
