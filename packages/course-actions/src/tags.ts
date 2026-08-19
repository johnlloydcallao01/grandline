/**
 * @encreasl/course-actions - Shared course tag service
 *
 * One factory used by both web-admin and web-instructor.
 *
 * Admin scope: full CRUD over the shared course-tags pool via
 * /lms/tags/admin. The backend owns the query logic, slug generation, and
 * normalization (see docs/fetching-solution.md).
 *
 * Instructor scope: read-only, course-scoped. Tags are a shared, unscoped
 * pool, but the instructor page only shows tags attached to the instructor's
 * own or co-taught courses, with course counts and stats derived from that
 * course set. The /lms/tags/instructor endpoint owns instructor context
 * resolution and the course-scoped derivation; the frontend only forwards the
 * signed-in userId.
 */

import {
  cmsFetch,
  type CreateTagInput,
  type InstructorTagDoc,
  type InstructorTagsFilters,
  type InstructorTagsResult,
  type TagCourseRef,
  type TagDoc,
  type TagListFilters,
  type TagListResult,
  type TagStats,
  type UpdateTagInput,
} from '@encreasl/cms-types';

export type TagScope = 'admin' | 'instructor';

export interface TagServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: TagScope;
}

export interface TagService {
  getTags(filters?: TagListFilters, userId?: string): Promise<TagListResult>;
  getTagById(id: string, userId?: string): Promise<TagDoc>;
  createTag(input: CreateTagInput, userId?: string): Promise<TagDoc>;
  updateTag(id: string, data: UpdateTagInput, userId?: string): Promise<TagDoc>;
  deleteTag(id: string, userId?: string): Promise<void>;
  getMyCourseTags(
    filters: InstructorTagsFilters,
    userId: string,
  ): Promise<InstructorTagsResult>;
}

function buildListParams(filters: TagListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

export function createTagService(config: TagServiceConfig): TagService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/tags/admin' : '/lms/tags/instructor';

  return {
    async getTags(filters = {}, userId): Promise<TagListResult> {
      if (scope !== 'admin') {
        throw new Error('getTags is only available for the admin scope');
      }
      return cmsFetch<TagListResult>(apiKey, cmsUrl, basePath, {
        params: buildListParams(filters, userId),
        cache: 'no-store',
      });
    },

    async getTagById(id, userId): Promise<TagDoc> {
      if (scope !== 'admin') {
        throw new Error('getTagById is only available for the admin scope');
      }
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ tag: TagDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.tag;
    },

    async createTag(input, userId): Promise<TagDoc> {
      if (scope !== 'admin') {
        throw new Error('createTag is only available for the admin scope');
      }
      return cmsFetch<TagDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateTag(id, data, userId): Promise<TagDoc> {
      if (scope !== 'admin') {
        throw new Error('updateTag is only available for the admin scope');
      }
      return cmsFetch<TagDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteTag(id, userId): Promise<void> {
      if (scope !== 'admin') {
        throw new Error('deleteTag is only available for the admin scope');
      }
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, `${basePath}?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },

    async getMyCourseTags(filters, userId): Promise<InstructorTagsResult> {
      if (scope !== 'instructor') {
        throw new Error('getMyCourseTags is only available for the instructor scope');
      }
      const params: Record<string, string> = { userId };
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      return cmsFetch<InstructorTagsResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },
  };
}

export type {
  TagDoc,
  TagListResult,
  TagListFilters,
  CreateTagInput,
  UpdateTagInput,
  InstructorTagDoc,
  InstructorTagsResult,
  InstructorTagsFilters,
  TagStats,
  TagCourseRef,
};