/**
 * @encreasl/course-actions - Shared course service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Context-scoped operations (listing, creating, updating, deleting courses)
 * are backend-mediated per docs/fetching-solution.md: the CMS endpoints own
 * the domain query, the instructor context resolution, and ownership checks.
 * Plain lookups (categories, instructors, generic collections) are single
 * collection reads that the factory performs directly.
 */

import {
  cmsFetch,
  type CategoryOption,
  type Course,
  type CourseCounts,
  type CourseEditData,
  type CourseListFilters,
  type CourseListResult,
  type CreateCourseInput,
  type InstructorRef,
  type SimpleDocRef,
  type TagOption,
} from '@encreasl/cms-types';

export type CourseScope = 'admin' | 'instructor';

export interface CourseServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: CourseScope;
}

export interface CourseService {
  getCourses(filters?: CourseListFilters, userId?: string): Promise<CourseListResult>;
  getCourseEditData(id: string, userId?: string): Promise<CourseEditData>;
  createCourse(input: CreateCourseInput, userId?: string): Promise<Course>;
  updateCourse(id: string, data: Record<string, unknown>, userId?: string): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  getCategories(): Promise<CategoryOption[]>;
  getTags(): Promise<TagOption[]>;
  searchInstructors(search: string): Promise<InstructorRef[]>;
  searchCollection(collection: string, search: string, labelField?: string): Promise<SimpleDocRef[]>;
  listCollection(collection: string, labelField?: string): Promise<SimpleDocRef[]>;
}

function buildListParams(filters: CourseListFilters = {}, userId?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.tag) params.tag = filters.tag;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (userId) params.userId = userId;
  return params;
}

function buildQueryString(params: Record<string, string>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') parts.push(`${key}=${encodeURIComponent(String(val))}`);
  }
  return parts.join('&');
}

export function createCourseService(config: CourseServiceConfig): CourseService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/courses/admin' : '/lms/courses/instructor';

  return {
    async getCourses(filters = {}, userId): Promise<CourseListResult> {
      const params = buildListParams(filters, userId);
      return cmsFetch<CourseListResult>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
    },

    async getCourseEditData(id, userId): Promise<CourseEditData> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        const params: Record<string, string> = { userId, courseId: id };
        return cmsFetch<CourseEditData>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
      }
      return cmsFetch<CourseEditData>(apiKey, cmsUrl, `/lms/course-edit/${encodeURIComponent(id)}`, {
        cache: 'no-store',
      });
    },

    async createCourse(input, userId): Promise<Course> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<Course>(apiKey, cmsUrl, basePath, {
          method: 'POST',
          body: JSON.stringify({ userId, data: input }),
        });
      }
      return cmsFetch<Course>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateCourse(id, data, userId): Promise<Course> {
      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        return cmsFetch<Course>(apiKey, cmsUrl, basePath, {
          method: 'PATCH',
          body: JSON.stringify({ userId, id, data }),
        });
      }
      return cmsFetch<Course>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, data }),
      });
    },

    async deleteCourse(id): Promise<void> {
      if (scope !== 'admin') {
        throw new Error('deleteCourse is only available for the admin scope');
      }
      await cmsFetch(apiKey, cmsUrl, `${basePath}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    },

    async getCategories(): Promise<CategoryOption[]> {
      const params: Record<string, string> = { depth: '0', limit: '100', sort: 'name' };
      const data = await cmsFetch<{ docs: Array<{ id: string; name?: string; title?: string }> }>(
        apiKey,
        cmsUrl,
        '/course-categories',
        { params, cache: 'no-store' },
      );
      return (data.docs || []).map((c) => ({
        id: String(c.id),
        name: c.name || c.title || '',
      }));
    },

    async getTags(): Promise<TagOption[]> {
      const params: Record<string, string> = { depth: '0', limit: '100', sort: 'name' };
      const data = await cmsFetch<{ docs: Array<{ id: string; name?: string; title?: string }> }>(
        apiKey,
        cmsUrl,
        '/course-tags',
        { params, cache: 'no-store' },
      );
      return (data.docs || []).map((t) => ({
        id: String(t.id),
        name: t.name || t.title || '',
      }));
    },

    async searchInstructors(search): Promise<InstructorRef[]> {
      const trimmed = (search || '').trim();
      if (trimmed.length < 1) return [];
      const limit = trimmed.length <= 2 ? '8' : '20';
      const params: Record<string, string> = {
        depth: '1',
        limit,
        'where[or][0][user][title][like]': trimmed,
      };
      const data = await cmsFetch<{ docs: Array<Record<string, any>> }>(apiKey, cmsUrl, '/instructors', {
        params,
        cache: 'no-store',
      });
      return (data.docs || []).map((inst) => ({
        id: String(inst.id),
        user:
          inst.user && typeof inst.user === 'object'
            ? {
                id: String(inst.user.id),
                firstName: inst.user.firstName || '',
                lastName: inst.user.lastName || '',
                email: inst.user.email || '',
              }
            : undefined,
      }));
    },

    async searchCollection(collection, search, labelField = 'title'): Promise<SimpleDocRef[]> {
      const trimmed = (search || '').trim();
      if (trimmed.length < 1) return [];
      const limit = trimmed.length <= 2 ? '8' : '20';
      const params: Record<string, string> = { depth: '0', limit, [`where[or][0][${labelField}][like]`]: trimmed };
      const data = await cmsFetch<{ docs: Array<Record<string, any>> }>(apiKey, cmsUrl, `/${collection}`, {
        params,
        cache: 'no-store',
      });
      return (data.docs || []).map((d) => ({
        id: String(d.id),
        title: d.title || d.name || String(d.id),
        name: d.name || undefined,
      }));
    },

    async listCollection(collection, _labelField = 'title'): Promise<SimpleDocRef[]> {
      const params: Record<string, string> = { depth: '0', limit: '10', sort: '-createdAt' };
      const data = await cmsFetch<{ docs: Array<Record<string, any>> }>(apiKey, cmsUrl, `/${collection}`, {
        params,
        cache: 'no-store',
      });
      return (data.docs || []).map((d) => ({
        id: String(d.id),
        title: d.title || d.name || String(d.id),
        name: d.name || undefined,
      }));
    },
  };
}

export function toLexical(text: string): unknown {
  if (!text) return undefined;
  return {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [{ text }],
        },
      ],
    },
  };
}

export function extractIds(items?: ({ id: string } | string)[]): string[] {
  if (!items) return [];
  return items.map((i) => (typeof i === 'string' ? i : i.id));
}

export function toDatetimeLocal(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type { Course, CourseListResult, CourseCounts, CategoryOption, SimpleDocRef, CreateCourseInput, CourseEditData, TagOption };
