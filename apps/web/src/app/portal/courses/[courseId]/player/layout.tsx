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
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
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

    if (curriculum.finalExam && course?.evaluationMode !== 'quizzes') {
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
  }, [curriculum, course?.evaluationMode]);

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

    if (curriculum.finalExam && course?.evaluationMode !== 'quizzes' && course?.evaluationMode !== 'lessons_quizzes') {
      examsCount += 1;
    }

    return {
      totalModules: curriculum.modules.length,
      totalLessons: lessonsCount,
      totalQuizzes: quizzesCount,
      totalExams: examsCount,
    };
  }, [curriculum, course?.evaluationMode]);

  const currentItem = useMemo(
    () => (selectedKey ? flatItems.find((item) => item.key === selectedKey) || null : null),
    [flatItems, selectedKey],
  );

  const evaluationMode = course?.evaluationMode;

  const { progressPercent, completedItems, totalItems } = useMemo(() => {
    const currentIndex = currentItem
      ? flatItems.findIndex((item) => item.key === currentItem.key)
      : -1;

    if (evaluationMode === 'lessons' || evaluationMode === 'lessons_exam') {
      const lessonItems = flatItems.filter((i) => i.type === 'lesson');
      const completedLessonCount = lessonItems.filter((i) => completedLessonIds.includes(i.id)).length;

      let total = lessonItems.length;
      let completed = completedLessonCount;

      if (evaluationMode === 'lessons_exam') {
        const finalExam = flatItems.find((item) => item.type === 'finalExam');
        if (finalExam) {
          total += 1;
          const submissions = submissionHistory[finalExam.id] || [];
          if (submissions.length > 0) {
            completed += 1;
          }
        }
      }

      return {
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        completedItems: completed,
        totalItems: total,
        progressLabel: evaluationMode === 'lessons_exam' ? 'lessons & exam' : 'lessons',
      };
    }

    if (evaluationMode === 'exam' || evaluationMode === 'quizzes' || evaluationMode === 'lessons_quizzes' || evaluationMode === 'quizzes_exam' || evaluationMode === 'lessons_quizzes_exam') {
      const total = flatItems.length;
      let completed = 0;

      for (const item of flatItems) {
        if (item.type === 'lesson') {
          if (completedLessonIds.includes(item.id)) {
            completed++;
          }
        } else if (item.type === 'assessment' || item.type === 'finalExam') {
          // Count as completed if there is at least one submission
          if (submissionHistory[item.id] && submissionHistory[item.id].length > 0) {
            completed++;
          }
        }
      }

      let progressLabel = 'items';
      if (evaluationMode === 'lessons_quizzes') progressLabel = 'lessons & quizzes';
      else if (evaluationMode === 'quizzes_exam') progressLabel = 'quizzes & exam';
      else if (evaluationMode === 'lessons_quizzes_exam') progressLabel = 'items';

      return {
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        completedItems: completed,
        totalItems: total,
        progressLabel
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
    if (enrollmentStatus !== 'active') return false;

    if (evaluationMode === 'lessons') {
      // Check if 100% completed
      return progressPercent === 100;
    }

    if (evaluationMode === 'exam') {
      const finalExam = flatItems.find(item => item.type === 'finalExam');
      if (!finalExam) return false;

      // Get submission history for the final exam
      const submissions = submissionHistory[finalExam.id] || [];

      // If no submissions, button should not be shown
      if (submissions.length === 0) return false;

      // If submitted at least once, allow finish (regardless of pass/fail)
      return true;
    }

    if (evaluationMode === 'lessons_exam') {
      // Must complete ALL lessons AND submit the final exam
      const lessonItems = flatItems.filter(item => item.type === 'lesson');
      const allLessonsCompleted = lessonItems.every(item => completedLessonIds.includes(item.id));

      const finalExam = flatItems.find(item => item.type === 'finalExam');
      let examSubmitted = false;

      if (finalExam) {
        const submissions = submissionHistory[finalExam.id] || [];
        examSubmitted = submissions.length > 0;
      }

      // Only show Finish if BOTH conditions met
      return allLessonsCompleted && examSubmitted;
    }

    if (evaluationMode === 'quizzes') {
      // Must submit ALL quizzes and module exams
      const allQuizzes = flatItems.filter(item => item.type === 'assessment' && (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam'));

      if (allQuizzes.length === 0) return true; // No quizzes/exams to pass?

      const allSubmitted = allQuizzes.every(quiz => {
        const submissions = submissionHistory[quiz.id] || [];
        return submissions.length > 0;
      });

      return allSubmitted;
    }

    if (evaluationMode === 'lessons_quizzes') {
      // Must complete ALL lessons AND submit ALL quizzes/exams
      const lessonItems = flatItems.filter(item => item.type === 'lesson');
      const allLessonsCompleted = lessonItems.every(item => completedLessonIds.includes(item.id));

      const allAssessments = flatItems.filter(item => item.type === 'assessment' && (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam'));
      const allAssessmentsSubmitted = allAssessments.every(item => {
        const submissions = submissionHistory[item.id] || [];
        return submissions.length > 0;
      });

      return allLessonsCompleted && allAssessmentsSubmitted;
    }

    if (evaluationMode === 'quizzes_exam') {
      // Must submit ALL quizzes/exams AND the final exam
      const allAssessments = flatItems.filter(item => item.type === 'assessment' && (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam'));
      const allAssessmentsSubmitted = allAssessments.every(item => {
        const submissions = submissionHistory[item.id] || [];
        return submissions.length > 0;
      });

      const finalExam = flatItems.find(item => item.type === 'finalExam');
      let finalExamSubmitted = false;
      if (finalExam) {
        const submissions = submissionHistory[finalExam.id] || [];
        finalExamSubmitted = submissions.length > 0;
      }

      return allAssessmentsSubmitted && finalExamSubmitted;
    }

    if (evaluationMode === 'lessons_quizzes_exam') {
      // Must complete ALL lessons AND submit ALL quizzes/exams AND submit final exam
      const lessonItems = flatItems.filter(item => item.type === 'lesson');
      const allLessonsCompleted = lessonItems.every(item => completedLessonIds.includes(item.id));

      const allAssessments = flatItems.filter(item => item.type === 'assessment' && (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam'));
      const allAssessmentsSubmitted = allAssessments.every(item => {
        const submissions = submissionHistory[item.id] || [];
        return submissions.length > 0;
      });

      const finalExam = flatItems.find(item => item.type === 'finalExam');
      let finalExamSubmitted = false;
      if (finalExam) {
        const submissions = submissionHistory[finalExam.id] || [];
        finalExamSubmitted = submissions.length > 0;
      }

      return allLessonsCompleted && allAssessmentsSubmitted && finalExamSubmitted;
    }

    return false;
  }, [evaluationMode, enrollmentStatus, progressPercent, flatItems, submissionHistory]);

  const showEvaluationButton = useMemo(() => {
    if (enrollmentStatus === 'completed' && evaluationMode === 'lessons') return true;

    if (evaluationMode === 'exam') {
      // Find the final exam
      const finalExam = flatItems.find(item => item.type === 'finalExam');
      if (finalExam && submissionHistory[finalExam.id] && submissionHistory[finalExam.id].length > 0) {
        return true;
      }
    }

    if (evaluationMode === 'quizzes') {
      // Show if ANY quiz/module exam has been attempted
      // "Show Evaluation" implies seeing the results. 
      // It's helpful to see it anytime to track progress of which quizzes are passed/failed.
      // So let's show it if AT LEAST ONE quiz/exam has been submitted.
      const anyQuizSubmitted = flatItems.some(item =>
        item.type === 'assessment' &&
        (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam') &&
        submissionHistory[item.id] &&
        submissionHistory[item.id].length > 0
      );
      return anyQuizSubmitted;
    }

    if (evaluationMode === 'lessons_exam') {
      // Show if ANY lesson is completed OR exam is submitted
      const anyLessonCompleted = completedLessonIds.length > 0;

      const finalExam = flatItems.find(item => item.type === 'finalExam');
      const examSubmitted = finalExam && submissionHistory[finalExam.id] && submissionHistory[finalExam.id].length > 0;

      return anyLessonCompleted || examSubmitted;
    }

    if (evaluationMode === 'lessons_quizzes') {
      // Show if ANY lesson is completed OR ANY quiz is submitted
      const anyLessonCompleted = completedLessonIds.length > 0;
      const anyQuizSubmitted = flatItems.some(item =>
        item.type === 'assessment' &&
        (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam') &&
        submissionHistory[item.id] &&
        submissionHistory[item.id].length > 0
      );

      return anyLessonCompleted || anyQuizSubmitted;
    }

    if (evaluationMode === 'quizzes_exam') {
      // Show if ANY quiz is submitted OR final exam is submitted
      const anyQuizSubmitted = flatItems.some(item =>
        item.type === 'assessment' &&
        (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam') &&
        submissionHistory[item.id] &&
        submissionHistory[item.id].length > 0
      );

      const finalExam = flatItems.find(item => item.type === 'finalExam');
      const examSubmitted = finalExam && submissionHistory[finalExam.id] && submissionHistory[finalExam.id].length > 0;

      return anyQuizSubmitted || examSubmitted;
    }

    if (evaluationMode === 'lessons_quizzes_exam') {
      // Show if ANY lesson completed OR ANY quiz submitted OR final exam submitted
      const anyLessonCompleted = completedLessonIds.length > 0;
      const anyQuizSubmitted = flatItems.some(item =>
        item.type === 'assessment' &&
        (item.assessmentKind === 'quiz' || item.assessmentKind === 'exam') &&
        submissionHistory[item.id] &&
        submissionHistory[item.id].length > 0
      );

      const finalExam = flatItems.find(item => item.type === 'finalExam');
      const examSubmitted = finalExam && submissionHistory[finalExam.id] && submissionHistory[finalExam.id].length > 0;

      return anyLessonCompleted || anyQuizSubmitted || examSubmitted;
    }

    return false;
  }, [enrollmentStatus, evaluationMode, flatItems, submissionHistory]);

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
              {showEvaluationButton && (
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(true)}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <i className="fa fa-file-text-o mr-2" />
                  Show Evaluation
                </button>
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

                  {showEvaluationButton && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsEvaluationModalOpen(true);
                      }}
                      className="mt-2 w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <i className="fa fa-file-text-o mr-2" />
                      Show Evaluation
                    </button>
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
                    evaluationMode={course?.evaluationMode}
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

              {/* Evaluation Modal */}
              {isEvaluationModalOpen && (
                (() => {
                  let status = 'passed';
                  let message = 'You have successfully completed all required lessons.';
                  let scoreDisplay: React.ReactNode = null;

                  if (evaluationMode === 'exam') {
                    const finalExam = flatItems.find(i => i.type === 'finalExam');
                    const submissions = finalExam ? submissionHistory[finalExam.id] : [];
                    const latest = submissions && submissions.length > 0 ? submissions[submissions.length - 1] : null;

                    if (latest) {
                      // Determine pass/fail
                      const passingScore = latest.passingScoreSnapshot ?? finalExam?.assessmentDetails?.passingScore ?? 70;
                      const score = Math.round(latest.score ?? 0);
                      const passed = score >= passingScore;

                      status = passed ? 'passed' : 'failed';
                      message = passed
                        ? 'Congratulations! You have passed the final exam.'
                        : 'You have not reached the passing score for the final exam.';

                      scoreDisplay = (
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-500">Your Score</p>
                          <p className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                            {score}% <span className="text-sm text-gray-400 font-normal">/ {passingScore}% required</span>
                          </p>
                        </div>
                      );
                    }
                  } else if (evaluationMode === 'lessons_exam') {
                    // Check Lessons
                    const lessonItems = flatItems.filter(item => item.type === 'lesson');
                    const totalLessons = lessonItems.length;
                    const completedLessons = lessonItems.filter(item => completedLessonIds.includes(item.id)).length;
                    const lessonsPassed = totalLessons > 0 && completedLessons === totalLessons;

                    // Check Final Exam
                    const finalExam = flatItems.find(item => item.type === 'finalExam');
                    let examPassed = false;
                    let examScore = 0;
                    let examSubmitted = false;
                    let examPassingScore = 70;

                    if (finalExam) {
                      const submissions = submissionHistory[finalExam.id] || [];
                      if (submissions.length > 0) {
                        examSubmitted = true;
                        const latest = submissions[submissions.length - 1];
                        examPassingScore = latest.passingScoreSnapshot ?? finalExam.assessmentDetails?.passingScore ?? 70;
                        examScore = Math.round(latest.score ?? 0);
                        examPassed = examScore >= examPassingScore;
                      } else {
                        examPassingScore = finalExam.assessmentDetails?.passingScore ?? 70;
                      }
                    }

                    // Status is 'passed' if BOTH are met (lessons done + exam passed)
                    // But user can finish if BOTH are met (lessons done + exam submitted) regardless of score
                    // The "Evaluation Result" should probably reflect PASS/FAIL based on score though?
                    // "If you completed the Lessons but failed the Final Exam, you will fail" -> Yes.

                    status = (lessonsPassed && examPassed) ? 'passed' : 'failed';

                    if (!lessonsPassed) {
                      message = `You have completed ${completedLessons} of ${totalLessons} lessons. You must complete all lessons before finishing.`;
                    } else if (!examSubmitted) {
                      message = 'You have completed all lessons, but you must submit the Final Exam.';
                    } else if (!examPassed) {
                      message = `You have completed all lessons and submitted the exam, but you did not achieve the passing score of ${examPassingScore}%.`;
                    } else {
                      message = 'Congratulations! You have completed all lessons and passed the Final Exam.';
                    }

                    scoreDisplay = (
                      <div className="mb-4 text-left space-y-4 border-t border-b border-gray-100 py-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Lessons Completion</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${lessonsPassed ? 'text-green-600' : 'text-orange-600'}`}>
                              {Math.round((completedLessons / (totalLessons || 1)) * 100)}%
                            </span>
                            <i className={`fa ${lessonsPassed ? 'fa-check text-green-500' : 'fa-clock-o text-orange-500'}`} />
                          </div>
                        </div>
                        {finalExam && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Final Exam</span>
                            <div className="flex items-center gap-2">
                              {examSubmitted ? (
                                <>
                                  <span className={`font-semibold ${examPassed ? 'text-green-600' : 'text-red-600'}`}>
                                    {examScore}%
                                  </span>
                                  <i className={`fa ${examPassed ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                </>
                              ) : (
                                <span className="text-gray-400">Not taken</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  } else if (evaluationMode === 'quizzes') {
                    const allAssessments = flatItems.filter(i => i.type === 'assessment' && (i.assessmentKind === 'quiz' || i.assessmentKind === 'exam'));
                    const results = allAssessments.map(item => {
                      const submissions = submissionHistory[item.id] || [];
                      const latest = submissions.length > 0 ? submissions[submissions.length - 1] : null;

                      if (!latest) {
                        return { title: item.title, status: 'pending', score: 0, passingScore: item.assessmentDetails?.passingScore ?? 70 };
                      }

                      const passingScore = latest.passingScoreSnapshot ?? item.assessmentDetails?.passingScore ?? 70;
                      const score = Math.round(latest.score ?? 0);
                      const passed = score >= passingScore;

                      return {
                        title: item.title,
                        status: passed ? 'passed' : 'failed',
                        score,
                        passingScore
                      };
                    });

                    const allPassed = results.every(r => r.status === 'passed');
                    status = allPassed ? 'passed' : 'failed';
                    message = allPassed
                      ? 'Congratulations! You have passed all required assessments.'
                      : 'You have completed the assessments, but did not pass all of them.';

                    scoreDisplay = (
                      <div className="mb-4 max-h-60 overflow-y-auto text-left space-y-2 border-t border-b border-gray-100 py-2">
                        {results.map((q, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="truncate max-w-[180px]" title={q.title}>{q.title}</span>
                            <div className="flex items-center gap-2">
                              {q.status === 'pending' ? (
                                <span className="text-gray-400">Not taken</span>
                              ) : (
                                <>
                                  <span className={`font-semibold ${q.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                    {q.score}%
                                  </span>
                                  <i className={`fa ${q.status === 'passed' ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else if (evaluationMode === 'lessons_quizzes') {
                    // Check Lessons
                    const lessonItems = flatItems.filter(item => item.type === 'lesson');
                    const totalLessons = lessonItems.length;
                    const completedLessons = lessonItems.filter(item => completedLessonIds.includes(item.id)).length;
                    const lessonsPassed = totalLessons > 0 && completedLessons === totalLessons;

                    // Check Assessments
                    const allAssessments = flatItems.filter(i => i.type === 'assessment' && (i.assessmentKind === 'quiz' || i.assessmentKind === 'exam'));
                    const results = allAssessments.map(item => {
                      const submissions = submissionHistory[item.id] || [];
                      const latest = submissions.length > 0 ? submissions[submissions.length - 1] : null;

                      if (!latest) {
                        return { title: item.title, status: 'pending', score: 0, passingScore: item.assessmentDetails?.passingScore ?? 70 };
                      }

                      const passingScore = latest.passingScoreSnapshot ?? item.assessmentDetails?.passingScore ?? 70;
                      const score = Math.round(latest.score ?? 0);
                      const passed = score >= passingScore;

                      return {
                        title: item.title,
                        status: passed ? 'passed' : 'failed',
                        score,
                        passingScore
                      };
                    });

                    const allAssessmentsPassed = results.every(r => r.status === 'passed');

                    status = (lessonsPassed && allAssessmentsPassed) ? 'passed' : 'failed';

                    if (!lessonsPassed) {
                      message = `You have completed ${completedLessons} of ${totalLessons} lessons. You must complete all lessons.`;
                    } else if (!allAssessmentsPassed) {
                      const failedCount = results.filter(r => r.status === 'failed').length;
                      const pendingCount = results.filter(r => r.status === 'pending').length;

                      if (pendingCount > 0) {
                        message = 'You have completed all lessons, but you have pending assessments.';
                      } else {
                        message = `You have completed all lessons, but failed ${failedCount} assessment${failedCount === 1 ? '' : 's'}.`;
                      }
                    } else {
                      message = 'Congratulations! You have completed all lessons and passed all required assessments.';
                    }

                    scoreDisplay = (
                      <div className="mb-4 text-left space-y-4 border-t border-b border-gray-100 py-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Lessons Completion</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${lessonsPassed ? 'text-green-600' : 'text-orange-600'}`}>
                              {Math.round((completedLessons / (totalLessons || 1)) * 100)}%
                            </span>
                            <i className={`fa ${lessonsPassed ? 'fa-check text-green-500' : 'fa-clock-o text-orange-500'}`} />
                          </div>
                        </div>

                        <div className="border-t border-gray-50 pt-2 mt-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Assessments</p>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {results.map((q, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="truncate max-w-[180px]" title={q.title}>{q.title}</span>
                                <div className="flex items-center gap-2">
                                  {q.status === 'pending' ? (
                                    <span className="text-gray-400">Not taken</span>
                                  ) : (
                                    <>
                                      <span className={`font-semibold ${q.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                        {q.score}%
                                      </span>
                                      <i className={`fa ${q.status === 'passed' ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            {results.length === 0 && (
                              <p className="text-xs text-gray-400 italic">No assessments required.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else if (evaluationMode === 'quizzes_exam') {
                    // Check Assessments
                    const allAssessments = flatItems.filter(i => i.type === 'assessment' && (i.assessmentKind === 'quiz' || i.assessmentKind === 'exam'));
                    const results = allAssessments.map(item => {
                      const submissions = submissionHistory[item.id] || [];
                      const latest = submissions.length > 0 ? submissions[submissions.length - 1] : null;

                      if (!latest) {
                        return { title: item.title, status: 'pending', score: 0, passingScore: item.assessmentDetails?.passingScore ?? 70 };
                      }

                      const passingScore = latest.passingScoreSnapshot ?? item.assessmentDetails?.passingScore ?? 70;
                      const score = Math.round(latest.score ?? 0);
                      const passed = score >= passingScore;

                      return {
                        title: item.title,
                        status: passed ? 'passed' : 'failed',
                        score,
                        passingScore
                      };
                    });

                    const allAssessmentsPassed = results.every(r => r.status === 'passed');

                    // Check Final Exam
                    const finalExam = flatItems.find(item => item.type === 'finalExam');
                    let examPassed = false;
                    let examScore = 0;
                    let examSubmitted = false;
                    let examPassingScore = 70;

                    if (finalExam) {
                      const submissions = submissionHistory[finalExam.id] || [];
                      if (submissions.length > 0) {
                        examSubmitted = true;
                        const latest = submissions[submissions.length - 1];
                        examPassingScore = latest.passingScoreSnapshot ?? finalExam.assessmentDetails?.passingScore ?? 70;
                        examScore = Math.round(latest.score ?? 0);
                        examPassed = examScore >= examPassingScore;
                      } else {
                        examPassingScore = finalExam.assessmentDetails?.passingScore ?? 70;
                      }
                    }

                    status = (allAssessmentsPassed && examPassed) ? 'passed' : 'failed';

                    if (!allAssessmentsPassed) {
                      const failedCount = results.filter(r => r.status === 'failed').length;
                      const pendingCount = results.filter(r => r.status === 'pending').length;

                      if (pendingCount > 0) {
                        message = 'You have not completed all required quizzes. You must pass all quizzes and the Final Exam.';
                      } else {
                        message = `You have failed ${failedCount} quiz${failedCount === 1 ? '' : 'zes'}. You must pass all quizzes and the Final Exam.`;
                      }
                    } else if (!examSubmitted) {
                      message = 'You have passed all quizzes, but you must pass the Final Exam to complete the course.';
                    } else if (!examPassed) {
                      message = `You have passed all quizzes, but you did not achieve the passing score of ${examPassingScore}% on the Final Exam.`;
                    } else {
                      message = 'Congratulations! You have passed all quizzes and the Final Exam.';
                    }

                    scoreDisplay = (
                      <div className="mb-4 text-left space-y-4 border-t border-b border-gray-100 py-4">
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quizzes & Module Exams</p>
                          {results.map((q, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="truncate max-w-[180px]" title={q.title}>{q.title}</span>
                              <div className="flex items-center gap-2">
                                {q.status === 'pending' ? (
                                  <span className="text-gray-400">Not taken</span>
                                ) : (
                                  <>
                                    <span className={`font-semibold ${q.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                      {q.score}%
                                    </span>
                                    <i className={`fa ${q.status === 'passed' ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                          {results.length === 0 && (
                            <p className="text-xs text-gray-400 italic">No quizzes required.</p>
                          )}
                        </div>

                        {finalExam && (
                          <div className="border-t border-gray-50 pt-2 mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold">Final Exam</span>
                              <div className="flex items-center gap-2">
                                {examSubmitted ? (
                                  <>
                                    <span className={`font-semibold ${examPassed ? 'text-green-600' : 'text-red-600'}`}>
                                      {examScore}%
                                    </span>
                                    <i className={`fa ${examPassed ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                  </>
                                ) : (
                                  <span className="text-gray-400">Not taken</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else if (evaluationMode === 'lessons_quizzes_exam') {
                    // Check Lessons
                    const lessonItems = flatItems.filter(item => item.type === 'lesson');
                    const totalLessons = lessonItems.length;
                    const completedLessons = lessonItems.filter(item => completedLessonIds.includes(item.id)).length;
                    const lessonsPassed = totalLessons > 0 && completedLessons === totalLessons;

                    // Check Assessments
                    const allAssessments = flatItems.filter(i => i.type === 'assessment' && (i.assessmentKind === 'quiz' || i.assessmentKind === 'exam'));
                    const results = allAssessments.map(item => {
                      const submissions = submissionHistory[item.id] || [];
                      const latest = submissions.length > 0 ? submissions[submissions.length - 1] : null;

                      if (!latest) {
                        return { title: item.title, status: 'pending', score: 0, passingScore: item.assessmentDetails?.passingScore ?? 70 };
                      }

                      const passingScore = latest.passingScoreSnapshot ?? item.assessmentDetails?.passingScore ?? 70;
                      const score = Math.round(latest.score ?? 0);
                      const passed = score >= passingScore;

                      return {
                        title: item.title,
                        status: passed ? 'passed' : 'failed',
                        score,
                        passingScore
                      };
                    });

                    const allAssessmentsPassed = results.every(r => r.status === 'passed');

                    // Check Final Exam
                    const finalExam = flatItems.find(item => item.type === 'finalExam');
                    let examPassed = false;
                    let examScore = 0;
                    let examSubmitted = false;
                    let examPassingScore = 70;

                    if (finalExam) {
                      const submissions = submissionHistory[finalExam.id] || [];
                      if (submissions.length > 0) {
                        examSubmitted = true;
                        const latest = submissions[submissions.length - 1];
                        examPassingScore = latest.passingScoreSnapshot ?? finalExam.assessmentDetails?.passingScore ?? 70;
                        examScore = Math.round(latest.score ?? 0);
                        examPassed = examScore >= examPassingScore;
                      } else {
                        examPassingScore = finalExam.assessmentDetails?.passingScore ?? 70;
                      }
                    }

                    status = (lessonsPassed && allAssessmentsPassed && examPassed) ? 'passed' : 'failed';

                    const failures: string[] = [];
                    if (!lessonsPassed) {
                      failures.push(`complete all ${totalLessons} lessons (completed: ${completedLessons})`);
                    }
                    if (!allAssessmentsPassed) {
                      const failedCount = results.filter(r => r.status === 'failed').length;
                      const pendingCount = results.filter(r => r.status === 'pending').length;
                      if (pendingCount > 0) {
                        failures.push('pass all quizzes (some are pending)');
                      } else {
                        failures.push(`pass all quizzes (${failedCount} failed)`);
                      }
                    }
                    if (!examSubmitted) {
                      failures.push('submit the Final Exam');
                    } else if (!examPassed) {
                      failures.push(`pass the Final Exam (score: ${examScore}%, required: ${examPassingScore}%)`);
                    }

                    if (status === 'passed') {
                      message = 'Congratulations! You have completed all lessons, passed all quizzes, and passed the Final Exam.';
                    } else {
                      message = 'To complete this course, you must: ' + failures.join(', ');
                    }

                    scoreDisplay = (
                      <div className="mb-4 text-left space-y-4 border-t border-b border-gray-100 py-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Lessons Completion</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${lessonsPassed ? 'text-green-600' : 'text-orange-600'}`}>
                              {Math.round((completedLessons / (totalLessons || 1)) * 100)}%
                            </span>
                            <i className={`fa ${lessonsPassed ? 'fa-check text-green-500' : 'fa-clock-o text-orange-500'}`} />
                          </div>
                        </div>

                        <div className="border-t border-gray-50 pt-2 mt-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quizzes & Module Exams</p>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {results.map((q, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="truncate max-w-[180px]" title={q.title}>{q.title}</span>
                                <div className="flex items-center gap-2">
                                  {q.status === 'pending' ? (
                                    <span className="text-gray-400">Not taken</span>
                                  ) : (
                                    <>
                                      <span className={`font-semibold ${q.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                        {q.score}%
                                      </span>
                                      <i className={`fa ${q.status === 'passed' ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            {results.length === 0 && (
                              <p className="text-xs text-gray-400 italic">No quizzes required.</p>
                            )}
                          </div>
                        </div>

                        {finalExam && (
                          <div className="border-t border-gray-50 pt-2 mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold">Final Exam</span>
                              <div className="flex items-center gap-2">
                                {examSubmitted ? (
                                  <>
                                    <span className={`font-semibold ${examPassed ? 'text-green-600' : 'text-red-600'}`}>
                                      {examScore}%
                                    </span>
                                    <i className={`fa ${examPassed ? 'fa-check text-green-500' : 'fa-times text-red-500'}`} />
                                  </>
                                ) : (
                                  <span className="text-gray-400">Not taken</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <>
                      <div
                        className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
                        onClick={() => setIsEvaluationModalOpen(false)}
                        aria-hidden="true"
                      />
                      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 pointer-events-auto transform transition-all scale-100 opacity-100">
                          <div className="text-center">
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${status === 'passed' ? 'bg-blue-100' : 'bg-red-100'} mb-4`}>
                              <i className={`fa ${status === 'passed' ? 'fa-file-text-o text-blue-600' : 'fa-times text-red-600'} text-2xl`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Evaluation Result
                            </h3>
                            <div className="flex justify-center mb-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${status === 'passed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                {status.toUpperCase()}
                              </span>
                            </div>

                            {scoreDisplay}

                            <div className={`my-6 py-4 ${status === 'passed' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} rounded-lg border`}>
                              <p className={`text-sm font-medium ${status === 'passed' ? 'text-green-800' : 'text-red-800'}`}>
                                {message}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              {showFinishButton && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEvaluationModalOpen(false);
                                    handleFinishCourse();
                                  }}
                                  className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 shadow-sm animate-pulse"
                                >
                                  Finish this Course
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setIsEvaluationModalOpen(false)}
                                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()
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
              evaluationMode={course?.evaluationMode}
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
