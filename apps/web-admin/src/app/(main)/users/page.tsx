'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search, Plus, Loader2, X, Trash2, Edit, Eye,
    Shield, Mail, UserCheck, EyeOff,
} from '@/components/ui/IconWrapper';
import {
    getUsers, createUser, updateUser, deleteUser,
    type UserDoc,
} from './actions';

const ITEMS_PER_PAGE = 15;

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'trainee', label: 'Trainee' },
    { value: 'service', label: 'Service Account' },
] as const;

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

const CIVIL_STATUS_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
] as const;

const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 ring-purple-200',
    instructor: 'bg-blue-100 text-blue-700 ring-blue-200',
    trainee: 'bg-green-100 text-green-700 ring-green-200',
    service: 'bg-gray-100 text-gray-700 ring-gray-200',
};

function getRoleBadge(role: string) {
    const c = ROLE_COLORS[role] || 'bg-gray-100 text-gray-600 ring-gray-200';
    return `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`;
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '\u2014';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type FormField = keyof FormState;

interface FormState {
    firstName: string;
    lastName: string;
    middleName: string;
    nameExtension: string;
    email: string;
    username: string;
    password: string;
    role: string;
    gender: string;
    civilStatus: string;
    nationality: string;
    birthDate: string;
    placeOfBirth: string;
    phone: string;
    completeAddress: string;
    isActive: boolean;
    securityAlertsEmailEnabled: boolean;
    pushNotificationsEnabled: boolean;
}

const FORM_DEFAULTS: FormState = {
    firstName: '', lastName: '', middleName: '', nameExtension: '',
    email: '', username: '', password: '', role: 'trainee',
    gender: '', civilStatus: '', nationality: '', birthDate: '',
    placeOfBirth: '', phone: '', completeAddress: '',
    isActive: true, securityAlertsEmailEnabled: true, pushNotificationsEnabled: true,
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteTarget, setDeleteTarget] = useState<UserDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailUser, setDetailUser] = useState<UserDoc | null>(null);

    const [slideUser, setSlideUser] = useState<UserDoc | null>(null);
    const [slideMounted, setSlideMounted] = useState(false);
    const [animateSlide, setAnimateSlide] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>(FORM_DEFAULTS);

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getUsers({
                search: debouncedSearch || undefined,
                role: roleFilter === 'all' ? undefined : roleFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setUsers(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, roleFilter, currentPage]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const openCreateSlide = () => {
        setSlideUser(null);
        setForm(FORM_DEFAULTS);
        setSaveError(null);
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const openEditSlide = (user: UserDoc) => {
        setSlideUser(user);
        setForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            middleName: user.middleName || '',
            nameExtension: user.nameExtension || '',
            email: user.email || '',
            username: user.username || '',
            password: '',
            role: user.role || 'trainee',
            gender: user.gender || '',
            civilStatus: user.civilStatus || '',
            nationality: user.nationality || '',
            birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
            placeOfBirth: user.placeOfBirth || '',
            phone: user.phone || '',
            completeAddress: user.completeAddress || '',
            isActive: user.isActive ?? true,
            securityAlertsEmailEnabled: user.securityAlertsEmailEnabled ?? true,
            pushNotificationsEnabled: user.pushNotificationsEnabled ?? true,
        });
        setSaveError(null);
        setSlideMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateSlide(true)));
    };

    const closeSlide = () => {
        setAnimateSlide(false);
        setTimeout(() => {
            setSlideMounted(false);
            setSlideUser(null);
        }, 300);
    };

    const updateField = <K extends FormField>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            if (!form.firstName.trim() || !form.lastName.trim()) {
                setSaveError('First name and last name are required.');
                setIsSaving(false);
                return;
            }

            if (slideUser) {
                const updateData: Record<string, unknown> = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    middleName: form.middleName.trim() || null,
                    nameExtension: form.nameExtension.trim() || null,
                    username: form.username.trim() || null,
                    role: form.role,
                    isActive: form.isActive,
                    gender: form.gender || null,
                    civilStatus: form.civilStatus || null,
                    nationality: form.nationality.trim() || null,
                    birthDate: form.birthDate || null,
                    placeOfBirth: form.placeOfBirth.trim() || null,
                    phone: form.phone.trim() || null,
                    completeAddress: form.completeAddress.trim() || null,
                    pushNotificationsEnabled: form.pushNotificationsEnabled,
                    securityAlertsEmailEnabled: form.securityAlertsEmailEnabled,
                };
                if (form.password.trim()) {
                    updateData.password = form.password.trim();
                }
                const updated = await updateUser(slideUser.id, updateData as any);
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            } else {
                if (!form.email.trim()) {
                    setSaveError('Email is required.');
                    setIsSaving(false);
                    return;
                }
                if (!form.password.trim()) {
                    setSaveError('Password is required for new users.');
                    setIsSaving(false);
                    return;
                }
                const created = await createUser({
                    email: form.email.trim(),
                    password: form.password.trim(),
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    middleName: form.middleName.trim() || undefined,
                    nameExtension: form.nameExtension.trim() || undefined,
                    username: form.username.trim() || undefined,
                    role: form.role as any,
                    isActive: form.isActive,
                    gender: form.gender || undefined,
                    civilStatus: form.civilStatus || undefined,
                    nationality: form.nationality.trim() || undefined,
                    birthDate: form.birthDate || undefined,
                    placeOfBirth: form.placeOfBirth.trim() || undefined,
                    phone: form.phone.trim() || undefined,
                    completeAddress: form.completeAddress.trim() || undefined,
                    pushNotificationsEnabled: form.pushNotificationsEnabled,
                    securityAlertsEmailEnabled: form.securityAlertsEmailEnabled,
                });
                setUsers(prev => [created, ...prev]);
                setTotalDocs(prev => prev + 1);
            }

            closeSlide();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteUser(deleteTarget.id);
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    const getAvatarLetters = (u: UserDoc) => {
        return (u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '').toUpperCase();
    };

    const metricCards = [
        { label: 'Total Users', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50', icon: Shield },
        { label: 'Active', value: users.filter(u => u.isActive).length, color: 'text-green-600', bg: 'bg-green-50', icon: UserCheck },
        { label: 'Inactive', value: users.filter(u => !u.isActive).length, color: 'text-red-600', bg: 'bg-red-50', icon: EyeOff },
        { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600', bg: 'bg-purple-50', icon: Shield },
    ];

    return (
        <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system users, roles, and permissions</p>
                </div>
                <button onClick={openCreateSlide}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add User
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
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[{ value: 'all', label: 'All Roles' }, ...ROLE_OPTIONS].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setRoleFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                roleFilter === opt.value
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
                    <button onClick={loadUsers} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                        Retry
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800" /><div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-1" /><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-48" /></div></div></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No users found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || roleFilter !== 'all'
                            ? 'No users match your search criteria. Try adjusting the filters.'
                            : 'Get started by adding the first user.'}
                    </p>
                    {!debouncedSearch && roleFilter === 'all' && (
                        <button onClick={openCreateSlide}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add User
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                                                    {getAvatarLetters(user)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getRoleBadge(user.role)}>
                                                {user.role === 'admin' && <Shield className="h-3 w-3" />}
                                                {user.role === 'instructor' && <UserCheck className="h-3 w-3" />}
                                                {user.role === 'trainee' && <UserCheck className="h-3 w-3" />}
                                                {user.role === 'service' && <Mail className="h-3 w-3" />}
                                                {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
                                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(user.lastLogin)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setDetailUser(user)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="View User"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => openEditSlide(user)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(user)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete User"
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

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm px-4 py-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) { pageNum = i + 1; }
                                    else if (currentPage <= 3) { pageNum = i + 1; }
                                    else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                                    else { pageNum = currentPage - 2 + i; }
                                    return (
                                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

            {detailUser && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailUser(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Details</h2>
                            <button onClick={() => setDetailUser(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shrink-0">
                                    {(detailUser.firstName?.charAt(0) || '') + (detailUser.lastName?.charAt(0) || '').toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{detailUser.firstName} {detailUser.lastName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{detailUser.email}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={getRoleBadge(detailUser.role)}>
                                            {detailUser.role === 'admin' && <Shield className="h-3 w-3" />}
                                            {ROLE_OPTIONS.find(r => r.value === detailUser.role)?.label || detailUser.role}
                                        </span>
                                        {detailUser.isActive ? (
                                            <span className="inline-flex items-center text-xs text-green-600"><span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" /> Active</span>
                                        ) : (
                                            <span className="inline-flex items-center text-xs text-red-600"><span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" /> Inactive</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Username</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.username || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Last Login</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailUser.lastLogin)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Created</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailUser.createdAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Updated</span><p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailUser.updatedAt)}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Gender</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.gender ? GENDER_OPTIONS.find(g => g.value === detailUser.gender)?.label || detailUser.gender : '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Civil Status</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.civilStatus ? CIVIL_STATUS_OPTIONS.find(c => c.value === detailUser.civilStatus)?.label || detailUser.civilStatus : '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Nationality</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.nationality || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Birth Date</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.birthDate ? formatDate(detailUser.birthDate) : '\u2014'}</p></div>
                                <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Place of Birth</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.placeOfBirth || '\u2014'}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contact</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Phone</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.phone || '\u2014'}</p></div>
                                <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Address</span><p className="font-medium text-gray-900 dark:text-gray-100">{detailUser.completeAddress || '\u2014'}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                                    <span className="text-gray-700 dark:text-gray-300">Security Email Alerts</span>
                                    <span className={`text-sm font-medium ${detailUser.securityAlertsEmailEnabled ? 'text-green-600' : 'text-gray-400'}`}>{detailUser.securityAlertsEmailEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                                    <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                                    <span className={`text-sm font-medium ${detailUser.pushNotificationsEnabled ? 'text-green-600' : 'text-gray-400'}`}>{detailUser.pushNotificationsEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => { const u = detailUser; setDetailUser(null); openEditSlide(u); }}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Edit User
                                </button>
                                <button onClick={() => setDetailUser(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium bg-white dark:bg-[var(--card-background)]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete User</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.firstName} {deleteTarget.lastName}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
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
                                {slideUser ? 'Edit User' : 'Add User'}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                                    <input type="text" value={form.firstName} onChange={e => updateField('firstName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                                    <input type="text" value={form.lastName} onChange={e => updateField('lastName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                                    <input type="text" value={form.middleName} onChange={e => updateField('middleName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name Extension</label>
                                    <input type="text" value={form.nameExtension} onChange={e => updateField('nameExtension', e.target.value)} placeholder="Jr., Sr., III"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={slideUser ? 'col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email {!slideUser ? '*' : ''}
                                    </label>
                                    <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                                        disabled={!!slideUser}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 ${slideUser ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <input type="text" value={form.username} onChange={e => updateField('username', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password {!slideUser ? '*' : '(leave blank to keep current)'}
                                    </label>
                                    <input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} autoComplete="new-password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <select value={form.role} onChange={e => updateField('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >
                                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                    <select value={form.gender} onChange={e => updateField('gender', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select...</option>
                                        {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Civil Status</label>
                                    <select value={form.civilStatus} onChange={e => updateField('civilStatus', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select...</option>
                                        {CIVIL_STATUS_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationality</label>
                                    <input type="text" value={form.nationality} onChange={e => updateField('nationality', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birth Date</label>
                                    <input type="date" value={form.birthDate} onChange={e => updateField('birthDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place of Birth</label>
                                    <input type="text" value={form.placeOfBirth} onChange={e => updateField('placeOfBirth', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contact</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input type="text" value={form.phone} onChange={e => updateField('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complete Address</label>
                                    <textarea value={form.completeAddress} onChange={e => updateField('completeAddress', e.target.value)} rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer">
                                    <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active</p><p className="text-xs text-gray-500">Inactive users cannot log in</p></div>
                                    <input type="checkbox" checked={form.isActive} onChange={e => updateField('isActive', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer">
                                    <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Security Email Alerts</p><p className="text-xs text-gray-500">Receive alerts for password changes and failed logins</p></div>
                                    <input type="checkbox" checked={form.securityAlertsEmailEnabled} onChange={e => updateField('securityAlertsEmailEnabled', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg cursor-pointer">
                                    <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Push Notifications</p><p className="text-xs text-gray-500">Receive browser push notifications</p></div>
                                    <input type="checkbox" checked={form.pushNotificationsEnabled} onChange={e => updateField('pushNotificationsEnabled', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[var(--card-background)] border-t border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-end gap-3">
                            <button onClick={closeSlide} disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSaving ? 'Saving...' : slideUser ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
