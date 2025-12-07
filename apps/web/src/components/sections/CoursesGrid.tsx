'use client';

import React from 'react';
import Link from 'next/link';
import type { Course, Media } from '@/types/course';

interface CoursesGridProps {
  courses: Course[];
  isLoading?: boolean;
  skeletonCount?: number;
  title?: string;
  paddingClass?: string;
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

// Course Card Component
interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps): React.ReactNode => {
  const LinkComponent = Link as any;

  // Get the best available image URL from thumbnail
  const getImageUrl = (media: Media | null | undefined): string | null => {
    if (!media) return null;

    // Priority: cloudinaryURL > url > thumbnailURL
    return media.cloudinaryURL || media.url || media.thumbnailURL || null;
  };

  const imageUrl = getImageUrl(course.thumbnail);
  const altText = course.thumbnail?.alt || `${course.title} thumbnail`;
  const [wishlisted, setWishlisted] = React.useState(false);
  React.useEffect(() => {
    try {
      const v = localStorage.getItem(`gl:wishlist:course:${course.id}`);
      setWishlisted(!!v);
    } catch { void 0; }
  }, [course.id]);

  return (
    <LinkComponent href={`/view-course/${course.id}`} scroll className="group cursor-pointer block">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        {/* Fallback placeholder - shown when no image or image fails to load */}
        <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Course Image</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const next = !wishlisted;
            setWishlisted(next);
            try {
              if (next) {
                localStorage.setItem(`gl:wishlist:course:${course.id}`, '1');
              } else {
                localStorage.removeItem(`gl:wishlist:course:${course.id}`);
              }
            } catch { void 0; }
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Toggle wishlist"
        >
          <i className={`fa fa-heart ${wishlisted ? 'text-[#ab3b43]' : 'text-gray-300'}`}></i>
        </button>
      </div>

      {/* Course Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
          {course.title}
        </h3>
        {course.excerpt && (
          <p className="text-sm text-gray-600 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
            {course.excerpt}
          </p>
        )}
      </div>
    </LinkComponent>
  );
}

// Main Courses Grid Component
export function CoursesGrid({ courses, isLoading = false, skeletonCount = 8, title = 'Available Courses', paddingClass = 'p-6' }: CoursesGridProps) {
  // Remove loading logic since ISR provides data immediately
  // Keep for backward compatibility during migration
  if (isLoading) {
    return (
      <div className={paddingClass}>
        <div className="mb-[10px]">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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
        <div className="mb-[10px]">
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
      <div className="mb-[10px]">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.filter((c) => c.status === 'published').map((course) => (
          <CourseCard
            key={course.id}
            course={course}
          />
        ))}
      </div>
    </div>
  );
}
