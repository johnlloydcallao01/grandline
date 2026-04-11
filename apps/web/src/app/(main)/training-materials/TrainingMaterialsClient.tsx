'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { FrontendMaterial } from './actions';

interface TrainingMaterialsClientProps {
  initialMaterials: FrontendMaterial[];
}

export default function TrainingMaterialsClient({ initialMaterials }: TrainingMaterialsClientProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fixed categories instead of dynamic ones
  const categories = ['All', 'Courses', 'Lessons'];

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return initialMaterials.filter((m) => {
      let matchesTab = true;
      if (activeTab === 'Courses') {
        matchesTab = !m.isLessonMaterial;
      } else if (activeTab === 'Lessons') {
        matchesTab = m.isLessonMaterial;
      }

      const matchesSearch = 
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.lessonTitle ? m.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) : false);
      
      return matchesTab && matchesSearch;
    });
  }, [initialMaterials, activeTab, searchQuery]);

  const courseMaterials = filteredMaterials.filter(m => !m.isLessonMaterial);
  const lessonMaterials = filteredMaterials.filter(m => m.isLessonMaterial);

  const renderMaterialCard = (item: FrontendMaterial) => (
    <Link 
      href={`/training-materials/${item.id}?type=${item.isLessonMaterial ? 'lesson' : 'course'}` as any}
      key={`${item.isLessonMaterial ? 'lesson' : 'course'}-${item.id}`} 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col group cursor-pointer"
    >
      <div className={`h-32 ${item.image} rounded-t-xl flex items-center justify-center relative group-hover:opacity-90 transition-opacity`}>
        {item.isRequired && (
          <span className="absolute top-3 right-3 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded border border-red-200">
            Required
          </span>
        )}
         {/* Placeholder Icons based on type */}
         {item.type === 'PDF' && (
           <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
           </svg>
         )}
         {item.type === 'Video' && (
           <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
         )}
         {item.type === 'Presentation' && (
           <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
         )}
         {item.type !== 'PDF' && item.type !== 'Video' && item.type !== 'Presentation' && (
           <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
         )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              {item.category}
            </span>
            <h3 className="mt-3 text-base font-semibold text-gray-900 line-clamp-2" title={item.title}>
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{item.courseName}</p>
            {item.lessonTitle && (
              <p className="mt-0.5 text-xs text-indigo-500 font-medium line-clamp-1">Lesson: {item.lessonTitle}</p>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              {item.size}
            </span>
            <span>•</span>
            <span>{item.type}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Added {item.date}</span>
          <span className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
            {item.hasMultipleFiles ? 'View files' : item.type === 'Video' ? 'Watch' : item.href ? 'View' : 'Details'}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Training Materials</h1>
            <p className="mt-1 text-sm text-gray-500">
              Access course supplements, reference guides, and study materials from your enrolled courses.
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto pb-px no-scrollbar">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        {/* Search Bar */}
        <div className="mb-8 max-w-lg">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
              placeholder="Search training materials..."
            />
          </div>
        </div>

        {/* Empty State */}
        {(!initialMaterials || initialMaterials.length === 0) && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
            <p className="mt-1 text-sm text-gray-500">You are not enrolled in any courses with available materials yet.</p>
          </div>
        )}

        {/* Grid Sections */}
        {courseMaterials.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Materials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseMaterials.map(renderMaterialCard)}
            </div>
          </div>
        )}

        {lessonMaterials.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Lesson Materials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessonMaterials.map(renderMaterialCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}