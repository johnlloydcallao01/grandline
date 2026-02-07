'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { QuizPlayer } from '@/components/course/QuizPlayer';
import { useCoursePlayer } from '../CoursePlayerContext';

export default function CoursePlayerPage() {
  const params = useParams();
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
    toggleLessonCompletion,
  } = useCoursePlayer();

  const [isQuizStarted, setIsQuizStarted] = useState(false);

  useEffect(() => {
    // Reset quiz state when changing items
    setIsQuizStarted(false);
  }, [selectedKey]);

  const currentItem = useMemo(
    () => (selectedKey ? flatItems.find((item) => item.key === selectedKey) || null : null),
    [flatItems, selectedKey],
  );

  // Sync URL slug to selectedKey
  useEffect(() => {
    if (!slug || slug.length === 0) {
      // Optional: Set to null or first item if needed. 
      // Current behavior: null (Overview/Welcome)
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
  }, [slug, flatItems, setSelectedKey, setExpandedModules]);

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
                {isQuizStarted && currentItem.assessmentDetails?.questions && currentItem.assessmentDetails.questions.length > 0 ? (
                  <QuizPlayer
                    title={currentItem.title}
                    questions={currentItem.assessmentDetails.questions}
                    passingScore={currentItem.assessmentDetails.passingScore ?? 70}
                    timeLimitMinutes={currentItem.assessmentDetails.timeLimitMinutes}
                    maxAttempts={currentItem.assessmentDetails.maxAttempts}
                    showCorrectAnswer={currentItem.assessmentDetails.showCorrectAnswer}
                    onExit={() => {
                      setIsQuizStarted(false);
                    }}
                  />
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-0">
                        {currentItem.assessmentKind === 'final'
                          ? 'Final Exam Instructions'
                          : currentItem.assessmentKind === 'exam'
                            ? 'Exam Instructions'
                            : 'Quiz Instructions'}
                      </h2>

                      {currentItem.content && (
                        <div className="mb-8 text-gray-600">
                          <RichTextRenderer content={currentItem.content} />
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 not-prose">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Time Limit</div>
                          <div className="font-semibold text-gray-900">
                            {currentItem.assessmentDetails?.timeLimitMinutes
                              ? `${currentItem.assessmentDetails.timeLimitMinutes} mins`
                              : 'None'}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Passing Score</div>
                          <div className="font-semibold text-gray-900">
                            {currentItem.assessmentDetails?.passingScore ?? 70}%
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Attempts</div>
                          <div className="font-semibold text-gray-900">
                            {currentItem.assessmentDetails?.maxAttempts ?? 1}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Questions</div>
                          <div className="font-semibold text-gray-900">
                            {currentItem.assessmentDetails?.questionsCount ?? '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 not-prose">
                        <button
                          type="button"
                          onClick={() => setIsQuizStarted(true)}
                          disabled={!currentItem.assessmentDetails?.questions || currentItem.assessmentDetails.questions.length === 0}
                          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#0056d2] hover:bg-[#0041a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056d2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Start {currentItem.assessmentKind === 'final' ? 'Final Exam' : currentItem.assessmentKind === 'exam' ? 'Exam' : 'Quiz'}
                        </button>
                        <div className="flex items-center text-sm text-gray-500">
                          <i className="fa fa-info-circle mr-2" />
                          {!currentItem.assessmentDetails?.questions || currentItem.assessmentDetails.questions.length === 0
                            ? 'No questions available.'
                            : 'Click start when you are ready to begin.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <i className="fa fa-book-open text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Select a learning item</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              Choose a lesson or assessment from the curriculum sidebar to view its content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
