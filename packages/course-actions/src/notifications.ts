/**
 * @encreasl/course-actions - Shared notifications service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call dedicated CMS endpoints that own the domain queries, the
 * scoping, and the stats (see docs/fetching-solution.md). The admin scope uses
 * /lms/notifications/admin and /lms/notifications/templates for management,
 * while the instructor scope uses /lms/notifications for the current user's
 * inbox.
 */

import {
  cmsFetch,
  type CreateNotificationData,
  type CreateTemplateData,
  type NotificationDoc,
  type NotificationTemplateDoc,
  type NotificationTemplateOption,
  type NotificationUserOption,
  type NotificationsListFilters,
  type NotificationsListResult,
  type TemplateListFilters,
  type TemplateListResult,
  type UpdateNotificationData,
  type UpdateTemplateData,
  type UserNotificationBulkResult,
  type UserNotificationDoc,
  type UserNotificationsResult,
  type UserNotificationUpdateData,
} from '@encreasl/cms-types';

export type NotificationsScope = 'admin' | 'instructor';

export interface NotificationsServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: NotificationsScope;
}

export interface NotificationsService {
  getNotifications(filters?: NotificationsListFilters): Promise<NotificationsListResult>;
  getNotification(id: number | string): Promise<NotificationDoc>;
  createNotification(data: CreateNotificationData, userId?: string): Promise<NotificationDoc>;
  updateNotification(id: number | string, data: UpdateNotificationData): Promise<NotificationDoc>;
  deleteNotification(id: number | string): Promise<void>;
  getUserOptions(search?: string): Promise<NotificationUserOption[]>;
  getTemplates(filters?: TemplateListFilters): Promise<TemplateListResult>;
  getTemplate(id: number | string): Promise<NotificationTemplateDoc>;
  createTemplate(data: CreateTemplateData): Promise<NotificationTemplateDoc>;
  updateTemplate(id: number | string, data: UpdateTemplateData): Promise<NotificationTemplateDoc>;
  deleteTemplate(id: number | string): Promise<void>;
  getTemplateOptions(): Promise<NotificationTemplateOption[]>;
  getMyNotifications(userId: string): Promise<UserNotificationsResult>;
  markNotification(
    id: number | string,
    userId: string,
    data: UserNotificationUpdateData,
  ): Promise<UserNotificationDoc>;
  markAllRead(userId: string): Promise<UserNotificationBulkResult>;
  markAllSeen(userId: string): Promise<UserNotificationBulkResult>;
  deleteMyNotification(id: number | string, userId: string): Promise<void>;
}

function assertAdminScope(scope: NotificationsScope) {
  if (scope !== 'admin') {
    throw new Error('This operation is only available for the admin scope');
  }
}

