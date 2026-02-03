'use client';
import Link from 'next/link';
import type { Course } from '@/types/course';
import { CourseCard } from '@encreasl/ui/course-card';
import { useWishlist } from '@/contexts/WishlistContext';

interface CoursesGridProps {
  courses: Course[];
  isLoading?: boolean;
  skeletonCount?: number;
  title?: string;
  paddingClass?: string;
  viewAllLink?: string;
}

// Course Card Skeleton
function CourseCardSkeleton() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        <div className="w-full h-full bg-gray-300"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function CoursesGrid({ courses, isLoading = false, skeletonCount = 8, title = 'Available Courses', paddingClass = 'p-6', viewAllLink }: CoursesGridProps) {
  const { wishlistMap, toggleWishlist } = useWishlist();

  if (isLoading && (!courses || courses.length === 0)) {
    return (
      <div className={paddingClass}>
        <div className="mb-[10px] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {viewAllLink && (
            <Link href={viewAllLink as any} className="lg:hidden text-gray-500 hover:text-gray-700">
              <i className="fa fa-chevron-right"></i>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show message if no courses
  if (!courses || courses.length === 0) {
    return (
      <div className={paddingClass}>
        <div className="mb-[10px] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
          <p className="text-gray-600">Check back later for new courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={paddingClass}>
      <div className="mb-[10px] flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink as any} className="lg:hidden text-gray-500 hover:text-gray-700">
            <i className="fa fa-chevron-right"></i>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses
          .filter((c) => c.status === 'published')
          .map((course) => {
            const idKey = String(course.id);
            const isWishlisted = wishlistMap ? wishlistMap[idKey] ?? false : false;

            return (
              <CourseCard
                key={course.id}
                course={course}
                variant="grid"
                isWishlisted={isWishlisted}
                onToggleWishlist={async (courseId) => {
                  try {
                    await toggleWishlist(courseId);
                  } catch {
                    void 0;
                  }
                }}
                renderLink={({ href, className, children }) => (
                  <Link href={href as any} scroll className={className}>
                    {children}
                  </Link>
                )}
              />
            );
          })}
      </div>
    </div>
  );
}
