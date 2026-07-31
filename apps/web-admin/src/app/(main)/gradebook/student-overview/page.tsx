'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Search, X, User, BookOpen, TrendingUp,
    Users, CheckCircle, Eye, Award, Clock
} from '@/components/ui/IconWrapper';
import {
    getTraineesList, getStudentOverview,
    type TraineeWithStats, type StudentOverviewData, type EnrollmentDoc
} from '../actions';
import {
    getTraineeDisplayName, getTraineeEmail, getCourseTitle,
    type TraineeDoc
} from '../utils';

const ITEMS_PER_PAGE = 25;

const LEVEL_COLORS: Record<string, string> = {
    standard: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    advanced: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

function LevelBadge({ level }: { level?: string | null }) {
    const c = LEVEL_COLORS[level || 'standard'] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${c}`}>{level || 'standard'}</span>;
}

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    suspended: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    dropped: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    expired: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    pending: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

const EVAL_COLORS: Record<string, string> = {
    passed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

function StatusBadge({ status }: { status: string }) {
    const c = STATUS_COLORS[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${c}`}>{status}</span>;
}

function EvalBadge({ eval: ev }: { eval: string | null | undefined }) {
    if (!ev) return <span className="text-xs text-gray-400">—</span>;
    const c = EVAL_COLORS[ev] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${c}`}>{ev}</span>;
}

function GradeDisplay({ grade }: { grade: number | null | undefined }) {
    if (grade == null) return <span className="text-xs text-gray-400">—</span>;
    const color = grade >= 70 ? 'text-green-600 dark:text-green-400' : grade >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
    return <span className={`text-sm font-semibold ${color}`}>{Math.round(grade)}%</span>;
}

export default function StudentOverviewPage() {
    const [trainees, setTrainees] = useState<TraineeWithStats[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [selectedTrainee, setSelectedTrainee] = useState<TraineeDoc | null>(null);
    const [overview, setOverview] = useState<StudentOverviewData | null>(null);
    const [isOverviewLoading, setIsOverviewLoading] = useState(false);
    const [overviewError, setOverviewError] = useState<string | null>(null);

    const loadTrainees = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getTraineesList({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setTrainees(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load students');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => { loadTrainees(); }, [loadTrainees]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const openOverview = async (t: TraineeDoc) => {
        setSelectedTrainee(t);
        setIsOverviewLoading(true);
        setOverviewError(null);
        setOverview(null);
        try {
            const data = await getStudentOverview(t.id);
            setOverview(data);
        } catch (err: any) {
            setOverviewError(err.message || 'Failed to load student data');
        }
        setIsOverviewLoading(false);
    };

    const avgGradeAll = trainees.length > 0
        ? Math.round(trainees.reduce((s, t) => s + (t.avgGrade ?? 0), 0) / trainees.length)
        : 0;

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4"><Users className="h-12 w-12 mx-auto" /></div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load students</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadTrainees} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/gradebook" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Overview</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">View grades and performance for all students across courses</p>
                    </div>
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
                                    <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-600"><Users className="h-5 w-5 text-white" /></div>
                                <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Students</p></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-green-600"><CheckCircle className="h-5 w-5 text-white" /></div>
                                <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{trainees.reduce((s, t) => s + t.completedCount, 0)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Courses Completed</p></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-600"><TrendingUp className="h-5 w-5 text-white" /></div>
                                <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgGradeAll}%</p><p className="text-xs text-gray-500 dark:text-gray-400">Avg Grade</p></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-indigo-600"><Award className="h-5 w-5 text-white" /></div>
                                <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{trainees.reduce((s, t) => s + t.certificateCount, 0)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Certificates</p></div>
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
                        <input type="text" placeholder="Search by name, SRN, or email..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                </div>
            </div>

            {/* Loading / Empty / Table */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SRN</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Courses</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Grade</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : trainees.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No students found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch ? 'No students match your search criteria.' : 'No students are registered in the system yet.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SRN</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Courses</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Grade</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {trainees.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{getTraineeDisplayName(t)}</span>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{getTraineeEmail(t)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{t.srn}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <LevelBadge level={t.currentLevel} />
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{t.enrollmentCount}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{t.completedCount}</td>
                                    <td className="px-4 py-3 text-center">
                                        {t.avgGrade != null
                                            ? <span className={`text-sm font-semibold ${t.avgGrade >= 70 ? 'text-green-600 dark:text-green-400' : t.avgGrade >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{t.avgGrade}%</span>
                                            : <span className="text-xs text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openOverview(t)}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
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

            {/* Detail Slide-Over */}
            {(selectedTrainee && (isOverviewLoading || overview || overviewError)) && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => { setSelectedTrainee(null); setOverview(null); setOverviewError(null); }}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{getTraineeDisplayName(selectedTrainee)}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedTrainee.srn}{getTraineeEmail(selectedTrainee) ? ` · ${getTraineeEmail(selectedTrainee)}` : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedTrainee(null); setOverview(null); setOverviewError(null); }}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {isOverviewLoading ? (
                            <div className="p-6 space-y-4 animate-pulse">
                                <div className="grid grid-cols-5 gap-3">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
                                </div>
                                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded w-full" />)}</div>
                            </div>
                        ) : overviewError ? (
                            <div className="p-6 text-center">
                                <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                </div>
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Failed to load student data</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{overviewError}</p>
                                <button onClick={() => openOverview(selectedTrainee)} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium">Retry</button>
                            </div>
                        ) : overview && (
                            <div className="p-6 space-y-6">
                                {/* Profile card */}
                                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-[var(--card-border)]">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Level</span>
                                        <div className="mt-1"><LevelBadge level={selectedTrainee.currentLevel} /></div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">SRN</span>
                                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">{selectedTrainee.srn}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 truncate">{getTraineeEmail(selectedTrainee) || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Enrolled</span>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedTrainee.enrollmentDate ? new Date(selectedTrainee.enrollmentDate).toLocaleDateString() : '—'}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {[
                                        { icon: BookOpen, label: 'Courses', value: overview.stats.totalCourses, color: 'bg-blue-600' },
                                        { icon: CheckCircle, label: 'Completed', value: overview.stats.completedCourses, color: 'bg-green-600' },
                                        { icon: Clock, label: 'In Progress', value: overview.stats.inProgressCourses, color: 'bg-amber-600' },
                                        { icon: TrendingUp, label: 'Avg Grade', value: overview.stats.avgGrade != null ? `${overview.stats.avgGrade}%` : '—', color: 'bg-purple-600' },
                                        { icon: Award, label: 'Certificates', value: overview.stats.certificateCount, color: 'bg-indigo-600' },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="bg-white dark:bg-[var(--card-background)] rounded-lg border border-gray-200 dark:border-[var(--card-border)] p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${color}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
                                                <div><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p><p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Enrollments table */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Course Enrollments</h3>
                                    {overview.enrollments.length === 0 ? (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No enrollments</p>
                                    ) : (
                                        <div className="border border-gray-200 dark:border-[var(--card-border)] rounded-xl overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                                                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                                                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Eval</th>
                                                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {overview.enrollments.map((e: EnrollmentDoc) => {
                                                        const courseId = typeof e.course === 'number' ? e.course : (e.course as any)?.id;
                                                        return (
                                                            <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                                <td className="px-3 py-2.5">
                                                                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{getCourseTitle(e.course as any)}</span>
                                                                </td>
                                                                <td className="px-3 py-2.5"><StatusBadge status={e.status} /></td>
                                                                <td className="px-3 py-2.5"><GradeDisplay grade={e.finalGrade ?? e.currentGrade} /></td>
                                                                <td className="px-3 py-2.5"><EvalBadge eval={e.finalEvaluation} /></td>
                                                                <td className="px-3 py-2.5 text-right">
                                                                    <Link href={`/gradebook/${courseId}/${e.id}/edit`}
                                                                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                                        Edit
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
