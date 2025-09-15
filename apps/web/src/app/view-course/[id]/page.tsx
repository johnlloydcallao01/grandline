import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourses, type Media } from '@/server';
import Image from 'next/image';
import { ScrollToTop } from './ScrollToTop';
import { AuthorAvatar } from './AuthorAvatar';

// Extended Course interface with instructor information
interface User {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture?: Media | null;
}

interface Instructor {
  id: number;
  user: User;
  specialization: string;
}

interface CourseWithInstructor {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  thumbnail?: Media | null;
  bannerImage?: Media | null;
  instructor?: Instructor | null;
}

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
async function getCourseById(id: string): Promise<CourseWithInstructor | null> {
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
    // Add depth=3 to fetch instructor -> user -> profilePicture data
    const response = await fetch(`${apiUrl}/courses/${id}?depth=3`, {
      next: { revalidate: 300 }, // 5 minutes cache for ISR
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch course: ${response.status}`);
    }

    const course: CourseWithInstructor = await response.json();
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
          <span className="text-gray-600 font-medium">
            View Course
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#201a7c] font-semibold truncate max-w-xs">{course.title}</span>
        </nav>
      </div>

      {/* Course Header - Full Width Dark Section */}
      <div 
        className="w-full text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #201a7c 0%, #ab3b43 100%)'
        }}
      >
        {/* Maritime Background Pattern */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 200"><defs><pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 Q25,0 50,10 T100,10" stroke="%23ffffff" stroke-width="1" fill="none" opacity="0.3"/></pattern></defs><rect width="1200" height="200" fill="url(%23waves)"/><g opacity="0.4"><circle cx="150" cy="40" r="1.5" fill="%23ffffff"/><circle cx="350" cy="60" r="1" fill="%23ffffff"/><circle cx="550" cy="35" r="1.5" fill="%23ffffff"/><circle cx="750" cy="55" r="1" fill="%23ffffff"/><circle cx="950" cy="45" r="1.5" fill="%23ffffff"/></g><g opacity="0.6"><path d="M50,80 L70,85 L90,80 L110,85 L130,80" stroke="%23ffffff" stroke-width="1.5" fill="none"/><path d="M200,90 L220,95 L240,90 L260,95 L280,90" stroke="%23ffffff" stroke-width="1.5" fill="none"/><path d="M400,75 L420,80 L440,75 L460,80 L480,75" stroke="%23ffffff" stroke-width="1.5" fill="none"/></g><g opacity="0.3"><polygon points="100,120 110,110 120,120 110,130" fill="%23ffffff"/><polygon points="300,130 310,120 320,130 310,140" fill="%23ffffff"/><polygon points="500,115 510,105 520,115 510,125" fill="%23ffffff"/><polygon points="700,125 710,115 720,125 710,135" fill="%23ffffff"/><polygon points="900,110 910,100 920,110 910,120" fill="%23ffffff"/></g><path d="M0,160 Q200,140 400,160 T800,160 Q1000,140 1200,160 L1200,200 L0,200 Z" fill="%23ffffff" opacity="0.1"/></svg>')`
          }}
        />
        <div className="relative z-10 max-w-7xl px-6 py-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Content */}
            <div className="flex-1">
              {/* Course Title */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>
              
              {/* Course Description */}
              {course.excerpt && (
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {course.excerpt}
                </p>
              )}
              
              {/* Author Information */}
              {course.instructor && course.instructor.user && (
                <div className="flex items-center space-x-3 mb-6">
                  <AuthorAvatar user={course.instructor.user} />
                  <div>
                    <p className="text-white font-medium">
                      A course by {course.instructor.user.firstName} {course.instructor.user.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {course.instructor.specialization}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Course Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-300 mb-6">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★★★★★</span>
                  <span>(0 ratings)</span>
                </div>
                <span>0 student</span>
                <span>Aug/2025</span>
                <span>1 lessons</span>
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Navigation Tabs */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl px-6">
          <nav className="flex space-x-8">
            <a href="#description" className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
              Description
            </a>
            <a href="#curriculum" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              Curriculum
            </a>
            <a href="#instructor" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              Instructor
            </a>
            <a href="#materials" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              Materials
            </a>
            <a href="#announcements" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              Announcements
            </a>
          </nav>
        </div>
      </div>
      
      {/* Course Content Sections - Two Column Layout */}
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - Left Column */}
            <div className="flex-1">
              {/* Description Section */}
              <div id="description" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Course Description</h2>
                {course.excerpt && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{course.excerpt}</p>
                  </div>
                )}
              </div>
              
              {/* Additional content sections can be added here */}
              <div id="curriculum" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
                <p className="text-gray-700">Course curriculum content will be displayed here.</p>
              </div>
              
              <div id="instructor" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Instructor</h2>
                {course.instructor && course.instructor.user && (
                  <div className="flex items-center space-x-4">
                    <AuthorAvatar user={course.instructor.user} />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {course.instructor.user.firstName} {course.instructor.user.lastName}
                      </h3>
                      <p className="text-gray-600">{course.instructor.specialization}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sticky Sidebar - Right Column */}
            <div className="lg:w-80">
              <div className="sticky top-20 -mt-70">
                {thumbnailImageUrl && (
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
                    {React.createElement(Image, {
                      src: thumbnailImageUrl,
                      alt: course.title,
                      width: 320,
                      height: 180,
                      className: "w-full h-45 object-cover"
                    })}
                    
                    {/* Price and Action */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-red-500 text-sm line-through">₱5,000.00</span>
                          <div className="text-2xl font-bold text-gray-900">₱4,700.00</div>
                        </div>
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Business
                        </span>
                      </div>
                      
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors">
                        ♡ ADD TO WISHLIST
                      </button>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>100% positive reviews</div>
                        <div>0 student</div>
                        <div>1 lesson</div>
                        <div>Language: English</div>
                        <div>0 quiz</div>
                        <div>Assessments: Yes</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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