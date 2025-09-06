import React from 'react';

// Media interface from CMS API
interface Media {
  id: number;
  alt?: string | null;
  cloudinaryPublicId?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

// Course type based on your CMS API
interface Course {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  thumbnail?: Media | null;
  bannerImage?: Media | null;
}

interface CoursesGridProps {
  courses?: Course[];
  isLoading?: boolean;
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
  onClick?: () => void;
}

function CourseCard({ course, onClick }: CourseCardProps) {
  // Get the best available image URL from thumbnail
  const getImageUrl = (media: Media | null | undefined): string | null => {
    if (!media) return null;

    // Priority: cloudinaryURL > url > thumbnailURL
    return media.cloudinaryURL || media.url || media.thumbnailURL || null;
  };

  const imageUrl = getImageUrl(course.thumbnail);
  const altText = course.thumbnail?.alt || `${course.title} thumbnail`;

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
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
    </div>
  );
}

// Main Courses Grid Component
export function CoursesGrid({ courses = [], isLoading = false }: CoursesGridProps) {
  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
          <p className="text-gray-600">Explore our published courses</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show message if no courses (don't return null - that can cause layout issues)
  if (!courses || courses.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
          <p className="text-gray-600">Explore our published courses</p>
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
        <p className="text-gray-600">Explore our published courses</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => {
              // Handle course click - could navigate to course page
              console.log('Course clicked:', course.title);
            }}
          />
        ))}
      </div>
    </div>
  );
}
