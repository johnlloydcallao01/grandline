'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import NextLink from 'next/link';
import {
    getLessons, deleteLesson, getLessonById,
    type LessonDoc, type ModuleOption
} from './actions';

const Link = NextLink as any;
const ITEMS_PER_PAGE = 12;

// Inline SVG icon components (matching web-instructor pattern)
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /></svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const Loader2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="19 12 12 19 5 12" /></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);
const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg>
);
export default function InstructorLessonsPage() {
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
        if (typeof lesson.module === 'string' || !lesson.bodyBlocks) {
            setIsDetailLoading(true);
            try {
                const full = await getLessonById(lesson.id);
                setDetailLesson(full as LessonDoc);
            } catch { /* use existing data */ }
            setIsDetailLoading(false);
        }
    };

    const getModuleName = (lesson: LessonDoc): string => {
        const mod = lesson.module;
        if (!mod) return 'Unknown';
        if (typeof mod === 'object') return mod.title || `Module #${mod.id}`;
        return 'Unknown';
    };

    const metricCards = [
        { label: 'Total Lessons', value: totalDocs, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: BookOpenIcon },
        { label: 'Modules', value: moduleOptions.length, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: FolderIcon },
        { label: 'Avg per Module', value: moduleOptions.length > 0 ? (totalDocs / moduleOptions.length).toFixed(1) : '0', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: FolderIcon },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <BookOpenIcon className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load lessons</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={loadLessons}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lessons</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your course lessons across your modules</p>
                </div>
                <Link
                    href="/courses/lessons/create"
                    className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Lesson
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    <>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                    <div>
                                        <div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    metricCards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {card.value}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {card.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by lesson title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            setModuleFilter('all');
                            setCurrentPage(1);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            moduleFilter === 'all'
                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        All Modules
                    </button>
                    {moduleOptions.slice(0, 5).map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => {
                                setModuleFilter(mod.id);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors max-w-[140px] truncate ${
                                moduleFilter === mod.id
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {mod.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lesson</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : lessons.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpenIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No lessons found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || moduleFilter !== 'all'
                            ? 'No lessons match your search criteria. Try adjusting the filters.'
                            : 'Get started by creating your first lesson.'}
                    </p>
                    {!debouncedSearch && moduleFilter === 'all' && (
                        <Link
                            href="/courses/lessons/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Lesson
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Lessons Table */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lesson</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {lessons.map((lesson) => {
                                    const moduleName = getModuleName(lesson);
                                    return (
                                        <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center overflow-hidden shrink-0">
                                                        <BookOpenIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/courses/lessons/${lesson.id}/edit`}
                                                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                                                        >
                                                            {lesson.title}
                                                        </Link>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{String(lesson.id).slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                    <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                    <span className="truncate">{moduleName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                    <ClockIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                    <span>{lesson.estimatedDuration ? `${lesson.estimatedDuration} min` : '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(lesson.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openDetail(lesson)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <Link
                                                        href={`/courses/lessons/${lesson.id}/edit`}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-5 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Edit Lesson"
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteTarget(lesson)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm px-4 py-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => !isDeleting && setDeleteTarget(null)}
                >
                    <div
                        className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Lesson</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.title}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting && <Loader2Icon className="h-4 w-4 animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-Over */}
            {detailLesson && (
                <div
                    className="fixed inset-0 z-50 flex justify-end"
                    onClick={() => setDetailLesson(null)}
                >
                    <div className="absolute inset-0 bg-black/30" />
                    <div
                        className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">
                                {detailLesson.title}
                            </h2>
                            <button
                                onClick={() => setDetailLesson(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0"
                            >
                                <XIcon className="h-5 w-5" />
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
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Lesson ID</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">
                                                #{detailLesson.id}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Module</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                                <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                {getModuleName(detailLesson)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Estimated Duration</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {detailLesson.estimatedDuration
                                                    ? `${detailLesson.estimatedDuration} min`
                                                    : 'Not set'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {new Date(detailLesson.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {detailLesson.updatedAt
                                                    ? new Date(detailLesson.updatedAt).toLocaleString()
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {detailLesson.bodyBlocks ? (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                                            <div className="mt-2 prose prose-sm max-w-none text-gray-900 dark:text-gray-100">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Rich content available
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpenIcon className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                No description
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                        <Link
                                            href={`/courses/lessons/${detailLesson.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                                        >
                                            <EditIcon className="h-4 w-4 mr-2" />
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
