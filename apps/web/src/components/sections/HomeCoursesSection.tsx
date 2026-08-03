"use client";
import React, { useState, useMemo, useEffect } from 'react';
import type { CourseCategory } from '@/server';
import { CourseCategoryCarousel } from '@/components/sections/CourseCategoryCarousel';
import { CoursesGrid } from '@/components/sections/CoursesGrid';
import { CoursesCarousel } from '@/components/sections/CoursesCarousel';
import { useCourses } from '@/hooks/useCourses';
import { useFeaturedCourses } from '@/hooks/useFeaturedCourses';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchPortalCourses } from '@/app/portal/courses/actions';
import { CategoryCarouselSkeleton } from '@/components/skeletons';

type Enrollment = { course?: any; status?: string; finalEvaluation?: string };

export function HomeCoursesSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialIdFromUrl = (() => {
    const v = searchParams.get('course-category');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  })();
  const [categoryId, setCategoryId] = useState<number | undefined>(initialIdFromUrl);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const { courses, isLoading, isLoadingMore, hasMore, loadMore, totalCourses } = useCourses({ status: 'published', limit: 4, page: 1, sort: '-updatedAt', category: typeof categoryId === 'number' ? String(categoryId) : undefined });
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const displayCourses = useMemo(() => {
    return (Array.isArray(courses) ? courses : []).filter((c) => c.status === 'published');
  }, [courses]);

  // Categories - fetched on the client, section shows its own skeleton until ready
  const [categoriesState, setCategoriesState] = useState<CourseCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const entries = (performance.getEntriesByType('navigation') as any) || [];
        const isReload = entries[0] && entries[0].type === 'reload';
        const res = await fetch(`/api/course-categories${isReload ? '?fresh=1' : ''}`, {
          cache: isReload ? 'no-store' : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data?.categories) ? data.categories : Array.isArray(data?.docs) ? data.docs : [];
          if (!cancelled) setCategoriesState(arr as CourseCategory[]);
        }
      } catch {
        void 0;
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Enrolled courses - fetched on the client, section shows its own skeleton until ready
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchPortalCourses();
        if (!cancelled) setEnrollments(Array.isArray(res) ? res : []);
      } catch {
        void 0;
      } finally {
        if (!cancelled) setEnrollmentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Featured Courses (only when no category filter)
  const showFeatured = typeof categoryId !== 'number';
  const { courses: featuredCourses, isLoading: isLoadingFeatured, isLoadingMore: isLoadingMoreFeatured, hasMore: hasMoreFeatured, loadMore: loadMoreFeatured, totalCourses: totalFeaturedCourses } = useFeaturedCourses(4, { enabled: showFeatured });
  const [visibleFeaturedCount, setVisibleFeaturedCount] = useState<number>(8);
  const featuredDisplay = useMemo(() => {
    return (Array.isArray(featuredCourses) ? featuredCourses : []).filter((c) => c.status === 'published' && c.isFeatured);
  }, [featuredCourses]);

  const enrolledCourses = useMemo(() => {
    const seen = new Set<string>();
    return (Array.isArray(enrollments) ? enrollments : [])
      .map((enrollment) => enrollment?.course)
      .filter((c) => {
        if (!c?.id) return false;
        const key = String(c.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((c) => ({ ...c, status: c.status || 'published' }));
  }, [enrollments]);

  const enrolledCoursesLink = enrolledCourses.length > 8 ? '/portal/courses' : undefined;

  const enrollmentStatusMap = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    const statusClasses: Record<string, string> = {
      active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      suspended: 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      dropped: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      expired: 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      completed: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };
    (Array.isArray(enrollments) ? enrollments : []).forEach((enrollment) => {
      const courseId = enrollment?.course?.id;
      if (!courseId) return;
      const key = String(courseId);
      if (map[key]) return;
      const status = enrollment.status;
      const isPassed = status === 'completed' && enrollment.finalEvaluation === 'passed';
      const isFailed = status === 'completed' && enrollment.finalEvaluation === 'failed';
      let label: string;
      let classKey: string;
      if (isPassed) { label = 'Passed'; classKey = 'completed'; }
      else if (isFailed) { label = 'Failed'; classKey = 'dropped'; }
      else if (status === 'completed') { label = 'Completed'; classKey = 'completed'; }
      else { label = status ?? ''; classKey = status ?? 'completed'; }
      const cls = statusClasses[classKey] || statusClasses.completed;
      map[key] = (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize border ${cls}`}>
          {label}
        </span>
      );
    });
    return map;
  }, [enrollments]);

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

  return (
    <div className="bg-[var(--background)]">
      {/* Category Carousel Section */}
      <div className="bg-[var(--card-background)] border-b border-[var(--card-border)]">
        {categoriesLoading ? (
          <CategoryCarouselSkeleton />
        ) : (
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
        )}
      </div>

      {/* Available Courses Section */}
      <div className="hidden lg:block">
        <CoursesGrid
          courses={displayCourses.slice(0, Math.min(visibleCount, displayCourses.length))}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          title="Available Courses"
          viewAllLink={availableCoursesLink}
          keyPrefix="available"
        />
      </div>
      {typeof categoryId === 'number' ? (
        <div className="lg:hidden">
          <CoursesGrid
            title="Available Courses"
            courses={displayCourses}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            paddingClass="p-[10px]"
            viewAllLink={availableCoursesLink}
            keyPrefix="available"
          />
        </div>
      ) : (
        <div className="lg:hidden">
          <CoursesCarousel
            courses={displayCourses.slice(0, 8)}
            isLoading={isLoading}
            title="Available Courses"
            viewAllLink={availableCoursesLink}
            keyPrefix="available"
          />
        </div>
      )}
      <div className="hidden lg:block max-w-7xl mx-auto p-[10px]">
        {!isLoading && (displayCourses.length > visibleCount || hasMore) && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                const nextVisible = visibleCount + 4;
                setVisibleCount(nextVisible);
                if (displayCourses.length < nextVisible && hasMore && !isLoadingMore) {
                  loadMore();
                }
              }}
              disabled={isLoadingMore}
              className="inline-flex items-center justify-center rounded-md border border-[var(--card-border)] bg-[var(--card-background)] p-[10px] text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Featured Courses Section */}
      {showFeatured && (isLoadingFeatured || featuredDisplay.length > 0) && (
        <>
          <div className="hidden lg:block">
            <CoursesGrid
              title="Featured Courses"
              courses={featuredDisplay.slice(0, Math.min(visibleFeaturedCount, featuredDisplay.length))}
              isLoading={isLoadingFeatured}
              isLoadingMore={isLoadingMoreFeatured}
              viewAllLink={featuredCoursesLink}
              keyPrefix="featured"
            />
          </div>
          <div className="lg:hidden">
            <CoursesCarousel
              courses={featuredDisplay.slice(0, 8)}
              isLoading={isLoadingFeatured}
              title="Featured Courses"
              viewAllLink={featuredCoursesLink}
              keyPrefix="featured"
            />
          </div>
          <div className="hidden lg:block max-w-7xl mx-auto p-[10px]">
            {!isLoadingFeatured && (featuredDisplay.length > visibleFeaturedCount || hasMoreFeatured) && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const nextVisible = visibleFeaturedCount + 4;
                    setVisibleFeaturedCount(nextVisible);
                    if (featuredDisplay.length < nextVisible && hasMoreFeatured && !isLoadingMoreFeatured) {
                      loadMoreFeatured();
                    }
                  }}
                  disabled={isLoadingMoreFeatured}
                  className="inline-flex items-center justify-center rounded-md border border-[var(--card-border)] bg-[var(--card-background)] p-[10px] text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Enrolled Courses Section */}
      {(enrollmentsLoading || enrolledCourses.length > 0) && (
        <>
          <div className="hidden lg:block">
            <CoursesGrid
              title="Enrolled Courses"
              courses={enrolledCourses.slice(0, 8)}
              isLoading={enrollmentsLoading}
              viewAllLink={enrolledCoursesLink}
              keyPrefix="enrolled"
              ribbonMap={enrollmentStatusMap}
              cardImageClassName="aspect-[3/4]"
            />
          </div>
          <div className="lg:hidden">
            <CoursesCarousel
              courses={enrolledCourses.slice(0, 8)}
              isLoading={enrollmentsLoading}
              title="Enrolled Courses"
              viewAllLink={enrolledCoursesLink}
              keyPrefix="enrolled"
              ribbonMap={enrollmentStatusMap}
              cardImageClassName="aspect-[3/4]"
            />
          </div>
        </>
      )}
    </div>
  );
}
