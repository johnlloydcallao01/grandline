'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import Modular Components
import { StatStrip } from './_components/StatStrip';
import { MyCourseGrid } from './_components/MyCourseGrid';
import { CertificatesShelf } from './_components/CertificatesShelf';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/signin');
          return;
        }
        setUser(currentUser);

        // Use centralized dashboard endpoint - same pattern as /portal/courses
        const dashboardUrl = `${API_BASE_URL}/api/dashboard/trainee-summary?userId=${currentUser.id}`;
        console.log('[Dashboard] Fetching from:', dashboardUrl);

        const response = await fetch(dashboardUrl, { cache: 'no-store' });

        if (response.ok) {
          const dashboardData = await response.json();
          if (dashboardData.success && dashboardData.data) {
            // Filter myCourses to show only ACTIVE courses (matching /portal/courses Active tab)
            const activeCourses = dashboardData.data.myCourses?.filter((c: any) => c.status === 'active') || [];
            setMyCourses(activeCourses);
            setCompletedCourses(dashboardData.data.completedCourses || []);
            setCompletedAssessments(dashboardData.data.completedAssessments || []);
            setAssignments(dashboardData.data.assignments || []);
            setAnnouncements(dashboardData.data.announcements || []);
            setStats(dashboardData.data.stats);
            setCertificates(dashboardData.data.certificates || []);
            setInstructors(dashboardData.data.instructors || []);
          }
        } else {
          console.error('Dashboard endpoint error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-8 h-40 animate-pulse"></div>
        </div>

        {/* Stat Strip Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* 2-Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200 w-full"></div>
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplemental Column */}
          <div className="space-y-8">
            {/* Certificates Shelf Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructors Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-200"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div
          className="rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
          style={{
            background: '#201a7c'
          }}
        >
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome back, {user.firstName || 'Student'}!</h1>
            <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
              {myCourses.length > 0
                ? `You have ${myCourses.length} active courses. Keep up the great work!`
                : "You're not enrolled in any active courses. Browse our catalog to get started!"}
            </p>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Phase 3.3: Stat Strip */}
      <StatStrip stats={stats} />

      {/* Phase 3.1: 2-Column Responsive Grid Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Column (Left/Top) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Phase 3.3: My Courses Grid - Shows ACTIVE courses only */}
          <MyCourseGrid courses={myCourses} />

          {/* Passed Courses Section */}
          {completedCourses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Passed Courses</h2>
                <Link href="/portal/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedCourses.slice(0, 4).map((course: any) => (
                  <Link key={course.id} href={`/portal/courses/${course.courseId}` as any} className="block">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 transition-all group">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.courseTitle}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                          <i className="fa fa-graduation-cap text-green-600 text-xl"></i>
                        </div>
                      )}
                      <div className="ml-4 min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-green-600 transition-colors">{course.courseTitle}</h3>
                        <p className="text-xs text-gray-500">{course.courseCode || 'Course'}</p>
                        {course.finalEvaluation && (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${course.finalEvaluation === 'passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {course.finalEvaluation === 'passed' ? 'Passed' : course.finalEvaluation}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {completedCourses.length > 4 && (
                <div className="text-center mt-4">
                  <Link href="/portal/courses" className="text-sm text-gray-500 hover:text-gray-700">
                    + {completedCourses.length - 4} more passed courses
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quizzes & Exams Section */}
          {completedAssessments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Quizzes & Exams</h2>
                <Link href="/portal/quizzes-exams" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {completedAssessments.slice(0, 5).map((assessment: any) => {
                  const assessmentUrl = assessment.assessmentKind === 'final'
                    ? `/portal/courses/${assessment.courseId}/player/assessment/${assessment.assessmentSlug}`
                    : `/portal/courses/${assessment.courseId}/player/module/${assessment.moduleSlug}/assessment/${assessment.assessmentSlug}`;
                  return (
                    <Link key={assessment.id} href={assessmentUrl as any} className="block">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all group">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">{assessment.title}</h3>
                          <p className="text-xs text-gray-500">{assessment.courseTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${assessment.isPassed === true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {assessment.isPassed === true ? 'Passed' : 'Failed'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Score: {assessment.score}/{assessment.passingScore}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${assessment.assessmentKind === 'final' ? 'bg-purple-100 text-purple-700' :
                          assessment.assessmentKind === 'exam' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {assessment.assessmentKind === 'final' ? 'Final' : assessment.assessmentKind || 'Quiz'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {completedAssessments.length > 5 && (
                <div className="text-center mt-4">
                  <Link href="/portal/quizzes-exams" className="text-sm text-gray-500 hover:text-gray-700">
                    + {completedAssessments.length - 5} more assessments
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Supplemental Column (Right/Bottom) */}
        <div className="space-y-8">

          {/* Announcements Section */}
          {announcements.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
                <Link href="/portal/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-2">
                      {announcement.pinned && (
                        <i className="fa fa-thumbtack text-blue-600 mt-1"></i>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{announcement.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {announcements.length > 3 && (
                <div className="text-center mt-4">
                  <Link href="/portal/announcements" className="text-sm text-gray-500 hover:text-gray-700">
                    + {announcements.length - 3} more announcements
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Certificates Shelf */}
          <CertificatesShelf certificates={certificates} />

          {/* Instructors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Instructors</h2>
              <Link href="/portal/instructors" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            {instructors.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden py-2">
                {instructors.slice(0, 5).map((instructor: any) => {
                  const user = instructor.user || {};
                  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Instructor';
                  const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase();
                  const profilePictureUrl = user.profilePictureUrl || null;

                  return (
                    <Link key={instructor.id} href={`/portal/instructors/${instructor.id}`} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden hover:ring-blue-200 transition-colors">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {initials}
                        </div>
                      )}
                    </Link>
                  );
                })}
                {instructors.length > 5 && (
                  <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 text-gray-600 text-xs font-bold">
                    +{instructors.length - 5}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Enroll in a course to connect with instructors.</p>
              </div>
            )}
          </div>

          {/* Assignments Section */}
          {assignments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
                <Link href="/portal/assignments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {assignments
                  .filter((a: any) => a.status === 'submitted' || a.status === 'graded')
                  .slice(0, 5)
                  .map((assignment: any) => {
                    const getStatusBadge = () => {
                      if (assignment.status === 'graded') {
                        const passed = (assignment.score ?? 0) >= assignment.passingScore;
                        return (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        );
                      } else if (assignment.status === 'returned_for_revision') {
                        return (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            Returned
                          </span>
                        );
                      } else if (assignment.status === 'submitted') {
                        return (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            In Review
                          </span>
                        );
                      } else {
                        return (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        );
                      }
                    };

                    const assignmentUrl = `/portal/courses/${assignment.courseId}/player/module/${assignment.moduleSlug}/assignment/${assignment.assignmentSlug}`;

                    return (
                      <Link key={assignment.id} href={assignmentUrl as any} className="block">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge()}
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">{assignment.title}</h3>
                            <p className="text-xs text-gray-500">{assignment.courseTitle}</p>
                            {assignment.dueDate && (
                              <p className="text-xs text-gray-400 mt-1">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {assignment.status === 'graded' && assignment.score !== null && (
                            <div className={`text-xs font-medium px-2 py-1 rounded ${assignment.score >= assignment.passingScore ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {assignment.score}/{assignment.maxScore}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
              </div>
              {assignments.length > 5 && (
                <div className="text-center mt-4">
                  <Link href="/portal/assignments" className="text-sm text-gray-500 hover:text-gray-700">
                    + {assignments.length - 5} more assignments
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}