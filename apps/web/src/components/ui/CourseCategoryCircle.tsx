import React from 'react';
import type { CourseCategory } from '@/types/course';

// Component props interface
interface CourseCategoryCircleProps {
  category: CourseCategory;
  active?: boolean;
  onClick?: () => void;
}

/**
 * CourseCategoryCircle component for course category selection with dynamic images
 * 
 * @param category - The category object with name and icon data
 * @param active - Whether the category is currently active/selected
 * @param onClick - Optional click handler
 */
export function CourseCategoryCircle({ 
  category, 
  active = false, 
  onClick 
}: CourseCategoryCircleProps) {
  
  return (
    <div 
      className="flex flex-col items-center space-y-2 cursor-pointer group"
      onClick={onClick}
    >
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden bg-gray-100 relative ${
          active 
            ? 'scale-110 shadow-lg ring-2 ring-gray-300' 
            : 'group-hover:scale-105'
        }`}
      >
        {category.icon && (category.icon.cloudinaryURL || category.icon.url) ? (
          <img
             src={category.icon.cloudinaryURL || category.icon.url || undefined}
             alt={category.icon.alt || category.name}
             className="absolute inset-0 w-full h-full object-cover rounded-full"
           />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-medium">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <span 
        className={`text-xs font-medium transition-colors text-center leading-tight ${
          active 
            ? 'text-gray-900' 
            : 'text-gray-600 group-hover:text-gray-900'
        }`}
        style={{
          width: '64px', // Match the icon width for consistent spacing
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          hyphens: 'auto'
        }}
      >
        {category.name}
      </span>
    </div>
  );
}
