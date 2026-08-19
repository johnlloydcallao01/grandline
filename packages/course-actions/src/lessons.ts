/**
 * @encreasl/course-actions - Shared lesson service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries and,
 * for the instructor scope, the context resolution and ownership checks
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/course-lessons/admin and the instructor scope uses
 * /lms/course-lessons/instructor.
 */

import {
  cmsFetch,
  type CreateLessonInput,
  type LessonDoc,
  type LessonEditData,
  type LessonListFilters,
  type LessonListResult,
  type LessonModuleOption,
} from '@encreasl/cms-types';

export type LessonScope = 'admin' | 'instructor';

export interface LessonServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: LessonScope;
}

export interface LessonService {
  getLessons(filters?: LessonListFilters, userId?: string): Promise<LessonListResult>;
  getLessonEditData(id: string, userId?: string): Promise<LessonEditData>;
  createLesson(input: CreateLessonInput, userId?: string): Promise<LessonDoc>;
  updateLesson(id: string, data: Record<string, unknown>, userId?: string): Promise<LessonDoc>;
  deleteLesson(id: string, userId?: string): Promise<void>;
  getModuleOptions(userId?: string): Promise<LessonModuleOption[]>;
}

function buildListParams(filters: LessonListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.moduleId) params.moduleId = filters.moduleId;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

export function createLessonService(config: LessonServiceConfig): LessonService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/course-lessons/admin' : '/lms/course-lessons/instructor';

  return {
    async getLessons(filters = {}, userId): Promise<LessonListResult> {
      return cmsFetch<LessonListResult>(apiKey, cmsUrl, basePath, {
        params: buildListParams(filters, userId),
        cache: 'no-store',
      });
    },

    async getLessonEditData(id, userId): Promise<LessonEditData> {
      const params: Record<string, string> = { lessonId: id };
      if (userId) params.userId = userId;
      return cmsFetch<LessonEditData>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
    },

    async createLesson(input, userId): Promise<LessonDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<LessonDoc>(apiKey, cmsUrl, basePath, {
          method: 'POST',
          body: JSON.stringify({ userId, data: input }),
        });
      }
      return cmsFetch<LessonDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateLesson(id, data, userId): Promise<LessonDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<LessonDoc>(apiKey, cmsUrl, basePath, {
          method: 'PATCH',
          body: JSON.stringify({ userId, id, data }),
        });
      }
      return cmsFetch<LessonDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteLesson(id, userId): Promise<void> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, `${basePath}?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },

    async getModuleOptions(userId): Promise<LessonModuleOption[]> {
      const params: Record<string, string> = { moduleOptions: '1' };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ moduleOptions: LessonModuleOption[] }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.moduleOptions || [];
    },
  };
}

export type { LessonDoc, LessonListResult, LessonModuleOption, CreateLessonInput, LessonEditData, LessonListFilters };