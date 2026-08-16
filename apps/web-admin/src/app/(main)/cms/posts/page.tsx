'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from '@/components/ui/IconWrapper';
import Link from '@/components/ui/LinkWrapper';
import { formatCMSDateTime, cmsApiFetch } from '@/lib/cms';
import type { Post } from '@encreasl/cms-types';

function PostsPageContent() {
  const [filters, setFilters] = useState({
    status: undefined as 'draft' | 'published' | undefined,
    search: '',
    limit: 10,
    page: 1,
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch posts using PayloadCMS REST API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          limit: filters.limit.toString(),
          page: filters.page.toString(),
        });

        if (filters.status) {
          params.append('where[status][equals]', filters.status);
        }

        if (filters.search) {
          params.append('where[title][contains]', filters.search);
        }

        const response = await cmsApiFetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data.docs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [filters]);



  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: 'draft' | 'published' | undefined) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await cmsApiFetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove post from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: unknown) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blog Posts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your blog content</p>
        </div>

        <Link
          href="/cms/posts/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[var(--card-background)] rounded-lg shadow dark:shadow-none mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-[var(--card-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400 bg-white dark:bg-[var(--card-background)]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={filters.status || ''}
                onChange={(e) => handleStatusFilter((e.target.value as 'draft' | 'published') || undefined)}
                className="border-2 border-gray-400 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">
                {error && typeof error === 'object' && 'message' in error
                  ? (error as { message: string }).message
                  : 'Failed to load posts'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No posts found.</p>
              <Link
                href="/cms/posts/new"
                className="mt-2 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {posts.map((post: Post) => (
                <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {post.title}
                        </h3>
                        {getStatusBadge(post.status)}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          By {typeof post.author === 'object' && post.author ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Unknown Author' : 'Unknown Author'}
                        </span>
                        {post.publishedAt && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatCMSDateTime(post.publishedAt)}
                          </span>
                        )}
                        <span>
                          Updated {formatCMSDateTime(post.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start space-x-2">
                      <Link
                        href={`/cms/posts/${post.id}/preview`}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/cms/posts/${post.id}/edit`}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-[var(--card-border)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {filters.page} of {totalPages}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>

                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return <PostsPageContent />;
}
