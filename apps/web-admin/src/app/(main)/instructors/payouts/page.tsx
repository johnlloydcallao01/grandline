'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search, Plus, Loader2, X, Trash2, Edit, Eye,
    DollarSign, Calendar, CheckCircle, Clock,
} from '@/components/ui/IconWrapper';
import {
    getPayouts, createPayout, updatePayout, deletePayout,
    transitionPayoutStatus, getInstructorOptions, getCourseOptions,
    type PayoutDoc, type PayoutStatus,
    type InstructorOption, type CourseOption,
    type InstructorRef, type CourseRef,
} from './actions';

const ITEMS_PER_PAGE = 15;

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'calculated', label: 'Calculated' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
    { value: 'voided', label: 'Voided' },
];

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
    calculated: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800',
    approved: 'bg-purple-100 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-800',
    paid: 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800',
    voided: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800',
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    calculated: 'Calculated',
    approved: 'Approved',
    paid: 'Paid',
    voided: 'Voided',
};

const ACTION_LABELS: Record<string, string> = {
    calculate: 'Calculate',
    approve: 'Approve',
    pay: 'Mark as Paid',
    void: 'Void',
};

const STATUS_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
    draft: ['calculated'],
    calculated: ['approved'],
    approved: ['paid', 'voided'],
    paid: [],
    voided: [],
};

function getAvailableActions(status: PayoutStatus): string[] {
    const targets = STATUS_TRANSITIONS[status] || []
    const actionMap: Record<string, string> = {
        calculated: 'calculate',
        approved: 'approve',
        paid: 'pay',
        voided: 'void',
    }
    return targets.map(t => actionMap[t] || t)
}

function getInstructorName(instructor: InstructorRef | number | null | undefined): string {
    if (!instructor || typeof instructor !== 'object') return '\u2014'
    const user = typeof instructor.user === 'object' ? instructor.user : null
    if (user && 'firstName' in user) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Instructor #${instructor.id}`
    }
    return `Instructor #${instructor.id}`
}

function getCourseTitle(course: CourseRef | number | null | undefined): string {
    if (!course || typeof course !== 'object') return '\u2014'
    return course.title || course.courseCode || `Course #${course.id}`
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '\u2014';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string | null | undefined) {
    if (!dateStr) return '\u2014';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '\u2014';
    return `$${amount.toFixed(2)}`;
}

type FormField = keyof FormState;

interface FormState {
    instructor: string;
    course: string;
    periodStart: string;
    periodEnd: string;
    sourceType: string;
    sourceReference: string;
    calculatedAmount: string;
    approvedAmount: string;
    notes: string;
}

