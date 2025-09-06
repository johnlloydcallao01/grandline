"use client";

import React from "react";
import { CategoryCarousel, VideoGrid, HeroSection, CoursesGrid } from "@/components/sections";
import { useCategory, useCourses } from "@/hooks";

/**
 * Home page component - RESTORED: Real course fetching
 *
 * PERFORMANCE OPTIMIZED: No artificial skeleton delays for static content.
 * Skeleton screens should only be used for dynamic content that requires network requests.
 * This follows Google's Core Web Vitals best practices for optimal LCP performance.
 */
export default function Home() {
  const { activeCategory, selectCategory } = useCategory("All");
  const { courses, isLoading: coursesLoading } = useCourses({
    status: 'published',
    limit: 8
  });

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <HeroSection />

      {/* Category Circles Carousel */}
      <div className="bg-white border-b border-gray-200">
        <CategoryCarousel
          activeCategory={activeCategory}
          onCategoryChange={selectCategory}
        />
      </div>

      {/* Courses Grid - Above Video Grid as requested */}
      <CoursesGrid courses={courses} isLoading={coursesLoading} />

      {/* Video Grid */}
      <VideoGrid />
    </div>
  );
}
