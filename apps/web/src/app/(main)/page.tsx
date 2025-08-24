"use client";

import React from "react";
import { CategoryCarousel, VideoGrid, HeroSection } from "@/components/sections";
import { useCategory } from "@/hooks";

/**
 * Home page component - Main application content
 *
 * PERFORMANCE OPTIMIZED: No artificial skeleton delays for static content.
 * Skeleton screens should only be used for dynamic content that requires network requests.
 * This follows Google's Core Web Vitals best practices for optimal LCP performance.
 */
export default function Home() {
  const { activeCategory, selectCategory } = useCategory("All");

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Category Circles Carousel */}
      <div className="bg-white border-b border-gray-200">
        <CategoryCarousel
          activeCategory={activeCategory}
          onCategoryChange={selectCategory}
        />
      </div>

      {/* Video Grid */}
      <VideoGrid />
    </>
  );
}
