import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourses, type Course, type Media } from '@/server';
import Image from 'next/image';
import { BackButton } from '@/components/ui';

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

  const bannerImageUrl = getImageUrl(course.bannerImage);
  const thumbnailImageUrl = getImageUrl(course.thumbnail);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Course Banner */}
      <div className="w-full px-[15px] pt-[10px]">
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-r from-[#201a7c] via-[#2d2394] to-[#ab3b43] rounded-3xl shadow-2xl">
        {/* Back/Previous Button */}
        <BackButton className="absolute top-4 left-4 z-10" />
        {bannerImageUrl ? (
          <>
            {React.createElement(Image, {
              src: bannerImageUrl,
              alt: course.title,
              fill: true,
              className: "object-cover opacity-30",
              priority: true
            })}
            <div className="absolute inset-0 bg-gradient-to-r from-[#201a7c]/80 via-[#2d2394]/70 to-[#ab3b43]/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#201a7c] via-[#2d2394] to-[#ab3b43]" />
        )}
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-5xl">

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent leading-tight">
                {course.title}
              </h1>
              {course.excerpt && (
                <p className="text-xl md:text-2xl text-gray-100 max-w-4xl mx-auto leading-relaxed font-light">
                  {course.excerpt}
                </p>
              )}
              <div className="flex items-center justify-center space-x-6 mt-8">
                <div className="flex items-center space-x-2 text-gray-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Premium Course</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span className="text-sm font-medium">Expert Instructors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="w-full px-[15px] pt-8 pb-4">
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
      <div className="w-full px-[15px] pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#201a7c] to-[#2d2394] px-8 py-6">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Course Overview
                </h2>
              </div>
              <div className="p-8">
                {course.excerpt && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#201a7c] to-[#ab3b43] rounded-full mr-3"></div>
                      Course Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg font-light">{course.excerpt}</p>
                  </div>
                )}

                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-[#201a7c] to-[#ab3b43] rounded-full mr-3"></div>
                      Course Features
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#201a7c] to-[#2d2394] rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Self-paced learning</span>
                      </div>
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#ab3b43] to-[#c44a54] rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Certificate of completion</span>
                      </div>
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#201a7c] to-[#ab3b43] rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Expert instructors</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-[#201a7c] to-[#ab3b43] rounded-full mr-3"></div>
                      Course Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Status:</span>
                          <span className="ml-2 capitalize font-medium text-green-600">{course.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Course ID:</span>
                          <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{course.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrollment Section */}
                <div className="bg-gradient-to-r from-[#201a7c] to-[#ab3b43] rounded-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Ready to start learning?
                    </h3>
                    <p className="text-white/90 mb-6 text-lg leading-relaxed">
                      Join thousands of students who have already enrolled in this premium course and advance your career.
                    </p>
                    <button className="w-full bg-white text-[#201a7c] py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                      Enroll Now - Start Your Journey
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#201a7c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Course Quick Info
                </h3>
              </div>
              
              <div className="p-6">
                {thumbnailImageUrl && (
                  <div className="mb-6">
                    {React.createElement(Image, {
                      src: thumbnailImageUrl,
                      alt: course.title,
                      width: 400,
                      height: 160,
                      className: "w-full h-40 object-cover rounded-xl shadow-md"
                    })}
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <span className="text-sm font-bold capitalize text-green-600 bg-green-100 px-3 py-1 rounded-full">{course.status}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Course ID</span>
                    <span className="text-xs font-mono bg-[#201a7c] text-white px-3 py-1 rounded-full">{course.id}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-[#201a7c] to-[#2d2394] text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-[#2d2394] hover:to-[#201a7c] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Start Learning
                  </button>
                  <button className="w-full border-2 border-[#ab3b43] text-[#ab3b43] py-3 px-6 rounded-xl font-semibold hover:bg-[#ab3b43] hover:text-white transition-all duration-200">
                    Add to Wishlist
                  </button>
                </div>

                {/* Course Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Course Stats</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Students Enrolled:</span>
                      <span className="font-medium">Coming Soon</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">Recently</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="font-medium">English</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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