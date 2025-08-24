import React from 'react';
import { 
  VideoCardSkeleton, 
  CategoryCircleSkeleton, 
  ShortCardSkeleton,
  ListItemSkeleton,
  CardSkeleton,
  TableRowSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/Skeleton';

/**
 * Home Page Skeleton - Category carousel + Video grid
 */
export function HomePageSkeleton() {
  return (
    <>
      {/* Category Carousel Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-6 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <CategoryCircleSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Shorts Page Skeleton
 */
export function ShortsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <PageHeaderSkeleton />
      
      {/* Shorts Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, index) => (
          <ShortCardSkeleton key={index} />
        ))}
      </div>

      {/* Featured Categories Skeleton */}
      <div className="mt-12">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} className="p-6 h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Video List Page Skeleton - for watch-later, liked-videos, etc.
 */
export function VideoListPageSkeleton() {
  return (
    <div className="p-6">
      <PageHeaderSkeleton />
      
      {/* Filter/Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Video List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex space-x-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Thumbnail skeleton */}
            <div className="w-40 h-24 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            
            {/* Actions skeleton */}
            <div className="flex flex-col space-y-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
