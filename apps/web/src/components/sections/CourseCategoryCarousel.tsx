"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CourseCategoryCircle } from '@/components/ui/CourseCategoryCircle';
import { CourseCategory } from '@/server';
import { usePhysicsCarousel } from '@encreasl/ui/physics-carousel';

/**
 * Professional CourseCategoryCarousel with smooth momentum scrolling
 * Implements physics-based scrolling similar to native mobile apps
 */
export function CourseCategoryCarousel({
  categories: initialCategories,
  onCategoryChange
}: {
  categories: CourseCategory[];
  onCategoryChange?: (categoryId?: number) => void;
}) {
  // Initialize with provided data (no loading state needed)
  const [categories] = useState<CourseCategory[]>(initialCategories);
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Viewport logic for responsive spacing
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const isUltraWide = viewportWidth >= 1500;
  const itemWidth = isUltraWide ? 80 : 64;
  const gapWidth = isUltraWide ? 56 : 48;

  const { translateX, isDragging, maxTranslate, scrollBy, onStart, onMove, onEnd } = usePhysicsCarousel({
    containerRef,
    trackRef,
    momentumMultiplier: 200,
    rubberBandFactor: 0.3,
    defaultAnimationDurationMs: 400,
    measureDeps: [categories.length, viewportWidth, gapWidth]
  });

  const scrollLeft = () => {
    const swipeDistance = (itemWidth + gapWidth) * 1.5;
    scrollBy(swipeDistance, 400);
  };

  const scrollRight = () => {
    const swipeDistance = (itemWidth + gapWidth) * 1.5;
    scrollBy(-swipeDistance, 400);
  };

  const handleCategoryClick = (id: number) => {
    if (!isDragging) {
      if (id === activeCategoryId) {
        setActiveCategoryId(0);
        onCategoryChange?.(undefined);
      } else {
        setActiveCategoryId(id);
        onCategoryChange?.(id);
      }
    }
  };

  const handleStart = (clientX: number) => {
    onStart(clientX);
  };

  const handleMove = useCallback((clientX: number) => {
    onMove(clientX);
  }, [onMove]);

  const handleEnd = useCallback(() => {
    onEnd();
  }, [onEnd]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events - optimized for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.stopPropagation();
    }
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="relative">
      {/* Left Arrow - Hidden on mobile/tablet, visible on desktop */}
      {translateX < 0 && (
        <button
          onClick={scrollLeft}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Arrow - Hidden on mobile/tablet, visible on desktop */}
      {translateX > -maxTranslate && (
        <button
          onClick={scrollRight}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Carousel Container */}
      <div
        className="overflow-hidden px-2.5" // Matched padding
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? handleMouseUp : undefined}
        style={{
          touchAction: 'pan-y', // Matched touchAction
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div
          ref={trackRef}
          className="flex py-2.5 select-none"
          style={{
            transform: `translateX(${translateX}px)`,
            gap: `${gapWidth}px`, // Dynamic gap
            WebkitUserSelect: 'none',
            userSelect: 'none',
            transition: 'none',
            willChange: 'transform',
            pointerEvents: 'none'
          }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0"
              style={{ pointerEvents: 'auto' }}
            >
              <CourseCategoryCircle
                category={category}
                active={activeCategoryId === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
