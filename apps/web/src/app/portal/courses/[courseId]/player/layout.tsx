'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import type { CourseWithInstructor } from '@/types/course';
import { PlayerItem } from '@/types/player';
import { buildItemKey, slugify } from '@/utils/course-player';
import { CourseCurriculumSidebar } from '@/components/course/CourseCurriculumSidebar';
import { CoursePlayerSkeleton } from '@/components/skeletons';
import { CoursePlayerProvider } from './CoursePlayerContext';

function formatEnrollmentStatus(status: string | null) {
  if (!status) return 'Not enrolled';
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'Active enrollment';
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'pending') return 'Pending approval';
  if (normalized === 'expired') return 'Expired';
  if (normalized === 'suspended') return 'Suspended';
  if (normalized === 'dropped') return 'Dropped';
  return status;
}

export default function CoursePlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params?.courseId)
    ? params.courseId[0]
    : (params?.courseId as string | undefined);

  const [course, setCourse] = useState<CourseWithInstructor | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [submissionHistory, setSubmissionHistory] = useState<Record<string, any[]>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFinishConfirmationOpen, setIsFinishConfirmationOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrevious = () => {
    router.back();
  };

  useEffect(() => {
    if (!courseId) return;

    let active = true;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        let userIdParam: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('grandline_auth_user');
            if (raw) {
              const parsed = JSON.parse(raw) as { id?: string | number } | null;
              const value = parsed && parsed.id;
              if (value !== undefined && value !== null) {
                userIdParam = String(value);
              }
            }
          } catch {
            void 0;
          }
        }

        const searchParams = new URLSearchParams();
        if (userIdParam) {
          searchParams.set('userId', userIdParam);
        }

        const url =
          searchParams.toString().length > 0
            ? `/api/courses/${courseId}?${searchParams.toString()}`
            : `/api/courses/${courseId}`;

        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (!res.ok) {
          if (active) {
            setError('Failed to load course');
            setCourse(null);
            setEnrollmentStatus(null);
          }
          return;
        }

        const data = (await res.json()) as CourseWithInstructor & {
          enrollmentStatus?: string | null;
          completedLessons?: string[];
        };

        if (!active) return;

        setCourse(data);

        // Fetch progress from the new endpoint
        let fetchedProgress = false;
        if (userIdParam) {
          try {
            const progressRes = await fetch(`/api/courses/${courseId}/progress?userId=${userIdParam}`, {
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
            });

            if (progressRes.ok) {
              const progressData = await progressRes.json();
              if (Array.isArray(progressData.completedLessonIds)) {
                setCompletedLessonIds(progressData.completedLessonIds.map(String));
              }
              if (progressData.attemptCounts) {
                setAttemptCounts(progressData.attemptCounts);
              }
              if (progressData.submissionHistory) {
                setSubmissionHistory(progressData.submissionHistory);
              }
              fetchedProgress = true;
            }
          } catch (e) {
            console.error('Failed to fetch progress', e);
          }
        }

        // Fallback to legacy data only if new fetch didn't happen/succeed
        if (!fetchedProgress) {
          if (Array.isArray(data.completedLessons)) {
            setCompletedLessonIds(data.completedLessons.map(String));
          } else {
            setCompletedLessonIds([]);
          }
        }

        const status =
          data && typeof data.enrollmentStatus === 'string'
            ? data.enrollmentStatus
            : null;
        setEnrollmentStatus(status);
      } catch {
        if (active) {
          setError('Network error');
          setCourse(null);
          setEnrollmentStatus(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      active = false;
    };
  }, [courseId]);

  const curriculum = course?.curriculum ?? null;

  const moduleTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!curriculum || !Array.isArray(curriculum.modules)) return map;
    for (const mod of curriculum.modules) {
      map[mod.id] = mod.title;
    }
    return map;
  }, [curriculum]);

  const flatItems: PlayerItem[] = useMemo(() => {
    const items: PlayerItem[] = [];
    if (!curriculum) return items;

    const modules = Array.isArray(curriculum.modules) ? curriculum.modules : [];
    // Modules are already ordered by the relationship order in PayloadCMS
    const sortedModules = modules;

    for (const mod of sortedModules) {
      const modSlug = slugify(mod.title);
      if (Array.isArray(mod.items) && mod.items.length > 0) {
        // Use the new polymorphic items array if available
        for (const item of mod.items) {
          if (typeof item.value === 'string') continue; // Skip unexpanded relationships

          if (item.relationTo === 'course-lessons') {
            const lesson = item.value;
            items.push({
              key: buildItemKey('lesson', lesson.id),
              type: 'lesson',
              id: String(lesson.id),
              moduleId: mod.id,
              title: lesson.title,
              estimatedDurationMinutes: lesson.estimatedDurationMinutes ?? null,
              content: lesson.description,
              slug: slugify(lesson.title),
              moduleSlug: modSlug,
            } as any);
          } else if (item.relationTo === 'assessments') {
            const assessment = item.value;
            const assessmentItems = (assessment as any).items || [];
            const questions = assessmentItems
              .map((i: any) => i.question)
              .filter((q: any) => q && typeof q === 'object');
            const questionsCount = questions.length > 0 ? questions.length : assessmentItems.length;

            items.push({
              key: buildItemKey('assessment', assessment.id),
              type: 'assessment',
              id: String(assessment.id),
              moduleId: mod.id,
              title: assessment.title,
              assessmentKind: assessment.assessmentType === 'exam' ? 'exam' : 'quiz',
              estimatedDurationMinutes: assessment.estimatedDurationMinutes ?? null,
              content: assessment.description,
              slug: slugify(assessment.title),
              moduleSlug: modSlug,
              assessmentDetails: {
                passingScore: assessment.passingScore,
                timeLimitMinutes: assessment.timeLimitMinutes,
                maxAttempts: assessment.maxAttempts,
                questionsCount,
                questions,
                showCorrectAnswer: assessment.showCorrectAnswer,
              }
            } as any);
          }
        }
      }
    }

    if (curriculum.finalExam) {
      const examItems = curriculum.finalExam.questions || [];
      const questions = examItems
        .map((i: any) => i.question)
        .filter((q: any) => q && typeof q === 'object');
      const questionsCount = questions.length > 0 ? questions.length : examItems.length;

      items.push({
        key: buildItemKey('finalExam', curriculum.finalExam.id),
        type: 'finalExam',
        id: String(curriculum.finalExam.id),
        title: curriculum.finalExam.title,
        assessmentKind: 'final',
        estimatedDurationMinutes: curriculum.finalExam.estimatedDurationMinutes ?? null,
        content: curriculum.finalExam.description,
        slug: slugify(curriculum.finalExam.title),
        assessmentDetails: {
          passingScore: curriculum.finalExam.passingScore,
          timeLimitMinutes: curriculum.finalExam.timeLimitMinutes,
          maxAttempts: curriculum.finalExam.maxAttempts,
          questionsCount,
          questions,
          showCorrectAnswer: curriculum.finalExam.showCorrectAnswer,
        }
      } as any);
    }

    return items;
  }, [curriculum]);

  const { totalModules, totalLessons, totalQuizzes, totalExams } = useMemo(() => {
    if (!curriculum || !Array.isArray(curriculum.modules)) {
      return {
        totalModules: 0,
        totalLessons: 0,
        totalQuizzes: 0,
        totalExams: 0,
      };
    }

    let lessonsCount = 0;
    let quizzesCount = 0;
    let examsCount = 0;

    for (const mod of curriculum.modules) {
      if (Array.isArray(mod.items)) {
        for (const item of mod.items) {
          if (typeof item.value === 'string') continue;
          if (item.relationTo === 'course-lessons') {
            lessonsCount += 1;
          } else if (item.relationTo === 'assessments') {
            const a = item.value;
            if (a.assessmentType === 'exam') examsCount += 1;
            else quizzesCount += 1;
          }
        }
      }
    }

    if (curriculum.finalExam) {
      examsCount += 1;
    }

    return {
      totalModules: curriculum.modules.length,
      totalLessons: lessonsCount,
      totalQuizzes: quizzesCount,
      totalExams: examsCount,
    };
  }, [curriculum]);

  const currentItem = useMemo(
    () => (selectedKey ? flatItems.find((item) => item.key === selectedKey) || null : null),
    [flatItems, selectedKey],
  );

  const evaluationMode = course?.evaluationMode;

  const { progressPercent, completedItems, totalItems } = useMemo(() => {
    const currentIndex = currentItem
      ? flatItems.findIndex((item) => item.key === currentItem.key)
      : -1;

    if (evaluationMode === 'lessons') {
      const total = flatItems.filter((i) => i.type === 'lesson').length;
      const completed = flatItems.filter((i) => i.type === 'lesson' && completedLessonIds.includes(i.id)).length;

      return {
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        completedItems: completed,
        totalItems: total,
        progressLabel: 'lessons'
      };
    }

    // Default behavior (count everything)
    const total = flatItems.length;
    const completed = currentIndex >= 0 ? currentIndex + 1 : 0;

    return {
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedItems: completed,
      totalItems: total,
      progressLabel: 'learning items'
    };
  }, [flatItems, currentItem, evaluationMode, completedLessonIds]);

  const toggleLessonCompletion = async (lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    const newCompleted = isCompleted
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(newCompleted);

    try {
      let userIdParam: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('grandline_auth_user');
          if (raw) {
            const parsed = JSON.parse(raw) as { id?: string | number } | null;
            const value = parsed && parsed.id;
            if (value !== undefined && value !== null) {
              userIdParam = String(value);
            }
          }
        } catch {
          void 0;
        }
      }

      if (!userIdParam) return;

      const res = await fetch(`/api/courses/${courseId}/lesson-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          completed: !isCompleted,
          userId: userIdParam
        })
      });

      if (res.ok) {
        // We do not update the state from the server response here to avoid "rubber-banding"
        // or race conditions when the user clicks multiple lessons quickly.
        // The optimistic update above is sufficient for the UI.
        // The server response is only used to confirm the action was successful.
        // const data = await res.json();
        // if (Array.isArray(data.completedLessons)) {
        //   setCompletedLessonIds(data.completedLessons.map(String));
        // }
      }
    } catch (e) {
      console.error('Failed to save completion', e);
      // Revert optimistic update on error
      setCompletedLessonIds(isCompleted ? [...completedLessonIds] : completedLessonIds.filter(id => id !== lessonId));
    }
  };

  const startAssessment = async (assessmentId: string) => {
    try {
      let userIdParam: string | null = null;
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('grandline_auth_user');
        if (raw) {
          const parsed = JSON.parse(raw) as { id?: string | number } | null;
          userIdParam = parsed?.id ? String(parsed.id) : null;
        }
      }

      if (!userIdParam) return null;

      const res = await fetch(`/api/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdParam, courseId })
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Failed to start assessment:', error);
        return null;
      }

      const data = await res.json();

      // If resumed, fetch already saved answers
      if (data.isResumed) {
        const answersRes = await fetch(`/api/assessments/submission/${data.submissionId}/answers`, {
          cache: 'no-store'
        });
        if (answersRes.ok) {
          const answersData = await answersRes.json();
          data.savedAnswers = answersData.answers;
        }
      }

      return data;
    } catch (e) {
      console.error('Failed to start assessment', e);
      return null;
    }
  };

  const saveAssessmentAnswer = async (submissionId: string, questionId: string, response: any, questionType: string) => {
    try {
      await fetch(`/api/assessments/submission/${submissionId}/save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, response, questionType })
      });
    } catch (e) {
      console.error('Failed to save assessment answer', e);
    }
  };

  const submitAssessment = async (submissionId: string, answers?: Record<string, any>) => {
    try {
      const res = await fetch(`/api/assessments/submission/${submissionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Failed to submit assessment:', error);
        return null;
      }

      const result = await res.json();

      // Refresh progress after submission (regardless of pass/fail to update attempt counts)
      let userIdParam: string | null = null;
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('grandline_auth_user');
        if (raw) {
          const parsed = JSON.parse(raw) as { id?: string | number } | null;
          userIdParam = parsed?.id ? String(parsed.id) : null;
        }
      }
      if (userIdParam) {
        const progressRes = await fetch(`/api/courses/${courseId}/progress?userId=${userIdParam}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (Array.isArray(progressData.completedLessonIds)) {
            setCompletedLessonIds(progressData.completedLessonIds.map(String));
          }
          if (progressData.attemptCounts) {
            setAttemptCounts(progressData.attemptCounts);
          }
          if (progressData.submissionHistory) {
            setSubmissionHistory(progressData.submissionHistory);
          }
        }
      }

      return result;
    } catch (e) {
      console.error('Failed to submit assessment', e);
      return null;
    }
  };

  const handleFinishCourse = () => {
    setIsFinishConfirmationOpen(true);
  };

  const confirmFinishCourse = async () => {
    setIsFinishConfirmationOpen(false);
    setIsSuccessModalOpen(true); // Open success modal immediately

    // Optimistic Update: Immediately show as completed
    const previousStatus = enrollmentStatus;
    setEnrollmentStatus('completed');

    // Close mobile menu immediately if open
    setIsMobileMenuOpen(false);

    try {
      let userIdParam: string | null = null;
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('grandline_auth_user');
        if (raw) {
          const parsed = JSON.parse(raw) as { id?: string | number } | null;
          userIdParam = parsed?.id ? String(parsed.id) : null;
        }
      }

      if (!userIdParam) {
        setEnrollmentStatus(previousStatus); // Revert on auth error
        return;
      }

      const res = await fetch(`/api/courses/${courseId}/finish-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdParam })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Revert on API failure
        setEnrollmentStatus(previousStatus);
        console.error(data.error || 'Failed to finish course.');
        // Optional: show toast/notification for error only
      }
    } catch (e) {
      // Revert on network error
      setEnrollmentStatus(previousStatus);
      console.error('Failed to finish course', e);
    }
  };

  const showFinishButton = useMemo(() => {
    if (enrollmentStatus === 'completed') return false; // Hide if already done
    if (evaluationMode !== 'lessons') return false;
    if (enrollmentStatus !== 'active') return false;

    // Check if 100% completed
    return progressPercent === 100;
  }, [evaluationMode, enrollmentStatus, progressPercent]);

  const handleToggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    );
  };

  const handleSelectItem = (item: PlayerItem) => {
    let url = `/portal/courses/${courseId}/player`;

    const i = item as any;

    if (item.type === 'lesson') {
      url += `/module/${i.moduleSlug}/lesson/${i.slug}`;
    } else if (item.type === 'assessment') {
      url += `/module/${i.moduleSlug}/assessment/${i.slug}`;
    } else if (item.type === 'finalExam') {
      url += `/assessment/${i.slug}`;
    }

    if (url !== `/portal/courses/${courseId}/player`) {
      setSelectedKey(item.key); // Optimistic update
      router.push(url as any);
    } else {
      setSelectedKey(item.key);
    }
  };

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600 text-sm">
          Course not found.
        </div>
      </div>
    );
  }

  if (loading) {
    return <CoursePlayerSkeleton />;
  }

  // Access Control Check
  if (!loading && enrollmentStatus !== 'active' && enrollmentStatus !== 'completed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <i className="fa fa-lock text-4xl text-red-500" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Access Restricted
          </h1>

          <p className="mb-8 text-gray-600">
            {enrollmentStatus
              ? `Your enrollment status is currently "${formatEnrollmentStatus(enrollmentStatus)}".`
              : "You are not enrolled in this course."
            }
            <br />
            Please enroll to access the course content.
          </p>

          <button
            onClick={() => router.push(`/view-course/${courseId}`)}
            className="w-full rounded-lg bg-[#201a7c] px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#1a1563] focus:outline-none focus:ring-2 focus:ring-[#201a7c] focus:ring-offset-2"
          >
            Go to Course Page
          </button>
        </div>
      </div>
    );
  }

  if (!loading && (error || !course)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Course not available</p>
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <i className="fa fa-arrow-left mr-2" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CoursePlayerProvider
      value={{
        course,
        loading,
        error,
        enrollmentStatus,
        selectedKey,
        setSelectedKey,
        expandedModules,
        setExpandedModules,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        flatItems,
        handleToggleModule,
        handleSelectItem,
        moduleTitleMap,
        formatEnrollmentStatus,
        progressPercent,
        totalItems,
        completedItems,
        totalModules,
        totalLessons,
        totalQuizzes,
        totalExams,
        completedLessonIds,
        attemptCounts,
        submissionHistory,
        toggleLessonCompletion,
        startAssessment,
        saveAssessmentAnswer,
        submitAssessment,
      }}
    >
      <div className="h-screen overflow-hidden bg-[#f5f5f7] flex flex-col">
        <header className="bg-white border-b border-gray-200 shrink-0">
          <div className="h-14 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="Go back"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <i className="fa fa-arrow-left" />
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-gray-500">
                  {course?.title}
                </span>
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {currentItem ? currentItem.title : 'Select a learning item'}
                </span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              {enrollmentStatus === 'completed' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200">
                  <i className="fa fa-check-circle text-green-600" />
                  <span className="text-sm font-semibold">Course Finished</span>
                </div>
              )}
              {showFinishButton && (
                <button
                  type="button"
                  onClick={handleFinishCourse}
                  className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 animate-pulse"
                >
                  Finish this Course
                </button>
              )}
              {totalItems > 0 && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500">
                    {progressPercent}% Progress
                  </span>
                  <div className="w-40 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0056d2] transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                  {formatEnrollmentStatus(enrollmentStatus)}
                </span>
                <div className="mt-1 flex flex-wrap justify-end gap-2 text-[11px] text-gray-500">
                  <span>
                    {totalModules} module{totalModules === 1 ? '' : 's'}
                  </span>
                  <span>•</span>
                  <span>
                    {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
                  </span>
                  <span>•</span>
                  <span>
                    {totalQuizzes} quiz{totalQuizzes === 1 ? '' : 'zes'}
                  </span>
                  <span>•</span>
                  <span>
                    {totalExams} exam{totalExams === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
              aria-label="More options"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <i className="fa fa-ellipsis-v" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Portal */}
        {mounted &&
          createPortal(
            <>
              {/* Mobile Menu Overlay */}
              <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Mobile Menu Sheet */}
              <div
                className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col h-[90vh] ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
                  }`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
                    aria-label="Close menu"
                  >
                    <i className="fa fa-times text-lg" />
                  </button>
                </div>

                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-xs text-gray-500">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-[#0056d2] transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {enrollmentStatus === 'completed' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 w-full justify-center">
                      <i className="fa fa-check-circle text-green-600" />
                      <span className="text-sm font-semibold">Course Finished</span>
                    </div>
                  )}

                  {showFinishButton && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleFinishCourse();
                      }}
                      className="w-full inline-flex justify-center items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 animate-pulse"
                    >
                      Finish this Course
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <CourseCurriculumSidebar
                    curriculum={curriculum}
                    expandedModules={expandedModules}
                    onToggleModule={handleToggleModule}
                    selectedKey={selectedKey}
                    onSelectItem={(item) => {
                      handleSelectItem(item);
                      setIsMobileMenuOpen(false);
                    }}
                    flatItems={flatItems}
                    completedLessonIds={completedLessonIds}
                    submissionHistory={submissionHistory}
                  />
                </div>
              </div>

              {/* Confirmation Modal */}
              {isFinishConfirmationOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
                    onClick={() => setIsFinishConfirmationOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 pointer-events-auto transform transition-all scale-100 opacity-100">
                      <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                          <i className="fa fa-question text-green-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Finish Course?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Are you sure you want to finish this course? This will mark it as completed.
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setIsFinishConfirmationOpen(false)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={confirmFinishCourse}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 shadow-sm"
                          >
                            Yes, Finish
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Success Modal */}
              {isSuccessModalOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
                    onClick={() => setIsSuccessModalOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 pointer-events-auto transform transition-all scale-100 opacity-100">
                      <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-bounce">
                          <i className="fa fa-trophy text-green-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Course Finished!
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Congratulations! You have successfully completed this course.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsSuccessModalOpen(false)}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 shadow-sm"
                        >
                          Awesome!
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>,
            document.body,
          )}

        <div className="flex-1 flex min-h-0">
          <aside className="hidden lg:flex w-96 shrink-0 bg-white shadow-sm h-full overflow-hidden">
            <CourseCurriculumSidebar
              curriculum={curriculum}
              expandedModules={expandedModules}
              onToggleModule={handleToggleModule}
              selectedKey={selectedKey}
              onSelectItem={handleSelectItem}
              flatItems={flatItems}
              completedLessonIds={completedLessonIds}
              submissionHistory={submissionHistory}
            />
          </aside>

          <main className="flex-1 flex flex-col bg-[#f5f5f7] min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CoursePlayerProvider>
  );
}
