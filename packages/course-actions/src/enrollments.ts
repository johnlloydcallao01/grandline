/**
 * @encreasl/course-actions - Shared enrollment service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries
 * (see docs/fetching-solution.md). The admin scope uses /lms/enrollments/admin
 * and the instructor scope uses /lms/enrollments/instructor.
 */

import {
  cmsFetch,
  type CourseOption,
  type CreateEnrollmentInput,
  type EnrollmentDoc,
  type EnrollmentFilters,
  type EnrollmentListResult,
  type TraineeOption,
} from '@encreasl/cms-types';

export type EnrollmentScope = 'admin' | 'instructor';

export interface EnrollmentServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: EnrollmentScope;
}

export interface EnrollmentService {
  getEnrollments(filters: EnrollmentFilters): Promise<EnrollmentListResult>;
  searchCourses(search: string, limit?: number, userId?: string): Promise<CourseOption[]>;
  searchTrainees(search: string): Promise<TraineeOption[]>;
  createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentDoc>;
  updateEnrollmentStatus(id: string, status: string, userId?: string): Promise<void>;
  unassignEnrollment(id: string, userId?: string): Promise<void>;
  archiveEnrollment(id: string): Promise<void>;
}

export function createEnrollmentService(config: EnrollmentServiceConfig): EnrollmentService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/enrollments/admin' : '/lms/enrollments/instructor';

  return {
    async getEnrollments(filters: EnrollmentFilters = {}): Promise<EnrollmentListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.userId) params.userId = filters.userId;
      return cmsFetch<EnrollmentListResult>(apiKey, cmsUrl, basePath, { params, cache: 'no-store' });
    },

    async searchCourses(search: string, limit?: number, userId?: string): Promise<CourseOption[]> {
      const trimmed = (search || '').trim();
      if (trimmed.length < 1) return [];
      const effectiveLimit = limit ?? (trimmed.length <= 2 ? 8 : 20);

      if (scope === 'admin') {
        const params: Record<string, string> = {
          depth: '0',
          limit: String(effectiveLimit),
          sort: 'title',
          'where[or][0][title][like]': trimmed,
          'where[or][1][courseCode][like]': trimmed,
        };
        const data = await cmsFetch<{ docs: CourseOption[] }>(apiKey, cmsUrl, '/courses', { params, cache: 'no-store' });
        return (data.docs || []).map((c) => ({
          id: String(c.id),
          title: c.title || '',
          courseCode: c.courseCode || '',
          status: c.status || '',
        }));
      }

      const params: Record<string, string> = { limit: String(effectiveLimit) };
      if (trimmed) params.search = trimmed;
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ docs: CourseOption[] }>(apiKey, cmsUrl, '/lms/enrollments/instructor/courses', { params, cache: 'no-store' });
      return (data.docs || []).map((c) => ({
        id: String(c.id),
        title: c.title || '',
        courseCode: c.courseCode || '',
        status: c.status || '',
      }));
    },

    async searchTrainees(search: string): Promise<TraineeOption[]> {
      const trimmed = (search || '').trim();
      if (trimmed.length < 1) return [];

      const params: Record<string, string> = { search: trimmed, limit: '20' };
      const data = await cmsFetch<{ docs: TraineeOption[] }>(apiKey, cmsUrl, '/lms/enrollments/trainees', { params, cache: 'no-store' });
      return (data.docs || []).map((t) => ({
        id: String(t.id),
        user:
          t.user && typeof t.user === 'object'
            ? {
                id: String(t.user.id),
                firstName: t.user.firstName || '',
                lastName: t.user.lastName || '',
                email: t.user.email || '',
              }
            : { id: '', firstName: '', lastName: '', email: '' },
        srn: t.srn || '',
      }));
    },

    async createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentDoc> {
      const body: Record<string, unknown> = {
        student: input.student,
        course: input.course,
        status: input.status || 'active',
        notes: input.notes || '',
      };
      if (input.userId) body.userId = input.userId;
      return cmsFetch<EnrollmentDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    async updateEnrollmentStatus(id: string, status: string, userId?: string): Promise<void> {
      const body: Record<string, unknown> = { id, status };
      if (userId) body.userId = userId;
      await cmsFetch(apiKey, cmsUrl, basePath, { method: 'PATCH', body: JSON.stringify(body) });
    },

    async unassignEnrollment(id: string, userId?: string): Promise<void> {
      if (scope === 'admin') {
        await cmsFetch(apiKey, cmsUrl, `${basePath}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        return;
      }
      const body: Record<string, unknown> = { id, unassign: true };
      if (userId) body.userId = userId;
      await cmsFetch(apiKey, cmsUrl, basePath, { method: 'PATCH', body: JSON.stringify(body) });
    },

    async archiveEnrollment(id: string): Promise<void> {
      if (scope !== 'admin') {
        throw new Error('archiveEnrollment is only available for the admin scope');
      }
      await cmsFetch(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify({ id, isArchived: true }),
      });
    },
  };
}