'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search, Plus, Loader2, X, Trash2, Edit, Eye,
    Bell, Star, Calendar, BookOpen,
} from '@/components/ui/IconWrapper';
import {
    getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    getCourseOptions,
} from './actions';
import type {
    AnnouncementDoc, AnnouncementCourseOption, AnnouncementsStats,
    CreateAnnouncementData,
} from '@encreasl/cms-types';

const ITEMS_PER_PAGE = 15;

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

function extractTextFromLexical(bodyBlocks: any): string {
    if (!bodyBlocks?.root?.children) return ''
    return bodyBlocks.root.children
        .map((child: any) =>
            child.children
                ? child.children.map((c: any) => c.text || '').join('')
                : child.text || ''
        )
        .join('\n')
}

function isActive(announcement: AnnouncementDoc): boolean {
    const now = Date.now()
    const from = announcement.visibleFrom ? new Date(announcement.visibleFrom).getTime() : 0
    const until = announcement.visibleUntil ? new Date(announcement.visibleUntil).getTime() : Infinity
    return !isNaN(from) && !isNaN(until) && now >= from && now <= until
}

function getCourseTitle(course: { id: number; title?: string; code?: string; courseCode?: string } | number | null | undefined): string {
    if (!course || typeof course !== 'object') return '\u2014'
    return course.title || course.code || course.courseCode || `Course #${course.id}`
}

type FormField = keyof FormState;

interface FormState {
    title: string;
    course: string;
    content: string;
    pinned: boolean;
    visibleFrom: string;
    visibleUntil: string;
}

