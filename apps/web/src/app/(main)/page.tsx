import React from "react";
import { HeroSection } from "@/components/sections";
import { HomeCoursesSection } from "@/components/sections/HomeCoursesSection";

/**
 * Home page component - FULLY ISR OPTIMIZED
 * 
 * PERFORMANCE OPTIMIZED: Both categories and courses are pre-fetched 
 * server-side with ISR. This eliminates all client-side loading states 
 * and provides optimal SEO performance.
 */
export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <HeroSection />

      <HomeCoursesSection />
    </div>
  );
}
