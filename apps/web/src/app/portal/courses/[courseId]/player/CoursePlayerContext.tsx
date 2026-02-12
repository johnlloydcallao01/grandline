'use client';

import React, { createContext, useContext } from 'react';
import type { CourseWithInstructor } from '@/types/course';
import type { PlayerItem } from '@/types/player';

interface CoursePlayerContextType {
  course: CourseWithInstructor | null;
  loading: boolean;
  error: string | null;
  enrollmentStatus: string | null;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
  expandedModules: string[];
  setExpandedModules: React.Dispatch<React.SetStateAction<string[]>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  flatItems: PlayerItem[];
  handleToggleModule: (moduleId: string) => void;
  handleSelectItem: (item: PlayerItem) => void;
  moduleTitleMap: Record<string, string>;
  formatEnrollmentStatus: (status: string | null) => string | null;
  progressPercent: number;
  totalItems: number;
  completedItems: number;
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalExams: number;
  completedLessonIds: string[];
  attemptCounts: Record<string, number>;
  submissionHistory: Record<string, any[]>;
  toggleLessonCompletion: (lessonId: string) => Promise<void>;
  startAssessment: (assessmentId: string) => Promise<{ submissionId: string; attemptNumber: number; isResumed?: boolean; savedAnswers?: Record<string, any> } | null>;
  saveAssessmentAnswer: (submissionId: string, questionId: string, response: any, questionType: string) => Promise<void>;
  submitAssessment: (submissionId: string, answers?: Record<string, any>) => Promise<{ score: number; passed: boolean } | null>;
}

const CoursePlayerContext = createContext<CoursePlayerContextType | undefined>(undefined);

export function useCoursePlayer() {
  const context = useContext(CoursePlayerContext);
  if (!context) {
    throw new Error('useCoursePlayer must be used within a CoursePlayerProvider');
  }
  return context;
}

export const CoursePlayerProvider = CoursePlayerContext.Provider;