const FORM_DEFAULTS: FormState = {
    title: '',
    course: '',
    content: '',
    pinned: false,
    visibleFrom: '',
    visibleUntil: '',
};

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [stats, setStats] = useState<AnnouncementsStats>({ total: 0, pinned: 0, active: 0, expired: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<AnnouncementDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailAnnouncement, setDetailAnnouncement] = useState<AnnouncementDoc | null>(null);

    const [slideAnnouncement, setSlideAnnouncement] = useState<AnnouncementDoc | null>(null);
    const [slideMounted, setSlideMounted] = useState(false);
    const [animateSlide, setAnimateSlide] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>(FORM_DEFAULTS);

    const [courseOptions, setCourseOptions] = useState<AnnouncementCourseOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const [courseSearch, setCourseSearch] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const courseRef = useRef<HTMLDivElement>(null);

    const loadAnnouncements = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAnnouncements({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setAnnouncements(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
            if (data.stats) setStats(data.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load announcements');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

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
            const courses = await getCourseOptions();
            setCourseOptions(courses);
        } catch {
            // silently fail
        } finally {
            setLoadingOptions(false);
        }
    };

    const filteredCourseOptions = courseSearch
        ? courseOptions.filter(c =>
            c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.code.toLowerCase().includes(courseSearch.toLowerCase())
        )
        : courseOptions;

    const openDetail = (announcement: AnnouncementDoc) => {
        setDetailAnnouncement(announcement);
    };

    const openCreateSlide = () => {
        setSlideAnnouncement(null);
        setForm(FORM_DEFAULTS);
        setCourseSearch('');
        setSaveError(null);
        loadOptions();
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const openEditSlide = (announcement: AnnouncementDoc) => {
        setSlideAnnouncement(announcement);
        const courseId = typeof announcement.course === 'object' ? announcement.course.id : announcement.course;
        const courseTitle = typeof announcement.course === 'object' ? getCourseTitle(announcement.course) : '';

        setForm({
            title: announcement.title || '',
            course: String(courseId || ''),
            content: extractTextFromLexical(announcement.bodyBlocks),
            pinned: announcement.pinned ?? false,
            visibleFrom: announcement.visibleFrom ? announcement.visibleFrom.slice(0, 16) : '',
            visibleUntil: announcement.visibleUntil ? announcement.visibleUntil.slice(0, 16) : '',
        });
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
            setSlideAnnouncement(null);
        }, 300);
    };

    const updateField = <K extends FormField>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const selectCourse = (option: AnnouncementCourseOption) => {
        updateField('course', String(option.id));
        setCourseSearch(option.title);
        setShowCourseDropdown(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            if (!form.title.trim()) { setSaveError('Title is required.'); setIsSaving(false); return; }
            if (!form.course) { setSaveError('Please select a course.'); setIsSaving(false); return; }

            const payload: CreateAnnouncementData = {
                title: form.title.trim(),
                course: Number(form.course),
                content: form.content.trim() || null,
                pinned: form.pinned,
                visibleFrom: form.visibleFrom || null,
                visibleUntil: form.visibleUntil || null,
            };

            if (slideAnnouncement) {
                const updated = await updateAnnouncement(slideAnnouncement.id, payload);
                setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
            } else {
                const created = await createAnnouncement(payload);
                setAnnouncements(prev => [created, ...prev]);
                setTotalDocs(prev => prev + 1);
            }

            closeSlide();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save announcement');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteAnnouncement(deleteTarget.id);
            setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete announcement');
        } finally {
            setIsDeleting(false);
        }
    };

    const metricCards = [
        { label: 'Total Announcements', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: Bell },
        { label: 'Pinned', value: stats.pinned, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Star },
        { label: 'Active', value: stats.active, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', icon: Calendar },
        { label: 'Expired', value: stats.expired, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', icon: BookOpen },
    ];

    return (
        <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage course announcements, pinned updates, and scheduled notices</p>
                </div>
                <button onClick={openCreateSlide}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                    <Plus className="h-4 w-4 mr-2" /> Create Announcement
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

            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                    <button onClick={loadAnnouncements} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>{['Title', 'Course', 'Pinned', 'Visible', 'Created', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-14" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No announcements found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch
                            ? 'No announcements match your search criteria. Try a different search term.'
                            : 'Get started by creating your first course announcement.'}
                    </p>
                    {!debouncedSearch && (
                        <button onClick={openCreateSlide}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create Announcement
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pinned</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visible</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {announcements.map(announcement => {
                                    const courseTitle = announcement.course != null && typeof announcement.course === 'object'
                                        ? getCourseTitle(announcement.course) : '\u2014';
                                    const active = isActive(announcement);
                                    const bodyPreview = extractTextFromLexical(announcement.bodyBlocks);
                                    return (
                                        <tr key={announcement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 shrink-0">
                                                        <Bell className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{announcement.title}</p>
                                                        {bodyPreview && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[250px]">{bodyPreview}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                                                {courseTitle}
                                            </td>
                                            <td className="px-4 py-3">
                                                {announcement.pinned ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800">
                                                        <Star className="h-3 w-3" /> Pinned
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">&mdash;</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                    active
                                                        ? 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800'
                                                        : 'bg-gray-100 text-gray-500 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    {active ? 'Active' : 'Scheduled'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(announcement.createdAt)}
                                                {announcement.createdBy && typeof announcement.createdBy === 'object' && (
                                                    <span className="text-xs text-gray-400 block">
                                                        by {announcement.createdBy.firstName} {announcement.createdBy.lastName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openDetail(announcement)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details"
                                                    ><Eye className="h-4 w-4" /></button>
                                                    <button onClick={() => openEditSlide(announcement)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Announcement"
                                                    ><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => setDeleteTarget(announcement)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Announcement"
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

            {detailAnnouncement && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailAnnouncement(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Announcement Details</h2>
                            <button onClick={() => setDetailAnnouncement(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><Bell className="h-6 w-6" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{detailAnnouncement.title}</h3>
                                    {detailAnnouncement.pinned && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
                                            <Star className="h-3 w-3" /> Pinned
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Course</h3></div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {detailAnnouncement.course != null && typeof detailAnnouncement.course === 'object'
                                    ? getCourseTitle(detailAnnouncement.course) : '\u2014'}
                            </p>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Visible From</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailAnnouncement.visibleFrom)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Visible Until</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailAnnouncement.visibleUntil)}</p></div>
                            </div>

                            {detailAnnouncement.bodyBlocks && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Content</h3></div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 max-h-60 overflow-y-auto">
                                        {extractTextFromLexical(detailAnnouncement.bodyBlocks) || '\u2014'}
                                    </div>
                                </>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audit</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Created</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailAnnouncement.createdAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Updated</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(detailAnnouncement.updatedAt)}</p></div>
                                {detailAnnouncement.createdBy && typeof detailAnnouncement.createdBy === 'object' && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500 dark:text-gray-400">Created By</span>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{detailAnnouncement.createdBy.firstName} {detailAnnouncement.createdBy.lastName} ({detailAnnouncement.createdBy.email})</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => { const a = detailAnnouncement; setDetailAnnouncement(null); openEditSlide(a); }}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                ><Edit className="h-4 w-4 mr-2" /> Edit Announcement</button>
                                <button onClick={() => setDetailAnnouncement(null)}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Announcement</h3>
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
                    <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animateSlide ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {slideAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
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
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                    <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
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
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Content</h3>
                            </div>
                            <div>
                                <textarea rows={6} value={form.content} onChange={e => updateField('content', e.target.value)}
                                    placeholder="Write your announcement content here..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 resize-none"
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Options</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="pinned" checked={form.pinned}
                                    onChange={e => updateField('pinned', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="pinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin this announcement</label>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schedule</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visible From</label>
                                    <input type="datetime-local" value={form.visibleFrom} onChange={e => updateField('visibleFrom', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visible Until</label>
                                    <input type="datetime-local" value={form.visibleUntil} onChange={e => updateField('visibleUntil', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
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
