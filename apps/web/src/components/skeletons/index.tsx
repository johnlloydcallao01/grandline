import React from 'react';
import {
  CategoryCircleSkeleton,
  ListItemSkeleton,
  CardSkeleton,
  TableRowSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/Skeleton';

/**
 * Home Page Skeleton - Category carousel + Courses grid
 */
export function HomePageSkeleton() {
  return (
    <>
      {/* Category Carousel Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-2.5 py-4">
          <div className="flex space-x-6 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <CategoryCircleSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    </>
  );
}





/**
 * Dashboard/Analytics Page Skeleton
 */
export function DashboardPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <PageHeaderSkeleton />
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Table Section Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 5 }).map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 6 }).map((_, index) => (
                <TableRowSkeleton key={index} columns={5} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Course Player Skeleton
 * Full page skeleton including header, sidebar, and main content area
 */
export function CoursePlayerSkeleton() {
  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f7] flex flex-col">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="h-14 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 w-1/3">
             {/* Back Button */}
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              {/* Course Title */}
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              {/* Lesson Title */}
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Right Side Stats (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex flex-col items-end gap-1 w-40">
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gray-200 animate-pulse w-1/3"></div>
              </div>
            </div>
             {/* Status Badge */}
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
           {/* Mobile Menu Button */}
           <div className="lg:hidden w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar Skeleton (Desktop) */}
        <aside className="hidden lg:flex w-96 shrink-0 bg-white shadow-sm h-full flex-col border-r border-gray-200">
          <div className="p-4 border-b border-gray-100">
             <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mb-2"></div>
             <div className="space-y-3 mt-4">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                       <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    {i === 1 && (
                      <div className="pl-4 space-y-3 mt-2 border-l-2 border-gray-100">
                         <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                         <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                         <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col bg-[#f5f5f7] min-w-0 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
             <div className="max-w-4xl mx-auto space-y-8">
                {/* Content Header */}
                <div className="flex items-start justify-between gap-6">
                   <div className="space-y-4 w-2/3">
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                   </div>
                   {/* Action Buttons */}
                   <div className="hidden md:flex gap-3">
                      <div className="h-9 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-9 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                   </div>
                </div>

                {/* Content Body */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 space-y-6">
                   {/* Text paragraphs */}
                   <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                   </div>
                   
                   {/* Media Placeholder */}
                   <div className="w-full aspect-video bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                   </div>

                   <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-11/12 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                   </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * List Page Skeleton - for tasks, team, projects, etc.
 */
export function ListPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <PageHeaderSkeleton />
      
      {/* Action Bar Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-28 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* List Items Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {Array.from({ length: 8 }).map((_, index) => (
          <ListItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * Calendar Page Skeleton
 */
export function CalendarPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <PageHeaderSkeleton />
      
      {/* Calendar Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Days header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="p-4 text-center">
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        {Array.from({ length: 5 }).map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className="p-4 h-24 border-r border-gray-200 last:border-r-0">
                <div className="h-4 bg-gray-200 rounded w-6 animate-pulse mb-2"></div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
