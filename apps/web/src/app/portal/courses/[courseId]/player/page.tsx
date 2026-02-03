'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import type { CourseWithInstructor } from '@/types/course';
import { PlayerItem } from '@/types/player';
import { buildItemKey } from '@/utils/course-player';
import { CourseCurriculumSidebar } from '@/components/course/CourseCurriculumSidebar';

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

export default function CoursePlayerPage() {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        };

        if (!active) return;

        setCourse(data);

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
    if (!curriculum || !Array.isArray(curriculum.modules)) {
      if (curriculum?.finalExam) {
        items.push({
          key: buildItemKey('finalExam', curriculum.finalExam.id),
          type: 'finalExam',
          id: curriculum.finalExam.id,
          title: curriculum.finalExam.title,
          assessmentKind: 'final',
          estimatedDurationMinutes: curriculum.finalExam.estimatedDurationMinutes ?? null,
        });
      }
      return items;
    }

    const sortedModules = [...curriculum.modules].sort((a, b) => a.order - b.order);

    for (const mod of sortedModules) {
      const lessons = Array.isArray(mod.lessons)
        ? [...mod.lessons].sort((a, b) => a.order - b.order)
        : [];
      const assessments = Array.isArray(mod.assessments)
        ? [...mod.assessments].sort((a, b) => a.order - b.order)
        : [];

      for (const lesson of lessons) {
        items.push({
          key: buildItemKey('lesson', lesson.id),
          type: 'lesson',
          id: lesson.id,
          moduleId: mod.id,
          title: lesson.title,
          estimatedDurationMinutes: lesson.estimatedDurationMinutes ?? null,
        });
      }

      for (const assessment of assessments) {
        items.push({
          key: buildItemKey('assessment', assessment.id),
          type: 'assessment',
          id: assessment.id,
          moduleId: mod.id,
          title: assessment.title,
          assessmentKind: assessment.assessmentType === 'exam' ? 'exam' : 'quiz',
          estimatedDurationMinutes: assessment.estimatedDurationMinutes ?? null,
        });
      }
    }

    if (curriculum.finalExam) {
      items.push({
        key: buildItemKey('finalExam', curriculum.finalExam.id),
        type: 'finalExam',
        id: curriculum.finalExam.id,
        title: curriculum.finalExam.title,
        assessmentKind: 'final',
        estimatedDurationMinutes: curriculum.finalExam.estimatedDurationMinutes ?? null,
      });
    }

    return items;
  }, [curriculum]);

  const currentItem = useMemo(
    () => (selectedKey ? flatItems.find((item) => item.key === selectedKey) || null : null),
    [flatItems, selectedKey],
  );

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
      if (Array.isArray(mod.lessons)) {
        lessonsCount += mod.lessons.length;
      }
      if (Array.isArray(mod.assessments)) {
        for (const a of mod.assessments) {
          if (a.assessmentType === 'quiz') quizzesCount += 1;
          if (a.assessmentType === 'exam') examsCount += 1;
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

  const currentIndex = currentItem
    ? flatItems.findIndex((item) => item.key === currentItem.key)
    : -1;
  const previousItem = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;
  const totalItems = flatItems.length;
  const completedItems = currentIndex >= 0 ? currentIndex + 1 : 0;
  const progressPercent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleToggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    );
  };

  const handleSelectItem = (item: PlayerItem) => {
    setSelectedKey(item.key);
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
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="h-16 flex items-center justify-between px-[10px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="space-y-1">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <aside className="hidden lg:flex w-96 bg-white shadow-sm max-h-screen">
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3">
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-10 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col bg-gray-50">
            <div className="w-full bg-black flex items-center justify-center">
              <div className="w-full max-w-5xl aspect-video bg-gray-900" />
            </div>
            <div className="flex-1 min-h-0">
              <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <div className="h-6 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-200 rounded" />
                <div className="space-y-3">
                  <div className="h-24 bg-gray-100 rounded-lg" />
                  <div className="h-24 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !course) {
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

  const hasMaterials = Array.isArray(course.courseMaterials) && course.courseMaterials.length > 0;

  return (
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
                {course.title}
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate">
                {currentItem ? currentItem.title : 'Select a learning item'}
              </span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            {totalItems > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">
                  {completedItems}/{totalItems} learning items
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
              className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col h-[80vh] ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
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
                  <span className="text-xs font-medium text-gray-500">
                    {completedItems}/{totalItems} items completed
                  </span>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-700">
                    {formatEnrollmentStatus(enrollmentStatus)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0056d2] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
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
                />
              </div>
            </div>
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
          />
        </aside>

        <main className="flex-1 flex flex-col bg-[#f5f5f7] min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {currentTypeLabel ?? 'Learning activity'}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
                    {currentItem ? currentItem.title : course.title}
                  </h1>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#0056d2] hover:underline"
                  >
                    Review learning objectives
                  </button>
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
                  <button
                    type="button"
                    disabled={!previousItem}
                    onClick={() => previousItem && setSelectedKey(previousItem.key)}
                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fa fa-chevron-left mr-2" />
                    Previous item
                  </button>
                  <button
                    type="button"
                    disabled={!nextItem}
                    onClick={() => nextItem && setSelectedKey(nextItem.key)}
                    className="inline-flex items-center rounded-full bg-[#0056d2] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0041a8] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go to next item
                    <i className="fa fa-arrow-right ml-2" />
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-[#f5f7ff] rounded-xl border border-[#d6dcff] p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Activity overview
                  </h3>
                  <p className="text-sm text-gray-700">
                    {currentItem ? (
                      currentTypeLabel === 'Final Exam' || currentTypeLabel === 'Exam' ? (
                        <>
                          This assessment evaluates your understanding of the course outcomes. Make
                          sure you have completed all required lessons before attempting this
                          activity.
                        </>
                      ) : currentTypeLabel === 'Quiz' ? (
                        <>
                          This quiz helps you check your understanding of the topics covered in
                          this module. You can use it as a self-check before moving forward.
                        </>
                      ) : (
                        <>
                          This learning activity focuses on the key concepts for this part of the
                          course. Follow along with the training content and review any attached
                          materials.
                        </>
                      )
                    ) : (
                      <>
                        Select a lesson or assessment from the curriculum to see its details and
                        available resources.
                      </>
                    )}
                  </p>
                </div>

                {hasMaterials && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Course materials
                    </h3>
                    <ul className="space-y-3">
                      {course.courseMaterials!.map((material) => (
                        <li
                          key={material.id}
                          className="flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {material.title}
                            </div>
                            {material.description && (
                              <p className="mt-1 text-xs text-gray-500">
                                {material.description}
                              </p>
                            )}
                            {material.externalUrl && (
                              <a
                                href={material.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center text-xs font-medium text-[#0056d2] hover:underline"
                              >
                                Open external resource
                                <i className="fa fa-external-link-alt ml-1" />
                              </a>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                              {material.materialSource === 'external' ? 'External link' : 'Media'}
                            </div>
                            {Array.isArray(material.media) && material.media.length > 0 && (
                              <div className="mt-1 text-[10px] text-gray-400">
                                {material.media.length} file
                                {material.media.length === 1 ? '' : 's'}
                              </div>
                            )}
                            {material.isRequired && (
                              <div className="mt-1 text-[10px] text-amber-600">
                                Required
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-3">
            Course Curriculum
          </p>
          {curriculum && Array.isArray(curriculum.modules) && curriculum.modules.length > 0 ? (
            <div className="space-y-2">
              {curriculum.modules
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((mod, index) => {
                  const lessonCount = Array.isArray(mod.lessons) ? mod.lessons.length : 0;
                  const assessmentCount = Array.isArray(mod.assessments)
                    ? mod.assessments.length
                    : 0;
                  const hasAnyItem = lessonCount + assessmentCount > 0;
                  const firstItem =
                    flatItems.find((item) => item.moduleId === mod.id) ?? null;

                  return (
                    <button
                      type="button"
                      key={mod.id}
                      onClick={() => firstItem && setSelectedKey(firstItem.key)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 text-sm flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium text-gray-900">
                            {mod.title}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                            {assessmentCount > 0 ? (
                              <>
                                {' • '}
                                {assessmentCount} assessment
                                {assessmentCount === 1 ? '' : 's'}
                              </>
                            ) : null}
                          </span>
                        </div>
                      </div>
                      <span className="ml-3 text-[11px] text-gray-400">
                        {hasAnyItem ? 'Open' : 'Coming soon'}
                      </span>
                    </button>
                  );
                })}

              {curriculum.finalExam && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedKey(buildItemKey('finalExam', curriculum.finalExam!.id))
                  }
                  className="w-full text-left px-3 py-2 rounded-lg bg-white border border-[#0056d2]/30 text-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0056d2]/10 text-[11px] font-semibold text-[#0056d2]">
                      FE
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold tracking-wide uppercase text-[#0056d2]">
                        Final Assessment
                      </span>
                      <span className="truncate font-medium text-gray-900">
                        {curriculum.finalExam.title}
                      </span>
                    </div>
                  </div>
                  {curriculum.finalExam.estimatedDurationMinutes ? (
                    <span className="text-[11px] text-gray-600">
                      {curriculum.finalExam.estimatedDurationMinutes} min
                    </span>
                  ) : null}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Curriculum will be displayed here once modules and lessons are added for this course.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
