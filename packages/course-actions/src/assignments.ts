/**
 * @encreasl/course-actions - Shared assignment service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries and,
 * for the instructor scope, the context resolution and ownership checks
 * (see docs/fetching-solution.md). The admin scope uses
 * /lms/assignments/admin and the instructor scope uses
 * /lms/assignments/instructor.
 */

import {
  cmsFetch,
  type AssignmentDoc,
  type AssignmentListFilters,
  type AssignmentListResult,
  type CreateAssignmentInput,
} from '@encreasl/cms-types';

export type AssignmentScope = 'admin' | 'instructor';

export interface AssignmentServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: AssignmentScope;
}

export interface AssignmentService {
  getAssignments(filters?: AssignmentListFilters, userId?: string): Promise<AssignmentListResult>;
  getAssignmentById(id: string, userId?: string): Promise<AssignmentDoc>;
  createAssignment(input: CreateAssignmentInput, userId?: string): Promise<AssignmentDoc>;
  updateAssignment(id: string, data: Record<string, unknown>, userId?: string): Promise<AssignmentDoc>;
  deleteAssignment(id: string, userId?: string): Promise<void>;
}

function buildListParams(filters: AssignmentListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.submissionType) params.submissionType = filters.submissionType;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

export function createAssignmentService(config: AssignmentServiceConfig): AssignmentService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/assignments/admin' : '/lms/assignments/instructor';

  return {
    async getAssignments(filters = {}, userId): Promise<AssignmentListResult> {
      return cmsFetch<AssignmentListResult>(apiKey, cmsUrl, basePath, {
        params: buildListParams(filters, userId),
        cache: 'no-store',
      });
    },

    async getAssignmentById(id, userId): Promise<AssignmentDoc> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ assignment: AssignmentDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.assignment;
    },

    async createAssignment(input, userId): Promise<AssignmentDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<AssignmentDoc>(apiKey, cmsUrl, basePath, {
          method: 'POST',
          body: JSON.stringify({ userId, data: input }),
        });
      }
      return cmsFetch<AssignmentDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateAssignment(id, data, userId): Promise<AssignmentDoc> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<AssignmentDoc>(apiKey, cmsUrl, basePath, {
          method: 'PATCH',
          body: JSON.stringify({ userId, id, data }),
        });
      }
      return cmsFetch<AssignmentDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteAssignment(id, userId): Promise<void> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, `${basePath}?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },
  };
}

export type {
  AssignmentDoc,
  AssignmentListFilters,
  AssignmentListResult,
  CreateAssignmentInput,
};