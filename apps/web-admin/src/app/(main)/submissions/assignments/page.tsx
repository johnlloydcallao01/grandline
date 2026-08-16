'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Search, BookOpen, Trash2, Eye,
    Loader2, X, FileText, User, Folder, File,
    CheckCircle, XCircle, Clock, Edit
} from '@/components/ui/IconWrapper';
import {
    getAssignmentSubmissions, deleteAssignmentSubmission,
    type AssignmentSubmissionDoc, type MediaRef
} from './actions';

const ITEMS_PER_PAGE = 20;

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    graded: 'Graded',
    returned_for_revision: 'Returned',
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    submitted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    graded: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    returned_for_revision: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    draft: Clock,
    submitted: FileText,
    graded: CheckCircle,
    returned_for_revision: XCircle,
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'graded', label: 'Graded' },
    { value: 'returned_for_revision', label: 'Returned' },
];

function getTraineeName(submission: AssignmentSubmissionDoc): string {
    const t = submission.trainee;
    if (!t || typeof t === 'number') return `Trainee #${submission.id}`;
    const u = (t as any).user;
    if (u && (u.firstName || u.lastName)) return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    if ((t as any).srn) return (t as any).srn;
    return `Trainee #${t.id}`;
}

function getAssignmentTitle(submission: AssignmentSubmissionDoc): string {
    const a = submission.assignment;
    if (!a || typeof a === 'number') return `Assignment #${submission.id}`;
    return (a as any).title || `Assignment #${a.id}`;
}

function getCourseTitle(submission: AssignmentSubmissionDoc): string {
    const e = submission.enrollment;
    if (!e || typeof e === 'number') return '—';
    const c = (e as any).course;
    if (!c || typeof c === 'number') return '—';
    return (c as any).title || `Course #${c.id}`;
}

function getFilesCount(submission: AssignmentSubmissionDoc): number {
    const f = submission.uploadedFiles;
    if (!f) return 0;
    if (Array.isArray(f)) return f.length;
    return 0;
}

function getStatusIcon(status: string) {
    const Icon = STATUS_ICONS[status] || FileText;
    return <Icon className="h-4 w-4" />;
}

export default function AssignmentSubmissionsPage() {
    const [submissions, setSubmissions] = useState<AssignmentSubmissionDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<AssignmentSubmissionDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailSubmission, setDetailSubmission] = useState<AssignmentSubmissionDoc | null>(null);

    const loadSubmissions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAssignmentSubmissions({
                search: debouncedSearch || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setSubmissions(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load assignment submissions');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter, currentPage]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const draftCount = submissions.filter(s => s.status === 'draft').length;
    const submittedCount = submissions.filter(s => s.status === 'submitted').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;

    const metricCards = [
        { label: 'Total Submissions', value: totalDocs, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: BookOpen },
        { label: 'Draft', value: draftCount, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: Clock },
        { label: 'Submitted', value: submittedCount, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: FileText },
        { label: 'Graded', value: gradedCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: CheckCircle },
    ];

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteAssignmentSubmission(deleteTarget.id);
            setSubmissions(prev => prev.filter(s => s.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getScoreDisplay = (submission: AssignmentSubmissionDoc) => {
        if (submission.score == null) return <span className="text-gray-400 dark:text-gray-500">—</span>;
        const a = submission.assignment;
        const maxScore = (a && typeof a === 'object' ? (a as any).maxScore : undefined) ?? 100;
        const passingScore = (a && typeof a === 'object' ? (a as any).passingScore : undefined) ?? 75;
        const passed = submission.score >= passingScore;
        return (
            <span className={`font-semibold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {submission.score} / {maxScore}
            </span>
        );
    };

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <BookOpen className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load submissions</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadSubmissions} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignment Submissions</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage trainee assignment submissions</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map(i => (
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by trainee or assignment..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === opt.value
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
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
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trainee</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Files</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8" /></td>
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
                        <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No submissions found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || statusFilter !== 'all'
                            ? 'No submissions match your search criteria. Try adjusting the filters.'
                            : 'No assignment submissions have been recorded yet.'}
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
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Files</th>
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
                                                    <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
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
                                                <Edit className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{getAssignmentTitle(submission)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[submission.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                                {getStatusIcon(submission.status)}
                                                {STATUS_LABELS[submission.status] || submission.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm">{getScoreDisplay(submission)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{getFilesCount(submission)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(submission.submittedAt)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setDetailSubmission(submission)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(submission)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
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

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Submission</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this submission by <span className="font-semibold text-gray-700 dark:text-gray-200">{getTraineeName(deleteTarget)}</span>? This action cannot be undone.
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
            {detailSubmission && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailSubmission(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">Submission Details</h2>
                            <button onClick={() => setDetailSubmission(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[detailSubmission.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                        {getStatusIcon(detailSubmission.status)}
                                        {STATUS_LABELS[detailSubmission.status] || detailSubmission.status}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{detailSubmission.id}</span>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Trainee</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {getTraineeName(detailSubmission)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Assignment</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <Edit className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {getAssignmentTitle(detailSubmission)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Course</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <Folder className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {getCourseTitle(detailSubmission)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Score</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {detailSubmission.score != null
                                            ? `${detailSubmission.score} / ${((detailSubmission.assignment && typeof detailSubmission.assignment === 'object') ? (detailSubmission.assignment as any).maxScore : '?')}`
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Submitted At</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(detailSubmission.submittedAt)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Graded At</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(detailSubmission.gradedAt)}</p>
                                </div>
                                {detailSubmission.gradedBy && typeof detailSubmission.gradedBy === 'object' && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500 dark:text-gray-400">Graded By</span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                            {(detailSubmission.gradedBy as any).firstName || ''} {(detailSubmission.gradedBy as any).lastName || ''}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submitted Text */}
                            {detailSubmission.submittedText && (
                                <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Submitted Text</h3>
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                                        {typeof detailSubmission.submittedText === 'object' ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Rich text content</p>
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{String(detailSubmission.submittedText)}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Files */}
                            {detailSubmission.uploadedFiles && detailSubmission.uploadedFiles.length > 0 && (
                                <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Uploaded Files ({detailSubmission.uploadedFiles.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {(detailSubmission.uploadedFiles as MediaRef[]).map((file) => {
                                            const name = file.filename || `File #${file.id}`;
                                            return (
                                                <div key={file.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                        <File className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {file.mimeType || 'Unknown type'}
                                                            {file.filesize ? ` — ${(file.filesize / 1024).toFixed(1)} KB` : ''}
                                                        </p>
                                                    </div>
                                                    {file.url && (
                                                        <a
                                                            href={file.url.startsWith('http') ? file.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${file.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 shrink-0"
                                                        >
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {detailSubmission.feedback && (
                                <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Instructor Feedback</h3>
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                                        {typeof detailSubmission.feedback === 'object' ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Rich text feedback</p>
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{String(detailSubmission.feedback)}</p>
                                        )}
                                    </div>
                                </div>
                            )}

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
