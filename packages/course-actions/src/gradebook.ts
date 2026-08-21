/**
 * @encreasl/course-actions - Shared gradebook service
 *
 * One factory used by both web-admin and web-instructor.
 *
 * Admin scope: full gradebook domain (courses with stats, enrollments CRUD,
 * recent activity, trainee lists and overviews, grade-scale CRUD) via
 * /lms/gradebook/admin. The backend owns the query logic, normalization, and
 * email resolution (see docs/fetching-solution.md).
 *
 * Instructor scope: read-only, course-scoped gradebook views
 * (/lms/gradebook/instructor/*). The backend resolves the instructor profile
 * from the signed-in userId, scopes all queries to the instructor's owned and
 * co-taught courses, and prepares one response per page.
 */

import {
  cmsFetch,
  type CreateGradeScaleInput,
  type CreateGradebookEnrollmentInput,
  type GradebookActivityCourseOption,
  type GradebookCourseDoc,
  type GradebookCourseListResult,
  type GradebookCourseWithStats,
  type GradebookData,
  type GradebookEnrollmentDoc,
  type GradebookEnrollmentFilters,
  type GradebookEnrollmentListResult,
  type GradebookRecentActivityFilters,
  type GradebookRecentActivityResult,
  type GradebookTraineeListResult,
  type GradeSetupData,
  type GradeScaleDoc,
  type GradeScaleListResult,
  type InstructorStudentOverviewData,
  type InstructorStudentOverviewFilters,
  type StudentOverviewData,
  type UpdateGradeScaleInput,
} from '@encreasl/cms-types';

export type GradebookScope = 'admin' | 'instructor';

export interface GradebookServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: GradebookScope;
}

export interface GradebookTraineeFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GradebookService {
  // Admin scope
  getCoursesWithStats(): Promise<GradebookCourseWithStats[]>;
  getCourses(): Promise<GradebookCourseListResult>;
  getEnrollments(filters?: GradebookEnrollmentFilters): Promise<GradebookEnrollmentListResult>;
  getEnrollmentById(id: number | string): Promise<GradebookEnrollmentDoc>;
  updateEnrollment(id: number | string, data: Record<string, any>): Promise<GradebookEnrollmentDoc>;
  deleteEnrollment(id: number | string): Promise<void>;
  createEnrollment(input: CreateGradebookEnrollmentInput): Promise<GradebookEnrollmentDoc>;
  getRecentActivity(filters?: GradebookRecentActivityFilters): Promise<GradebookRecentActivityResult>;
  getTrainees(filters?: GradebookTraineeFilters): Promise<GradebookTraineeListResult>;
  getStudentOverview(traineeId: number | string): Promise<StudentOverviewData>;
  getGradeScales(): Promise<GradeScaleListResult>;
  createGradeScale(input: CreateGradeScaleInput): Promise<GradeScaleDoc>;
  updateGradeScale(id: number | string, data: UpdateGradeScaleInput): Promise<GradeScaleDoc>;
  deleteGradeScale(id: number | string): Promise<void>;

  // Instructor scope
  getGradebookData(courseId: number | undefined, userId: string): Promise<GradebookData>;
  getGradeSetupReference(userId: string): Promise<GradeSetupData>;
  getInstructorStudentOverview(
    filters: InstructorStudentOverviewFilters,
    userId: string,
  ): Promise<InstructorStudentOverviewData>;
  getInstructorRecentActivity(
    filters: GradebookRecentActivityFilters,
    userId: string,
  ): Promise<GradebookRecentActivityResult>;
}

