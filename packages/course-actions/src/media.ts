/**
 * @encreasl/course-actions - Shared media service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Both scopes call the same /lms/media endpoint. The scope distinction is made
 * by the presence of a userId: the admin scope omits it (full access) while the
 * instructor scope passes it (ownership + shared scoping enforced server-side).
 * See docs/fetching-solution.md.
 */

import {
  cmsFetch,
  type MediaDoc,
  type MediaListFilters,
  type MediaListResult,
  type MediaScope,
  type MediaStats,
  type MediaVisibility,
  type UpdateMediaData,
} from '@encreasl/cms-types';

export type MediaServiceScope = 'admin' | 'instructor';

export interface MediaServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: MediaServiceScope;
}

export interface MediaService {
  getMedia(filters: MediaListFilters, userId?: string): Promise<MediaListResult>;
  getMediaItem(id: number | string, userId?: string): Promise<MediaDoc>;
  uploadMedia(formData: FormData, userId?: string): Promise<MediaDoc>;
  updateMedia(id: number | string, data: UpdateMediaData, userId?: string): Promise<MediaDoc>;
  deleteMedia(id: number | string): Promise<void>;
}

function assertAdminScope(scope: MediaServiceScope) {
  if (scope !== 'admin') {
    throw new Error('This operation is only available for the admin scope');
  }
}

export function createMediaService(config: MediaServiceConfig): MediaService {
  const { apiKey, cmsUrl, scope } = config;
  const basePath = '/lms/media';

  return {
    async getMedia(filters: MediaListFilters = {}, userId?: string): Promise<MediaListResult> {
      const params: Record<string, string> = {};
      if (filters.scope) params.scope = filters.scope;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sort) params.sort = filters.sort;
      if (userId) params.userId = userId;
      return cmsFetch<MediaListResult>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async getMediaItem(id: number | string, userId?: string): Promise<MediaDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      return cmsFetch<MediaDoc>(apiKey, cmsUrl, basePath, {
        params,
        cache: 'no-store',
      });
    },

    async uploadMedia(formData: FormData, userId?: string): Promise<MediaDoc> {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      return cmsFetch<MediaDoc>(apiKey, cmsUrl, basePath, {
        method: 'POST',
        body: formData,
        params,
      });
    },

    async updateMedia(
      id: number | string,
      data: UpdateMediaData,
      userId?: string,
    ): Promise<MediaDoc> {
      const params: Record<string, string> = { id: String(id) };
      if (userId) params.userId = userId;
      return cmsFetch<MediaDoc>(apiKey, cmsUrl, basePath, {
        method: 'PATCH',
        body: JSON.stringify(data),
        params,
      });
    },

    async deleteMedia(id: number | string): Promise<void> {
      assertAdminScope(scope);
      const params: Record<string, string> = { id: String(id) };
      await cmsFetch(apiKey, cmsUrl, basePath, {
        method: 'DELETE',
        params,
      });
    },
  };
}

export type {
  MediaDoc,
  MediaListFilters,
  MediaListResult,
  MediaScope,
  MediaStats,
  MediaVisibility,
  UpdateMediaData,
};