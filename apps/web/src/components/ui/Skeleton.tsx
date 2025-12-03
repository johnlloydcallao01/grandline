import React from 'react';

/**
 * Base Skeleton component for loading states
 */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}



/**
 * Category Circle Skeleton
 */
export const CategoryCircleSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-2 flex-shrink-0">
      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
    </div>
  );
}



/**
 * List Item Skeleton - for various list layouts
 */
export const ListItemSkeleton: React.FC = () => {
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
export const CardSkeleton: React.FC<{ className?: string }> = ({ 
  className = "p-6" 
}) => {
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
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
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
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
  );
}
