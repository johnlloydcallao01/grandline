import React from 'react';

/**
 * Base Skeleton component for loading states
 */
export function Skeleton({ 
  className = '', 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Video Card Skeleton - matches VideoCard structure
 */
export function VideoCardSkeleton() {
  return (
    <div className="group">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3 animate-pulse">
        <div className="absolute bottom-2 right-2 bg-gray-300 rounded w-12 h-4"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex space-x-3">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        {/* Text content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title skeleton - 2 lines */}
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          
          {/* Channel name skeleton */}
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          
          {/* Views and time skeleton */}
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Category Circle Skeleton
 */
export function CategoryCircleSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2 flex-shrink-0">
      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
    </div>
  );
}

/**
 * Short Video Card Skeleton - for shorts page
 */
export function ShortCardSkeleton() {
  return (
    <div className="group">
      {/* Vertical thumbnail skeleton */}
      <div className="relative aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden mb-2 animate-pulse">
        <div className="absolute bottom-2 right-2 bg-gray-300 rounded w-10 h-3"></div>
      </div>
      
      {/* Title skeleton */}
      <div className="space-y-1">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
      
      {/* Views skeleton */}
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1 animate-pulse"></div>
    </div>
  );
}

/**
 * List Item Skeleton - for various list layouts
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      {/* Icon/Avatar skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </div>
      
      {/* Action skeleton */}
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
    </div>
  );
}

/**
 * Card Skeleton - for dashboard cards, stats, etc.
 */
export function CardSkeleton({ 
  className = "p-6" 
}: { 
  className?: string 
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Main content skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
  );
}
