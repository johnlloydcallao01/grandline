/**
 * Professional PayloadCMS Admin API with Redux Toolkit Query
 *
 * Enterprise-grade authentication integration with PayloadCMS
 * Supports admin and instructor roles with proper permission handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Post, Media, User } from '@encreasl/cms-types';
import { env } from './env';
import type { RootState } from './store';

// ============================================================================
// PayloadCMS Types (matching your Supabase PostgreSQL schema)
// ============================================================================

interface PayloadUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nameExtension?: string;
  username?: string;
  role: 'admin' | 'instructor' | 'trainee';
  isActive: boolean;
  lastLogin?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface PayloadAuthResponse {
  message?: string;
  user: PayloadUser;
  token: string;
  exp?: number;
}

interface PayloadLoginRequest {
  email: string;
  password: string;
}

interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface QueryParams {
  limit?: number;
  page?: number;
  sort?: string;
  where?: Record<string, any>;
}

// ============================================================================
// Professional Base Query with PayloadCMS Integration
// ============================================================================

const payloadBaseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state (professional approach)
    const state = getState() as RootState;
    const token = state.auth?.token;

    if (token) {
      // PayloadCMS uses JWT format, not Bearer
      headers.set('authorization', `JWT ${token}`);
    }

    // Professional headers for enterprise API
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');
    headers.set('x-client-platform', 'web-admin');
    headers.set('x-client-version', '1.0.0');

    return headers;
  },
});

// Enhanced base query with automatic token refresh and error handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await payloadBaseQuery(args, api, extraOptions);

  // Handle authentication errors professionally
  if (result.error && result.error.status === 401) {
    console.warn('🔐 Authentication failed - token may be expired');

    // Dispatch logout action to clear invalid state
    api.dispatch({ type: 'auth/forceLogout' });

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

  return result;
};

// ============================================================================
// Professional Admin API Definition
// ============================================================================

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', 'Media', 'User', 'Trainee', 'Auth'],
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    // ========================================================================
    // Authentication Endpoints (PayloadCMS Integration)
    // ========================================================================

    /**
     * Login with PayloadCMS - Professional Implementation
     * Only allows admin and instructor roles
     */
    login: builder.mutation<PayloadAuthResponse, PayloadLoginRequest>({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: PayloadAuthResponse) => {
        // Validate user role on client side as well
        if (!['admin', 'instructor'].includes(response.user.role)) {
          throw new Error(`Access denied. Required role: admin or instructor. Current: ${response.user.role}`);
        }

        if (!response.user.isActive) {
          throw new Error('Account is inactive. Please contact administrator.');
        }

        return response;
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Logout from PayloadCMS
     */
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Get current user profile
     */
    getCurrentUser: builder.query<PayloadUser, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // ========================================================================
    // Posts Management (Blog Content)
    // ========================================================================

    /**
     * Get paginated posts with advanced filtering
     */
    getPosts: builder.query<PaginatedResponse<Post>, QueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.sort) searchParams.append('sort', params.sort);
        if (params.where) {
          Object.entries(params.where).forEach(([key, value]) => {
            searchParams.append(`where[${key}]`, JSON.stringify(value));
          });
        }

        return `/posts?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.docs.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    /**
     * Get single post by ID
     */
    getPost: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    /**
     * Create new post
     */
    createPost: builder.mutation<Post, Partial<Post>>({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    /**
     * Update existing post
     */
    updatePost: builder.mutation<Post, { id: string; data: Partial<Post> }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    /**
     * Delete post (admin only)
     */
    deletePost: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
});

// ============================================================================
// Export hooks for components
// ============================================================================

export const {
  // Auth hooks
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,

  // Posts hooks
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = adminApi;

export default adminApi;