'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Search, Edit, Trash2, Eye,
    Loader2, X, BookOpen
} from '@/components/ui/IconWrapper';
import {
    getTagsList, deleteTag, getTagById,
    type PostTagDoc
} from './actions';

const ITEMS_PER_PAGE = 20;

export default function PostTagsPage() {
    const [tags, setTags] = useState<PostTagDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<PostTagDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailTag, setDetailTag] = useState<PostTagDoc | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const loadTags = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getTagsList({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setTags(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load tags');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

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
            await deleteTag(deleteTarget.id);
            setTags(prev => prev.filter(c => c.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetail = async (t: PostTagDoc) => {
        setDetailTag(t);
        if (!t.description) {
            setIsDetailLoading(true);
            try {
                const full = await getTagById(t.id);
                setDetailTag(full);
            } catch { /* use existing data */ }
            setIsDetailLoading(false);
        }
    };

    const activeTags = tags.filter(t => t.isActive).length;

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4"><BookOpen className="h-12 w-12 mx-auto" /></div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load tags</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadTags} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tags</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Organize and tag blog post content</p>
                </div>
                <Link href="/cms/posts/tags/create"
                    className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm font-medium">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Create Tag
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><div className="h-5 w-5 bg-blue-200 dark:bg-blue-700 rounded" /></div>
                                    <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Tags</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30"><BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeTags}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800"><BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs - activeTags}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Inactive</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search by name..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[var(--card-background)]" />
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tag</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : tags.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No tags found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch
                            ? 'No tags match your search criteria. Try a different search term.'
                            : 'Get started by creating your first tag.'}
                    </p>
                    {!debouncedSearch && (
                        <Link href="/cms/posts/tags/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                            Create Tag
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tag</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {tags.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {t.colorCode && (
                                                    <div className="h-8 w-8 rounded-md shrink-0" style={{ backgroundColor: t.colorCode }} />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.name}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{String(t.id).slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{t.slug}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {t.colorCode ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="h-4 w-4 rounded border border-gray-200 dark:border-gray-600 inline-block" style={{ backgroundColor: t.colorCode }} />
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{t.colorCode}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                                {t.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openDetail(t)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link href={`/cms/posts/tags/${t.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Tag">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => setDeleteTarget(t)}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Tag</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-300">{deleteTarget.name}</span>? This action cannot be undone.
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
            {detailTag && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailTag(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">{detailTag.name}</h2>
                            <button onClick={() => setDetailTag(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
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
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${detailTag.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                            {detailTag.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Tag ID</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">#{detailTag.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Slug</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">{detailTag.slug}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Display Order</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{detailTag.displayOrder ?? 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Color</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
                                                {detailTag.colorCode ? (
                                                    <><span className="h-4 w-4 rounded border border-gray-200 dark:border-gray-600 inline-block" style={{ backgroundColor: detailTag.colorCode }} />{detailTag.colorCode}</>
                                                ) : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(detailTag.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {detailTag.description ? (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{detailTag.description}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpen className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No description</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                        <Link href={`/cms/posts/tags/${detailTag.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Tag
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
