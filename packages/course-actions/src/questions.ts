/**
 * @encreasl/course-actions - Shared question bank service
 *
 * One factory used by both web-admin and web-instructor. The question bank is a
 * shared, unscoped pool (questions belong to no single instructor), so both
 * scopes hit dedicated endpoints: /lms/questions/admin and
 * /lms/questions/instructor. The backend owns the instructor context
 * resolution; the instructor scope only forwards the signed-in userId
 * (see docs/fetching-solution.md).
 *
 * All CRUD goes through the dedicated /lms/questions endpoints, which own the
 * query logic and data normalization.
 */

import {
  cmsFetch,
  type CreateQuestionInput,
  type QuestionDoc,
  type QuestionListFilters,
  type QuestionListResult,
  type UpdateQuestionInput,
} from '@encreasl/cms-types';

export type QuestionScope = 'admin' | 'instructor';

export interface QuestionServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: QuestionScope;
}

export interface QuestionService {
  getQuestions(filters?: QuestionListFilters, userId?: string): Promise<QuestionListResult>;
  getQuestionById(id: string, userId?: string): Promise<QuestionDoc>;
  createQuestion(input: CreateQuestionInput, userId?: string): Promise<QuestionDoc>;
  updateQuestion(id: string, data: UpdateQuestionInput, userId?: string): Promise<QuestionDoc>;
  deleteQuestion(id: string, userId?: string): Promise<void>;
}

function buildListParams(filters: QuestionListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.type) params.type = filters.type;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

export function createQuestionService(config: QuestionServiceConfig): QuestionService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/questions/admin' : '/lms/questions/instructor';

  return {
    async getQuestions(filters = {}, userId): Promise<QuestionListResult> {
      return cmsFetch<QuestionListResult>(apiKey, cmsUrl, basePath, {
        params: buildListParams(filters, userId),
        cache: 'no-store',
      });
    },

    async getQuestionById(id, userId): Promise<QuestionDoc> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ question: QuestionDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.question;
    },

    async createQuestion(input, userId): Promise<QuestionDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<QuestionDoc>(apiKey, cmsUrl, basePath, {
          method: 'POST',
          body: JSON.stringify({ userId, data: input }),
        });
      }
      return cmsFetch<QuestionDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateQuestion(id, data, userId): Promise<QuestionDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<QuestionDoc>(apiKey, cmsUrl, basePath, {
          method: 'PATCH',
          body: JSON.stringify({ userId, id, data }),
        });
      }
      return cmsFetch<QuestionDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteQuestion(id, userId): Promise<void> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, `${basePath}?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },
  };
}

export type {
  QuestionDoc,
  QuestionListResult,
  QuestionListFilters,
  CreateQuestionInput,
  UpdateQuestionInput,
};