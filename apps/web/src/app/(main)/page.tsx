import React from "react";
import { HeroSection } from "@/components/sections";
import { HomeCoursesSection } from "@/components/sections/HomeCoursesSection";
import { getCourseCategories } from "@/server";

/**
 * Home page component - FULLY ISR OPTIMIZED
 * 
 * PERFORMANCE OPTIMIZED: Both categories and courses are pre-fetched 
 * server-side with ISR. This eliminates all client-side loading states 
 * and provides optimal SEO performance.
 */
export default async function Home() {
  const categories = await getCourseCategories(50);
  return (
    <div className="bg-gray-50 lg:min-h-screen home-no-min" style={{ backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <HeroSection />

      <HomeCoursesSection categories={categories} />
    </div>
  );
}
