import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourses, type Course, type Media } from '@/server';
import Image from 'next/image';
import { ScrollToTop } from './ScrollToTop';

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

interface ViewCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch individual course data from CMS
 */
async function getCourseById(id: string): Promise<Course | null> {
  try {
    // Build headers with API key authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey = process.env.PAYLOAD_API_KEY;
    if (apiKey) {
      headers['Authorization'] = `users API-Key ${apiKey}`;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const response = await fetch(`${apiUrl}/courses/${id}`, {
      next: { revalidate: 300 }, // 5 minutes cache for ISR
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch course: ${response.status}`);
    }

    const course: Course = await response.json();
    return course;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

/**
 * Get the best available image URL from media object
 */
function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.cloudinaryURL || media.url || media.thumbnailURL || null;
}

/**
 * Dynamic course view page
 */
export default async function ViewCoursePage({ params }: ViewCoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  const thumbnailImageUrl = getImageUrl(course.thumbnail);

  return (
    <ScrollToTop>
      <div className="min-h-screen bg-white">


      {/* Breadcrumb Navigation */}
      <div className="w-full px-[5px] md:px-[15px] pt-4 pb-4">
        <nav className="flex items-center space-x-3 text-sm">
          <Link href="/" className="text-gray-600 hover:text-[#201a7c] transition-all duration-200 font-medium flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l8-8-8-8" />
            </svg>
            <span>Home</span>
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/courses" className="text-gray-600 hover:text-[#201a7c] transition-all duration-200 font-medium">
            Courses
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#201a7c] font-semibold truncate max-w-xs">{course.title}</span>
        </nav>
      </div>

      {/* Course Content */}
      <div className="w-full pb-12 pt-4 lg:pt-0">
        <div className="space-y-8">
          {/* Main Content */}
          <div className="flex flex-col md:flex-row shadow-lg rounded-xl border border-gray-100 p-4 mx-[5px] lg:mx-[15px]">
            <div className="w-full md:w-[65%]">
              {/* Course Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-[#201a7c] to-[#ab3b43] bg-clip-text text-transparent leading-tight">
                {course.title}
              </h1>
              
              {course.excerpt && (
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed text-lg font-light">{course.excerpt}</p>
                </div>
              )}
            </div>
            
            {thumbnailImageUrl && (
              <div className="w-full md:w-[35%]">
                {React.createElement(Image, {
                  src: thumbnailImageUrl,
                  alt: course.title,
                  width: 400,
                  height: 160,
                  className: "w-full h-40 object-cover rounded-xl shadow-md"
                })}
              </div>
            )}
          </div>


        </div>
      </div>
      </div>
    </ScrollToTop>
  );
}

/**
 * Generate static params for ISR
 * This will pre-generate pages for published courses
 */
export async function generateStaticParams() {
  try {
    const courses = await getCourses({ status: 'published', limit: 50 });
    return courses.map((course) => ({
      id: String(course.id),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}