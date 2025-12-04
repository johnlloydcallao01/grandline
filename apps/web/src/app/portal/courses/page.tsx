'use client';

import React, { useState } from 'react';

// Mock data for courses
const COURSES = [
  {
    id: 1,
    title: 'STCW Basic Safety Training',
    category: 'Safety',
    instructor: 'Capt. James Wilson',
    duration: '5 Days',
    level: 'Basic',
    rating: 4.8,
    students: 1240,
    image: 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600',
    progress: 0,
  },
  {
    id: 2,
    title: 'Advanced Fire Fighting',
    category: 'Safety',
    instructor: 'Chief Off. Sarah Chen',
    duration: '4 Days',
    level: 'Advanced',
    rating: 4.9,
    students: 850,
    image: 'https://images.unsplash.com/photo-1552158280-1678c04b5b5e?auto=format&fit=crop&q=80&w=600',
    progress: 0,
  },
  {
    id: 3,
    title: 'ECDIS Generic & Type Specific',
    category: 'Navigation',
    instructor: 'Capt. Robert Johnson',
    duration: '40 Hours',
    level: 'Intermediate',
    rating: 4.7,
    students: 2100,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=600',
    progress: 0,
  },
  {
    id: 4,
    title: 'Marine High Voltage Safety',
    category: 'Engineering',
    instructor: 'Chief Eng. Michael Brown',
    duration: '3 Days',
    level: 'Advanced',
    rating: 4.9,
    students: 560,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600',
    progress: 0,
  },
  {
    id: 5,
    title: 'Maritime English for Officers',
    category: 'Communication',
    instructor: 'Ms. Elena Rodriguez',
    duration: 'Self-paced',
    level: 'Intermediate',
    rating: 4.6,
    students: 3200,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    progress: 0,
  },
  {
    id: 6,
    title: 'Ship Security Officer (SSO)',
    category: 'Security',
    instructor: 'Capt. David Miller',
    duration: '3 Days',
    level: 'Management',
    rating: 4.8,
    students: 980,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
    progress: 0,
  },
];

const CATEGORIES = ['All', 'Safety', 'Navigation', 'Engineering', 'Communication', 'Security'];

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = COURSES.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-[10px] py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="mt-1 text-sm text-gray-500">Manage and access your maritime training content</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <i className="fa fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
                <i className="fa fa-plus"></i>
                <span>Enroll New</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-6 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeCategory === category
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[10px] py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Course Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                  {course.level}
                </div>
              </div>

              {/* Course Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                    <i className="fa fa-star"></i>
                    <span className="text-gray-600">{course.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                    {course.instructor.charAt(0)}
                  </div>
                  <span className="truncate">{course.instructor}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1">
                    <i className="fa fa-clock"></i>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fa fa-users"></i>
                    <span>{course.students}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Not Started</span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Start Learning →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa fa-search text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              We couldn't find any courses matching your search criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={() => {setActiveCategory('All'); setSearchQuery('');}}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
