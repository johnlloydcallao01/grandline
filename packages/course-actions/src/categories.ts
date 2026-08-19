/**
 * @encreasl/course-actions - Shared course category service
 *
 * One factory used by both web-admin and web-instructor.
 *
 * Admin scope: full CRUD over the shared course-categories pool via
 * /lms/course-categories/admin. The backend owns the query logic, slug
 * generation, and normalization (see docs/fetching-solution.md).
 *
 * Instructor scope: read-only. Categories are a shared, unscoped pool, but the
 * instructor page only shows categories attached to the instructor's own or
 * co-taught courses, with course counts and stats derived from that course
 * set. The /lms/course-categories/instructor endpoint owns instructor context
 * resolution and the course-scoped derivation; the frontend only forwards the
 * signed-in userId.
 */

import {
  cmsFetch,
  type CategoryCourseRef,
  type CategoryDoc,
  type CategoryListFilters,
  type CategoryListResult,
  type CategoryOption,
  type CategoryStats,
  type CreateCategoryInput,
  type InstructorCategoriesFilters,
  type InstructorCategoriesResult,
  type InstructorCategoryDoc,
  type UpdateCategoryInput,
} from '@encreasl/cms-types';

export type CategoryScope = 'admin' | 'instructor';

export interface CategoryServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: CategoryScope;
}

export interface CategoryService {
  getCategories(filters?: CategoryListFilters, userId?: string): Promise<CategoryListResult>;
  getCategoryById(id: string, userId?: string): Promise<CategoryDoc>;
  createCategory(input: CreateCategoryInput, userId?: string): Promise<CategoryDoc>;
  updateCategory(id: string, data: UpdateCategoryInput, userId?: string): Promise<CategoryDoc>;
  deleteCategory(id: string, userId?: string): Promise<void>;
  getAllCategories(userId?: string): Promise<CategoryOption[]>;
  getMyCourseCategories(
    filters: InstructorCategoriesFilters,
    userId: string,
  ): Promise<InstructorCategoriesResult>;
}

function buildListParams(filters: CategoryListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.categoryType) params.categoryType = filters.categoryType;
  if (filters.isActive) params.isActive = filters.isActive;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

export function createCategoryService(config: CategoryServiceConfig): CategoryService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/course-categories/admin' : '/lms/course-categories/instructor';

  return {
    async getCategories(filters = {}, userId): Promise<CategoryListResult> {
      return cmsFetch<CategoryListResult>(apiKey, cmsUrl, basePath, {
        params: buildListParams(filters, userId),
        cache: 'no-store',
      });
    },

    async getCategoryById(id, userId): Promise<CategoryDoc> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ category: CategoryDoc }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.category;
    },

    async createCategory(input, userId): Promise<CategoryDoc> {
      if (scope !== 'admin') {
        throw new Error('createCategory is only available for the admin scope');
      }
      return cmsFetch<CategoryDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateCategory(id, data, userId): Promise<CategoryDoc> {
      if (scope !== 'admin') {
        throw new Error('updateCategory is only available for the admin scope');
      }
      return cmsFetch<CategoryDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteCategory(id, userId): Promise<void> {
      if (scope !== 'admin') {
        throw new Error('deleteCategory is only available for the admin scope');
      }
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, `${basePath}?${new URLSearchParams(params).toString()}`, {
        method: 'DELETE',
      });
    },

    async getAllCategories(userId): Promise<CategoryOption[]> {
      if (scope !== 'admin') {
        throw new Error('getAllCategories is only available for the admin scope');
      }
      const params: Record<string, string> = { all: 'true' };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ categories: CategoryOption[] }>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
      return data.categories || [];
    },

    async getMyCourseCategories(filters, userId): Promise<InstructorCategoriesResult> {
      if (scope !== 'instructor') {
        throw new Error('getMyCourseCategories is only available for the instructor scope');
      }
      const params: Record<string, string> = { userId };
      if (filters.search) params.search = filters.search;
      if (filters.categoryType) params.categoryType = filters.categoryType;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      return cmsFetch<InstructorCategoriesResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },
  };
}

export type {
  CategoryDoc,
  CategoryListResult,
  CategoryListFilters,
  CreateCategoryInput,
  UpdateCategoryInput,
  InstructorCategoryDoc,
  InstructorCategoriesResult,
  InstructorCategoriesFilters,
  CategoryStats,
  CategoryCourseRef,
};