'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // States for Enroll New Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | number | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  // Fetch available courses when modal opens
  useEffect(() => {
    if (isEnrollModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (isEnrollModalOpen && availableCourses.length === 0) {
      async function fetchCourses() {
        setLoadingCourses(true);
        try {
          // Use the Next.js API route proxy which handles the PAYLOAD_API_KEY automatically
          const res = await fetch(`/api/courses?limit=100`);
          if (res.ok) {
            const data = await res.json();
            setAvailableCourses(data.docs || []);
          }
        } catch (error) {
          console.error('Error fetching available courses:', error);
        } finally {
          setLoadingCourses(false);
        }
      }
      fetchCourses();
    }
  }, [isEnrollModalOpen, availableCourses.length]);

  const handleRequestEnrollment = async (courseId: string | number) => {
    try {
      setEnrollingCourseId(courseId);
      setIsSubmitting(true);
      const user = await getCurrentUser();
      if (!user) return;

      const token = localStorage.getItem('grandline_auth_token_trainee');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `users JWT ${token}`;

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');
      const res = await fetch(`${baseUrl}/api/lms/enrollment-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: user.id, courseId })
      });

      if (res.ok) {
        setFeedbackModal({ isOpen: true, type: 'success', title: 'Enrollment Request Sent', message: 'We have received your request. Our team will review it and contact you shortly via email.' });

        // Refresh enrollments list silently in background
        const enrollRes = await fetch(`${baseUrl}/api/lms/enrollments?userId=${user.id}&limit=100`, { cache: 'no-store' });
        if (enrollRes.ok) {
          const data = await enrollRes.json();
          setEnrollments(data.docs || []);
        }
      } else {
        setFeedbackModal({ isOpen: true, type: 'error', title: 'Request Failed', message: 'We couldn\'t process your request at this time. Please try again later.' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackModal({ isOpen: true, type: 'error', title: 'An Error Occurred', message: 'Something went wrong. Please check your internet connection.' });
    } finally {
      setIsSubmitting(false);
      setEnrollingCourseId(null);
    }
  };

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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <i className="fa fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap"
              >
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

      {/* Available Courses Modal */}
      {mounted && isEnrollModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-white md:bg-black/50 flex flex-col md:items-start md:justify-center md:p-6 md:pt-12 overflow-hidden" style={{ margin: 0 }}>
          <div className="bg-white w-full h-full flex flex-col md:h-auto md:max-h-[85vh] md:rounded-xl md:max-w-4xl md:shadow-2xl overflow-hidden md:mx-auto">
            <div className="p-3 md:px-6 md:py-4 flex items-center gap-2 md:gap-4 border-b border-gray-200 shrink-0">
              {/* Mobile Back Button */}
              <button onClick={() => setIsEnrollModalOpen(false)} className="md:hidden w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center shrink-0">
                <i className="fa fa-arrow-left"></i>
              </button>

              {/* Desktop Title */}
              <h2 className="hidden md:block text-xl font-bold text-gray-900">Available Courses</h2>

              <div className="relative flex-1 md:w-64 md:flex-none md:ml-auto">
                <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] text-sm"
                />
                {modalSearchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModalSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                )}
              </div>

              {/* Desktop Close Button */}
              <button onClick={() => setIsEnrollModalOpen(false)} className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0 ml-2">
                <i className="fa fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loadingCourses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col animate-pulse">
                      <div className="h-32 bg-gray-200 w-full"></div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="mt-auto pt-4">
                          <div className="h-9 bg-gray-200 rounded-lg w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableCourses.filter(c => c.title?.toLowerCase().includes(modalSearchQuery.toLowerCase())).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fa fa-search text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                  <p className="text-gray-500 max-w-sm mt-1">
                    We couldn't find any courses matching "{modalSearchQuery}".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCourses.filter(c => c.title?.toLowerCase().includes(modalSearchQuery.toLowerCase())).map(course => {
                    const isEnrolled = enrollments.some(e => e.course?.id === course.id);
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

                    return (
                      <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                        <div className="h-32 bg-gray-200 relative">
                          <img src={imageUrl} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                          <p className="text-xs text-gray-500 mb-4 capitalize">{course.difficultyLevel || 'Standard'}</p>
                          <div className="mt-auto">
                            {isEnrolled ? (
                              <button disabled className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                                Already Enrolled
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRequestEnrollment(course.id)}
                                disabled={isSubmitting && enrollingCourseId === course.id}
                                className="w-full py-2 bg-[#201a7c] hover:bg-[#1a1563] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                              >
                                {enrollingCourseId === course.id ? 'Requesting...' : 'Request Enrollment'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Feedback Modal */}
      {mounted && feedbackModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feedbackModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {feedbackModal.type === 'success' ? (
                <i className="fa fa-check text-2xl"></i>
              ) : (
                <i className="fa fa-times text-2xl"></i>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feedbackModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
