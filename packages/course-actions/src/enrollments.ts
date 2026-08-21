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
  type EnrollmentCouponOption,
  type EnrollmentDoc,
  type EnrollmentFilters,
  type EnrollmentListResult,
  type EnrollmentUserOption,
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
  getEnrollment(id: string, userId?: string): Promise<EnrollmentDoc>;
  searchCourses(search: string, limit?: number, userId?: string): Promise<CourseOption[]>;
  searchTrainees(search: string): Promise<TraineeOption[]>;
  searchEnrollmentCoupons(search: string): Promise<EnrollmentCouponOption[]>;
  searchEnrollmentUsers(search: string): Promise<EnrollmentUserOption[]>;
  createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentDoc>;
  updateEnrollment(id: string, input: Partial<CreateEnrollmentInput>, userId?: string): Promise<void>;
  updateEnrollmentStatus(id: string, status: string, userId?: string): Promise<void>;
  unassignEnrollment(id: string, userId?: string): Promise<void>;
  archiveEnrollment(id: string): Promise<void>;
}

export function createEnrollmentService(config: EnrollmentServiceConfig): EnrollmentService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = scope === 'admin' ? '/lms/enrollments/admin' : '/lms/enrollments/instructor';

  return {
    async getEnrollment(id: string, userId?: string): Promise<EnrollmentDoc> {
      const params: Record<string, string> = { id };
      if (userId) params.userId = userId;
      return cmsFetch<EnrollmentDoc>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async getEnrollments(filters: EnrollmentFilters = {}): Promise<EnrollmentListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.userId) params.userId = filters.userId;
      // Bust Next.js server-action / fetch memoization after mutations.
      params._ts = String(Date.now());
      return cmsFetch<EnrollmentListResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
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

    async searchEnrollmentCoupons(search: string): Promise<EnrollmentCouponOption[]> {
      if (scope !== 'admin') return [];
      const trimmed = (search || '').trim();
      if (!trimmed) return [];
      const params: Record<string, string> = {
        depth: '0',
        limit: '20',
        'where[or][0][code][like]': trimmed,
        'where[or][1][name][like]': trimmed,
        sort: 'code',
      };
      const data = await cmsFetch<{ docs: EnrollmentCouponOption[] }>(apiKey, cmsUrl, '/coupon-codes', {
        params,
        cache: 'no-store',
      });
      return (data.docs || []).map((coupon) => ({
        id: String(coupon.id),
        code: coupon.code || '',
        name: coupon.name || '',
        status: coupon.status || '',
      }));
    },

    async searchEnrollmentUsers(search: string): Promise<EnrollmentUserOption[]> {
      if (scope !== 'admin') return [];
      const trimmed = (search || '').trim();
      if (!trimmed) return [];
      const params: Record<string, string> = {
        depth: '0',
        limit: '20',
        'where[or][0][email][like]': trimmed,
        'where[or][1][firstName][like]': trimmed,
        'where[or][2][lastName][like]': trimmed,
        sort: 'firstName',
      };
      const data = await cmsFetch<{ docs: EnrollmentUserOption[] }>(apiKey, cmsUrl, '/users', {
        params,
        cache: 'no-store',
      });
      return (data.docs || []).map((user) => ({
        id: String(user.id),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || '',
      }));
    },

    async createEnrollment(input: CreateEnrollmentInput): Promise<EnrollmentDoc> {
      const body: Record<string, unknown> = { ...input };
      // Instructor endpoints require userId for ownership checks; admin does not.
      if (scope === 'admin') delete body.userId;
      return cmsFetch<EnrollmentDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    async updateEnrollment(id: string, input: Partial<CreateEnrollmentInput>, userId?: string): Promise<void> {
      const body: Record<string, unknown> = { id, ...input };
      if (scope === 'admin') {
        delete body.userId;
      } else if (userId) {
        body.userId = userId;
      }
      await cmsFetch(apiKey, cmsUrl, basePath, { method: 'PATCH', body: JSON.stringify(body) });
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
