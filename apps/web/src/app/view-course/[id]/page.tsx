import React from 'react';
import { notFound } from 'next/navigation';
import { getCourseByIdWithInstructor } from '@/server';
import ViewCourseClient from './ViewCourseClient';

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

interface ViewCoursePageProps {
  params: Promise<{
    id: string;
  }>;
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
  
  // Fetch course data server-side with ISR using centralized service
  const course = await getCourseByIdWithInstructor(resolvedParams.id);
  
  if (!course) {
    notFound();
  }

  return (
    <ViewCourseClient course={course} />
  );
}
