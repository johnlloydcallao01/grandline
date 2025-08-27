/**
 * Admin-specific RTK Query API extensions
 * Extends the base Redux API with admin-only endpoints
 */

import { api } from '@encreasl/redux';
import type { Post, Media, User } from '@encreasl/cms-types';

// ============================================================================
// Admin API Types
// ============================================================================

interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PostsResponse extends PaginatedResponse<Post> {}
interface MediaResponse extends PaginatedResponse<Media> {}
interface UsersResponse extends PaginatedResponse<User> {}

interface TraineeData {
  id: string;
  user: User | string;
  srn: string;
  couponCode?: string;
  enrollmentDate: string;
  currentLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface TraineesResponse extends PaginatedResponse<TraineeData> {}

// ============================================================================
// Admin API Extensions
// ============================================================================

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // Posts Management
    // ========================================================================
    
    getPosts: builder.query<PostsResponse, {
      status?: 'draft' | 'published';
      search?: string;
      limit?: number;
      page?: number;
    }>({
      query: ({ status, search, limit = 10, page = 1 }) => ({
        url: '/posts',
        params: {
          ...(status && { status }),
          ...(search && { search }),
          limit,
          page,
        },
      }),
      providesTags: ['Post'],
    }),

    getPostById: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    createPost: builder.mutation<Post, Partial<Post>>({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post'],
    }),

    updatePost: builder.mutation<Post, { id: string; data: Partial<Post> }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }, 'Post'],
    }),

    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }, 'Post'],
    }),

    // ========================================================================
    // Media Management
    // ========================================================================

    getMedia: builder.query<MediaResponse, {
      limit?: number;
      page?: number;
      search?: string;
    }>({
      query: ({ limit = 20, page = 1, search }) => ({
        url: '/media',
        params: {
          limit,
          page,
          ...(search && { search }),
        },
      }),
      providesTags: ['Media'],
    }),

    getMediaById: builder.query<Media, string>({
      query: (id) => `/media/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Media', id }],
    }),

    uploadMedia: builder.mutation<Media, { file: File; alt?: string }>({
      query: ({ file, alt }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (alt) formData.append('alt', alt);
        
        return {
          url: '/media',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Media'],
    }),

    deleteMedia: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Media', id }, 'Media'],
    }),

    // ========================================================================
    // User Management (Admin)
    // ========================================================================

    getUsers: builder.query<UsersResponse, {
      role?: string;
      limit?: number;
      page?: number;
      search?: string;
    }>({
      query: ({ role, limit = 10, page = 1, search }) => ({
        url: '/users',
        params: {
          ...(role && { role }),
          limit,
          page,
          ...(search && { search }),
        },
      }),
      providesTags: ['User'],
    }),

    updateUserRole: builder.mutation<User, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // ========================================================================
    // Trainee Management (Admin)
    // ========================================================================

    getTrainees: builder.query<TraineesResponse, {
      limit?: number;
      page?: number;
      search?: string;
      status?: string;
    }>({
      query: ({ limit = 10, page = 1, search, status }) => ({
        url: '/trainees',
        params: {
          limit,
          page,
          ...(search && { search }),
          ...(status && { status }),
        },
      }),
      providesTags: ['Trainee'],
    }),

    getTraineeById: builder.query<TraineeData, string>({
      query: (id) => `/trainees/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Trainee', id }],
    }),

    updateTrainee: builder.mutation<TraineeData, { id: string; data: Partial<TraineeData> }>({
      query: ({ id, data }) => ({
        url: `/trainees/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Trainee', id },
        'Trainee',
      ],
    }),
  }),
  overrideExisting: false,
});

// ============================================================================
// Export Hooks
// ============================================================================

export const {
  // Posts
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  
  // Media
  useGetMediaQuery,
  useGetMediaByIdQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  
  // Users
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  
  // Trainees
  useGetTraineesQuery,
  useGetTraineeByIdQuery,
  useUpdateTraineeMutation,
} = adminApi;
