'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = ['All', 'Active', 'Passed', 'Failed', 'Pending', 'Suspended', 'Dropped', 'Expired'];

type CoursesPageClientProps = {
  initialCategory: string;
  initialEnrollments: any[];
};

export default function CoursesPageClient({
  initialCategory,
  initialEnrollments,
}: CoursesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollments] = useState<any[]>(initialEnrollments);

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (tabFromUrl && CATEGORIES.includes(tabFromUrl)) {
      setActiveCategory(tabFromUrl);
    } else if (!tabFromUrl) {
      setActiveCategory('All');
    }
  }, [tabFromUrl]);

  const handleTabChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      router.push('/portal/courses');
    } else {
      router.push(`/portal/courses?tab=${category}`);
    }
  };

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
          const res = await fetch('/api/courses?limit=100');
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

  const handleRequestEnrollment = (courseId: string | number) => {
    setIsEnrollModalOpen(false);
    setModalSearchQuery('');
    router.push(`/view-course/${courseId}/request-enrollment`);
  };

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesCategory =
        activeCategory === 'All' ||
        (activeCategory === 'Active' && enrollment.status === 'active') ||
        (activeCategory === 'Passed' &&
          enrollment.status === 'completed' &&
          enrollment.finalEvaluation === 'passed') ||
        (activeCategory === 'Failed' &&
          enrollment.status === 'completed' &&
          enrollment.finalEvaluation === 'failed') ||
        (activeCategory === 'Pending' && enrollment.status === 'pending') ||
        (activeCategory === 'Suspended' && enrollment.status === 'suspended') ||
        (activeCategory === 'Dropped' && enrollment.status === 'dropped') ||
        (activeCategory === 'Expired' && enrollment.status === 'expired');

      const courseTitle = enrollment.course?.title || '';
      const matchesSearch = courseTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, enrollments, searchQuery]);

  const getImageUrl = (media: any) => {
    if (!media) {
      return 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600';
    }
    if (media.cloudinaryURL) return media.cloudinaryURL;
    if (media.url) {
      if (media.url.startsWith('http')) return media.url;
      return `${(process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '')}${media.url}`;
    }
    return 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600';
  };

  return (
    <div className="w-full min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--card-background)] border-b border-[var(--card-border)]">
        <div className="w-full px-[10px] py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage and access your maritime training content
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-[var(--background)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <i className="fa fa-search absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm"></i>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap"
              >
                <i className="fa fa-plus"></i>
                <span>Enroll New</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleTabChange(category)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeCategory === category
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEnrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            const imageUrl = getImageUrl(course.thumbnail);
            const instructorName = course.instructor?.user?.firstName
              ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
              : 'Instructor';
            const calculatedProgress =
              typeof enrollment.progressPercentage === 'number'
                ? enrollment.progressPercentage
                : 0;

            return (
              <div
                key={enrollment.id}
                className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {course.difficultyLevel || 'Standard'}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full capitalize border border-transparent dark:border-blue-800">
                      {enrollment.status}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                      <span className="text-gray-600 dark:text-gray-400">{calculatedProgress}%</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {course.instructor?.user?.profilePicture ? (
                      <img
                        src={getImageUrl(course.instructor.user.profilePicture)}
                        alt={instructorName}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {instructorName.charAt(0)}
                      </div>
                    )}
                    <span className="truncate">{instructorName}</span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                      style={{ width: `${calculatedProgress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-[var(--card-border)] pt-4">
                    <div className="flex items-center gap-1">
                      <i className="fa fa-clock"></i>
                      <span>
                        {course.estimatedDuration
                          ? `${course.estimatedDuration} ${course.estimatedDurationUnit || 'Hours'}`
                          : 'Self-paced'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-[var(--card-border)] flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                    {enrollment.status === 'completed' && enrollment.finalEvaluation === 'passed'
                      ? 'Passed'
                      : enrollment.status === 'completed' && enrollment.finalEvaluation === 'failed'
                        ? 'Failed'
                        : enrollment.status === 'completed'
                          ? 'Completed'
                          : enrollment.status}
                  </span>
                  <Link
                    href={`/portal/courses/${course.id}/player` as any}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {enrollment.status === 'completed' ||
                    enrollment.status === 'expired' ||
                    enrollment.status === 'dropped' ||
                    enrollment.status === 'suspended'
                      ? 'Review Course →'
                      : 'Continue Learning →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-[var(--card-border)]">
              <i className="fa fa-search text-gray-400 dark:text-gray-500 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No courses found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              We couldn&apos;t find any courses matching your criteria.
            </p>
            <button
              onClick={() => {
                handleTabChange('All');
                setSearchQuery('');
              }}
              className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {mounted &&
        isEnrollModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-white dark:bg-gray-900 md:bg-black/50 md:dark:bg-black/70 flex flex-col md:items-start md:justify-center md:p-6 md:pt-12 overflow-hidden"
            style={{ margin: 0 }}
          >
            <div className="bg-[var(--background)] w-full h-full flex flex-col md:h-auto md:max-h-[85vh] md:rounded-xl md:max-w-4xl md:shadow-2xl overflow-hidden md:mx-auto border border-transparent md:border-[var(--card-border)]">
              <div className="p-3 md:px-6 md:py-4 flex items-center gap-2 md:gap-4 border-b border-[var(--card-border)] bg-[var(--card-background)] shrink-0">
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="md:hidden w-8 h-8 rounded-full bg-[var(--card-background)] border border-[var(--card-border)] shadow-md flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-300"
                >
                  <i className="fa fa-arrow-left"></i>
                </button>

                <h2 className="hidden md:block text-xl font-bold text-gray-900 dark:text-gray-100">
                  Available Courses
                </h2>

                <div className="relative flex-1 md:w-64 md:flex-none md:ml-auto">
                  <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full h-10 border border-gray-300 dark:border-gray-700 bg-[var(--background)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {modalSearchQuery.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="hidden md:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 shrink-0 ml-2"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--background)]">
                {loadingCourses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="border border-[var(--card-border)] bg-[var(--card-background)] rounded-xl overflow-hidden flex flex-col animate-pulse"
                      >
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 w-full"></div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
                          <div className="mt-auto pt-4">
                            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : availableCourses.filter((course) =>
                    course.title?.toLowerCase().includes(modalSearchQuery.toLowerCase()),
                  ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-[var(--card-background)] border border-[var(--card-border)] rounded-full flex items-center justify-center mb-4">
                      <i className="fa fa-search text-gray-400 dark:text-gray-500 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      No courses found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                      We couldn&apos;t find any courses matching &quot;{modalSearchQuery}&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCourses
                      .filter((course) =>
                        course.title?.toLowerCase().includes(modalSearchQuery.toLowerCase()),
                      )
                      .map((course) => {
                        const isEnrolled = enrollments.some((enrollment) => enrollment.course?.id === course.id);
                        const imageUrl = getImageUrl(course.thumbnail);

                        return (
                          <div
                            key={course.id}
                            className="border border-[var(--card-border)] bg-[var(--card-background)] rounded-xl overflow-hidden flex flex-col"
                          >
                            <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
                              <img src={imageUrl} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                                {course.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 capitalize">
                                {course.difficultyLevel || 'Standard'}
                              </p>
                              <div className="mt-auto">
                                {isEnrolled ? (
                                  <button
                                    disabled
                                    className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                                  >
                                    Already Enrolled
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRequestEnrollment(course.id)}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Request Enrollment
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
          document.body,
        )}
    </div>
  );
}
