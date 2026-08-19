/**
 * @encreasl/course-actions - Shared assessment service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries and,
 * for the instructor scope, the context resolution and ownership checks
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/assessments/admin and the instructor scope uses
 * /lms/assessments/instructor. Question options are fetched through the
 * scope-matched /lms/questions/admin or /lms/questions/instructor endpoint.
 */

import {
  cmsFetch,
  type AssessmentCourseOption,
  type AssessmentDoc,
  type AssessmentEditData,
  type AssessmentListFilters,
  type AssessmentListResult,
  type AssessmentModuleOption,
  type AssessmentQuestionOption,
  type CreateAssessmentInput,
} from '@encreasl/cms-types';

export type AssessmentScope = 'admin' | 'instructor';

export interface AssessmentServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: AssessmentScope;
}

export interface AssessmentService {
  getAssessments(filters?: AssessmentListFilters, userId?: string): Promise<AssessmentListResult>;
  getAssessmentEditData(id: string, userId?: string): Promise<AssessmentEditData>;
  createAssessment(input: CreateAssessmentInput, userId?: string): Promise<AssessmentDoc>;
  updateAssessment(id: string, data: Record<string, unknown>, userId?: string): Promise<AssessmentDoc>;
  deleteAssessment(id: string, userId?: string): Promise<void>;
  getQuestions(params?: { search?: string; limit?: number }, userId?: string): Promise<AssessmentQuestionOption[]>;
}

function buildListParams(filters: AssessmentListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.assessmentType) params.assessmentType = filters.assessmentType;
  if (filters.moduleId) params.moduleId = filters.moduleId;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

export function createAssessmentService(config: AssessmentServiceConfig): AssessmentService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/assessments/admin' : '/lms/assessments/instructor';

  return {
    async getAssessments(filters = {}, userId): Promise<AssessmentListResult> {
      return cmsFetch<AssessmentListResult>(apiKey, cmsUrl, basePath, {
        params: buildListParams(filters, userId),
        cache: 'no-store',
      });
    },

    async getAssessmentEditData(id, userId): Promise<AssessmentEditData> {
      const params: Record<string, string> = { assessmentId: id };
      if (userId) params.userId = userId;
      return cmsFetch<AssessmentEditData>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
    },

    async createAssessment(input, userId): Promise<AssessmentDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<AssessmentDoc>(apiKey, cmsUrl, basePath, {
          method: 'POST',
          body: JSON.stringify({ userId, data: input }),
        });
      }
      return cmsFetch<AssessmentDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateAssessment(id, data, userId): Promise<AssessmentDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<AssessmentDoc>(apiKey, cmsUrl, basePath, {
          method: 'PATCH',
          body: JSON.stringify({ userId, id, data }),
        });
      }
      return cmsFetch<AssessmentDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteAssessment(id, userId): Promise<void> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, `${basePath}?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },

    async getQuestions(params = {}, userId): Promise<AssessmentQuestionOption[]> {
      const qs: Record<string, string> = { sort: 'prompt' };
      if (params.search) qs.search = params.search;
      if (params.limit) qs.limit = String(params.limit);
      if (userId) qs.userId = userId;
      const questionsPath = scope === 'admin' ? '/lms/questions/admin' : '/lms/questions/instructor';
      const data = await cmsFetch<{ docs: Array<Record<string, unknown>> }>(
        apiKey,
        cmsUrl,
        questionsPath,
        {
          params: qs,
          cache: 'no-store',
        },
      );
      return (data.docs || []).map((q) => ({
        id: String(q.id),
        prompt: String(q.prompt),
        type: (q.type as AssessmentQuestionOption['type']) || 'single_choice',
        difficulty: (q.difficulty as AssessmentQuestionOption['difficulty']) || 'easy',
      }));
    },
  };
}

export type {
  AssessmentDoc,
  AssessmentListResult,
  AssessmentModuleOption,
  AssessmentCourseOption,
  AssessmentQuestionOption,
  CreateAssessmentInput,
  AssessmentEditData,
  AssessmentListFilters,
};