export function createGradebookService(config: GradebookServiceConfig): GradebookService {
  const { apiKey, cmsUrl, scope } = config;
  const adminPath = '/lms/gradebook/admin';
  const instructorPath = '/lms/gradebook/instructor';

  function assertAdmin(method: string): void {
    if (scope !== 'admin') {
      throw new Error(`${method} is only available for the admin scope`);
    }
  }

  function assertInstructor(method: string): void {
    if (scope !== 'instructor') {
      throw new Error(`${method} is only available for the instructor scope`);
    }
  }

  function buildActivityParams(filters: GradebookRecentActivityFilters, userId?: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    if (filters.type) params.type = filters.type;
    if (filters.courseId != null) params.courseId = String(filters.courseId);
    if (filters.search) params.search = filters.search;
    return params;
  }

  return {
    // ===== Admin: courses =====
    async getCoursesWithStats(): Promise<GradebookCourseWithStats[]> {
      assertAdmin('getCoursesWithStats');
      const data = await cmsFetch<{ courses: GradebookCourseWithStats[] }>(apiKey, cmsUrl, `${adminPath}/courses`, {
        params: { withStats: '1' },
        cache: 'no-store',
      });
      return data.courses;
    },

    async getCourses(): Promise<GradebookCourseListResult> {
      assertAdmin('getCourses');
      return cmsFetch<GradebookCourseListResult>(apiKey, cmsUrl, `${adminPath}/courses`, {
        cache: 'no-store',
      });
    },

    // ===== Admin: enrollments =====
    async getEnrollments(filters: GradebookEnrollmentFilters = {}): Promise<GradebookEnrollmentListResult> {
      assertAdmin('getEnrollments');
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.courseId) params.courseId = String(filters.courseId);
      if (filters.status) params.status = filters.status;
      return cmsFetch<GradebookEnrollmentListResult>(apiKey, cmsUrl, `${adminPath}/enrollments`, {
        params,
        cache: 'no-store',
      });
    },

    async getEnrollmentById(id: number | string): Promise<GradebookEnrollmentDoc> {
      assertAdmin('getEnrollmentById');
      const data = await cmsFetch<{ enrollment: GradebookEnrollmentDoc }>(
        apiKey,
        cmsUrl,
        `${adminPath}/enrollments`,
        { params: { id: String(id) }, cache: 'no-store' },
      );
      return data.enrollment;
    },

    async updateEnrollment(id: number | string, data: Record<string, any>): Promise<GradebookEnrollmentDoc> {
      assertAdmin('updateEnrollment');
      return cmsFetch<GradebookEnrollmentDoc>(apiKey, cmsUrl, `${adminPath}/enrollments`, {
        method: 'PATCH',
        body: JSON.stringify({ id: String(id), data }),
      });
    },

    async deleteEnrollment(id: number | string): Promise<void> {
      assertAdmin('deleteEnrollment');
      const params: Record<string, string> = { id: String(id) };
      await cmsFetch(apiKey, cmsUrl, `${adminPath}/enrollments?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },

    async createEnrollment(input: CreateGradebookEnrollmentInput): Promise<GradebookEnrollmentDoc> {
      assertAdmin('createEnrollment');
      return cmsFetch<GradebookEnrollmentDoc>(apiKey, cmsUrl, `${adminPath}/enrollments`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    // ===== Admin: activity =====
    async getRecentActivity(filters: GradebookRecentActivityFilters = {}): Promise<GradebookRecentActivityResult> {
      assertAdmin('getRecentActivity');
      return cmsFetch<GradebookRecentActivityResult>(apiKey, cmsUrl, `${adminPath}/activity`, {
        params: buildActivityParams(filters),
        cache: 'no-store',
      });
    },

    // ===== Admin: trainees =====
    async getTrainees(filters: GradebookTraineeFilters = {}): Promise<GradebookTraineeListResult> {
      assertAdmin('getTrainees');
      const params: Record<string, string> = {};
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.search) params.search = filters.search;
      return cmsFetch<GradebookTraineeListResult>(apiKey, cmsUrl, `${adminPath}/trainees`, {
        params,
        cache: 'no-store',
      });
    },

    async getStudentOverview(traineeId: number | string): Promise<StudentOverviewData> {
      assertAdmin('getStudentOverview');
      const data = await cmsFetch<{ overview: StudentOverviewData }>(
        apiKey,
        cmsUrl,
        `${adminPath}/trainees`,
        { params: { overviewId: String(traineeId) }, cache: 'no-store' },
      );
      return data.overview;
    },

    // ===== Admin: grade scales =====
    async getGradeScales(): Promise<GradeScaleListResult> {
      assertAdmin('getGradeScales');
      return cmsFetch<GradeScaleListResult>(apiKey, cmsUrl, `${adminPath}/grade-scales`, {
        cache: 'no-store',
      });
    },

    async createGradeScale(input: CreateGradeScaleInput): Promise<GradeScaleDoc> {
      assertAdmin('createGradeScale');
      return cmsFetch<GradeScaleDoc>(apiKey, cmsUrl, `${adminPath}/grade-scales`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateGradeScale(id: number | string, data: UpdateGradeScaleInput): Promise<GradeScaleDoc> {
      assertAdmin('updateGradeScale');
      return cmsFetch<GradeScaleDoc>(apiKey, cmsUrl, `${adminPath}/grade-scales`, {
        method: 'PATCH',
        body: JSON.stringify({ id: String(id), data }),
      });
    },

    async deleteGradeScale(id: number | string): Promise<void> {
      assertAdmin('deleteGradeScale');
      const params: Record<string, string> = { id: String(id) };
      await cmsFetch(apiKey, cmsUrl, `${adminPath}/grade-scales?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },

    // ===== Instructor =====
    async getGradebookData(courseId: number | undefined, userId: string): Promise<GradebookData> {
      assertInstructor('getGradebookData');
      const params: Record<string, string> = { userId };
      if (courseId != null) params.courseId = String(courseId);
      return cmsFetch<GradebookData>(apiKey, cmsUrl, instructorPath, {
        params,
        cache: 'no-store',
      });
    },

    async getGradeSetupReference(userId: string): Promise<GradeSetupData> {
      assertInstructor('getGradeSetupReference');
      return cmsFetch<GradeSetupData>(apiKey, cmsUrl, `${instructorPath}/grade-setup`, {
        params: { userId },
        cache: 'no-store',
      });
    },

    async getInstructorStudentOverview(
      filters: InstructorStudentOverviewFilters,
      userId: string,
    ): Promise<InstructorStudentOverviewData> {
      assertInstructor('getInstructorStudentOverview');
      const params: Record<string, string> = { userId };
      if (filters.search) params.search = filters.search;
      if (filters.courseId != null) params.courseId = String(filters.courseId);
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      return cmsFetch<InstructorStudentOverviewData>(apiKey, cmsUrl, `${instructorPath}/student-overview`, {
        params,
        cache: 'no-store',
      });
    },

    async getInstructorRecentActivity(
      filters: GradebookRecentActivityFilters,
      userId: string,
    ): Promise<GradebookRecentActivityResult> {
      assertInstructor('getInstructorRecentActivity');
      return cmsFetch<GradebookRecentActivityResult>(apiKey, cmsUrl, `${instructorPath}/activity`, {
        params: buildActivityParams(filters, userId),
        cache: 'no-store',
      });
    },
  };
}

export type {
  CreateGradeScaleInput,
  CreateGradebookEnrollmentInput,
  GradebookActivityCourseOption,
  GradebookCourseDoc,
  GradebookCourseListResult,
  GradebookCourseWithStats,
  GradebookData,
  GradebookEnrollmentDoc,
  GradebookEnrollmentFilters,
  GradebookEnrollmentListResult,
  GradebookRecentActivityFilters,
  GradebookRecentActivityResult,
  GradebookTraineeListResult,
  GradeSetupData,
  GradeScaleDoc,
  GradeScaleListResult,
  InstructorStudentOverviewData,
  InstructorStudentOverviewFilters,
  StudentOverviewData,
  UpdateGradeScaleInput,
};
