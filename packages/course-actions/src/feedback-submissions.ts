/**
 * @encreasl/course-actions - Shared feedback submission service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/feedback-submissions/admin and the instructor scope uses
 * /lms/feedback-submissions/instructor.
 */

import {
  cmsFetch,
  type FeedbackFormOption,
  type FeedbackListFilters,
  type FeedbackListResult,
  type FeedbackSubmissionDoc,
} from '@encreasl/cms-types';

export type FeedbackSubmissionScope = 'admin' | 'instructor';

export interface FeedbackSubmissionServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: FeedbackSubmissionScope;
}

export interface FeedbackSubmissionService {
  getSubmissions(filters: FeedbackListFilters, userId?: string): Promise<FeedbackListResult>;
  getSubmission(id: number, userId?: string): Promise<FeedbackSubmissionDoc>;
  getFormOptions(userId?: string): Promise<FeedbackFormOption[]>;
  deleteSubmission(id: number): Promise<void>;
}

export function createFeedbackSubmissionService(
  config: FeedbackSubmissionServiceConfig,
): FeedbackSubmissionService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath =
    scope === 'admin' ? '/lms/feedback-submissions/admin' : '/lms/feedback-submissions/instructor';

  return {
    async getSubmissions(filters: FeedbackListFilters = {}, userId?: string): Promise<FeedbackListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.formId) params.formId = filters.formId;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      if (userId) params.userId = userId;
      return cmsFetch<FeedbackListResult>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
    },

    async getSubmission(id: number, userId?: string): Promise<FeedbackSubmissionDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ submission: FeedbackSubmissionDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.submission;
    },

    async getFormOptions(userId?: string): Promise<FeedbackFormOption[]> {
      const params: Record<string, string> = { formOptions: '1' };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ docs: FeedbackFormOption[] }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.docs || [];
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
  FeedbackFormOption,
  FeedbackListFilters,
  FeedbackListResult,
  FeedbackSubmissionDoc,
};