'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const CATEGORIES = ['All', 'Active', 'Passed', 'Failed', 'Pending', 'Suspended', 'Dropped', 'Expired'];

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Default to the tab in URL if valid, otherwise 'All'
  const initialCategory = CATEGORIES.includes(tabFromUrl || '') ? tabFromUrl! : 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state when URL changes (e.g. user hits back button)
  useEffect(() => {
    if (tabFromUrl && CATEGORIES.includes(tabFromUrl)) {
      setActiveCategory(tabFromUrl);
    } else if (!tabFromUrl) {
      setActiveCategory('All');
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      router.push('/portal/courses');
    } else {
      router.push(`/portal/courses?tab=${category}`);
    }
  };

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');
        // Disable cache to ensure fresh progressPercentage is fetched
        const response = await fetch(`${baseUrl}/api/lms/enrollments?userId=${user.id}&limit=100`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setEnrollments(data.docs || []);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(enrollment => {
    // Filter by Category Tab
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Active' && enrollment.status === 'active') ||
      (activeCategory === 'Passed' && enrollment.status === 'completed' && enrollment.finalEvaluation === 'passed') ||
      (activeCategory === 'Failed' && enrollment.status === 'completed' && enrollment.finalEvaluation === 'failed') ||
      (activeCategory === 'Pending' && enrollment.status === 'pending') ||
      (activeCategory === 'Suspended' && enrollment.status === 'suspended') ||
      (activeCategory === 'Dropped' && enrollment.status === 'dropped') ||
      (activeCategory === 'Expired' && enrollment.status === 'expired');

    // Filter by Search Query
    const courseTitle = enrollment.course?.title || '';
    const matchesSearch = courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

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
              <Link href={"/courses" as any} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
                <i className="fa fa-plus"></i>
                <span>Enroll New</span>
              </Link>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-6 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleTabChange(category)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${activeCategory === category
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                {/* Course Image Skeleton */}
                <div className="h-48 bg-gray-200 w-full"></div>

                {/* Course Content Skeleton */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4 mt-2"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4"></div>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>

                {/* Action Footer Skeleton */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEnrollments.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;

                const getImageUrl = (media: any) => {
                  if (!media) return 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600';
                  if (media.cloudinaryURL) return media.cloudinaryURL;
                  if (media.url) {
                    if (media.url.startsWith('http')) return media.url;
                    return `${(process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '')}${media.url}`;
                  }
                  return 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600';
                };

                const imageUrl = getImageUrl(course.thumbnail);

                const instructorName = course.instructor?.user?.firstName
                  ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
                  : 'Instructor';

                const calculatedProgress = enrollment.progressPercentage || 0;

                return (
                  <div key={enrollment.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                    {/* Course Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 capitalize">
                        {course.difficultyLevel || 'Standard'}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full capitalize">
                          {enrollment.status}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                          <span className="text-gray-600">{calculatedProgress}%</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        {course.instructor?.user?.profilePicture ? (
                          <img
                            src={getImageUrl(course.instructor.user.profilePicture)}
                            alt={instructorName}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                            {instructorName.charAt(0)}
                          </div>
                        )}
                        <span className="truncate">{instructorName}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculatedProgress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-1">
                          <i className="fa fa-clock"></i>
                          <span>{course.estimatedDuration ? `${course.estimatedDuration} ${course.estimatedDurationUnit || 'Hours'}` : 'Self-paced'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 capitalize">
                        {enrollment.status === 'completed' && enrollment.finalEvaluation === 'passed' ? 'Passed' : (enrollment.status === 'completed' && enrollment.finalEvaluation === 'failed' ? 'Failed' : (enrollment.status === 'completed' ? 'Completed' : enrollment.status))}
                      </span>
                      <Link
                        href={`/portal/courses/${course.id}/player` as any}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {enrollment.status === 'completed' || enrollment.status === 'expired' || enrollment.status === 'dropped' || enrollment.status === 'suspended' ? 'Review Course →' : 'Continue Learning →'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEnrollments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa fa-search text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  We couldn't find any courses matching your criteria.
                </p>
                <button
                  onClick={() => { handleTabChange('All'); setSearchQuery(''); }}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
