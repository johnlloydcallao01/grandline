'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search, Plus, Loader2, X, Trash2, Edit, Eye,
    Ticket, Calendar, UserCheck, DollarSign,
} from '@/components/ui/IconWrapper';
import {
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    getRedemptions, searchCourses, searchCategories,
    type CouponDoc, type RedemptionDoc,
} from './actions';

const ITEMS_PER_PAGE = 15;

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'paused', label: 'Paused' },
    { value: 'expired', label: 'Expired' },
    { value: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700 ring-green-200',
    draft: 'bg-gray-100 text-gray-600 ring-gray-200',
    paused: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
    expired: 'bg-red-100 text-red-700 ring-red-200',
    archived: 'bg-gray-100 text-gray-500 ring-gray-200',
};

const DISCOUNT_LABELS: Record<string, string> = {
    percent: 'Percent',
    fixed_course: 'Fixed per Course',
    fixed_cart: 'Fixed Cart',
};

const SCOPE_LABELS: Record<string, string> = {
    all_courses: 'All Courses',
    specific_courses: 'Specific Courses',
    specific_categories: 'Specific Categories',
};

const COUPON_STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'expired', label: 'Expired' },
    { value: 'archived', label: 'Archived' },
] as const;

const DISCOUNT_TYPE_OPTIONS = [
    { value: 'percent', label: 'Percent (%)' },
    { value: 'fixed_course', label: 'Fixed per Course ($)' },
    { value: 'fixed_cart', label: 'Fixed Cart ($)' },
] as const;

const SCOPE_TYPE_OPTIONS = [
    { value: 'all_courses', label: 'All Courses' },
    { value: 'specific_courses', label: 'Specific Courses' },
    { value: 'specific_categories', label: 'Specific Categories' },
] as const;

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

function getUsageDisplay(coupon: CouponDoc): string {
    const used = coupon.usageCount || 0;
    if (coupon.usageLimitTotal) {
        return `${used} / ${coupon.usageLimitTotal}`;
    }
    return String(used);
}

function getDiscountDisplay(coupon: CouponDoc): string {
    const label = DISCOUNT_LABELS[coupon.discountType] || coupon.discountType;
    if (coupon.discountType === 'percent') {
        return `${coupon.amount}% ${label}`;
    }
    return `$${coupon.amount} ${label}`;
}

type FormField = keyof FormState;

interface FormState {
    code: string;
    name: string;
    description: string;
    status: string;
    discountType: string;
    amount: string;
    maxDiscountAmount: string;
    scopeType: string;
    excludeSaleCourses: boolean;
    minimumAmount: string;
    maximumAmount: string;
    usageLimitTotal: string;
    usageLimitPerUser: string;
    maxItemsAffected: string;
    stackable: boolean;
    priority: string;
    startsAt: string;
    expiresAt: string;
}

