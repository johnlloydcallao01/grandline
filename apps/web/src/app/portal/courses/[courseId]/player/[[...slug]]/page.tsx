'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { QuizPlayer } from '@/components/course/QuizPlayer';
import { useCoursePlayer } from '../CoursePlayerContext';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string[] | undefined;

  const {
    course,
    selectedKey,
    setSelectedKey,
    flatItems,
    handleSelectItem,
    moduleTitleMap,
    setExpandedModules,
    completedLessonIds,
    attemptCounts,
    submissionHistory,
    toggleLessonCompletion,
    startAssessment,
    saveAssessmentAnswer,
    submitAssessment,
  } = useCoursePlayer();

  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [initialAnswers, setInitialAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    // Reset quiz state when changing items
    setIsQuizStarted(false);
    setSubmissionId(null);
    setIsSubmitting(false);
    setIsStarting(false);
    setInitialAnswers({});
  }, [selectedKey]);

  const handleStartQuiz = async () => {
    if (!currentItem || (currentItem.type !== 'assessment' && currentItem.type !== 'finalExam')) return;

    setIsStarting(true);
    try {
      const result = await startAssessment(currentItem.id);
      if (result) {
        setSubmissionId(result.submissionId);
        if (result.savedAnswers) {
          setInitialAnswers(result.savedAnswers);
        }
        setIsQuizStarted(true);
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteQuiz = async (result: { score: number; passed: boolean; answers: Record<string, string | string[]> }) => {
    if (!submissionId) return;

    setIsSubmitting(true);
    try {
      await submitAssessment(submissionId, result.answers);
      // The QuizPlayer handles showing results locally, 
      // but we've now also saved it to the server.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAnswer = async (questionId: string, response: any, questionType: string) => {
    if (!submissionId) return;
    await saveAssessmentAnswer(submissionId, questionId, response, questionType);
  };

  const handleRetryQuiz = () => {
    setIsQuizStarted(false);
    setSubmissionId(null);
    // This will trigger the "Start Assessment" screen in QuizPlayer
  };

  const currentItem = useMemo(
    () => (selectedKey ? flatItems.find((item) => item.key === selectedKey) || null : null),
    [flatItems, selectedKey],
  );

  // Sync URL slug to selectedKey
  useEffect(() => {
    if (!slug || slug.length === 0) {
      // Auto-redirect to last completed item OR first item if available
      if (flatItems.length > 0) {
        let targetItem = flatItems[0];

        // Find the last completed item based on curriculum order
        // We iterate from the end to find the "furthest" progress
        // STRICTLY RESTRICT TO LESSONS ONLY per user instruction
        for (let i = flatItems.length - 1; i >= 0; i--) {
          const item = flatItems[i];
          if (item.type === 'lesson' && completedLessonIds.includes(String(item.id))) {
            targetItem = item;
            break; // Found the furthest completed LESSON
          }
        }

        let url = `/portal/courses/${params.courseId}/player`;
        const i = targetItem as any;

        if (targetItem.type === 'lesson') {
          url += `/module/${i.moduleSlug}/lesson/${i.slug}`;
        } else if (targetItem.type === 'assessment') {
          url += `/module/${i.moduleSlug}/assessment/${i.slug}`;
        } else if (targetItem.type === 'finalExam') {
          url += `/assessment/${i.slug}`;
        }

        router.replace(url as any);
      }
      return;
    }

    let key: string | null = null;
    let foundItem: any = null;

    // URL patterns:
    // /module/:moduleSlug/lesson/:lessonSlug -> ['module', modSlug, 'lesson', lessonSlug]
    // /module/:moduleSlug/assessment/:assessmentSlug -> ['module', modSlug, 'assessment', assessmentSlug]
    // /assessment/:assessmentSlug -> ['assessment', assessmentSlug] (Final Exam)

    if (slug[0] === 'module' && slug[2] === 'lesson' && slug[3]) {
      const moduleSlug = slug[1];
      const lessonSlug = slug[3];
      foundItem = flatItems.find((i: any) =>
        i.type === 'lesson' && i.slug === lessonSlug && i.moduleSlug === moduleSlug
      );

      if (foundItem) {
        key = foundItem.key;
        // Also expand the module
        setExpandedModules(prev => prev.includes(foundItem.moduleId) ? prev : [...prev, foundItem.moduleId]);
      }
    } else if (slug[0] === 'module' && slug[2] === 'assessment' && slug[3]) {
      const moduleSlug = slug[1];
      const assessmentSlug = slug[3];
      foundItem = flatItems.find((i: any) =>
        i.type === 'assessment' && i.slug === assessmentSlug && i.moduleSlug === moduleSlug
      );

      if (foundItem) {
        key = foundItem.key;
        setExpandedModules(prev => prev.includes(foundItem.moduleId) ? prev : [...prev, foundItem.moduleId]);
      }
    } else if (slug[0] === 'assessment' && slug[1]) {
      const assessmentSlug = slug[1];
      foundItem = flatItems.find((i: any) =>
        i.type === 'finalExam' && i.slug === assessmentSlug
      );

      if (foundItem) {
        key = foundItem.key;
      }
    }

    if (key) {
      setSelectedKey(key);
    }
  }, [slug, flatItems, setSelectedKey, setExpandedModules, params.courseId, router, completedLessonIds]);

  const currentIndex = currentItem
    ? flatItems.findIndex((item) => item.key === currentItem.key)
    : -1;
  const previousItem = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  const currentTypeLabel =
    currentItem?.type === 'lesson'
      ? 'Lesson'
      : currentItem?.type === 'assessment'
        ? currentItem.assessmentKind === 'exam'
          ? 'Exam'
          : 'Quiz'
        : currentItem?.type === 'finalExam'
          ? 'Final Exam'
          : null;

  const currentModuleTitle =
    currentItem && currentItem.moduleId ? moduleTitleMap[currentItem.moduleId] || null : null;

  const isCompleted = currentItem && currentItem.type === 'lesson'
    ? completedLessonIds.includes(currentItem.id)
    : false;

  if (!course) return null;

  return (
    <div className="px-[10px] py-8">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {currentTypeLabel ?? 'Learning activity'}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
            {currentItem ? currentItem.title : course.title}
          </h1>
          <p className="text-sm text-gray-500">
            {currentItem ? (
              <>
                {currentModuleTitle && (
                  <>
                    {currentModuleTitle}
                    {' • '}
                  </>
                )}
                {currentItem.estimatedDurationMinutes
                  ? `${currentItem.estimatedDurationMinutes} min`
                  : 'Flexible pace'}
              </>
            ) : (
              'Use the curriculum panel to choose where you want to start.'
            )}
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
          {currentItem?.type === 'lesson' && (
            <button
              type="button"
              onClick={() => currentItem && toggleLessonCompletion(currentItem.id)}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-colors
                ${isCompleted
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <i className={`fa ${isCompleted ? 'fa-check-circle' : 'fa-circle-o'} mr-2`} />
              {isCompleted ? 'Completed' : 'Mark as Completed'}
            </button>
          )}
          <button
            type="button"
            disabled={!previousItem}
            onClick={() => previousItem && handleSelectItem(previousItem)}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fa fa-chevron-left mr-2" />
            Previous item
          </button>
          <button
            type="button"
            disabled={!nextItem}
            onClick={() => nextItem && handleSelectItem(nextItem)}
            className="inline-flex items-center rounded-full bg-[#0056d2] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0041a8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go to next item
            <i className="fa fa-arrow-right ml-2" />
          </button>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden mt-6 flex flex-col gap-3">
        {currentItem?.type === 'lesson' && (
          <button
            type="button"
            onClick={() => currentItem && toggleLessonCompletion(currentItem.id)}
            className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium border transition-colors
              ${isCompleted
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-300 text-gray-700'
              }`}
          >
            <i className={`fa ${isCompleted ? 'fa-check-circle' : 'fa-circle-o'} mr-2`} />
            {isCompleted ? 'Completed' : 'Mark as Completed'}
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!previousItem}
            onClick={() => previousItem && handleSelectItem(previousItem)}
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            <i className="fa fa-chevron-left mr-2" />
            Previous
          </button>
          <button
            type="button"
            disabled={!nextItem}
            onClick={() => nextItem && handleSelectItem(nextItem)}
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border border-transparent bg-[#0056d2] text-sm font-medium text-white disabled:opacity-50"
          >
            Next
            <i className="fa fa-arrow-right ml-2" />
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {currentItem ? (
          <div className="prose prose-slate max-w-none">
            {currentItem.type === 'lesson' && (
              currentItem.content ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                  <RichTextRenderer content={currentItem.content} />
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No content available for this lesson.</p>
                </div>
              )
            )}

            {(currentItem.type === 'assessment' || currentItem.type === 'finalExam') && (
              <>
                <QuizPlayer
                  assessment={currentItem as any}
                  isStarted={isQuizStarted}
                  onStart={handleStartQuiz}
                  onSaveAnswer={handleSaveAnswer}
                  onComplete={handleCompleteQuiz}
                  onRetry={handleRetryQuiz}
                  isSubmitting={isSubmitting}
                  isStarting={isStarting}
                  initialAnswers={initialAnswers}
                  attemptsUsed={currentItem ? attemptCounts[currentItem.id] || 0 : 0}
                  attemptHistory={currentItem ? submissionHistory[currentItem.id] || [] : []}
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#201a7c] border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
