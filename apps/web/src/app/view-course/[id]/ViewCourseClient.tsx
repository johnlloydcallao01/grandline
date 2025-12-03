'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthorAvatar } from './AuthorAvatar';
import { CourseNavigationCarousel } from '@/components/CourseNavigationCarousel';
import type { Media, CourseWithInstructor } from '@/types/course';

interface ViewCourseClientProps {
  course: CourseWithInstructor;
}

// Helper function to get image URL - same pattern as CoursesGrid
function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  
  // Priority: cloudinaryURL > url > thumbnailURL
  return media.cloudinaryURL || media.url || media.thumbnailURL || null;
}

export default function ViewCourseClient({ course }: ViewCourseClientProps) {
  const [activeSection, setActiveSection] = useState('Overview');
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Check screen size and adjust active section accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const wasDesktop = isDesktop;
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      // Only auto-switch when actually changing screen sizes, not on manual section selection
      if (wasDesktop !== desktop) {
        // If switching to desktop and currently on Overview, switch to Description
        if (desktop && activeSection === 'Overview') {
          setActiveSection('Description');
        }
        // If switching to mobile/tablet and currently on Description, switch to Overview
        else if (!desktop && activeSection === 'Description') {
          setActiveSection('Overview');
        }
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isDesktop, activeSection]);

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = isDesktop 
        ? ['Description', 'Curriculum', 'Materials', 'Announcements']
        : ['Overview', 'Description', 'Curriculum', 'Materials', 'Announcements'];
      const headerOffset = 150; // Account for sticky header and navigation
      
      for (const section of sections) {
        const sectionId = section.toLowerCase().replace(/\s+/g, '-');
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerOffset && rect.bottom > headerOffset) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDesktop]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Scroll to the corresponding section
    const sectionId = section.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120; // Account for sticky header and navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  

  // Helper function to format last updated date
  const formatLastUpdated = (updatedAt: string | null | undefined): string => {
    if (!updatedAt) return 'Not updated';
    
    try {
      const date = new Date(updatedAt);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to format price
  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'Free';
    if (price === 0) return 'Free';
    
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const thumbnailImageUrl = getImageUrl(course.thumbnail);
  const altText = course.thumbnail?.alt || `${course.title} thumbnail`;

  return (
    <div className="min-h-screen bg-white">


      {/* Breadcrumb Navigation */}
      <div className="w-full px-[10px] md:px-[15px] pt-4 pb-4">
        <nav className="flex items-center space-x-3 text-sm">
          {(Link as any)({
            href: "/",
            className: "text-gray-600 hover:text-[#201a7c] transition-all duration-200 font-medium",
            children: "Home"
          })}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium">
            View Course
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#201a7c] font-semibold truncate max-w-xs">{course.title}</span>
        </nav>
      </div>

      {/* Course Header - Full Width Dark Section */}
      <div 
        className="w-full text-white relative overflow-hidden"
        style={{
          background: '#201a7c'
        }}
      >
        {/* Maritime Background Pattern */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 200"><defs><pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 Q25,0 50,10 T100,10" stroke="%23ffffff" stroke-width="1" fill="none" opacity="0.3"/></pattern></defs><rect width="1200" height="200" fill="url(%23waves)"/><g opacity="0.4"><circle cx="150" cy="40" r="1.5" fill="%23ffffff"/><circle cx="350" cy="60" r="1" fill="%23ffffff"/><circle cx="550" cy="35" r="1.5" fill="%23ffffff"/><circle cx="750" cy="55" r="1" fill="%23ffffff"/><circle cx="950" cy="45" r="1.5" fill="%23ffffff"/></g><g opacity="0.6"><path d="M50,80 L70,85 L90,80 L110,85 L130,80" stroke="%23ffffff" stroke-width="1.5" fill="none"/><path d="M200,90 L220,95 L240,90 L260,95 L280,90" stroke="%23ffffff" stroke-width="1.5" fill="none"/><path d="M400,75 L420,80 L440,75 L460,80 L480,75" stroke="%23ffffff" stroke-width="1.5" fill="none"/></g><g opacity="0.3"><polygon points="100,120 110,110 120,120 110,130" fill="%23ffffff"/><polygon points="300,130 310,120 320,130 310,140" fill="%23ffffff"/><polygon points="500,115 510,105 520,115 510,125" fill="%23ffffff"/><polygon points="700,125 710,115 720,125 710,135" fill="%23ffffff"/><polygon points="900,110 910,100 920,110 910,120" fill="%23ffffff"/></g><path d="M0,160 Q200,140 400,160 T800,160 Q1000,140 1200,160 L1200,200 L0,200 Z" fill="%23ffffff" opacity="0.1"/></svg>')`
          }}
        />
        <div className="relative z-10 max-w-7xl px-2.5 md:px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Content */}
            <div className="flex-1">
              {/* Course Title */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>
              
              {/* Course Description */}
              {course.excerpt && (
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {course.excerpt}
                </p>
              )}
              
              {/* Author Information */}
              {course.instructor && course.instructor.user && (
                <div className="flex items-center space-x-3 mb-6">
                  <AuthorAvatar user={course.instructor.user} />
                  <div>
                    <p className="text-white font-medium">
                      A course by {course.instructor.user.firstName} {course.instructor.user.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {course.instructor.specialization}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Course Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-300">
             <span>Last Updated: {formatLastUpdated(course.updatedAt)}</span>
           </div>
            </div>
          </div>
        </div>
      </div>
      


      
      {/* Course Content Sections - Two Column Layout */}
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full lg:pr-5">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - Left Column */}
            <div className="flex-1 lg:flex-[1_1_0%] min-w-0">
              {/* Course Navigation Carousel - Sticky positioned below header */}
              <div className="sticky top-[45px] lg:top-16 z-40 mb-8">
                <CourseNavigationCarousel 
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>
              
              {/* Overview Section - Hidden on desktop */}
              <div id="overview" className="lg:hidden bg-white rounded-lg shadow-sm px-2.5 pt-2.5 pb-8 mb-8">
                {/* Mobile/Tablet Course Card - Only visible on smaller screens */}
                {thumbnailImageUrl && (
                  <div className="lg:hidden">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                      {/* @ts-ignore */}
                      <Image
                        src={thumbnailImageUrl}
                        alt={altText}
                        width={320}
                        height={180}
                        className="w-full h-45 object-cover"
                      />
                      
                      {/* Price and Action */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-red-500 text-sm line-through">{formatPrice(course.price)}</span>
                            <div className="text-2xl font-bold text-gray-900">{formatPrice(course.discountedPrice)}</div>
                          </div>
                          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded" style={{backgroundColor: '#f5f5f5', color: '#333'}}>
                            {course.category?.name || 'General'}
                          </span>
                        </div>
                        
                        <button className="w-full bg-white hover:bg-[#201a7c] text-[#201a7c] hover:text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors border border-[#201a7c]">
                          ▶ Start Learning
                        </button>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>100% positive reviews</div>
                          <div>0 student</div>
                          <div>1 lesson</div>
                          <div>Language: English</div>
                          <div>0 quiz</div>
                          <div>Assessments: Yes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description Section */}
              <div id="description" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Course Description</h2>
                {course.excerpt && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{course.excerpt}</p>
                  </div>
                )}
              </div>
              
              {/* Additional content sections can be added here */}
              <div id="curriculum" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
                <p className="text-gray-700">Course curriculum content will be displayed here.</p>
              </div>
              

              <div id="materials" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Materials</h2>
                <p className="text-gray-700">Course materials and resources will be displayed here.</p>
              </div>
              
              <div id="announcements" className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 className="text-xl font-semibold mb-4">Announcements</h2>
                <p className="text-gray-700">Course announcements and updates will be displayed here.</p>
              </div>
            </div>
            
            {/* Sticky Sidebar - Right Column - Hidden on mobile/tablet */}
            <div className="hidden lg:block lg:flex-[0_0_320px] lg:max-w-[320px]">
              <div className="sticky top-20 -mt-55">
                {thumbnailImageUrl && (
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
                    {/* @ts-ignore */}
                    <Image
                      src={thumbnailImageUrl}
                      alt={altText}
                      width={320}
                      height={180}
                      className="w-full h-45 object-cover"
                    />
                    
                    {/* Price and Action */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-red-500 text-sm line-through">{formatPrice(course.price)}</span>
                          <div className="text-2xl font-bold text-gray-900">{formatPrice(course.discountedPrice)}</div>
                        </div>
                        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded" style={{backgroundColor: '#f5f5f5', color: '#333'}}>
                          {course.category?.name || 'General'}
                        </span>
                      </div>
                      
                      <button className="w-full bg-white hover:bg-[#201a7c] text-[#201a7c] hover:text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors border border-[#201a7c]">
                        ▶ Start Learning
                      </button>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>100% positive reviews</div>
                        <div>0 student</div>
                        <div>1 lesson</div>
                        <div>Language: English</div>
                        <div>0 quiz</div>
                        <div>Assessments: Yes</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