const FORM_DEFAULTS: FormState = {
    instructor: '',
    course: '',
    periodStart: '',
    periodEnd: '',
    sourceType: 'course_activity',
    sourceReference: '',
    calculatedAmount: '',
    approvedAmount: '',
    notes: '',
};

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<PayoutDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<PayoutDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailPayout, setDetailPayout] = useState<PayoutDoc | null>(null);

    const [slidePayout, setSlidePayout] = useState<PayoutDoc | null>(null);
    const [slideMounted, setSlideMounted] = useState(false);
    const [animateSlide, setAnimateSlide] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [form, setForm] = useState<FormState>(FORM_DEFAULTS);

    const [instructorOptions, setInstructorOptions] = useState<InstructorOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const [instructorSearch, setInstructorSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const instructorRef = useRef<HTMLDivElement>(null);
    const courseRef = useRef<HTMLDivElement>(null);

    const loadPayouts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getPayouts({
                search: debouncedSearch || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setPayouts(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payouts');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter, currentPage]);

    useEffect(() => { loadPayouts(); }, [loadPayouts]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (instructorRef.current && !instructorRef.current.contains(e.target as Node)) {
                setShowInstructorDropdown(false);
            }
            if (courseRef.current && !courseRef.current.contains(e.target as Node)) {
                setShowCourseDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadOptions = async () => {
        setLoadingOptions(true);
        try {
            const [instructors, courses] = await Promise.all([
                getInstructorOptions(),
                getCourseOptions(),
            ]);
            setInstructorOptions(instructors);
            setCourseOptions(courses);
        } catch {
            // silently fail
        } finally {
            setLoadingOptions(false);
        }
    };

    const filteredInstructorOptions = instructorSearch
        ? instructorOptions.filter(i =>
            i.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
            i.email.toLowerCase().includes(instructorSearch.toLowerCase()) ||
            i.specialization.toLowerCase().includes(instructorSearch.toLowerCase())
        )
        : instructorOptions;

    const filteredCourseOptions = courseSearch
        ? courseOptions.filter(c =>
            c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.code.toLowerCase().includes(courseSearch.toLowerCase())
        )
        : courseOptions;

    const openDetail = (payout: PayoutDoc) => {
        setDetailPayout(payout);
    };

    const openCreateSlide = () => {
        setSlidePayout(null);
        setForm(FORM_DEFAULTS);
        setInstructorSearch('');
        setCourseSearch('');
        setSaveError(null);
        loadOptions();
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const openEditSlide = (payout: PayoutDoc) => {
        setSlidePayout(payout);
        const instructorId = payout.instructor != null && typeof payout.instructor === 'object' ? payout.instructor.id : payout.instructor;
        const courseId = payout.course != null && typeof payout.course === 'object' ? payout.course.id : payout.course;
        const instructorName = payout.instructor != null && typeof payout.instructor === 'object' ? getInstructorName(payout.instructor) : '';
        const courseTitle = payout.course != null && typeof payout.course === 'object' ? getCourseTitle(payout.course) : '';

        setForm({
            instructor: String(instructorId || ''),
            course: String(courseId || ''),
            periodStart: payout.periodStart ? payout.periodStart.slice(0, 10) : '',
            periodEnd: payout.periodEnd ? payout.periodEnd.slice(0, 10) : '',
            sourceType: payout.sourceType || 'course_activity',
            sourceReference: payout.sourceReference || '',
            calculatedAmount: String(payout.calculatedAmount || ''),
            approvedAmount: payout.approvedAmount != null ? String(payout.approvedAmount) : '',
            notes: payout.notes || '',
        });
        setInstructorSearch(instructorName);
        setCourseSearch(courseTitle);
        setSaveError(null);
        loadOptions();
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const closeSlide = () => {
        setAnimateSlide(false);
        setTimeout(() => {
            setSlideMounted(false);
            setSlidePayout(null);
        }, 300);
    };

    const updateField = <K extends FormField>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const selectInstructor = (option: InstructorOption) => {
        updateField('instructor', String(option.id));
        setInstructorSearch(option.name);
        setShowInstructorDropdown(false);
    };

    const selectCourse = (option: CourseOption) => {
        updateField('course', String(option.id));
        setCourseSearch(option.title);
        setShowCourseDropdown(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            if (!form.instructor) { setSaveError('Please select an instructor.'); setIsSaving(false); return; }
            if (!form.course) { setSaveError('Please select a course.'); setIsSaving(false); return; }
            if (!form.periodStart) { setSaveError('Period start date is required.'); setIsSaving(false); return; }
            if (!form.periodEnd) { setSaveError('Period end date is required.'); setIsSaving(false); return; }

            const payload: Record<string, unknown> = {
                instructor: Number(form.instructor),
                course: Number(form.course),
                periodStart: form.periodStart,
                periodEnd: form.periodEnd,
                sourceType: form.sourceType || 'course_activity',
                sourceReference: form.sourceReference || `PAYOUT-${Date.now()}`,
                calculatedAmount: form.calculatedAmount ? Number(form.calculatedAmount) : 0,
                notes: form.notes || null,
            };

            if (slidePayout) {
                if (form.approvedAmount) {
                    payload.approvedAmount = Number(form.approvedAmount);
                } else {
                    payload.approvedAmount = null;
                }
                const updated = await updatePayout(slidePayout.id, payload as any);
                setPayouts(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else {
                const created = await createPayout(payload as any);
                setPayouts(prev => [created, ...prev]);
                setTotalDocs(prev => prev + 1);
            }

            closeSlide();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save payout');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deletePayout(deleteTarget.id);
            setPayouts(prev => prev.filter(p => p.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete payout');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleTransition = async (payout: PayoutDoc, action: string) => {
        try {
            setIsTransitioning(true);
            const updated = await transitionPayoutStatus(payout.id, action);
            setPayouts(prev => prev.map(p => p.id === updated.id ? updated : p));
            if (detailPayout?.id === payout.id) {
                setDetailPayout(updated);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update payout status');
        } finally {
            setIsTransitioning(false);
        }
    };

    const totalCalculated = payouts.reduce((sum, p) =>
        p.status === 'calculated' || p.status === 'approved' ? sum + (p.calculatedAmount || 0) : sum, 0);
    const totalPaid = payouts.reduce((sum, p) =>
        p.status === 'paid' ? sum + ((p.approvedAmount || p.calculatedAmount) || 0) : sum, 0);

    const metricCards = [
        { label: 'Total Payouts', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: DollarSign },
        { label: 'Draft', value: payouts.filter(p => p.status === 'draft').length, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', icon: Clock },
        { label: 'Calculated / Approved', value: totalCalculated > 0 ? `$${totalCalculated.toFixed(0)}` : '0', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: Calendar },
        { label: 'Paid', value: totalPaid > 0 ? `$${totalPaid.toFixed(0)}` : '$0', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', icon: CheckCircle },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Instructor Payouts</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage instructor payout records and payment lifecycle</p>
                </div>
                <button onClick={openCreateSlide}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                    <Plus className="h-4 w-4 mr-2" /> Create Payout
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" /></div>
                                <div><div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                            </div>
                        </div>
                    ))
                ) : (
                    metricCards.map(card => (
                        <div key={card.label} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${card.bg} dark:opacity-80`}>
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

            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search by reference..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                    <button onClick={loadPayouts} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>{['Reference', 'Instructor', 'Course', 'Period', 'Amount', 'Status', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : payouts.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No payouts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || statusFilter !== 'all'
                            ? 'No payouts match your search criteria. Try adjusting the filters.'
                            : 'Get started by creating your first instructor payout record.'}
                    </p>
                    {!debouncedSearch && statusFilter === 'all' && (
                        <button onClick={openCreateSlide}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create Payout
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {payouts.map(payout => {
                                    const instructorName = payout.instructor != null && typeof payout.instructor === 'object' ? getInstructorName(payout.instructor) : '\u2014';
                                    const courseTitle = payout.course != null && typeof payout.course === 'object' ? getCourseTitle(payout.course) : '\u2014';
                                    const displayAmount = payout.approvedAmount != null ? payout.approvedAmount : payout.calculatedAmount;
                                    const availableActions = getAvailableActions(payout.status);
                                    return (
                                        <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                                                        <DollarSign className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{payout.sourceReference}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{payout.sourceType}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                {instructorName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                                {courseTitle}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(payout.periodStart)} &ndash; {formatDate(payout.periodEnd)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(displayAmount)}
                                                </p>
                                                {payout.approvedAmount != null && payout.approvedAmount !== payout.calculatedAmount && (
                                                    <p className="text-xs text-gray-400">calc: {formatCurrency(payout.calculatedAmount)}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[payout.status] || ''}`}>
                                                    {STATUS_LABELS[payout.status] || payout.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openDetail(payout)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details"
                                                    ><Eye className="h-4 w-4" /></button>
                                                    {payout.status !== 'paid' && payout.status !== 'voided' && (
                                                        <button onClick={() => openEditSlide(payout)}
                                                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Payout"
                                                        ><Edit className="h-4 w-4" /></button>
                                                    )}
                                                    {availableActions.length > 0 && (
                                                        <div className="relative group/actions">
                                                            <button disabled={isTransitioning}
                                                                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-40"
                                                                title="Status Actions"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[140px] z-20 hidden group-hover/actions:block">
                                                                {availableActions.map(action => (
                                                                    <button key={action} onClick={() => handleTransition(payout, action)}
                                                                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                    >
                                                                        {ACTION_LABELS[action] || action}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {payout.status !== 'paid' && payout.status !== 'voided' && (
                                                        <button onClick={() => setDeleteTarget(payout)}
                                                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Payout"
                                                        ><Trash2 className="h-4 w-4" /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                                ><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pn: number;
                                    if (totalPages <= 5) pn = i + 1;
                                    else if (currentPage <= 3) pn = i + 1;
                                    else if (currentPage >= totalPages - 2) pn = totalPages - 4 + i;
                                    else pn = currentPage - 2 + i;
                                    return <button key={pn} onClick={() => setCurrentPage(pn)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pn ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{pn}</button>;
                                })}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                                ><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {detailPayout && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailPayout(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payout Details</h2>
                            <button onClick={() => setDetailPayout(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><DollarSign className="h-6 w-6" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">{detailPayout.sourceReference}</h3>
                                    <p className="text-sm text-gray-500">{detailPayout.sourceType}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status</h3></div>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${STATUS_COLORS[detailPayout.status] || ''}`}>
                                    {STATUS_LABELS[detailPayout.status] || detailPayout.status}
                                </span>
                                {getAvailableActions(detailPayout.status).map(action => (
                                    <button key={action} onClick={() => handleTransition(detailPayout, action)}
                                        disabled={isTransitioning}
                                        className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {ACTION_LABELS[action] || action}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Instructor & Course</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Instructor</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {detailPayout.instructor != null && typeof detailPayout.instructor === 'object' ? getInstructorName(detailPayout.instructor) : '\u2014'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Course</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {detailPayout.course != null && typeof detailPayout.course === 'object' ? getCourseTitle(detailPayout.course) : '\u2014'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Period</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Start</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailPayout.periodStart)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">End</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailPayout.periodEnd)}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amounts</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Calculated Amount</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(detailPayout.calculatedAmount)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Approved Amount</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(detailPayout.approvedAmount)}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Details</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Source Type</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailPayout.sourceType || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Source Reference</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailPayout.sourceReference || '\u2014'}</p></div>
                                <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Notes</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailPayout.notes || '\u2014'}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audit</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Created</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailPayout.createdAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Updated</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailPayout.updatedAt)}</p></div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                {detailPayout.status !== 'paid' && detailPayout.status !== 'voided' && (
                                    <button onClick={() => { const p = detailPayout; setDetailPayout(null); openEditSlide(p); }}
                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                    ><Edit className="h-4 w-4 mr-2" /> Edit Payout</button>
                                )}
                                <button onClick={() => setDetailPayout(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium bg-white dark:bg-[var(--card-background)]"
                                >Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Payout</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.sourceReference}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                >Cancel</button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                                >{isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}{isDeleting ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {slideMounted && createPortal(
                <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animateSlide ? 'bg-black/50' : 'bg-transparent'}`} onClick={closeSlide}>
                    <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animateSlide ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {slidePayout ? 'Edit Payout' : 'Create Payout'}
                            </h2>
                            <button onClick={closeSlide} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {saveError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                    {saveError}
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Instructor & Course</h3>
                            </div>
                            <div className="space-y-4">
                                <div ref={instructorRef} className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor *</label>
                                    <input type="text" placeholder="Search instructor..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        value={instructorSearch}
                                        onChange={e => { setInstructorSearch(e.target.value); setShowInstructorDropdown(true); if (!e.target.value) updateField('instructor', ''); }}
                                        onFocus={() => setShowInstructorDropdown(true)}
                                    />
                                    {showInstructorDropdown && (
                                        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                            {loadingOptions ? (
                                                <div className="p-3 text-sm text-gray-500 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
                                            ) : filteredInstructorOptions.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500 text-center">No instructors found</div>
                                            ) : (
                                                filteredInstructorOptions.map(opt => (
                                                    <button key={opt.id} type="button" onClick={() => selectInstructor(opt)}
                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${String(opt.id) === form.instructor ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        <span className="font-medium">{opt.name}</span>
                                                        {opt.specialization && <span className="text-xs text-gray-500 ml-2">{opt.specialization}</span>}
                                                        {opt.email && <span className="text-xs text-gray-400 ml-2">{opt.email}</span>}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div ref={courseRef} className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
                                    <input type="text" placeholder="Search course..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        value={courseSearch}
                                        onChange={e => { setCourseSearch(e.target.value); setShowCourseDropdown(true); if (!e.target.value) updateField('course', ''); }}
                                        onFocus={() => setShowCourseDropdown(true)}
                                    />
                                    {showCourseDropdown && (
                                        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                            {loadingOptions ? (
                                                <div className="p-3 text-sm text-gray-500 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
                                            ) : filteredCourseOptions.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500 text-center">No courses found</div>
                                            ) : (
                                                filteredCourseOptions.map(opt => (
                                                    <button key={opt.id} type="button" onClick={() => selectCourse(opt)}
                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${String(opt.id) === form.course ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        <span className="font-medium">{opt.title}</span>
                                                        {opt.code && <span className="text-xs text-gray-500 ml-2">{opt.code}</span>}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Period</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Start *</label>
                                    <input type="date" value={form.periodStart} onChange={e => updateField('periodStart', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End *</label>
                                    <input type="date" value={form.periodEnd} onChange={e => updateField('periodEnd', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amounts</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calculated Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input type="number" min="0" step="0.01" value={form.calculatedAmount}
                                            onChange={e => updateField('calculatedAmount', e.target.value)}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input type="number" min="0" step="0.01" value={form.approvedAmount}
                                            onChange={e => updateField('approvedAmount', e.target.value)}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Type</label>
                                    <input type="text" value={form.sourceType} onChange={e => updateField('sourceType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Reference</label>
                                    <input type="text" value={form.sourceReference} onChange={e => updateField('sourceReference', e.target.value)}
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                    <textarea rows={3} value={form.notes} onChange={e => updateField('notes', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[var(--card-background)] border-t border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex gap-3">
                            <button onClick={closeSlide} disabled={isSaving}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium bg-white dark:bg-[var(--card-background)]"
                            >Cancel</button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                            >{isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isSaving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