const FORM_DEFAULTS: FormState = {
    code: '', name: '', description: '', status: 'draft',
    discountType: 'percent', amount: '', maxDiscountAmount: '',
    scopeType: 'all_courses', excludeSaleCourses: false,
    minimumAmount: '', maximumAmount: '', usageLimitTotal: '',
    usageLimitPerUser: '', maxItemsAffected: '', stackable: false,
    priority: '100', startsAt: '', expiresAt: '',
};

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<CouponDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<CouponDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailCoupon, setDetailCoupon] = useState<CouponDoc | null>(null);
    const [redemptions, setRedemptions] = useState<RedemptionDoc[]>([]);
    const [loadingRedemptions, setLoadingRedemptions] = useState(false);

    const [slideCoupon, setSlideCoupon] = useState<CouponDoc | null>(null);
    const [slideMounted, setSlideMounted] = useState(false);
    const [animateSlide, setAnimateSlide] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>(FORM_DEFAULTS);

    const [courseSearch, setCourseSearch] = useState('');
    const [courseResults, setCourseResults] = useState<{ id: number; title: string }[]>([]);
    const [categorySearch, setCategorySearch] = useState('');
    const [categoryResults, setCategoryResults] = useState<{ id: number; name: string }[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<{ id: number; title: string }[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<{ id: number; name: string }[]>([]);

    const courseSearchTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const categorySearchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const loadCoupons = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCoupons({
                search: debouncedSearch || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setCoupons(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter, currentPage]);

    useEffect(() => { loadCoupons(); }, [loadCoupons]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const openDetail = async (coupon: CouponDoc) => {
        setDetailCoupon(coupon);
        setRedemptions([]);
        setLoadingRedemptions(true);
        try {
            const data = await getRedemptions(coupon.id);
            setRedemptions(data);
        } catch {
            setRedemptions([]);
        } finally {
            setLoadingRedemptions(false);
        }
    };

    const openCreateSlide = () => {
        setSlideCoupon(null);
        setForm(FORM_DEFAULTS);
        setSelectedCourses([]);
        setSelectedCategories([]);
        setSaveError(null);
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const openEditSlide = (coupon: CouponDoc) => {
        setSlideCoupon(coupon);

        const includedCourses = coupon.includedCourses
            ? (Array.isArray(coupon.includedCourses) ? coupon.includedCourses.filter((c): c is { id: number; title: string } => typeof c === 'object' && 'title' in c) : [])
            : [];
        const includedCategories = coupon.includedCategories
            ? (Array.isArray(coupon.includedCategories) ? coupon.includedCategories.filter((c): c is { id: number; name: string } => typeof c === 'object' && 'name' in c) : [])
            : [];

        setSelectedCourses(includedCourses);
        setSelectedCategories(includedCategories);

        setForm({
            code: coupon.code || '',
            name: coupon.name || '',
            description: coupon.description || '',
            status: coupon.status || 'draft',
            discountType: coupon.discountType || 'percent',
            amount: String(coupon.amount || ''),
            maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
            scopeType: coupon.scopeType || 'all_courses',
            excludeSaleCourses: coupon.excludeSaleCourses || false,
            minimumAmount: coupon.minimumAmount != null ? String(coupon.minimumAmount) : '',
            maximumAmount: coupon.maximumAmount != null ? String(coupon.maximumAmount) : '',
            usageLimitTotal: coupon.usageLimitTotal != null ? String(coupon.usageLimitTotal) : '',
            usageLimitPerUser: coupon.usageLimitPerUser != null ? String(coupon.usageLimitPerUser) : '',
            maxItemsAffected: coupon.maxItemsAffected != null ? String(coupon.maxItemsAffected) : '',
            stackable: coupon.stackable || false,
            priority: String(coupon.priority ?? 100),
            startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
            expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
        });
        setSaveError(null);
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const closeSlide = () => {
        setAnimateSlide(false);
        setTimeout(() => {
            setSlideMounted(false);
            setSlideCoupon(null);
        }, 300);
    };

    const updateField = <K extends FormField>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleCourseSearch = (value: string) => {
        setCourseSearch(value);
        if (courseSearchTimer.current) clearTimeout(courseSearchTimer.current);
        courseSearchTimer.current = setTimeout(async () => {
            if (value.trim().length < 1) { setCourseResults([]); return; }
            const results = await searchCourses(value.trim());
            setCourseResults(results);
        }, 300);
    };

    const handleCategorySearch = (value: string) => {
        setCategorySearch(value);
        if (categorySearchTimer.current) clearTimeout(categorySearchTimer.current);
        categorySearchTimer.current = setTimeout(async () => {
            if (value.trim().length < 1) { setCategoryResults([]); return; }
            const results = await searchCategories(value.trim());
            setCategoryResults(results);
        }, 300);
    };

    const addCourse = (course: { id: number; title: string }) => {
        if (!selectedCourses.find(c => c.id === course.id)) {
            setSelectedCourses(prev => [...prev, course]);
        }
        setCourseSearch('');
        setCourseResults([]);
    };

    const removeCourse = (id: number) => {
        setSelectedCourses(prev => prev.filter(c => c.id !== id));
    };

    const addCategory = (cat: { id: number; name: string }) => {
        if (!selectedCategories.find(c => c.id === cat.id)) {
            setSelectedCategories(prev => [...prev, cat]);
        }
        setCategorySearch('');
        setCategoryResults([]);
    };

    const removeCategory = (id: number) => {
        setSelectedCategories(prev => prev.filter(c => c.id !== id));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            if (!form.code.trim()) { setSaveError('Coupon code is required.'); setIsSaving(false); return; }
            if (!form.amount || Number(form.amount) <= 0) { setSaveError('Discount amount must be greater than 0.'); setIsSaving(false); return; }

            const payload: Record<string, unknown> = {
                code: form.code.trim().toUpperCase(),
                name: form.name.trim() || null,
                description: form.description.trim() || null,
                status: form.status,
                discountType: form.discountType,
                amount: Number(form.amount),
                maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
                scopeType: form.scopeType,
                excludeSaleCourses: form.excludeSaleCourses,
                minimumAmount: form.minimumAmount ? Number(form.minimumAmount) : null,
                maximumAmount: form.maximumAmount ? Number(form.maximumAmount) : null,
                usageLimitTotal: form.usageLimitTotal ? Number(form.usageLimitTotal) : null,
                usageLimitPerUser: form.usageLimitPerUser ? Number(form.usageLimitPerUser) : null,
                maxItemsAffected: form.maxItemsAffected ? Number(form.maxItemsAffected) : null,
                stackable: form.stackable,
                priority: Number(form.priority) || 100,
                startsAt: form.startsAt || null,
                expiresAt: form.expiresAt || null,
            };

            if (form.scopeType === 'specific_courses') {
                payload.includedCourses = selectedCourses.map(c => c.id);
            }
            if (form.scopeType === 'specific_categories') {
                payload.includedCategories = selectedCategories.map(c => c.id);
            }

            if (slideCoupon) {
                const updated = await updateCoupon(slideCoupon.id, payload as any);
                setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await createCoupon(payload as any);
                setCoupons(prev => [created, ...prev]);
                setTotalDocs(prev => prev + 1);
            }

            closeSlide();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save coupon');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteCoupon(deleteTarget.id);
            setCoupons(prev => prev.filter(c => c.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete coupon');
        } finally {
            setIsDeleting(false);
        }
    };

    const totalUsage = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

    const metricCards = [
        { label: 'Total Coupons', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50', icon: Ticket },
        { label: 'Active', value: coupons.filter(c => c.status === 'active').length, color: 'text-green-600', bg: 'bg-green-50', icon: UserCheck },
        { label: 'Expired', value: coupons.filter(c => c.status === 'expired').length, color: 'text-red-600', bg: 'bg-red-50', icon: Calendar },
        { label: 'Total Usage', value: totalUsage, color: 'text-purple-600', bg: 'bg-purple-50', icon: DollarSign },
    ];

    return (
        <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Coupons</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage discount coupons and promotional codes</p>
                </div>
                <button onClick={openCreateSlide}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                    <Plus className="h-4 w-4 mr-2" /> Create Coupon
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" /></div>
                                <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" /></div>
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
                    <input type="text" placeholder="Search by code or name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                    <button onClick={loadCoupons} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>{['Code', 'Discount', 'Usage', 'Status', 'Valid Period', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : coupons.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No coupons found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || statusFilter !== 'all'
                            ? 'No coupons match your search criteria.'
                            : 'Get started by creating your first coupon code.'}
                    </p>
                    {!debouncedSearch && statusFilter === 'all' && (
                        <button onClick={openCreateSlide}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create Coupon
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valid Period</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                                                    <Ticket className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{coupon.code}</p>
                                                    {coupon.name && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{coupon.name}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getDiscountDisplay(coupon)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{SCOPE_LABELS[coupon.scopeType] || coupon.scopeType}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {getUsageDisplay(coupon)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[coupon.status] || 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                                                {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.startsAt ? formatDate(coupon.startsAt) : '\u2014'} &ndash; {coupon.expiresAt ? formatDate(coupon.expiresAt) : '\u2014'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openDetail(coupon)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details"
                                                ><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => openEditSlide(coupon)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Coupon"
                                                ><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => setDeleteTarget(coupon)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Coupon"
                                                ><Trash2 className="h-4 w-4" /></button>
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

            {detailCoupon && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailCoupon(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Coupon Details</h2>
                            <button onClick={() => setDetailCoupon(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><Ticket className="h-6 w-6" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">{detailCoupon.code}</h3>
                                    {detailCoupon.name && <p className="text-sm text-gray-500">{detailCoupon.name}</p>}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Discount Info</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Type</span><p className="font-medium text-gray-900 dark:text-gray-100">{getDiscountDisplay(detailCoupon)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Max Discount</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailCoupon.maxDiscountAmount != null ? `$${detailCoupon.maxDiscountAmount}` : '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Scope</span><p className="font-medium text-gray-900 dark:text-gray-100">{SCOPE_LABELS[detailCoupon.scopeType] || detailCoupon.scopeType}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Stackable</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailCoupon.stackable ? 'Yes' : 'No'}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Usage</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Used</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailCoupon.usageCount || 0}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Limit</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailCoupon.usageLimitTotal != null ? detailCoupon.usageLimitTotal : 'Unlimited'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Per User</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailCoupon.usageLimitPerUser != null ? detailCoupon.usageLimitPerUser : 'Unlimited'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Last Used</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailCoupon.lastUsedAt)}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Starts</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailCoupon.startsAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Expires</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailCoupon.expiresAt)}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Redemptions</h3>
                                {loadingRedemptions && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                            </div>
                            {redemptions.length === 0 && !loadingRedemptions ? (
                                <p className="text-sm text-gray-500 text-center py-4">No redemptions recorded yet.</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {redemptions.map(r => {
                                        const userObj = typeof r.user === 'object' && r.user ? r.user : null;
                                        const courseObj = typeof r.course === 'object' && r.course ? r.course : null;
                                        return (
                                            <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-sm">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {userObj ? `${userObj.firstName} ${userObj.lastName}` : `User #${r.user}`}
                                                    </p>
                                                    {courseObj && <p className="text-xs text-gray-500 truncate">{courseObj.title}</p>}
                                                </div>
                                                <div className="text-right shrink-0 ml-3">
                                                    <p className="font-mono text-sm text-gray-900">${r.finalTotalSnapshot.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(r.appliedAt)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => { const c = detailCoupon; setDetailCoupon(null); openEditSlide(c); }}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                ><Edit className="h-4 w-4 mr-2" /> Edit Coupon</button>
                                <button onClick={() => setDetailCoupon(null)}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Coupon</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200 font-mono">{deleteTarget.code}</span>? This action cannot be undone.
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
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{slideCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
                            <button onClick={closeSlide} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {saveError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{saveError}</div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                                    <input type="text" value={form.code} onChange={e => updateField('code', e.target.value.toUpperCase())} placeholder="SUMMER2024"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Summer Sale 2024"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={form.status} onChange={e => updateField('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >{COUPON_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Discount</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                                    <select value={form.discountType} onChange={e => updateField('discountType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >{DISCOUNT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
                                    <input type="number" value={form.amount} onChange={e => updateField('amount', e.target.value)} min="0" step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Discount Amount (optional)</label>
                                    <input type="number" value={form.maxDiscountAmount} onChange={e => updateField('maxDiscountAmount', e.target.value)} min="0" step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Scope</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applies To</label>
                                    <select value={form.scopeType} onChange={e => updateField('scopeType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >{SCOPE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                                </div>

                                {form.scopeType === 'specific_courses' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Included Courses</label>
                                        <div className="relative">
                                            <input type="text" value={courseSearch} onChange={e => handleCourseSearch(e.target.value)} placeholder="Search courses..."
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                            />
                                            {courseResults.length > 0 && (
                                                <div className="absolute z-10 mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                                    {courseResults.map(c => (
                                                        <button key={c.id} type="button" onClick={() => addCourse(c)}
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-gray-100"
                                                        >{c.title}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {selectedCourses.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedCourses.map(c => (
                                                    <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                                                        {c.title}
                                                        <button type="button" onClick={() => removeCourse(c.id)} className="text-blue-400 hover:text-blue-600"><X className="h-3 w-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {form.scopeType === 'specific_categories' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Included Categories</label>
                                        <div className="relative">
                                            <input type="text" value={categorySearch} onChange={e => handleCategorySearch(e.target.value)} placeholder="Search categories..."
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                            />
                                            {categoryResults.length > 0 && (
                                                <div className="absolute z-10 mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                                    {categoryResults.map(c => (
                                                        <button key={c.id} type="button" onClick={() => addCategory(c)}
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-gray-100"
                                                        >{c.name}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {selectedCategories.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedCategories.map(c => (
                                                    <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                                                        {c.name}
                                                        <button type="button" onClick={() => removeCategory(c.id)} className="text-purple-400 hover:text-purple-600"><X className="h-3 w-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer">
                                    <input type="checkbox" checked={form.excludeSaleCourses} onChange={e => updateField('excludeSaleCourses', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Exclude Sale Courses</p><p className="text-xs text-gray-500">Coupon does not apply to courses already on sale</p></div>
                                </label>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Restrictions</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount</label>
                                    <input type="number" value={form.minimumAmount} onChange={e => updateField('minimumAmount', e.target.value)} min="0" step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount</label>
                                    <input type="number" value={form.maximumAmount} onChange={e => updateField('maximumAmount', e.target.value)} min="0" step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit (Total)</label>
                                    <input type="number" value={form.usageLimitTotal} onChange={e => updateField('usageLimitTotal', e.target.value)} min="0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit (Per User)</label>
                                    <input type="number" value={form.usageLimitPerUser} onChange={e => updateField('usageLimitPerUser', e.target.value)} min="0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Items Affected</label>
                                    <input type="number" value={form.maxItemsAffected} onChange={e => updateField('maxItemsAffected', e.target.value)} min="1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                    <input type="number" value={form.priority} onChange={e => updateField('priority', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer">
                                        <input type="checkbox" checked={form.stackable} onChange={e => updateField('stackable', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Stackable</p><p className="text-xs text-gray-500">Allow this coupon to be combined with other coupons</p></div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input type="datetime-local" value={form.startsAt} onChange={e => updateField('startsAt', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                    <input type="datetime-local" value={form.expiresAt} onChange={e => updateField('expiresAt', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[var(--card-background)] border-t border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-end gap-3">
                            <button onClick={closeSlide} disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                            >Cancel</button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{isSaving ? 'Saving...' : slideCoupon ? 'Save Changes' : 'Create Coupon'}</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
