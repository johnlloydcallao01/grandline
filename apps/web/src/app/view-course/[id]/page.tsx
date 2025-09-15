import React from 'react';
import { notFound } from 'next/navigation';
import { type Media } from '@/server';
import ViewCourseClient from './ViewCourseClient';

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

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

    const apiUrl = 'https://cms.grandlinemaritime.com/api';
    // Add depth=3 to fetch instructor -> user -> profilePicture data
    const response = await fetch(`${apiUrl}/courses/${id}?depth=3`, {
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
 * Server-side course view page with ISR - FULLY ISR OPTIMIZED
 * 
 * PERFORMANCE OPTIMIZED: Course data is pre-fetched server-side with ISR.
 * This eliminates client-side loading states and provides optimal SEO performance.
 */
export default async function ViewCoursePage({ params }: ViewCoursePageProps) {
  // Resolve params server-side
  const resolvedParams = await params;
  
  // Fetch course data server-side with ISR
  const course = await getCourseById(resolvedParams.id);
  
  if (!course) {
    notFound();
  }

  return (
    <ViewCourseClient course={course} />
  );
}