export function createNotificationsService(
  config: NotificationsServiceConfig,
): NotificationsService {
  const { apiKey, cmsUrl, scope } = config;
  const adminPath = '/lms/notifications/admin';
  const templatesPath = '/lms/notifications/templates';
  const inboxPath = '/lms/notifications';

  return {
    async getNotifications(
      filters: NotificationsListFilters = {},
    ): Promise<NotificationsListResult> {
      assertAdminScope(scope);
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      return cmsFetch<NotificationsListResult>(apiKey, cmsUrl, adminPath, {
        params,
        cache: 'no-store',
      });
    },

    async getNotification(id: number | string): Promise<NotificationDoc> {
      assertAdminScope(scope);
      return cmsFetch<NotificationDoc>(apiKey, cmsUrl, adminPath, {
        params: { id: String(id) },
        cache: 'no-store',
      });
    },

    async createNotification(
      data: CreateNotificationData,
      userId?: string,
    ): Promise<NotificationDoc> {
      assertAdminScope(scope);
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      return cmsFetch<NotificationDoc>(apiKey, cmsUrl, adminPath, {
        method: 'POST',
        body: JSON.stringify(data),
        params,
      });
    },

    async updateNotification(
      id: number | string,
      data: UpdateNotificationData,
    ): Promise<NotificationDoc> {
      assertAdminScope(scope);
      return cmsFetch<NotificationDoc>(apiKey, cmsUrl, adminPath, {
        method: 'PATCH',
        body: JSON.stringify(data),
        params: { id: String(id) },
      });
    },

    async deleteNotification(id: number | string): Promise<void> {
      assertAdminScope(scope);
      await cmsFetch(apiKey, cmsUrl, adminPath, {
        method: 'DELETE',
        params: { id: String(id) },
      });
    },

    async getUserOptions(search?: string): Promise<NotificationUserOption[]> {
      assertAdminScope(scope);
      const params: Record<string, string> = { userOptions: '1' };
      if (search) params.search = search;
      const data = await cmsFetch<{ users: NotificationUserOption[] }>(
        apiKey,
        cmsUrl,
        adminPath,
        { params, cache: 'no-store' },
      );
      return data.users || [];
    },

    async getTemplates(filters: TemplateListFilters = {}): Promise<TemplateListResult> {
      assertAdminScope(scope);
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      return cmsFetch<TemplateListResult>(apiKey, cmsUrl, templatesPath, {
        params,
        cache: 'no-store',
      });
    },

    async getTemplate(id: number | string): Promise<NotificationTemplateDoc> {
      assertAdminScope(scope);
      return cmsFetch<NotificationTemplateDoc>(apiKey, cmsUrl, templatesPath, {
        params: { id: String(id) },
        cache: 'no-store',
      });
    },

    async createTemplate(data: CreateTemplateData): Promise<NotificationTemplateDoc> {
      assertAdminScope(scope);
      return cmsFetch<NotificationTemplateDoc>(apiKey, cmsUrl, templatesPath, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateTemplate(
      id: number | string,
      data: UpdateTemplateData,
    ): Promise<NotificationTemplateDoc> {
      assertAdminScope(scope);
      return cmsFetch<NotificationTemplateDoc>(apiKey, cmsUrl, templatesPath, {
        method: 'PATCH',
        body: JSON.stringify(data),
        params: { id: String(id) },
      });
    },

    async deleteTemplate(id: number | string): Promise<void> {
      assertAdminScope(scope);
      await cmsFetch(apiKey, cmsUrl, templatesPath, {
        method: 'DELETE',
        params: { id: String(id) },
      });
    },

    async getTemplateOptions(): Promise<NotificationTemplateOption[]> {
      assertAdminScope(scope);
      const data = await cmsFetch<{ templates: NotificationTemplateOption[] }>(
        apiKey,
        cmsUrl,
        templatesPath,
        { params: { templateOptions: '1' }, cache: 'no-store' },
      );
      return data.templates || [];
    },

    async getMyNotifications(userId: string): Promise<UserNotificationsResult> {
      return cmsFetch<UserNotificationsResult>(apiKey, cmsUrl, inboxPath, {
        params: { userId },
        cache: 'no-store',
      });
    },

    async markNotification(
      id: number | string,
      userId: string,
      data: UserNotificationUpdateData,
    ): Promise<UserNotificationDoc> {
      return cmsFetch<UserNotificationDoc>(apiKey, cmsUrl, inboxPath, {
        method: 'PATCH',
        body: JSON.stringify(data),
        params: { id: String(id), userId },
      });
    },

    async markAllRead(userId: string): Promise<UserNotificationBulkResult> {
      return cmsFetch<UserNotificationBulkResult>(apiKey, cmsUrl, inboxPath, {
        method: 'POST',
        body: JSON.stringify({ action: 'mark-all-read' }),
        params: { userId },
      });
    },

    async markAllSeen(userId: string): Promise<UserNotificationBulkResult> {
      return cmsFetch<UserNotificationBulkResult>(apiKey, cmsUrl, inboxPath, {
        method: 'POST',
        body: JSON.stringify({ action: 'mark-all-seen' }),
        params: { userId },
      });
    },

    async deleteMyNotification(id: number | string, userId: string): Promise<void> {
      await cmsFetch(apiKey, cmsUrl, inboxPath, {
        method: 'DELETE',
        params: { id: String(id), userId },
      });
    },
  };
}

export type {
  CreateNotificationData,
  CreateTemplateData,
  NotificationDoc,
  NotificationTemplateDoc,
  NotificationTemplateOption,
  NotificationUserOption,
  NotificationsListFilters,
  NotificationsListResult,
  TemplateListFilters,
  TemplateListResult,
  UpdateNotificationData,
  UpdateTemplateData,
  UserNotificationDoc,
  UserNotificationsResult,
};