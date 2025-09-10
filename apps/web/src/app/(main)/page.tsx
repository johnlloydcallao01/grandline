import React from "react";
import { CourseCategoryCarousel, HeroSection, CoursesGrid } from "@/components/sections";
import { getCourseCategories, getCourses } from "@/server";

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

/**
 * Home page component - FULLY ISR OPTIMIZED
 * 
 * PERFORMANCE OPTIMIZED: Both categories and courses are pre-fetched 
 * server-side with ISR. This eliminates all client-side loading states 
 * and provides optimal SEO performance.
 */
export default async function Home() {
  // Fetch both categories and courses server-side with ISR
  const [categories, courses] = await Promise.all([
    getCourseCategories(),
    getCourses({ status: 'published', limit: 8 })
  ]);

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <HeroSection />

      {/* Course Category Carousel with ISR data */}
      <div className="bg-white border-b border-gray-200">
        <CourseCategoryCarousel
          categories={categories}
        />
      </div>

      {/* Courses Grid with ISR data - no client wrapper needed */}
      <CoursesGrid courses={courses} />
    </div>
  );
}
