/**
 * @encreasl/course-actions - Shared announcements service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries and the
 * instructor ownership scoping (see docs/fetching-solution.md). The admin scope
 * uses /lms/announcements/admin and the instructor scope uses
 * /lms/announcements/instructor.
 */

import {
  cmsFetch,
  type AnnouncementCourseOption,
  type AnnouncementDoc,
  type AnnouncementsListFilters,
  type AnnouncementsListResult,
  type CreateAnnouncementData,
  type UpdateAnnouncementData,
} from '@encreasl/cms-types';

export type AnnouncementsScope = 'admin' | 'instructor';

export interface AnnouncementsServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: AnnouncementsScope;
}

export interface AnnouncementsService {
  getAnnouncements(
    filters: AnnouncementsListFilters,
    userId?: string,
  ): Promise<AnnouncementsListResult>;
  getAnnouncement(id: number | string, userId?: string): Promise<AnnouncementDoc>;
  createAnnouncement(data: CreateAnnouncementData, userId?: string): Promise<AnnouncementDoc>;
  updateAnnouncement(
    id: number | string,
    data: UpdateAnnouncementData,
    userId?: string,
  ): Promise<AnnouncementDoc>;
  deleteAnnouncement(id: number | string, userId?: string): Promise<void>;
  getCourseOptions(userId?: string): Promise<AnnouncementCourseOption[]>;
}

export function createAnnouncementsService(
  config: AnnouncementsServiceConfig,
): AnnouncementsService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath =
    scope === 'admin' ? '/lms/announcements/admin' : '/lms/announcements/instructor';

  return {
    async getAnnouncements(
      filters: AnnouncementsListFilters = {},
      userId?: string,
    ): Promise<AnnouncementsListResult> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.courseId) params.courseId = String(filters.courseId);
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      if (userId) params.userId = userId;
      return cmsFetch<AnnouncementsListResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async getAnnouncement(id: number | string, userId?: string): Promise<AnnouncementDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      return cmsFetch<AnnouncementDoc>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async createAnnouncement(
      data: CreateAnnouncementData,
      userId?: string,
    ): Promise<AnnouncementDoc> {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      return cmsFetch<AnnouncementDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: JSON.stringify(data),
        params,
      });
    },

    async updateAnnouncement(
      id: number | string,
      data: UpdateAnnouncementData,
      userId?: string,
    ): Promise<AnnouncementDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      return cmsFetch<AnnouncementDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify(data),
        params,
      });
    },

    async deleteAnnouncement(id: number | string, userId?: string): Promise<void> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      await cmsFetch(apiKey, cmsUrl, basePath, {
        method: 'DELETE',
        params,
      });
    },

    async getCourseOptions(userId?: string): Promise<AnnouncementCourseOption[]> {
      const params: Record<string, string> = { courseOptions: '1' };
      if (userId) params.userId = userId;
      const data = await cmsFetch<{ courses: AnnouncementCourseOption[] }>(
        apiKey,
        cmsUrl,
        basePath,
        {
          params,
          cache: 'no-store',
        },
      );
      return data.courses || [];
    },
  };
}

export type {
  AnnouncementCourseOption,
  AnnouncementDoc,
  AnnouncementsListFilters,
  AnnouncementsListResult,
  CreateAnnouncementData,
  UpdateAnnouncementData,
};