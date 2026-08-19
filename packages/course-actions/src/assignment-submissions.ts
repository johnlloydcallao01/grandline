/**
 * @encreasl/course-actions - Shared assignment submission service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/assignment-submissions/admin and the instructor scope uses
 * /lms/assignment-submissions/instructor.
 */

import {
  cmsFetch,
  type AssignmentSubmissionDoc,
  type AssignmentSubmissionListFilters,
  type AssignmentSubmissionListResult,
  type GradeAssignmentInput,
  type SubmissionCourseOption,
} from '@encreasl/cms-types';

export type AssignmentSubmissionScope = 'admin' | 'instructor';

export interface AssignmentSubmissionServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: AssignmentSubmissionScope;
}

export interface AssignmentSubmissionService {
  getSubmissions(
    filters: AssignmentSubmissionListFilters,
    userId?: string,
  ): Promise<AssignmentSubmissionListResult>;
  getSubmission(id: number, userId?: string): Promise<AssignmentSubmissionDoc>;
  getCourseOptions(userId?: string): Promise<SubmissionCourseOption[]>;
  gradeSubmission(input: GradeAssignmentInput, userId?: string): Promise<AssignmentSubmissionDoc>;
  deleteSubmission(id: number): Promise<void>;
}

export function createAssignmentSubmissionService(
  config: AssignmentSubmissionServiceConfig,
): AssignmentSubmissionService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath =
    scope === 'admin' ? '/lms/assignment-submissions/admin' : '/lms/assignment-submissions/instructor';

  return {
    async getSubmissions(
      filters: AssignmentSubmissionListFilters = {},
      userId?: string,
    ): Promise<AssignmentSubmissionListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      if (userId) params.userId = userId;
      return cmsFetch<AssignmentSubmissionListResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async getSubmission(id: number, userId?: string): Promise<AssignmentSubmissionDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ submission: AssignmentSubmissionDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.submission;
    },

    async getCourseOptions(userId?: string): Promise<SubmissionCourseOption[]> {
      if (scope !== 'instructor') {
        throw new Error('getCourseOptions is only available for the instructor scope');
      }
      const params: Record<string, string> = { courseOptions: '1' };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ docs: SubmissionCourseOption[] }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.docs || [];
    },

    async gradeSubmission(
      input: GradeAssignmentInput,
      userId?: string,
    ): Promise<AssignmentSubmissionDoc> {
      if (scope !== 'instructor') {
        throw new Error('gradeSubmission is only available for the instructor scope');
      }
      const body: Record<string, unknown> = { id: input.id, status: input.status };
      if (input.score !== undefined) body.score = input.score;
      if (input.feedback !== undefined) body.feedback = input.feedback;
      if (userId) body.userId = userId;
      const data = await cmsFetch<{ submission: AssignmentSubmissionDoc }>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      return data.submission;
    },

    async deleteSubmission(id: number): Promise<void> {
      if (scope !== 'admin') {
        throw new Error('deleteSubmission is only available for the admin scope');
      }
      await cmsFetch(apiKey, cmsUrl, `${basePath}?id=${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      });
    },
  };
}

export type {
  AssignmentSubmissionDoc,
  AssignmentSubmissionListFilters,
  AssignmentSubmissionListResult,
  GradeAssignmentInput,
  SubmissionCourseOption,
};