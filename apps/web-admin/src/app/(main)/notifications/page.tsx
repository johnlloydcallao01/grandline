'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search, Plus, Loader2, X, Trash2, Edit, Eye,
    Bell, Mail, FileText, Users, Clock,
    Send, CheckCircle, UserCheck,
} from '@/components/ui/IconWrapper';
import {
    getNotifications, createNotification, updateNotification, deleteNotification,
    getTemplates, createTemplate, updateTemplate, deleteTemplate,
    getUserOptions, getTemplateOptions,
    type NotificationDoc, type NotificationTemplateDoc,
    type UserOption,
} from './actions';

const ITEMS_PER_PAGE = 15;

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string | null | undefined) {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const CATEGORIES = [
    { value: 'learning', label: 'Learning', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { value: 'account', label: 'Account', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { value: 'system-update', label: 'System Update', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { value: 'other', label: 'Other', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800' },
] as const;

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400' },
    scheduled: { label: 'Scheduled', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', dot: 'bg-blue-500' },
    sent: { label: 'Sent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', dot: 'bg-green-500' },
    cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', dot: 'bg-red-500' },
} as const;

const STATUS_ORDER: Array<keyof typeof STATUS_CONFIG> = ['draft', 'scheduled', 'sent', 'cancelled'];

type TabId = 'notifications' | 'templates';

function getCategoryInfo(value: string) {
    return CATEGORIES.find(c => c.value === value) || CATEGORIES[3];
}

function getChannelsLabel(channels?: ('in-app' | 'email' | 'push')[] | null): string {
    if (!channels || channels.length === 0) return '\u2014';
    return channels.map(ch => ch === 'in-app' ? 'In-App' : ch === 'email' ? 'Email' : 'Push').join(', ');
}

interface NotifFormState {
    title: string;
    category: string;
    body: string;
    template: string;
    origin: string;
    audienceType: string;
    audienceRole: string;
    audienceUsers: number[];
    segmentDefinition: string;
    sourceType: string;
    sourceId: string;
    scheduledAt: string;
    expiresAt: string;
    status: string;
}

const NOTIF_FORM_DEFAULTS: NotifFormState = {
    title: '',
    category: 'learning',
    body: '',
    template: '',
    origin: 'manual',
    audienceType: 'all-users',
    audienceRole: '',
    audienceUsers: [],
    segmentDefinition: '',
    sourceType: '',
    sourceId: '',
    scheduledAt: '',
    expiresAt: '',
    status: 'draft',
};

interface TemplateFormState {
    name: string;
    code: string;
    category: string;
    titleTemplate: string;
    bodyTemplate: string;
    defaultLink: string;
    channels: string[];
    automatic: boolean;
    manual: boolean;
    metadataSchema: string;
}

const TEMPLATE_FORM_DEFAULTS: TemplateFormState = {
    name: '',
    code: '',
    category: 'learning',
    titleTemplate: '',
    bodyTemplate: '',
    defaultLink: '',
    channels: ['in-app'],
    automatic: false,
    manual: true,
    metadataSchema: '',
};

function NotificationsTab() {
    const [items, setItems] = useState<NotificationDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<NotificationDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailItem, setDetailItem] = useState<NotificationDoc | null>(null);

    const [slideItem, setSlideItem] = useState<NotificationDoc | null>(null);
    const [slideMounted, setSlideMounted] = useState(false);
    const [animateSlide, setAnimateSlide] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [form, setForm] = useState<NotifFormState>(NOTIF_FORM_DEFAULTS);

    const [templateOptions, setTemplateOptions] = useState<{ id: number; name: string; code: string }[]>([]);
    const [loadingTemplateOptions, setLoadingTemplateOptions] = useState(false);

    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userRef = useRef<HTMLDivElement>(null);

    const loadItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getNotifications({
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
                category: categoryFilter || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setItems(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter, categoryFilter, currentPage]);

    useEffect(() => { loadItems(); }, [loadItems]);

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
            if (userRef.current && !userRef.current.contains(e.target as Node)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadOptions = async () => {
        setLoadingTemplateOptions(true);
        try {
            const templates = await getTemplateOptions();
            setTemplateOptions(templates);
        } catch { /* silently fail */ } finally {
            setLoadingTemplateOptions(false);
        }
    };

    const loadUserOptions = async (search?: string) => {
        try {
            const users = await getUserOptions(search);
            setUserOptions(users);
        } catch { /* silently fail */ }
    };

    const openDetail = (item: NotificationDoc) => {
        setDetailItem(item);
    };

    const openCreateSlide = () => {
        setSlideItem(null);
        setForm(NOTIF_FORM_DEFAULTS);
        setSaveError(null);
        loadOptions();
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const openEditSlide = (item: NotificationDoc) => {
        setSlideItem(item);
        const audienceUsers: number[] = item.audienceUsers
            ? (Array.isArray(item.audienceUsers) ? item.audienceUsers.map(u => typeof u === 'object' ? u.id : u) : [])
            : [];

        setForm({
            title: item.title || '',
            category: item.category || 'learning',
            body: item.body || '',
            template: item.template && typeof item.template === 'object' ? String(item.template.id) : '',
            origin: item.origin || 'manual',
            audienceType: item.audienceType || 'all-users',
            audienceRole: item.audienceRole || '',
            audienceUsers,
            segmentDefinition: item.segmentDefinition ? JSON.stringify(item.segmentDefinition, null, 2) : '',
            sourceType: item.sourceType || '',
            sourceId: item.sourceId || '',
            scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '',
            expiresAt: item.expiresAt ? item.expiresAt.slice(0, 16) : '',
            status: item.status || 'draft',
        });
        setSaveError(null);
        loadOptions();
        if (audienceUsers.length > 0) loadUserOptions();
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const closeSlide = () => {
        setAnimateSlide(false);
        setTimeout(() => {
            setSlideMounted(false);
            setSlideItem(null);
        }, 300);
    };

    const updateField = <K extends keyof NotifFormState>(key: K, value: NotifFormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const toggleAudienceUser = (userId: number) => {
        setForm(prev => ({
            ...prev,
            audienceUsers: prev.audienceUsers.includes(userId)
                ? prev.audienceUsers.filter(id => id !== userId)
                : [...prev.audienceUsers, userId],
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            if (!form.title.trim()) { setSaveError('Title is required.'); setIsSaving(false); return; }
            if (form.audienceType === 'specific-users' && form.audienceUsers.length === 0) {
                setSaveError('Please select at least one user for the specific audience.'); setIsSaving(false); return;
            }

            let segmentDefinition: any = undefined;
            if (form.audienceType === 'segment' && form.segmentDefinition.trim()) {
                try { segmentDefinition = JSON.parse(form.segmentDefinition); }
                catch { setSaveError('Invalid JSON in Segment Definition.'); setIsSaving(false); return; }
            }

            const payload: Record<string, unknown> = {
                title: form.title.trim(),
                category: form.category,
                body: form.body.trim() || null,
                template: form.template ? Number(form.template) : null,
                origin: form.origin,
                audienceType: form.audienceType,
                audienceRole: form.audienceType === 'role' ? form.audienceRole : null,
                audienceUsers: form.audienceType === 'specific-users' && form.audienceUsers.length > 0 ? form.audienceUsers : null,
                segmentDefinition: form.audienceType === 'segment' ? segmentDefinition : null,
                sourceType: form.sourceType.trim() || null,
                sourceId: form.sourceId.trim() || null,
                scheduledAt: form.scheduledAt || null,
                expiresAt: form.expiresAt || null,
                status: form.status,
            };

            if (slideItem) {
                const updated = await updateNotification(slideItem.id, payload as any);
                setItems(prev => prev.map(a => a.id === updated.id ? updated : a));
            } else {
                const created = await createNotification(payload as any);
                setItems(prev => [created, ...prev]);
                setTotalDocs(prev => prev + 1);
            }

            closeSlide();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save notification');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteNotification(deleteTarget.id);
            setItems(prev => prev.filter(a => a.id !== deleteTarget!.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete notification');
        } finally {
            setIsDeleting(false);
        }
    };

    const statusCounts = {
        total: totalDocs,
        draft: items.filter(a => a.status === 'draft').length,
        scheduled: items.filter(a => a.status === 'scheduled').length,
        sent: items.filter(a => a.status === 'sent').length,
        cancelled: items.filter(a => a.status === 'cancelled').length,
    };

    const metricCards = [
        { label: 'Total', value: statusCounts.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: Bell },
        { label: 'Draft', value: statusCounts.draft, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', icon: FileText },
        { label: 'Scheduled', value: statusCounts.scheduled, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: Clock },
        { label: 'Sent', value: statusCounts.sent, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', icon: Send },
    ];

    const filterChips = [
        { key: 'status', label: 'All Status', value: '', active: !statusFilter },
        ...STATUS_ORDER.map(s => ({
            key: 'status', label: STATUS_CONFIG[s].label, value: s, active: statusFilter === s,
        })),
        { key: 'sep', label: '|', value: '', active: false, separator: true },
        { key: 'category', label: 'All Categories', value: '', active: !categoryFilter },
        ...CATEGORIES.map(c => ({
            key: 'category', label: c.label, value: c.value, active: categoryFilter === c.value,
        })),
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={openCreateSlide}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                ><Plus className="h-4 w-4 mr-2" /> Create Notification</button>
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

            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {filterChips.map((chip, i) =>
                    chip.separator ? (
                        <span key={i} className="text-gray-300 dark:text-gray-600 text-sm px-1 select-none">|</span>
                    ) : (
                        <button key={`${chip.key}-${chip.value}`} onClick={() => {
                            if (chip.key === 'status') { setStatusFilter(chip.value); setCurrentPage(1); }
                            if (chip.key === 'category') { setCategoryFilter(chip.value); setCurrentPage(1); }
                        }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${chip.active
                                ? chip.value === ''
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-white dark:bg-[var(--card-background)] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >{chip.label}</button>
                    )
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                    <button onClick={loadItems} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>{['Title / Category', 'Audience', 'Status', 'Scheduled', 'Created', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No notifications found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || statusFilter || categoryFilter
                            ? 'No notifications match your criteria. Try different filters.'
                            : 'Get started by creating your first notification.'}
                    </p>
                    {!debouncedSearch && !statusFilter && !categoryFilter && (
                        <button onClick={openCreateSlide}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        ><Plus className="h-4 w-4 mr-2" /> Create Notification</button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title / Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Audience</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scheduled</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map(item => {
                                    const catInfo = getCategoryInfo(item.category);
                                    const sc = STATUS_CONFIG[item.status];
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer" onClick={() => openDetail(item)}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded text-white shrink-0 ${catInfo.bg} ${catInfo.color.replace('text-', '')}`}>
                                                        <Bell className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                                                        <span className={`text-xs ${catInfo.color}`}>{catInfo.label}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <Users className="h-3 w-3" />
                                                    {item.audienceType === 'all-users' ? 'All Users' :
                                                        item.audienceType === 'role' ? `Role: ${item.audienceRole || '\u2014'}` :
                                                        item.audienceType === 'specific-users' ? `${(item.audienceUsers?.length || 0)} users` :
                                                        'Segment'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${sc.bg} ${sc.color} ring-${sc.dot.replace('bg-', '')}/30`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {item.scheduledAt ? formatDateTime(item.scheduledAt) : '\u2014'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openDetail(item)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details"
                                                    ><Eye className="h-4 w-4" /></button>
                                                    <button onClick={() => openEditSlide(item)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit"
                                                    ><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => setDeleteTarget(item)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"
                                                    ><Trash2 className="h-4 w-4" /></button>
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

            {detailItem && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailItem(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notification Details</h2>
                            <button onClick={() => setDetailItem(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${getCategoryInfo(detailItem.category).bg}`}>
                                    <Bell className={`h-6 w-6 ${getCategoryInfo(detailItem.category).color}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{detailItem.title}</h3>
                                    <span className={`text-xs font-medium ${getCategoryInfo(detailItem.category).color}`}>
                                        {getCategoryInfo(detailItem.category).label}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status & Origin</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_CONFIG[detailItem.status].bg} ${STATUS_CONFIG[detailItem.status].color}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[detailItem.status].dot}`} />
                                            {STATUS_CONFIG[detailItem.status].label}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Origin</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">{detailItem.origin}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audience</h3></div>
                            <div className="text-sm space-y-2">
                                <div><span className="text-gray-500 dark:text-gray-400">Type</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {detailItem.audienceType === 'all-users' ? 'All Users' :
                                            detailItem.audienceType === 'role' ? `Role: ${detailItem.audienceRole || '\u2014'}` :
                                            detailItem.audienceType === 'specific-users' ? `Specific Users (${detailItem.audienceUsers?.length || 0})` :
                                            'Segment'}
                                    </p>
                                </div>
                                {detailItem.audienceType === 'specific-users' && detailItem.audienceUsers && Array.isArray(detailItem.audienceUsers) && detailItem.audienceUsers.length > 0 && (
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Users</span>
                                        <div className="mt-1 max-h-24 overflow-y-auto space-y-1">
                                            {detailItem.audienceUsers.map(u => {
                                                const uid = typeof u === 'object' ? u.id : u;
                                                const label = typeof u === 'object' ? (u.email || `User #${u.id}`) : `User #${u}`;
                                                return <div key={uid} className="text-sm text-gray-700 dark:text-gray-300">{label}</div>;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {detailItem.body && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Body</h3></div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                                        {detailItem.body}
                                    </div>
                                </>
                            )}

                            {detailItem.template && typeof detailItem.template === 'object' && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Template</h3></div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{detailItem.template.name || `Template #${detailItem.template.id}`}</p>
                                </>
                            )}

                            {(detailItem.sourceType || detailItem.sourceId) && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Source</h3></div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {detailItem.sourceType && <div><span className="text-gray-500 dark:text-gray-400">Type</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailItem.sourceType}</p></div>}
                                        {detailItem.sourceId && <div><span className="text-gray-500 dark:text-gray-400">ID</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailItem.sourceId}</p></div>}
                                    </div>
                                </>
                            )}

                            {(detailItem.scheduledAt || detailItem.expiresAt) && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule</h3></div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-500 dark:text-gray-400">Scheduled At</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailItem.scheduledAt)}</p></div>
                                        <div><span className="text-gray-500 dark:text-gray-400">Expires At</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailItem.expiresAt)}</p></div>
                                    </div>
                                </>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audit</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Created</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailItem.createdAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Updated</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailItem.updatedAt)}</p></div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => { const a = detailItem; setDetailItem(null); openEditSlide(a); }}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                ><Edit className="h-4 w-4 mr-2" /> Edit</button>
                                <button onClick={() => setDetailItem(null)}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Notification</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.title}</span>? This action cannot be undone.
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
                    <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animateSlide ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {slideItem ? 'Edit Notification' : 'Create Notification'}
                            </h2>
                            <button onClick={closeSlide} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {saveError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{saveError}</div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                    <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                                    <select value={form.category} onChange={e => updateField('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
                                    <textarea rows={4} value={form.body} onChange={e => updateField('body', e.target.value)}
                                        placeholder="Notification body text..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template</label>
                                    <select value={form.template} onChange={e => updateField('template', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">No template</option>
                                        {loadingTemplateOptions ? <option disabled>Loading...</option> :
                                            templateOptions.map(t => <option key={t.id} value={String(t.id)}>{t.name} ({t.code})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audience</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audience Type *</label>
                                    <select value={form.audienceType} onChange={e => updateField('audienceType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all-users">All Users</option>
                                        <option value="role">Role-based</option>
                                        <option value="specific-users">Specific Users</option>
                                        <option value="segment">Segment</option>
                                    </select>
                                </div>
                                {form.audienceType === 'role' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <select value={form.audienceRole} onChange={e => updateField('audienceRole', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Select role...</option>
                                            <option value="trainee">Trainee</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="admin">Admin</option>
                                            <option value="service">Service</option>
                                        </select>
                                    </div>
                                )}
                                {form.audienceType === 'specific-users' && (
                                    <div ref={userRef} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Users ({form.audienceUsers.length} selected)
                                        </label>
                                        <input type="text" placeholder="Search users by email or name..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                            value={userSearch}
                                            onChange={e => { setUserSearch(e.target.value); setShowUserDropdown(true); loadUserOptions(e.target.value); }}
                                            onFocus={() => { setShowUserDropdown(true); loadUserOptions(); }}
                                        />
                                        {showUserDropdown && (
                                            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                                {userOptions.length === 0 ? (
                                                    <div className="p-3 text-sm text-gray-500 text-center">No users found</div>
                                                ) : (
                                                    userOptions.map(u => (
                                                        <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                            <input type="checkbox" checked={form.audienceUsers.includes(u.id)}
                                                                onChange={() => toggleAudienceUser(u.id)}
                                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-300">{u.email}</span>
                                                            {(u.firstName || u.lastName) && (
                                                                <span className="text-xs text-gray-500">({u.firstName} {u.lastName})</span>
                                                            )}
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                        {form.audienceUsers.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {form.audienceUsers.map(uid => {
                                                    const u = userOptions.find(o => o.id === uid);
                                                    const label = u ? (u.email || `User #${uid}`) : `User #${uid}`;
                                                    return (
                                                        <span key={uid} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                            {label}
                                                            <button onClick={() => toggleAudienceUser(uid)} className="hover:text-blue-900 dark:hover:text-blue-100"><X className="h-3 w-3" /></button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {form.audienceType === 'segment' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segment Definition (JSON)</label>
                                        <textarea rows={4} value={form.segmentDefinition || ''} onChange={e => updateField('segmentDefinition', e.target.value)}
                                            placeholder='e.g. {"coursesCompleted": {"gte": 5}}'
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 font-mono resize-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Source</h3></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Type</label>
                                    <input type="text" value={form.sourceType} onChange={e => updateField('sourceType', e.target.value)}
                                        placeholder="e.g. course, enrollment"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source ID</label>
                                    <input type="text" value={form.sourceId} onChange={e => updateField('sourceId', e.target.value)}
                                        placeholder="e.g. 42"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Scheduling & Status</h3></div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin</label>
                                        <select value={form.origin} onChange={e => updateField('origin', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="automatic">Automatic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select value={form.status} onChange={e => updateField('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="scheduled">Scheduled</option>
                                            <option value="sent">Sent</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled At</label>
                                        <input type="datetime-local" value={form.scheduledAt} onChange={e => updateField('scheduledAt', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At</label>
                                        <input type="datetime-local" value={form.expiresAt} onChange={e => updateField('expiresAt', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
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

function TemplatesTab() {
    const [items, setItems] = useState<NotificationTemplateDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<NotificationTemplateDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailItem, setDetailItem] = useState<NotificationTemplateDoc | null>(null);

    const [slideItem, setSlideItem] = useState<NotificationTemplateDoc | null>(null);
    const [slideMounted, setSlideMounted] = useState(false);
    const [animateSlide, setAnimateSlide] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [form, setForm] = useState<TemplateFormState>(TEMPLATE_FORM_DEFAULTS);

    const loadItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getTemplates({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setItems(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => { loadItems(); }, [loadItems]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const openDetail = (item: NotificationTemplateDoc) => { setDetailItem(item); };

    const openCreateSlide = () => {
        setSlideItem(null);
        setForm(TEMPLATE_FORM_DEFAULTS);
        setSaveError(null);
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const openEditSlide = (item: NotificationTemplateDoc) => {
        setSlideItem(item);
        setForm({
            name: item.name || '',
            code: item.code || '',
            category: item.category || 'learning',
            titleTemplate: item.titleTemplate || '',
            bodyTemplate: item.bodyTemplate || '',
            defaultLink: item.defaultLink || '',
            channels: (item.channels as string[]) || ['in-app'],
            automatic: item.automatic ?? false,
            manual: item.manual ?? true,
            metadataSchema: item.metadataSchema ? JSON.stringify(item.metadataSchema, null, 2) : '',
        });
        setSaveError(null);
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const closeSlide = () => {
        setAnimateSlide(false);
        setTimeout(() => { setSlideMounted(false); setSlideItem(null); }, 300);
    };

    const updateField = <K extends keyof TemplateFormState>(key: K, value: TemplateFormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const toggleChannel = (ch: string) => {
        setForm(prev => ({
            ...prev,
            channels: prev.channels.includes(ch) ? prev.channels.filter(c => c !== ch) : [...prev.channels, ch],
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            if (!form.name.trim()) { setSaveError('Name is required.'); setIsSaving(false); return; }
            if (!form.code.trim()) { setSaveError('Code is required.'); setIsSaving(false); return; }
            if (!form.titleTemplate.trim()) { setSaveError('Title template is required.'); setIsSaving(false); return; }
            if (form.channels.length === 0) { setSaveError('Select at least one channel.'); setIsSaving(false); return; }

            let metadataSchema: any = undefined;
            if (form.metadataSchema.trim()) {
                try { metadataSchema = JSON.parse(form.metadataSchema); }
                catch { setSaveError('Invalid JSON in Metadata Schema.'); setIsSaving(false); return; }
            }

            const payload: Record<string, unknown> = {
                name: form.name.trim(),
                code: form.code.trim(),
                category: form.category,
                titleTemplate: form.titleTemplate.trim(),
                bodyTemplate: form.bodyTemplate.trim() || null,
                defaultLink: form.defaultLink.trim() || null,
                channels: form.channels,
                automatic: form.automatic,
                manual: form.manual,
                metadataSchema,
            };

            if (slideItem) {
                const updated = await updateTemplate(slideItem.id, payload as any);
                setItems(prev => prev.map(a => a.id === updated.id ? updated : a));
            } else {
                const created = await createTemplate(payload as any);
                setItems(prev => [created, ...prev]);
                setTotalDocs(prev => prev + 1);
            }
            closeSlide();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteTemplate(deleteTarget.id);
            setItems(prev => prev.filter(a => a.id !== deleteTarget!.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete template');
        } finally {
            setIsDeleting(false);
        }
    };

    const automatedCount = items.filter(t => t.automatic).length;
    const channelsWithEmail = items.filter(t => t.channels?.includes('email')).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={openCreateSlide}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                ><Plus className="h-4 w-4 mr-2" /> Create Template</button>
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
                    [
                        { label: 'Total Templates', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: FileText },
                        { label: 'Automated', value: automatedCount, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', icon: Send },
                        { label: 'With Email', value: channelsWithEmail, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: Mail },
                        { label: 'Manual', value: items.filter(t => t.manual).length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: UserCheck },
                    ].map(card => (
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

            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                    <button onClick={loadItems} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>{['Name / Code', 'Category', 'Channels', 'Auto', 'Manual', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-10" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-10" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No templates found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch ? 'No templates match your search.' : 'Create your first notification template to define reusable notification types.'}
                    </p>
                    {!debouncedSearch && (
                        <button onClick={openCreateSlide}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        ><Plus className="h-4 w-4 mr-2" /> Create Template</button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name / Code</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channels</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auto</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manual</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer" onClick={() => openDetail(item)}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 shrink-0">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                                                    <span className="text-xs text-gray-500 font-mono">{item.code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium ${getCategoryInfo(item.category).color}`}>
                                                {getCategoryInfo(item.category).label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {getChannelsLabel(item.channels)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.automatic ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300 dark:text-gray-600">&mdash;</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.manual ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-gray-300 dark:text-gray-600">&mdash;</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openDetail(item)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details"
                                                ><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => openEditSlide(item)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit"
                                                ><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => setDeleteTarget(item)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"
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

            {detailItem && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailItem(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Template Details</h2>
                            <button onClick={() => setDetailItem(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><FileText className="h-6 w-6" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{detailItem.name}</h3>
                                    <span className="text-xs font-mono text-gray-500">{detailItem.code}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Details</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Category</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{getCategoryInfo(detailItem.category).label}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Channels</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{getChannelsLabel(detailItem.channels)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Automatic</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{detailItem.automatic ? 'Yes' : 'No'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Manual</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{detailItem.manual ? 'Yes' : 'No'}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Content Templates</h3></div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Title Template</span>
                                    <div className="mt-1 p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-gray-900 dark:text-gray-100 font-mono text-xs break-all">{detailItem.titleTemplate}</div>
                                </div>
                                {detailItem.bodyTemplate && (
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Body Template</span>
                                        <div className="mt-1 p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-gray-900 dark:text-gray-100 font-mono text-xs whitespace-pre-wrap break-all max-h-40 overflow-y-auto">{detailItem.bodyTemplate}</div>
                                    </div>
                                )}
                                {detailItem.defaultLink && (
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Default Link</span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-all">{detailItem.defaultLink}</p>
                                    </div>
                                )}
                            </div>

                            {detailItem.metadataSchema && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Metadata Schema</h3></div>
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto whitespace-pre">
                                        {JSON.stringify(detailItem.metadataSchema, null, 2)}
                                    </div>
                                </>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audit</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Created</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailItem.createdAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Updated</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailItem.updatedAt)}</p></div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => { const a = detailItem; setDetailItem(null); openEditSlide(a); }}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                ><Edit className="h-4 w-4 mr-2" /> Edit</button>
                                <button onClick={() => setDetailItem(null)}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Template</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.name}</span>? This action cannot be undone.
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
                    <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animateSlide ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {slideItem ? 'Edit Template' : 'Create Template'}
                            </h2>
                            <button onClick={closeSlide} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {saveError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{saveError}</div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                    <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                                    <input type="text" value={form.code} onChange={e => updateField('code', e.target.value)}
                                        placeholder="e.g. COURSE_ENROLLED"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select value={form.category} onChange={e => updateField('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channels</label>
                                    <div className="flex gap-4">
                                        {['in-app', 'email', 'push'].map(ch => (
                                            <label key={ch} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.channels.includes(ch)}
                                                    onChange={() => toggleChannel(ch)}
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{ch === 'in-app' ? 'In-App' : ch}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Content</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title Template *</label>
                                    <input type="text" value={form.titleTemplate} onChange={e => updateField('titleTemplate', e.target.value)}
                                        placeholder="e.g. Welcome to {{courseName}}!"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Template</label>
                                    <textarea rows={4} value={form.bodyTemplate} onChange={e => updateField('bodyTemplate', e.target.value)}
                                        placeholder="e.g. You have been enrolled in {{courseName}}. Start learning now!"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Link</label>
                                    <input type="text" value={form.defaultLink} onChange={e => updateField('defaultLink', e.target.value)}
                                        placeholder="e.g. /portal/account/enrollments/{{enrollmentId}}"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Behavior</h3></div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.automatic}
                                            onChange={e => updateField('automatic', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatic (system-triggered)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.manual}
                                            onChange={e => updateField('manual', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual (admin-sent)</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metadata Schema (JSON)</label>
                                    <textarea rows={4} value={form.metadataSchema} onChange={e => updateField('metadataSchema', e.target.value)}
                                        placeholder='{"type": "object", "properties": {"enrollmentId": {"type": "number"}}}'
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 font-mono resize-none"
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

export default function NotificationsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab: TabId = (searchParams.get('tab') as TabId) || 'notifications';

    const handleTabChange = (tabId: TabId) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/notifications?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage notification events, broadcasts, and templates</p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
                        { id: 'templates' as TabId, label: 'Notification Templates', icon: FileText },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'templates' && <TemplatesTab />}
        </div>
    );
}
