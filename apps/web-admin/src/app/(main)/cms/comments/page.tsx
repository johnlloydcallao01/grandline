'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Search, Edit, Trash2, Eye, CheckCircle, XCircle,
    Loader2, X, MessageCircle, Clock
} from '@/components/ui/IconWrapper';
import {
    getCommentsList, deleteComment, getCommentById, updateComment,
    type PostCommentDoc
} from './actions';

const ITEMS_PER_PAGE = 20;

type StatusFilter = 'all' | 'pending' | 'approved' | 'spam';

const STATUS_TABS: { key: StatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { key: 'pending', label: 'Pending', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
    { key: 'approved', label: 'Approved', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { key: 'spam', label: 'Spam', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
];

export default function PostCommentsPage() {
    const [comments, setComments] = useState<PostCommentDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<PostCommentDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailComment, setDetailComment] = useState<PostCommentDoc | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadComments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCommentsList({
                search: debouncedSearch || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setComments(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage, statusFilter]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteComment(deleteTarget.id);
            setComments(prev => prev.filter(c => c.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (comment: PostCommentDoc, newStatus: 'approved' | 'spam') => {
        setActionLoading(comment.id);
        try {
            await updateComment(comment.id, { status: newStatus });
            setComments(prev => prev.map(c =>
                c.id === comment.id ? { ...c, status: newStatus } : c
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const openDetail = async (c: PostCommentDoc) => {
        setDetailComment(c);
        setIsDetailLoading(true);
        try {
            const full = await getCommentById(c.id);
            setDetailComment(full);
        } catch { /* use existing data */ }
        setIsDetailLoading(false);
    };

    const getPostTitle = (c: PostCommentDoc): string => {
        if (typeof c.post === 'object' && c.post?.title) return c.post.title;
        return `Post #${typeof c.post === 'object' ? c.post.id : c.post}`;
    };

    const getAuthorName = (c: PostCommentDoc): string => {
        if (c.authorName) return c.authorName;
        if (typeof c.author === 'object' && c.author?.name) return c.author.name;
        if (c.author) return `User #${typeof c.author === 'object' ? c.author.id : c.author}`;
        return 'Anonymous';
    };

    const getAuthorEmail = (c: PostCommentDoc): string => {
        if (c.authorEmail) return c.authorEmail;
        if (typeof c.author === 'object' && c.author?.email) return c.author.email;
        return '';
    };

    const truncate = (text: string, max: number) =>
        text.length > max ? text.slice(0, max) + '...' : text;

    const pendingCount = comments.filter(c => c.status === 'pending').length;
    const approvedCount = comments.filter(c => c.status === 'approved').length;
    const spamCount = comments.filter(c => c.status === 'spam').length;

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4"><MessageCircle className="h-12 w-12 mx-auto" /></div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load comments</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadComments} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Comments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage blog post comments</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><div className="h-5 w-5 bg-blue-200 dark:bg-blue-700 rounded" /></div>
                                    <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Comments</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30"><Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingCount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{approvedCount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/30"><XCircle className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{spamCount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Spam</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-[var(--card-border)]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input type="text" placeholder="Search by content or author name..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                </div>
                <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto">
                    {STATUS_TABS.map(tab => {
                        const counts = tab.key === 'all' ? totalDocs
                            : tab.key === 'pending' ? pendingCount
                            : tab.key === 'approved' ? approvedCount
                            : spamCount;
                        return (
                            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === tab.key
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}>
                                <span>{tab.label}</span>
                                {counts > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tab.color}`}>{counts}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comment</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Post</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : comments.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No comments found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch
                            ? 'No comments match your search criteria. Try a different search term.'
                            : statusFilter !== 'all'
                                ? `No ${statusFilter} comments to review.`
                                : 'No comments have been submitted yet.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Post</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {comments.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3 max-w-[240px]">
                                            <div className="flex items-start gap-2">
                                                <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
                                                <div className="min-w-0">
                                                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{truncate(c.content, 80)}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">#{c.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{truncate(getPostTitle(c), 40)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{truncate(getAuthorName(c), 24)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : c.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {c.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(c, 'approved')} disabled={actionLoading === c.id}
                                                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Approve">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleStatusChange(c, 'spam')} disabled={actionLoading === c.id}
                                                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Mark as Spam">
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => openDetail(c)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link href={`/cms/comments/${c.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Comment">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => setDeleteTarget(c)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm px-4 py-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    return (
                                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Comment</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this comment? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
                                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-Over */}
            {detailComment && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailComment(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">Comment #{detailComment.id}</h2>
                            <button onClick={() => setDetailComment(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {isDetailLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                    <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${detailComment.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : detailComment.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                            {detailComment.status.charAt(0).toUpperCase() + detailComment.status.slice(1)}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Comment</span>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{detailComment.content}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Comment ID</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">#{detailComment.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Post</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs mt-1">{getPostTitle(detailComment)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Author</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs mt-1">{getAuthorName(detailComment)}</p>
                                            {getAuthorEmail(detailComment) && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{getAuthorEmail(detailComment)}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs mt-1">{new Date(detailComment.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created At</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs mt-1">{new Date(detailComment.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                        <Link href={`/cms/comments/${detailComment.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Comment
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
