import React, { useRef } from 'react';
import { usePhysicsCarousel } from '@encreasl/ui/physics-carousel';

interface CourseNavigationCarouselProps {
  sections?: string[];
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

/**
 * Professional Course Navigation Carousel with smooth momentum scrolling
 * Implements physics-based scrolling similar to native mobile apps
 */
export function CourseNavigationCarousel({
  sections = ["Overview", "Description", "Curriculum", "Materials", "Instructors", "Announcements"],
  activeSection = "Overview",
  onSectionChange
}: CourseNavigationCarouselProps) {
  // Filter out Overview section on desktop (lg screens and above)
  const [isDesktop, setIsDesktop] = React.useState(false);
  
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const filteredSections = isDesktop 
    ? sections.filter(section => section !== "Overview")
    : sections;

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const {
    translateX,
    isDragging,
    hasDragged,
    maxTranslate,
    scrollBy,
    onStart,
    onMove,
    onEnd,
  } = usePhysicsCarousel({
    containerRef,
    trackRef,
    momentumMultiplier: 200,
    rubberBandFactor: 0.3,
    defaultAnimationDurationMs: 400,
    measureDeps: [filteredSections.length],
  });

  const scrollLeft = () => {
    const swipeDistance = 180;
    scrollBy(swipeDistance * -1, 400);
  };

  const scrollRight = () => {
    const swipeDistance = 180;
    scrollBy(swipeDistance, 400);
  };

  const handleSectionClick = (section: string) => {
    if (!onSectionChange) return;
    if (hasDragged) return;
    onSectionChange(section);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) onMove(e.clientX);
  };

  const handleMouseUp = () => {
    onEnd();
  };

  // Touch events - optimized for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    onStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.stopPropagation();
    }
    onMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    onEnd();
  };

  return (
    <div className="relative mb-8">
      {/* Left Arrow - Hidden on mobile/tablet, visible on desktop */}
      {translateX < 0 && (
        <button
          onClick={scrollLeft}
          className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Arrow - Hidden on mobile/tablet, visible on desktop */}
      {translateX > -maxTranslate && (
        <button
          onClick={scrollRight}
          className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Carousel Container */}
      <div
        className="overflow-hidden px-[10px] bg-white rounded-lg shadow-sm"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? handleMouseUp : undefined}
        style={{
          touchAction: 'pan-x',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div
          ref={trackRef}
          className="flex py-1.5 select-none"
          style={{
            transform: `translateX(${translateX}px)`,
            gap: '24px',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            transition: 'none', // Using requestAnimationFrame for smooth animations
            willChange: 'transform',
            pointerEvents: 'none' // Prevent individual items from blocking events
          }}
        >
          {filteredSections.map((section) => (
            <div
              key={section}
              className="flex-shrink-0"
              style={{ pointerEvents: 'auto' }} // Re-enable pointer events for clicking
            >
              <button
                onClick={() => handleSectionClick(section)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeSection === section
                    ? 'bg-gray-200 text-gray-700 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
