import React from 'react';
import { CourseWithInstructor } from '@/types/course';
import { PlayerItem } from '@/types/player';
import { buildItemKey } from '@/utils/course-player';

interface CourseCurriculumSidebarProps {
  curriculum: CourseWithInstructor['curriculum'];
  expandedModules: string[];
  onToggleModule: (moduleId: string) => void;
  selectedKey: string | null;
  onSelectItem: (item: PlayerItem) => void;
  flatItems: PlayerItem[];
  completedLessonIds?: string[];
}

export function CourseCurriculumSidebar({
  curriculum,
  expandedModules,
  onToggleModule,
  selectedKey,
  onSelectItem,
  flatItems,
  completedLessonIds = [],
}: CourseCurriculumSidebarProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 w-full">
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
          Course Curriculum
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Browse modules, lessons, and assessments.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {curriculum && Array.isArray(curriculum.modules) && curriculum.modules.length > 0 ? (
          <>
            {curriculum.modules
              .map((mod, index) => {
                const isExpanded = expandedModules.includes(mod.id);
                let lessonCount = 0;
                let quizCount = 0;
                let examCount = 0;

                if (Array.isArray(mod.items)) {
                  for (const item of mod.items) {
                    if (typeof item.value === 'string') continue;
                    if (item.relationTo === 'course-lessons') {
                      lessonCount++;
                    } else if (item.relationTo === 'assessments') {
                      const a = item.value;
                      if (a.assessmentType === 'exam') examCount++;
                      else quizCount++;
                    }
                  }
                }

                return (
                  <div
                    key={mod.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleModule(mod.id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {mod.title}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                            {quizCount + examCount > 0 ? (
                              <>
                                {' • '}
                                {quizCount + examCount} assessment
                                {quizCount + examCount === 1 ? '' : 's'}
                              </>
                            ) : null}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          isExpanded
                            ? 'transform rotate-180 transition-transform duration-150 text-gray-400'
                            : 'transform rotate-0 transition-transform duration-150 text-gray-400'
                        }
                      >
                        <i className="fa fa-chevron-down text-xs" />
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
                        {Array.isArray(mod.items) && mod.items.length > 0 ? (
                          <ul className="space-y-1">
                            {mod.items.map((item) => {
                              if (typeof item.value === 'string') return null;

                              if (item.relationTo === 'course-lessons') {
                                const lesson = item.value;
                                const itemKey = buildItemKey('lesson', lesson.id);
                                const isActive = selectedKey === itemKey;
                                const isCompleted = completedLessonIds.includes(String(lesson.id));

                                return (
                                  <li key={lesson.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const found = flatItems.find((i) => i.key === itemKey);
                                        if (found) onSelectItem(found);
                                      }}
                                      className={`w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs ${isActive
                                        ? 'bg-white text-[#201a7c] font-semibold shadow-sm'
                                        : 'text-gray-700 hover:bg-white'
                                        }`}
                                    >
                                      <span className="flex items-center gap-2 min-w-0">
                                        {isCompleted ? (
                                          <i className="fa fa-check-circle text-green-500 text-xs" />
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#201a7c]" />
                                        )}
                                        <span className="truncate">{lesson.title}</span>
                                      </span>
                                      {lesson.estimatedDurationMinutes ? (
                                        <span className="text-[11px] text-gray-400">
                                          {lesson.estimatedDurationMinutes} min
                                        </span>
                                      ) : null}
                                    </button>
                                  </li>
                                );
                              } else if (item.relationTo === 'assessments') {
                                const assessment = item.value;
                                const itemKey = buildItemKey('assessment', assessment.id);
                                const isActive = selectedKey === itemKey;
                                const isQuiz = assessment.assessmentType === 'quiz';
                                const isCompleted = completedLessonIds.includes(String(assessment.id));

                                return (
                                  <li key={assessment.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const found = flatItems.find((i) => i.key === itemKey);
                                        if (found) onSelectItem(found);
                                      }}
                                      className={`w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs ${isActive
                                        ? 'bg-white text-[#201a7c] font-semibold shadow-sm'
                                        : 'text-gray-700 hover:bg-white'
                                        }`}
                                    >
                                      <span className="flex items-center gap-2 min-w-0">
                                        {isCompleted ? (
                                          <i className="fa fa-check-circle text-green-500 text-xs" />
                                        ) : (
                                          <i
                                            className={`fa ${isQuiz ? 'fa-question-circle' : 'fa-file-alt'} text-[10px] w-3 text-center ${isActive ? 'text-[#201a7c]' : 'text-gray-400'
                                              }`}
                                          />
                                        )}
                                        <span className="truncate">{assessment.title}</span>
                                      </span>
                                      {assessment.estimatedDurationMinutes ? (
                                        <span className="text-[11px] text-gray-400">
                                          {assessment.estimatedDurationMinutes} min
                                        </span>
                                      ) : null}
                                    </button>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </ul>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}

            {curriculum.finalExam && (
              <div className="mt-4 border border-[#0056d2]/30 rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    const itemKey = buildItemKey('finalExam', curriculum.finalExam!.id);
                    const found = flatItems.find((i) => i.key === itemKey);
                    if (found) onSelectItem(found);
                  }}
                  className="w-full flex flex-col gap-2 px-3 py-3 hover:bg-indigo-50/40 transition-colors"
                >
                  <div className="w-full flex items-center gap-3 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0056d2]/10 text-xs font-bold text-[#0056d2]">
                      FE
                    </span>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#0056d2]">
                        Final Assessment
                      </span>
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {curriculum.finalExam.title}
                      </span>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between pl-11 text-[11px] text-gray-500 font-medium">
                    <span>
                      {curriculum.finalExam.estimatedDurationMinutes
                        ? `${curriculum.finalExam.estimatedDurationMinutes} min`
                        : 'Flexible'}
                    </span>
                    <span>Attempts: Unlimited</span>
                  </div>
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Curriculum will be displayed here once modules and lessons are added for this course.
          </p>
        )}
      </div>
    </div>
  );
}
