'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Search, Edit, Trash2, Eye, Plus,
    Loader2, X, FileText, CheckCircle, Clock
} from '@/components/ui/IconWrapper';
import {
    getFormsList, deleteForm, getFormById,
} from './actions';
import type { FeedbackFormDoc, FeedbackFormsStats } from '@encreasl/cms-types';

const ITEMS_PER_PAGE = 20;

const BLOCK_LABELS: Record<string, string> = {
    textInput: 'Text Input',
    choiceInput: 'Choice Input',
    surveyMatrix: 'Survey Matrix',
};

function getBlockTypesSummary(fields: any[]): string {
    if (!fields || fields.length === 0) return 'No fields';
    const types = [...new Set(fields.map(f => BLOCK_LABELS[f.blockType] || f.blockType))];
    return `${fields.length} field${fields.length > 1 ? 's' : ''}: ${types.join(', ')}`;
}

export default function FeedbackFormsPage() {
    const [forms, setForms] = useState<FeedbackFormDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [stats, setStats] = useState<FeedbackFormsStats | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<FeedbackFormDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailForm, setDetailForm] = useState<FeedbackFormDoc | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const loadForms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getFormsList({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setForms(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
            setStats(data.stats);
        } catch (err) {
            console.error(err);
            setError('Failed to load feedback forms');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => { loadForms(); }, [loadForms]);

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
            await deleteForm(deleteTarget.id);
            setForms(prev => prev.filter(c => c.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetail = async (f: FeedbackFormDoc) => {
        setDetailForm(f);
        setIsDetailLoading(true);
        try {
            const full = await getFormById(f.id);
            setDetailForm(full);
        } catch { /* use existing data */ }
        setIsDetailLoading(false);
    };

    const totalFieldCount = stats?.totalFields ?? 0;

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4"><FileText className="h-12 w-12 mx-auto" /></div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load feedback forms</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadForms} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback Forms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage feedback &amp; survey forms</p>
                </div>
                <Link href="/feedback-forms/create"
                    className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Form
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
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Forms</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFieldCount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Fields</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30"><Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.avgFieldsPerForm ?? 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Fields/Form</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input type="text" placeholder="Search by title..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fields</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No forms found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch
                            ? 'No forms match your search criteria. Try a different search term.'
                            : 'Get started by creating your first feedback form.'}
                    </p>
                    {!debouncedSearch && (
                        <Link href="/feedback-forms/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Form
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fields</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {forms.map(f => (
                                    <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{f.title}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{f.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{getBlockTypesSummary(f.fields as any)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(f.updatedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openDetail(f)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link href={`/feedback-forms/${f.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Form">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => setDeleteTarget(f)}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Form</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-300">{deleteTarget.title}</span>? This action cannot be undone.
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
            {detailForm && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailForm(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">{detailForm.title}</h2>
                            <button onClick={() => setDetailForm(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
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
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{detailForm.description || 'No description'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Form ID</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">#{detailForm.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Fields</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{detailForm.fields?.length || 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(detailForm.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created At</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(detailForm.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {detailForm.fields && detailForm.fields.length > 0 && (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Fields</span>
                                            <div className="mt-2 space-y-2">
                                                {(detailForm.fields as any[]).map((field: any, i: number) => (
                                                    <div key={field.id || i}
                                                        className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                        <div className={`h-2 w-2 rounded-full shrink-0 ${field.blockType === 'textInput' ? 'bg-blue-500' : field.blockType === 'choiceInput' ? 'bg-amber-500' : 'bg-purple-500'}`} />
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{field.name || `Field ${i + 1}`}</span>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">{BLOCK_LABELS[field.blockType] || field.blockType}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                        <Link href={`/feedback-forms/${detailForm.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Form
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
