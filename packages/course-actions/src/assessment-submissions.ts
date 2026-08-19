/**
 * @encreasl/course-actions - Shared assessment submission service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/assessment-submissions/admin and the instructor scope uses
 * /lms/assessment-submissions/instructor.
 */

import {
  cmsFetch,
  type AssessmentSubmissionDoc,
  type SubmissionAnswerDoc,
  type SubmissionCourseOption,
  type SubmissionListFilters,
  type SubmissionListResult,
} from '@encreasl/cms-types';

export type AssessmentSubmissionScope = 'admin' | 'instructor';

export interface AssessmentSubmissionServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: AssessmentSubmissionScope;
}

export interface AssessmentSubmissionService {
  getSubmissions(filters: SubmissionListFilters, userId?: string): Promise<SubmissionListResult>;
  getSubmission(id: number, userId?: string): Promise<AssessmentSubmissionDoc>;
  getAnswers(submissionId: number, userId?: string): Promise<SubmissionAnswerDoc[]>;
  getCourseOptions(userId?: string): Promise<SubmissionCourseOption[]>;
  deleteSubmission(id: number): Promise<void>;
}

export function createAssessmentSubmissionService(
  config: AssessmentSubmissionServiceConfig,
): AssessmentSubmissionService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/assessment-submissions/admin' : '/lms/assessment-submissions/instructor';

  return {
    async getSubmissions(filters: SubmissionListFilters = {}, userId?: string): Promise<SubmissionListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      if (userId) params.userId = userId;
      return cmsFetch<SubmissionListResult>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
    },

    async getSubmission(id: number, userId?: string): Promise<AssessmentSubmissionDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ submission: AssessmentSubmissionDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.submission;
    },

    async getAnswers(submissionId: number, userId?: string): Promise<SubmissionAnswerDoc[]> {
      const params: Record<string, string> = { answersFor: String(submissionId) };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ answers: SubmissionAnswerDoc[] }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.answers || [];
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

    async deleteSubmission(id: number): Promise<void> {
      if (scope !== 'admin') {
        throw new Error('deleteSubmission is only available for the admin scope');
      }
      await cmsFetch(apiKey, cmsUrl, `${basePath}?id=${encodeURIComponent(String(id))}`, { method: 'DELETE' });
    },
  };
}

export type {
  AssessmentSubmissionDoc,
  SubmissionAnswerDoc,
  SubmissionCourseOption,
  SubmissionListFilters,
  SubmissionListResult,
};