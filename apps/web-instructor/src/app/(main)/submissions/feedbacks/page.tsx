'use client';

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFeedbackSubmissions, getFeedbackFormOptions } from './actions';
import type { FeedbackFormRef, FeedbackFormOption, FeedbackSubmissionDoc } from '@encreasl/cms-types';

const ITEMS_PER_PAGE = 20;

// Inline SVG icon components (matching web-instructor pattern)
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const FolderIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
);
const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const BookOpenIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

function getTraineeName(submission: FeedbackSubmissionDoc): string {
    const t = submission.trainee;
    if (!t || typeof t === 'number') return `Trainee #${submission.id}`;
    const u = (t as any).user;
    if (u && (u.firstName || u.lastName)) return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    if ((t as any).srn) return (t as any).srn;
    return `Trainee #${t.id}`;
}

function getFormTitle(submission: FeedbackSubmissionDoc): string {
    const f = submission.form;
    if (!f || typeof f === 'number') return `Form #${submission.id}`;
    return (f as any).title || `Form #${f.id}`;
}

function getCourseTitle(submission: FeedbackSubmissionDoc): string {
    const c = submission.course;
    if (!c || typeof c === 'number') return '—';
    return (c as any).title || `Course #${c.id}`;
}

function getResponseSummary(submission: FeedbackSubmissionDoc): string {
    const r = submission.responses;
    if (!r || typeof r !== 'object') return '—';
    const entries = Object.entries(r).filter(([k]) => !k.startsWith('_'));
    const count = entries.length;
    if (count === 0) return 'No responses';
    const firstVal = entries[0][1];
    const preview = typeof firstVal === 'string' ? firstVal : JSON.stringify(firstVal);
    return `${count} field${count !== 1 ? 's' : ''} \u2014 ${preview.slice(0, 60)}${preview.length > 60 ? '\u2026' : ''}`;
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function renderResponseValue(value: any): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function getFieldLabel(form: FeedbackFormRef | number | undefined, fieldName: string): string {
    if (!form || typeof form === 'number') return fieldName;
    const f = form as any;
    if (!f.fields || !Array.isArray(f.fields)) return fieldName;
    const block = f.fields.find((bf: any) => {
        if (bf.name === fieldName) return true;
        if (bf.fields?.length) return bf.fields.some((sf: any) => sf.name === fieldName);
        return false;
    });
    if (!block) return fieldName;
    if (block.label) return block.label;
    if (block.fields) {
        const sub = block.fields.find((sf: any) => sf.name === fieldName);
        return sub?.label || fieldName;
    }
    return fieldName;
}

export default function FeedbackSubmissionsPage() {
    return (
        <Suspense fallback={null}>
            <FeedbackSubmissionsContent />
        </Suspense>
    );
}

function FeedbackSubmissionsContent() {
    const searchParams = useSearchParams();
    const [submissions, setSubmissions] = useState<FeedbackSubmissionDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formFilter, setFormFilter] = useState<string>(searchParams.get('formId') || 'all');
    const [formOptions, setFormOptions] = useState<FeedbackFormOption[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [detailSubmission, setDetailSubmission] = useState<FeedbackSubmissionDoc | null>(null);

    const loadSubmissions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getFeedbackSubmissions({
                search: debouncedSearch || undefined,
                formId: formFilter === 'all' ? undefined : formFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setSubmissions(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load feedback submissions');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, formFilter, currentPage]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    useEffect(() => {
        getFeedbackFormOptions().then(setFormOptions).catch(() => { });
    }, []);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const uniqueCourseIds = new Set(
        submissions.map(s => {
            const c = s.course;
            return (c && typeof c === 'object' ? (c as any).id : null);
        }).filter(Boolean)
    );

    const uniqueFormIds = new Set(
        submissions.map(s => {
            const f = s.form;
            return (f && typeof f === 'object' ? (f as any).id : null);
        }).filter(Boolean)
    );

    const metricCards = [
        { label: 'Total Submissions', value: totalDocs, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: BookOpenIcon },
        { label: 'Feedback Forms', value: uniqueFormIds.size, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: MessageSquareIcon },
        { label: 'Courses', value: uniqueCourseIds.size, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: FolderIcon },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <BookOpenIcon className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load feedback submissions</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadSubmissions}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback Submissions</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View trainee feedback and survey responses from your courses</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" /></div>
                                    <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    metricCards.map((card) => (
                        <div key={card.label} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
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
                        placeholder="Search by trainee, form, or course..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={formFilter}
                    onChange={(e) => { setFormFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All Forms</option>
                    {formOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.title}</option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trainee</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responses</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : submissions.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquareIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No feedback submissions found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || formFilter !== 'all'
                            ? 'No submissions match your search criteria. Try adjusting the filters.'
                            : 'Trainees have not submitted any feedback for your courses yet.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Submissions Table */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trainee</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responses</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {submissions.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center shrink-0">
                                                    <UserIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                                                        {getTraineeName(submission)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <MessageSquareIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{getFormTitle(submission)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{getCourseTitle(submission)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate block max-w-xs">
                                                {getResponseSummary(submission)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(submission.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setDetailSubmission(submission)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
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
                                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Detail Slide-Over */}
            {detailSubmission && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailSubmission(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">Feedback Details</h2>
                            <button onClick={() => setDetailSubmission(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 min-h-[calc(100vh-4rem)]">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Trainee</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <UserIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {getTraineeName(detailSubmission)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Form</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <MessageSquareIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {getFormTitle(detailSubmission)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Course</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {getCourseTitle(detailSubmission)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Submitted</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(detailSubmission.createdAt)}</p>
                                </div>
                            </div>

                            {/* Form Description */}
                            {detailSubmission.form && typeof detailSubmission.form === 'object' && (detailSubmission.form as any).description && (
                                <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Form Description</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{(detailSubmission.form as any).description}</p>
                                </div>
                            )}

                            {/* Responses */}
                            <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Responses</h3>
                                {detailSubmission.responses && typeof detailSubmission.responses === 'object' ? (
                                    <div className="space-y-3">
                                        {Object.entries(detailSubmission.responses).filter(([k]) => !k.startsWith('_')).map(([key, value]) => (
                                            <div key={key} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
                                                    {getFieldLabel(detailSubmission.form, key)}
                                                </p>
                                                {Array.isArray(value) ? (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {(value as any[]).map((v, i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-sm text-gray-900 dark:text-gray-100">
                                                                {renderResponseValue(v)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : typeof value === 'object' && value !== null ? (
                                                    <div className="mt-1 space-y-1">
                                                        {Object.entries(value).map(([sk, sv]) => (
                                                            <div key={sk} className="flex items-center gap-2 text-sm">
                                                                <span className="text-gray-400 dark:text-gray-500 font-medium">{sk}:</span>
                                                                <span className="text-gray-900 dark:text-gray-100">{renderResponseValue(sv)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{renderResponseValue(value)}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <MessageSquareIcon className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 dark:text-gray-500">No response data</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => setDetailSubmission(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}