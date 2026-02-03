export type PlayerItemType = 'lesson' | 'assessment' | 'finalExam';

export interface PlayerItem {
  key: string;
  type: PlayerItemType;
  id: string;
  moduleId?: string;
  title: string;
  assessmentKind?: 'quiz' | 'exam' | 'final';
  estimatedDurationMinutes?: number | null;
}
