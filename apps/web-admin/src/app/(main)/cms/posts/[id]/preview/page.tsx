'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Edit, Calendar, User } from '@/components/ui/IconWrapper';
import { formatCMSDateTime, cmsApiFetch } from '@/lib/cms';

export default function PostPreviewPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await cmsApiFetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        const data = await response.json();
        setPost(data.doc || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Published</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">Draft</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Eye className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Failed to load post</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Link href="/cms/posts" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">Back to Posts</Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Eye className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Post not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">This post does not exist or has been removed.</p>
          <Link href="/cms/posts" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">Back to Posts</Link>
        </div>
      </div>
    );
  }

  const authorName = typeof post.author === 'object' && post.author
    ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Unknown'
    : 'Unknown';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/cms/posts" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Posts
        </Link>
        <Link
          href={`/cms/posts/${postId}/edit`}
          className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Post
        </Link>
      </div>

      <article className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
        {post.featuredImage && typeof post.featuredImage === 'object' && post.featuredImage.cloudinaryURL && (
          <div className="w-full h-64 bg-gray-100 dark:bg-gray-800">
            <img src={post.featuredImage.cloudinaryURL} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            {getStatusBadge(post.status)}
            {post.publishedAt && (
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                {formatCMSDateTime(post.publishedAt)}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{post.title}</h1>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <User className="w-4 h-4 mr-1" />
            {authorName}
            <span className="mx-2">·</span>
            Updated {formatCMSDateTime(post.updatedAt)}
          </div>

          {post.excerpt && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic border-l-4 border-gray-200 dark:border-gray-700 pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {post.content ? (
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {typeof post.content === 'string' ? post.content : JSON.stringify(post.content)}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">No content</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
