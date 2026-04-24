/**
 * @file apps/web/src/types/dashboard.ts
 * @description Type definitions for the Trainee Dashboard
 */

export interface TraineeDashboardSummary {
  success: boolean;
  data: {
    trainee: {
      id: string;
      srn: string;
      currentLevel: string;
    };
    stats: {
      activeCoursesCount: number;
      completedCoursesCount: number;
      activeAvgGrade: number;
      certificatesCount: number;
    };
    hero: {
      continueLearning: {
        id: string;
        status: string;
        lastAccessedAt: string;
        itemType: string;
        itemId: string;
      } | null;
    };
    myCourses: {
      id: string;
      status: string;
      progressPercentage: number;
      lastAccessedAt: string;
      courseId: string;
      courseTitle: string;
      courseCode: string;
      thumbnailUrl: string | null;
    }[];
    pendingWork: {
      id: string;
      status: string;
      type: 'assignment';
      title: string;
      dueDate: string;
    }[];
    recentScores: {
      id: string;
      score: number;
      status: string;
      completedAt: string;
      passingScoreSnapshot: number;
      title: string;
      assessmentType: string;
    }[];
    certificates: {
      id: string;
      certificateCode: string;
      issueDate: string;
      verificationUrl: string;
      fileUrl: string | null;
      courseTitle: string | null;
    }[];
    announcements: {
      id: string;
      title: string;
      pinned: boolean;
      createdAt: string;
      courseId: string;
    }[];
  };
  meta: {
    timestamp: string;
    requestId: string;
    responseTimeMs: number;
  };
}
