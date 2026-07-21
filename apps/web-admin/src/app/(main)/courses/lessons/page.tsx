'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Plus, Search, BookOpen, Clock, Edit, Trash2, Eye,
    Loader2, X, Folder
} from '@/components/ui/IconWrapper';
import {
    getLessons, deleteLesson, getLessonById,
    type LessonDoc, type ModuleOption
} from './actions';

const ITEMS_PER_PAGE = 12;

export default function CourseLessonsPage() {
    const [lessons, setLessons] = useState<LessonDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);

    const [deleteTarget, setDeleteTarget] = useState<LessonDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailLesson, setDetailLesson] = useState<LessonDoc | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const loadLessons = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getLessons({
                search: debouncedSearch || undefined,
                moduleId: moduleFilter === 'all' ? undefined : moduleFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setLessons(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
            if (data.moduleOptions) {
                setModuleOptions(data.moduleOptions);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load lessons');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, moduleFilter, currentPage]);

    useEffect(() => {
        loadLessons();
    }, [loadLessons]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const getModuleName = (lesson: LessonDoc): string => {
        const mod = lesson.module;
        if (!mod) return 'Unknown';
        if (typeof mod === 'object') return mod.title || `Module #${mod.id}`;
        return 'Unknown';
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteLesson(deleteTarget.id);
            setLessons(prev => prev.filter(l => l.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetail = async (lesson: LessonDoc) => {
        setDetailLesson(lesson);
        if (typeof lesson.module === 'string' || !lesson.description) {
            setIsDetailLoading(true);
            try {
                const full = await getLessonById(lesson.id);
                setDetailLesson(full.lesson);
            } catch { /* use existing data */ }
            setIsDetailLoading(false);
        }
    };

    const metricCards = [
        { label: 'Total Lessons', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50', icon: BookOpen },
        { label: 'Avg per Module', value: moduleOptions.length > 0 ? (totalDocs / moduleOptions.length).toFixed(1) : '0', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Folder },
        { label: 'Modules', value: moduleOptions.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: Folder },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <BookOpen className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">Failed to load lessons</p>
                    <p className="text-gray-500 text-sm mb-4">{error}</p>
                    <button onClick={loadLessons} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
                    <p className="text-gray-500 mt-1">Manage all course lessons across the platform</p>
                </div>
                <Link
                    href="/courses/lessons/create"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lesson
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-50"><div className="h-5 w-5 bg-blue-200 rounded" /></div>
                                <div><div className="h-7 w-12 bg-gray-100 rounded mb-1" /><div className="h-3 w-24 bg-gray-100 rounded" /></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-indigo-50"><div className="h-5 w-5 bg-indigo-200 rounded" /></div>
                                <div><div className="h-7 w-12 bg-gray-100 rounded mb-1" /><div className="h-3 w-28 bg-gray-100 rounded" /></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-50"><div className="h-5 w-5 bg-purple-200 rounded" /></div>
                                <div><div className="h-7 w-12 bg-gray-100 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 rounded" /></div>
                            </div>
                        </div>
                    </>
                ) : (
                    metricCards.map((card) => (
                        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                    <p className="text-xs text-gray-500">{card.label}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by lesson title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => { setModuleFilter('all'); setCurrentPage(1); }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            moduleFilter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All Modules
                    </button>
                    {moduleOptions.slice(0, 5).map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => { setModuleFilter(mod.id); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors max-w-[140px] truncate ${
                                moduleFilter === mod.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {mod.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lesson</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : lessons.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No lessons found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {debouncedSearch || moduleFilter !== 'all'
                            ? 'No lessons match your search criteria. Try adjusting the filters.'
                            : 'Get started by creating your first lesson.'}
                    </p>
                    {!debouncedSearch && moduleFilter === 'all' && (
                        <Link
                            href="/courses/lessons/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Lesson
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Lessons Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lesson</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lessons.map((lesson) => (
                                    <tr key={lesson.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    <BookOpen className="h-5 w-5 text-indigo-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 truncate block">
                                                        {lesson.title}
                                                    </span>
                                                    <p className="text-xs text-gray-400 font-mono">#{String(lesson.id).slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate">{getModuleName(lesson)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span>{lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500">
                                                {new Date(lesson.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openDetail(lesson)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/courses/lessons/${lesson.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Edit Lesson"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(lesson)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
                            <p className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Lesson</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteTarget.title}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-Over */}
            {detailLesson && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailLesson(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{detailLesson.title}</h2>
                            <button onClick={() => setDetailLesson(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {isDetailLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                                    <div className="h-20 bg-gray-100 rounded w-full" />
                                </div>
                            ) : (
                                <>
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Lesson ID</span>
                                            <p className="font-medium text-gray-900 font-mono text-xs mt-1">#{detailLesson.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Module</span>
                                            <p className="font-medium text-gray-900 flex items-center gap-1.5 mt-1">
                                                <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                {getModuleName(detailLesson)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Estimated Duration</span>
                                            <p className="font-medium text-gray-900 mt-1">
                                                {detailLesson.estimatedDuration ? `${detailLesson.estimatedDuration} min` : 'Not set'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Created</span>
                                            <p className="font-medium text-gray-900 mt-1">{new Date(detailLesson.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Last Updated</span>
                                            <p className="font-medium text-gray-900 mt-1">{new Date(detailLesson.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {detailLesson.description ? (
                                        <div>
                                            <span className="text-sm text-gray-500">Description</span>
                                            <div className="mt-2 prose prose-sm max-w-none text-gray-900">
                                                {typeof detailLesson.description === 'object' ? (
                                                    <p className="text-sm text-gray-600">Rich content available</p>
                                                ) : (
                                                    <p className="text-sm text-gray-900">{String(detailLesson.description)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">No description</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <Link
                                            href={`/courses/lessons/${detailLesson.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Lesson
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
