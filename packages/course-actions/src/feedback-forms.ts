/**
 * @encreasl/course-actions - Shared feedback form service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/feedback-forms/admin and the instructor scope uses
 * /lms/feedback-forms/instructor.
 */

import {
  cmsFetch,
  type FeedbackFormDoc,
  type FeedbackFormPayload,
  type FeedbackFormsListFilters,
  type FeedbackFormsListResult,
} from '@encreasl/cms-types';

export type FeedbackFormsScope = 'admin' | 'instructor';

export interface FeedbackFormsServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: FeedbackFormsScope;
}

export interface FeedbackFormsService {
  getForms(filters: FeedbackFormsListFilters, userId?: string): Promise<FeedbackFormsListResult>;
  getForm(id: number | string, userId?: string): Promise<FeedbackFormDoc>;
  createForm(payload: FeedbackFormPayload): Promise<FeedbackFormDoc>;
  updateForm(id: number | string, payload: FeedbackFormPayload): Promise<FeedbackFormDoc>;
  deleteForm(id: number | string): Promise<void>;
}

function assertAdminScope(scope: FeedbackFormsScope) {
  if (scope !== 'admin') {
    throw new Error('This operation is only available for the admin scope');
  }
}

export function createFeedbackFormsService(
  config: FeedbackFormsServiceConfig,
): FeedbackFormsService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath =
    scope === 'admin' ? '/lms/feedback-forms/admin' : '/lms/feedback-forms/instructor';

  return {
    async getForms(filters: FeedbackFormsListFilters = {}, userId?: string): Promise<FeedbackFormsListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (userId) params.userId = userId;
      return cmsFetch<FeedbackFormsListResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async getForm(id: number | string, userId?: string): Promise<FeedbackFormDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ form: FeedbackFormDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.form;
    },

    async createForm(payload: FeedbackFormPayload): Promise<FeedbackFormDoc> {
      assertAdminScope(scope);
      const data = await cmsFetch<{ form: FeedbackFormDoc }>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data.form;
    },

    async updateForm(id: number | string, payload: FeedbackFormPayload): Promise<FeedbackFormDoc> {
      assertAdminScope(scope);
      const data = await cmsFetch<{ form: FeedbackFormDoc }>(
        apiKey,
        cmsUrl,
        `${basePath}?id=${encodeURIComponent(String(id))}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );
      return data.form;
    },

    async deleteForm(id: number | string): Promise<void> {
      assertAdminScope(scope);
      await cmsFetch(apiKey, cmsUrl, `${basePath}?id=${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      });
    },
  };
}

export type {
  FeedbackFormDoc,
  FeedbackFormPayload,
  FeedbackFormsListFilters,
  FeedbackFormsListResult,
};