'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getFeedbackForms } from './actions';
import type { FeedbackFormDoc, FeedbackFormsStats, FormFieldBlock } from '@encreasl/cms-types';

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
const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const FolderIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
);
const LayersIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></svg>
);
const TypeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>
);
const BarChartIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
);
const HashIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);
const ListIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
);
const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
);

const BLOCK_LABELS: Record<string, string> = {
    textInput: 'Text Input',
    choiceInput: 'Choice Input',
    surveyMatrix: 'Survey Matrix',
};

function getBlockTypesSummary(fields: FormFieldBlock[]): string {
    const types = fields.map((f) => BLOCK_LABELS[f.blockType] || f.blockType);
    const unique = Array.from(new Set(types));
    return unique.join(', ');
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

function FieldBlockView({ block }: { block: FormFieldBlock }) {
    const requiredBadge = block.isRequired ? (
        <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Required
        </span>
    ) : (
        <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Optional
        </span>
    );

    if (block.blockType === 'textInput') {
        const formatLabel = {
            text: 'Text', email: 'Email', phone: 'Phone', number: 'Number', textarea: 'Textarea (Long)',
        }[block.format] || block.format;
        return (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{block.label}</p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">name: {block.name}</p>
                    </div>
                    <div className="flex items-center shrink-0">
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            Text Input
                        </span>
                        {requiredBadge}
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Format: <span className="font-medium">{formatLabel}</span>
                    {block.placeholder ? <span className="text-gray-400 dark:text-gray-500"> · Placeholder: &quot;{block.placeholder}&quot;</span> : null}
                </p>
            </div>
        );
    }

    if (block.blockType === 'choiceInput') {
        const uiTypeLabel = {
            radio: 'Radio Buttons (Single Choice)',
            dropdown: 'Dropdown (Single Choice)',
            checkbox_group: 'Checkboxes (Multiple Choice)',
        }[block.uiType] || block.uiType;
        return (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{block.label}</p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">name: {block.name}</p>
                    </div>
                    <div className="flex items-center shrink-0">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Choice Input
                        </span>
                        {requiredBadge}
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">UI: {uiTypeLabel}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {(block.options || []).map((opt, i) => (
                        <span key={opt.id || i} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {opt.label}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{block.question}</p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">name: {block.name}</p>
                </div>
                <div className="flex items-center shrink-0">
                    <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Survey Matrix
                    </span>
                    {requiredBadge}
                </div>
            </div>
            <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Statement</th>
                            {(block.columns || []).map((col, i) => (
                                <th key={col.id || i} className="px-3 py-1.5 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(block.rows || []).map((row, i) => (
                            <tr key={row.id || i}>
                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.statement}</td>
                                {(block.columns || []).map((col, j) => (
                                    <td key={col.id || j} className="px-3 py-2 text-center">
                                        <span className="mx-auto block h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function FeedbackFormsPage() {
    const [forms, setForms] = useState<FeedbackFormDoc[]>([]);
    const [stats, setStats] = useState<FeedbackFormsStats | null>(null);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [detailForm, setDetailForm] = useState<FeedbackFormDoc | null>(null);

    const loadForms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getFeedbackForms({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setForms(data.docs || []);
            setStats(data.stats);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load feedback forms');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => {
        loadForms();
    }, [loadForms]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const metricCards = [
        { label: 'Total Forms', value: stats?.totalForms ?? 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: MessageSquareIcon },
        { label: 'Total Fields', value: stats?.totalFields ?? 0, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: ListIcon },
        { label: 'Avg Fields/Form', value: stats?.avgFieldsPerForm ?? 0, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: BarChartIcon },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <MessageSquareIcon className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load feedback forms</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadForms}
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback Forms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Survey and feedback forms attached to your courses</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {isLoading || !stats ? (
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

            {/* Search */}
            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search forms by title or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fields</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Used By</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquareIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No feedback forms found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch
                            ? 'No forms match your search criteria. Try adjusting the search term.'
                            : 'No feedback forms are attached to your courses yet. Contact an administrator to assign a survey to a course.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Forms Table */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fields</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Used By</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {forms.map((form) => (
                                    <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center shrink-0">
                                                    <MessageSquareIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                                                        {form.title}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                        <HashIcon className="h-3 w-3" /> #{form.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <ListIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{form.fields.length} field{form.fields.length !== 1 ? 's' : ''} &middot; {getBlockTypesSummary(form.fields) || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <FolderIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">
                                                    {form.courses.length} course{form.courses.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(form.updatedAt)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setDetailForm(form)}
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
            {detailForm && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailForm(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">Form Details</h2>
                            <button onClick={() => setDetailForm(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 min-h-[calc(100vh-4rem)]">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Title</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <MessageSquareIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {detailForm.title}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Form ID</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <HashIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        #{detailForm.id}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {formatDate(detailForm.updatedAt)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(detailForm.createdAt)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Fields</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mt-1">
                                        <ListIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                        {detailForm.fields.length} field{detailForm.fields.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Courses Using This Form */}
                            <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                    <FolderIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    Used by Courses
                                </h3>
                                {detailForm.courses.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {detailForm.courses.map((course) => (
                                            <span key={course.id} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {course.title}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-500">No courses use this form.</p>
                                )}
                            </div>

                            {/* Form Description */}
                            {detailForm.description && (
                                <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{detailForm.description}</p>
                                </div>
                            )}

                            {/* Fields */}
                            <div className="pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <LayersIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    Fields
                                </h3>
                                {detailForm.fields.length > 0 ? (
                                    <div className="space-y-3">
                                        {detailForm.fields.map((field, i) => (
                                            <FieldBlockView key={(field as any).id || i} block={field} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <TypeIcon className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 dark:text-gray-500">No fields defined</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <Link
                                    href={`/submissions/feedbacks?formId=${detailForm.id}` as any}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <ExternalLinkIcon className="h-4 w-4" />
                                    View Responses
                                </Link>
                                <button onClick={() => setDetailForm(null)}
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