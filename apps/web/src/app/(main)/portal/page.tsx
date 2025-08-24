'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * LMS Portal Page - Professional Learning Management System
 * Mobile-optimized design with maritime training focus
 * Shows logged-out state with promotional content and sign-in options
 */

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    title: 'STCW Basic Safety Training',
    description: 'Essential safety training for all seafarers',
    progress: 75,
    duration: '40 hours',
    instructor: 'Capt. John Smith',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
    status: 'in-progress',
    modules: 12,
    completedModules: 9,
    certificate: 'IMO Certified',
    difficulty: 'Beginner',
    rating: 4.8,
    students: 1250
  },
  {
    id: 2,
    title: 'Advanced Bridge Management',
    description: 'Leadership and navigation skills for bridge officers',
    progress: 30,
    duration: '60 hours',
    instructor: 'Capt. Maria Rodriguez',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    status: 'in-progress',
    modules: 15,
    completedModules: 4,
    certificate: 'IMO Certified',
    difficulty: 'Advanced',
    rating: 4.9,
    students: 850
  },
  {
    id: 3,
    title: 'Maritime Security Awareness',
    description: 'ISPS Code compliance and security procedures',
    progress: 100,
    duration: '24 hours',
    instructor: 'Chief Officer Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    status: 'completed',
    modules: 8,
    completedModules: 8,
    certificate: 'IMO Certified',
    difficulty: 'Intermediate',
    rating: 4.7,
    students: 2100
  },
  {
    id: 4,
    title: 'Engine Room Operations',
    description: 'Comprehensive engine maintenance and operations',
    progress: 0,
    duration: '80 hours',
    instructor: 'Chief Engineer Mike Thompson',
    thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop',
    status: 'not-started',
    modules: 20,
    completedModules: 0,
    certificate: 'IMO Certified',
    difficulty: 'Advanced',
    rating: 4.6,
    students: 950
  }
];

// Mock user data
const mockUser = {
  name: 'Alex Maritime',
  rank: 'Third Officer',
  company: 'Global Shipping Ltd.',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  totalCourses: 12,
  completedCourses: 8,
  certificatesEarned: 6,
  studyHours: 240
};

// Mock announcements
const mockAnnouncements = [
  {
    id: 1,
    title: 'New STCW 2024 Regulations',
    content: 'Updated training requirements now available',
    date: '2024-01-15',
    type: 'important'
  },
  {
    id: 2,
    title: 'System Maintenance',
    content: 'Scheduled maintenance on Jan 20, 2024',
    date: '2024-01-10',
    type: 'info'
  }
];

export default function PortalPage() {
  const router = useRouter();
  // For now, we'll show logged-out state
  const isLoggedIn = false;

  const handleSignInClick = () => {
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-[#201a7c] to-[#ab3b43] text-white">
        <div className="px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <i className="fa fa-graduation-cap text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold mb-2">Maritime Learning Portal</h1>
            <p className="text-blue-100 text-sm">
              Professional maritime training and certification platform
            </p>
          </div>
        </div>
      </div>

      {/* Sign In Section - Priority placement */}
      <div className="px-4 mt-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#201a7c]/10 rounded-full flex items-center justify-center">
            <i className="fa fa-user-graduate text-[#201a7c] text-2xl"></i>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Ready to Start Learning?</h3>
          <p className="text-gray-600 text-sm mb-6">
            Join thousands of maritime professionals advancing their careers through our certified training programs.
          </p>

          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">Already have an account?</p>
            <button
              onClick={handleSignInClick}
              className="w-full bg-[#201a7c] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#1a1569] transition-colors duration-200 shadow-lg"
            >
              Sign In / Sign Up
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              New to our platform? Create an account to access all courses and track your progress.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fa fa-chart-line text-blue-600 text-lg"></i>
            </div>
            <div className="text-sm font-medium text-gray-900">Track Progress</div>
            <div className="text-xs text-gray-600 mt-1">Monitor your learning journey</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa fa-certificate text-green-600 text-lg"></i>
            </div>
            <div className="text-sm font-medium text-gray-900">Earn Certificates</div>
            <div className="text-xs text-gray-600 mt-1">IMO certified courses</div>
          </div>
        </div>
      </div>

      {/* What You Can Do Section */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">What You Can Do</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa fa-book text-blue-600 text-sm"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Access Premium Courses</h4>
                <p className="text-gray-600 text-xs">STCW, Bridge Management, Engine Operations & more</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa fa-trophy text-green-600 text-sm"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Earn IMO Certificates</h4>
                <p className="text-gray-600 text-xs">Industry-recognized certifications for career advancement</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa fa-users text-purple-600 text-sm"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Learn from Experts</h4>
                <p className="text-gray-600 text-xs">Experienced captains and chief officers as instructors</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa fa-mobile-alt text-orange-600 text-sm"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Study Anywhere</h4>
                <p className="text-gray-600 text-xs">Mobile-optimized platform for learning on the go</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses Preview */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Popular Courses</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fa fa-life-ring text-blue-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">STCW Basic Safety Training</h4>
                <p className="text-gray-600 text-xs">Essential safety training for all seafarers</p>
                <div className="flex items-center mt-1">
                  <i className="fa fa-star text-yellow-400 text-xs mr-1"></i>
                  <span className="text-xs text-gray-500">4.8 • 1,250 students</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa fa-ship text-green-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">Advanced Bridge Management</h4>
                <p className="text-gray-600 text-xs">Leadership skills for bridge officers</p>
                <div className="flex items-center mt-1">
                  <i className="fa fa-star text-yellow-400 text-xs mr-1"></i>
                  <span className="text-xs text-gray-500">4.9 • 850 students</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa fa-shield-alt text-purple-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">Maritime Security Awareness</h4>
                <p className="text-gray-600 text-xs">ISPS Code compliance training</p>
                <div className="flex items-center mt-1">
                  <i className="fa fa-star text-yellow-400 text-xs mr-1"></i>
                  <span className="text-xs text-gray-500">4.7 • 2,100 students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing for mobile footer */}
      <div className="pb-20"></div>
    </div>
  );
}
