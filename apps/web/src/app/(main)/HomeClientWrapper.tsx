"use client";

import React from "react";
import { CoursesGrid } from "@/components/sections/CoursesGrid";
import { useCourses } from "@/hooks";

/**
 * Client wrapper for interactive components that require client-side state
 * Separated from server component to maintain ISR benefits for categories
 */
export function HomeClientWrapper() {
  const { courses, isLoading: coursesLoading } = useCourses({
    status: 'published',
    limit: 8
  });

  return (
    <CoursesGrid courses={courses} isLoading={coursesLoading} />
  );
}