'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import NextLink from 'next/link';
import {
    getAssessments, deleteAssessment, getAssessmentById,
    type AssessmentDoc, type ModuleOption
} from './actions';

const Link = NextLink as any;
const ITEMS_PER_PAGE = 12;

const TYPE_LABELS: Record<string, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    final_exam: 'Final Exam',
};

const TYPE_COLORS: Record<string, string> = {
    quiz: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    exam: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    final_exam: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'final_exam', label: 'Final Exam' },
];

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
);

const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><path d="M14 2v6h6" /><path d="M9 13v6" /><path d="M9 9v.01" /></svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /></svg>
);

const Loader2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="19 12 12 19 5 12" /></svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);

export default function InstructorAssessmentsPage() {
    const [assessments, setAssessments] = useState<AssessmentDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<{ id: string; title: string }[]>([]);
    const [moduleFilter, setModuleFilter] = useState('all');
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
            setModuleOptions(data.moduleOptions || []);
            setCourseOptions(data.courseOptions || []);
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
            return courseOptions.find(co => co.id === String(c))?.title || 'N/A';
        }
        const mod = assessment.module;
        if (!mod) return 'N/A';
        if (typeof mod === 'object') return mod.title || `Module #${mod.id}`;
        return moduleOptions.find(m => m.id === String(mod))?.title || 'N/A';
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
            setTotalDocs(prev => Math.max(0, prev - 1));
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetail = async (assessment: AssessmentDoc) => {
        setDetailAssessment(assessment);
        if (typeof assessment.module === 'string' || typeof assessment.course === 'string' || !assessment.description) {
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
        { label: 'Total Assessments', value: totalDocs, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: FileTextIcon },
        { label: 'Quizzes', value: typeCounts.quiz, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: FileTextIcon },
        { label: 'Exams', value: typeCounts.exam, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: FileTextIcon },
        { label: 'Final Exams', value: typeCounts.final_exam, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: FileTextIcon },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <FileTextIcon className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load assessments</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadAssessments} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assessments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage quizzes, exams, and final exams</p>
                </div>
                <Link
                    href="/courses/assessments/create"
                    className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Assessment
                </Link>
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
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
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
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Module Filter (only show non-final-exam modules) */}
            {moduleOptions.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => { setModuleFilter('all'); setCurrentPage(1); }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            moduleFilter === 'all'
                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        All Modules
                    </button>
                    {moduleOptions.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => { setModuleFilter(mod.id); setCurrentPage(1); }}
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
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module / Course</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passing</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : assessments.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileTextIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No assessments found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || typeFilter !== 'all' || moduleFilter !== 'all'
                            ? 'No assessments match your search criteria. Try adjusting the filters.'
                            : 'Get started by creating your first assessment.'}
                    </p>
                    {!debouncedSearch && typeFilter === 'all' && moduleFilter === 'all' && (
                        <Link
                            href="/courses/assessments/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Assessment
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Assessments Table */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module / Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passing</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {assessments.map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center overflow-hidden shrink-0">
                                                    <FileTextIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                                                        {assessment.title}
                                                    </span>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{String(assessment.id).slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[assessment.assessmentType] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                                {TYPE_LABELS[assessment.assessmentType] || assessment.assessmentType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{getModuleName(assessment)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{getItemsCount(assessment)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{assessment.passingScore ?? 70}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openDetail(assessment)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/courses/assessments/${assessment.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Edit Assessment"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(assessment)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
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
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Assessment</h3>
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
            {detailAssessment && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailAssessment(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">{detailAssessment.title}</h2>
                            <button onClick={() => setDetailAssessment(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
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
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[detailAssessment.assessmentType] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                            {TYPE_LABELS[detailAssessment.assessmentType] || detailAssessment.assessmentType}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Assessment ID</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">#{detailAssessment.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">{detailAssessment.assessmentType === 'final_exam' ? 'Course' : 'Module'}</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                                <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                {getModuleName(detailAssessment)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Questions</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{getItemsCount(detailAssessment)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Passing Score</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{detailAssessment.passingScore ?? 70}%</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Max Attempts</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{detailAssessment.maxAttempts ?? 1}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Time Limit</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {detailAssessment.timeLimitMinutes ? `${detailAssessment.timeLimitMinutes} min` : 'No limit'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(detailAssessment.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {detailAssessment.description ? (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                                            <div className="mt-2 prose prose-sm max-w-none text-gray-900 dark:text-gray-100">
                                                {typeof detailAssessment.description === 'object' ? (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Rich content available</p>
                                                ) : (
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">{String(detailAssessment.description)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileTextIcon className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No description</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                        <Link
                                            href={`/courses/assessments/${detailAssessment.id}/edit`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                                        >
                                            <EditIcon className="h-4 w-4 mr-2" />
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
