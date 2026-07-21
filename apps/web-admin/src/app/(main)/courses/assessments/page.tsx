'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Search, BookOpen, Edit, Trash2, Eye,
    Loader2, X, Folder, FileText
} from '@/components/ui/IconWrapper';
import {
    getAssessments, deleteAssessment, getAssessmentById,
    type AssessmentDoc
} from './actions';

const ITEMS_PER_PAGE = 12;

const TYPE_LABELS: Record<string, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    final_exam: 'Final Exam',
};

const TYPE_COLORS: Record<string, string> = {
    quiz: 'bg-blue-100 text-blue-700',
    exam: 'bg-orange-100 text-orange-700',
    final_exam: 'bg-purple-100 text-purple-700',
};

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'final_exam', label: 'Final Exam' },
];

export default function AssessmentsPage() {
    const [assessments, setAssessments] = useState<AssessmentDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [moduleFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<AssessmentDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailAssessment, setDetailAssessment] = useState<AssessmentDoc | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const loadAssessments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAssessments({
                search: debouncedSearch || undefined,
                assessmentType: typeFilter === 'all' ? undefined : typeFilter,
                moduleId: moduleFilter === 'all' ? undefined : moduleFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setAssessments(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);

        } catch (err) {
            console.error(err);
            setError('Failed to load assessments');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, typeFilter, moduleFilter, currentPage]);

    useEffect(() => {
        loadAssessments();
    }, [loadAssessments]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const getModuleName = (assessment: AssessmentDoc): string => {
        if (assessment.assessmentType === 'final_exam') {
            const c = assessment.course;
            if (!c) return 'N/A';
            if (typeof c === 'object') return c.title || `Course #${c.id}`;
            return 'N/A';
        }
        const mod = assessment.module;
        if (!mod) return 'N/A';
        if (typeof mod === 'object') return mod.title || `Module #${mod.id}`;
        return 'N/A';
    };

    const getItemsCount = (assessment: AssessmentDoc): number => {
        return assessment.items?.length || 0;
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteAssessment(deleteTarget.id);
            setAssessments(prev => prev.filter(a => a.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetail = async (assessment: AssessmentDoc) => {
        setDetailAssessment(assessment);
        if (typeof assessment.module === 'string' || !assessment.description) {
            setIsDetailLoading(true);
            try {
                const full = await getAssessmentById(assessment.id);
                setDetailAssessment(full.assessment);
            } catch { /* use existing data */ }
            setIsDetailLoading(false);
        }
    };

    const typeCounts = {
        quiz: assessments.filter(a => a.assessmentType === 'quiz').length,
        exam: assessments.filter(a => a.assessmentType === 'exam').length,
        final_exam: assessments.filter(a => a.assessmentType === 'final_exam').length,
    };

    const metricCards = [
        { label: 'Total Assessments', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50', icon: BookOpen },
        { label: 'Quizzes', value: typeCounts.quiz, color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
        { label: 'Exams', value: typeCounts.exam, color: 'text-orange-600', bg: 'bg-orange-50', icon: FileText },
        { label: 'Final Exams', value: typeCounts.final_exam, color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <BookOpen className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">Failed to load assessments</p>
                    <p className="text-gray-500 text-sm mb-4">{error}</p>
                    <button onClick={loadAssessments} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
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
                    <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
                    <p className="text-gray-500 mt-1">Create and manage quizzes, exams, and assessments</p>
                </div>
                <Link
                    href="/courses/assessments/create"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Create Assessment
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                                <div className="p-2.5 rounded-lg bg-blue-50"><div className="h-5 w-5 bg-blue-200 rounded" /></div>
                                <div><div className="h-7 w-12 bg-gray-100 rounded mb-1" /><div className="h-3 w-16 bg-gray-100 rounded" /></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-orange-50"><div className="h-5 w-5 bg-orange-200 rounded" /></div>
                                <div><div className="h-7 w-12 bg-gray-100 rounded mb-1" /><div className="h-3 w-16 bg-gray-100 rounded" /></div>
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
                        placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {TYPE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setTypeFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                typeFilter === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {opt.label}
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
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assessment</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module / Course</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Passing</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : assessments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No assessments found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {debouncedSearch || typeFilter !== 'all'
                            ? 'No assessments match your search criteria. Try adjusting the filters.'
                            : 'Get started by creating your first assessment.'}
                    </p>
                    {!debouncedSearch && typeFilter === 'all' && (
                        <Link
                            href="/courses/assessments/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                            Create Assessment
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Assessments Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assessment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module / Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Passing</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assessments.map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 truncate block">
                                                        {assessment.title}
                                                    </span>
                                                    <p className="text-xs text-gray-400 font-mono">#{String(assessment.id).slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[assessment.assessmentType] || 'bg-gray-100 text-gray-600'}`}>
                                                {TYPE_LABELS[assessment.assessmentType] || assessment.assessmentType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate">{getModuleName(assessment)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">{getItemsCount(assessment)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">{assessment.passingScore ?? 70}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openDetail(assessment)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/courses/assessments/${assessment.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Edit Assessment"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(assessment)}
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
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    return (
                                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Assessment</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteTarget.title}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-Over */}
            {detailAssessment && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailAssessment(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{detailAssessment.title}</h2>
                            <button onClick={() => setDetailAssessment(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0">
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
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[detailAssessment.assessmentType] || 'bg-gray-100 text-gray-600'}`}>
                                            {TYPE_LABELS[detailAssessment.assessmentType] || detailAssessment.assessmentType}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Assessment ID</span>
                                            <p className="font-medium text-gray-900 font-mono text-xs mt-1">#{detailAssessment.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">{detailAssessment.assessmentType === 'final_exam' ? 'Course' : 'Module'}</span>
                                            <p className="font-medium text-gray-900 flex items-center gap-1.5 mt-1">
                                                <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                {getModuleName(detailAssessment)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Questions</span>
                                            <p className="font-medium text-gray-900 mt-1">{getItemsCount(detailAssessment)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Passing Score</span>
                                            <p className="font-medium text-gray-900 mt-1">{detailAssessment.passingScore ?? 70}%</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Max Attempts</span>
                                            <p className="font-medium text-gray-900 mt-1">{detailAssessment.maxAttempts ?? 1}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time Limit</span>
                                            <p className="font-medium text-gray-900 mt-1">
                                                {detailAssessment.timeLimitMinutes ? `${detailAssessment.timeLimitMinutes} min` : 'No limit'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Show Correct Answer</span>
                                            <p className="font-medium text-gray-900 mt-1">{detailAssessment.showCorrectAnswer ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Last Updated</span>
                                            <p className="font-medium text-gray-900 mt-1">{new Date(detailAssessment.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {detailAssessment.description ? (
                                        <div>
                                            <span className="text-sm text-gray-500">Description</span>
                                            <div className="mt-2 prose prose-sm max-w-none text-gray-900">
                                                {typeof detailAssessment.description === 'object' ? (
                                                    <p className="text-sm text-gray-600">Rich content available</p>
                                                ) : (
                                                    <p className="text-sm text-gray-900">{String(detailAssessment.description)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">No description</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <Link href={`/courses/assessments/${detailAssessment.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Assessment
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
