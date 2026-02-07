export type PlayerItemType = 'lesson' | 'assessment' | 'finalExam';

export interface PlayerItem {
  key: string;
  type: PlayerItemType;
  id: string;
  moduleId?: string;
  title: string;
  assessmentKind?: 'quiz' | 'exam' | 'final';
  estimatedDurationMinutes?: number | null;
  content?: any; // Rich text content for lessons
  assessmentDetails?: {
    passingScore?: number | null;
    timeLimitMinutes?: number | null;
    maxAttempts?: number | null;
    questionsCount?: number;
    questions?: any[];
    showCorrectAnswer?: boolean;
  };
}
