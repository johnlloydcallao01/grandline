'use client';

import React, { useState } from 'react';
import Image from '@/components/ui/ImageWrapper';

/**
 * Professional Courses Page - Coursera-style design
 * Mobile-optimized with comprehensive maritime training courses
 */

// Mock course data
const mockCourses = [
  {
    id: 1,
    title: 'STCW Basic Safety Training',
    instructor: 'Capt. John Smith',
    institution: 'IMO Certified',
    rating: 4.8,
    students: 12450,
    duration: '40 hours',
    level: 'Beginner',
    price: 299,
    originalPrice: 399,
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
    description: 'Essential safety training covering personal survival, fire prevention, elementary first aid, and personal safety.',
    skills: ['Personal Survival Techniques', 'Fire Prevention', 'Elementary First Aid', 'Personal Safety'],
    category: 'Safety',
    bestseller: true
  },
  {
    id: 2,
    title: 'Advanced Bridge Management',
    instructor: 'Capt. Maria Rodriguez',
    institution: 'Maritime Academy',
    rating: 4.9,
    students: 8750,
    duration: '60 hours',
    level: 'Advanced',
    price: 599,
    originalPrice: 799,
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    description: 'Comprehensive bridge management training for senior officers and future captains.',
    skills: ['Navigation Systems', 'Team Management', 'Emergency Procedures', 'Communication'],
    category: 'Navigation',
    bestseller: false
  },
  {
    id: 3,
    title: 'Maritime Security Awareness',
    instructor: 'Chief Officer Sarah Johnson',
    institution: 'ISPS Certified',
    rating: 4.7,
    students: 15200,
    duration: '24 hours',
    level: 'Intermediate',
    price: 199,
    originalPrice: 299,
    thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop',
    description: 'ISPS Code compliance training covering maritime security threats and countermeasures.',
    skills: ['Security Assessment', 'Threat Recognition', 'Emergency Response', 'ISPS Compliance'],
    category: 'Security',
    bestseller: true
  },
  {
    id: 4,
    title: 'Engine Room Operations',
    instructor: 'Chief Engineer Mike Thompson',
    institution: 'Marine Engineering Institute',
    rating: 4.6,
    students: 6890,
    duration: '80 hours',
    level: 'Advanced',
    price: 799,
    originalPrice: 999,
    thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop',
    description: 'Comprehensive engine room operations and maintenance for marine engineers.',
    skills: ['Engine Maintenance', 'Troubleshooting', 'Safety Procedures', 'Performance Optimization'],
    category: 'Engineering',
    bestseller: false
  },
  {
    id: 5,
    title: 'Cargo Handling & Stowage',
    instructor: 'Capt. David Wilson',
    institution: 'Cargo Operations Academy',
    rating: 4.5,
    students: 9340,
    duration: '45 hours',
    level: 'Intermediate',
    price: 399,
    originalPrice: 499,
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop',
    description: 'Professional cargo handling techniques and stowage planning for deck officers.',
    skills: ['Cargo Planning', 'Load Calculations', 'Safety Procedures', 'Documentation'],
    category: 'Operations',
    bestseller: false
  },
  {
    id: 6,
    title: 'Maritime Law & Regulations',
    instructor: 'Prof. Emily Chen',
    institution: 'Maritime Law Institute',
    rating: 4.4,
    students: 5670,
    duration: '35 hours',
    level: 'Intermediate',
    price: 349,
    originalPrice: 449,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop',
    description: 'Essential maritime law covering international conventions and regulations.',
    skills: ['MARPOL Convention', 'SOLAS Requirements', 'Flag State Law', 'Port State Control'],
    category: 'Legal',
    bestseller: false
  }
];

const categories = ['All', 'Safety', 'Navigation', 'Security', 'Engineering', 'Operations', 'Legal'];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = mockCourses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filters */}
      <div className="px-4 pt-8 pb-6 bg-white border-b border-gray-200">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600 text-sm">Discover professional maritime training programs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
            />
            <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#201a7c] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* Results Count */}
      <div className="px-4 py-3 bg-gray-50">
        <p className="text-sm text-gray-600">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Courses Grid */}
      <div className="px-4 py-6">
        <div className="space-y-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="md:flex">
                {/* Course Image */}
                <div className="md:w-1/3 relative">
                  <div className="relative h-48 md:h-full">
                    {/* @ts-ignore */}
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    {course.bestseller && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Bestseller
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <div className="md:w-2/3 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-[#201a7c]">${course.price}</div>
                      <div className="text-sm text-gray-500 line-through">${course.originalPrice}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="font-medium">{course.instructor}</span>
                    <span className="mx-2">•</span>
                    <span>{course.institution}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <i className="fa fa-star text-yellow-400 mr-1"></i>
                        <span className="font-medium">{course.rating}</span>
                        <span className="ml-1">({course.students.toLocaleString()})</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fa fa-clock mr-1"></i>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {course.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{course.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-[#201a7c] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1a1569] transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacing for mobile footer */}
      <div className="pb-20"></div>
    </div>
  );
}
