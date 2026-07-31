'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, MessageCircle, AlertTriangle, CheckCircle, X } from '@/components/ui/IconWrapper';
import { getCommentById, updateComment } from '../../actions';

export default function EditCommentPage() {
    const params = useParams();
    const commentId = params.commentId as string;

    const [comment, setComment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [status, setStatus] = useState<'approved' | 'pending' | 'spam'>('pending');

    const loadComment = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCommentById(commentId);
            setComment(data);
            setContent(data.content || '');
            setAuthorName(data.authorName || '');
            setAuthorEmail(data.authorEmail || '');
            setStatus(data.status || 'pending');
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load comment'));
        } finally {
            setIsLoading(false);
        }
    }, [commentId]);

    useEffect(() => { loadComment(); }, [loadComment]);

    const handleSave = async () => {
        if (!commentId) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);
            setError(null);
            const payload: Record<string, any> = { content, status };
            if (authorName.trim()) payload.authorName = authorName.trim();
            if (authorEmail.trim()) payload.authorEmail = authorEmail.trim();
            await updateComment(commentId, payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save comment');
        } finally {
            setIsSaving(false);
        }
    };

    const getPostTitle = (): string => {
        if (!comment) return '';
        if (typeof comment.post === 'object' && comment.post?.title) return comment.post.title;
        return `Post #${typeof comment.post === 'object' ? comment.post.id : comment.post}`;
    };

    const getPostLink = (): string => {
        if (!comment) return '#';
        const id = typeof comment.post === 'object' ? comment.post.id : comment.post;
        return `/cms/posts/${id}/edit`;
    };

    const getAuthorName_ = (): string => {
        if (!comment) return '';
        if (comment.authorName) return comment.authorName;
        if (typeof comment.author === 'object' && comment.author?.name) return comment.author.name;
        if (comment.author) return `User #${typeof comment.author === 'object' ? comment.author.id : comment.author}`;
        return 'Anonymous';
    };

    const getAuthorEmail_ = (): string => {
        if (!comment) return '';
        if (comment.authorEmail) return comment.authorEmail;
        if (typeof comment.author === 'object' && comment.author?.email) return comment.author.email;
        return '';
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-48" /><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mt-1.5" /></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error === 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Comment Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">This comment does not exist or has been removed.</p>
                    <Link href="/cms/comments" className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Comments
                    </Link>
                </div>
            </div>
        );
    }

    if (error && error !== 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={loadComment} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                        <Link href="/cms/comments" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/cms/comments" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Comment</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Comment #{commentId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/cms/comments" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving || !content.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Comment Content */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Comment Content</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                            <textarea value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Comment content..." />
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Author Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                <input type="text" value={authorName}
                                    onChange={e => setAuthorName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                    placeholder="Author name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" value={authorEmail}
                                    onChange={e => setAuthorEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                    placeholder="author@example.com" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Status & Moderation</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'approved' as const, label: 'Approved', color: 'text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' },
                                    { value: 'pending' as const, label: 'Pending', color: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' },
                                    { value: 'spam' as const, label: 'Spam', color: 'text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' },
                                ].map(option => (
                                    <label key={option.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${status === option.value ? option.color : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                        <input type="radio" name="status" value={option.value}
                                            checked={status === option.value}
                                            onChange={() => setStatus(option.value)}
                                            className="text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Publishing Info */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Post</span>
                            <Link href={getPostLink()} className="block text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1 truncate">
                                {getPostTitle()}
                            </Link>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Registered Author</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{getAuthorName_()}</p>
                            {getAuthorEmail_() && <p className="text-xs text-gray-400 dark:text-gray-500">{getAuthorEmail_()}</p>}
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {comment?.updatedAt ? new Date(comment.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {comment?.createdAt ? new Date(comment.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Comment ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{commentId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Toast */}
            {error && error !== 'not-found' && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-1 hover:bg-red-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Comment saved successfully
                        <button onClick={() => setSaveSuccess(false)} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
