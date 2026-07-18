'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Plus, Search, BookOpen, Users, Clock, Edit, Trash2, Eye,
    DollarSign, Loader2, X
} from '@/components/ui/IconWrapper';
import { getCourses, deleteCourse, updateCourse, createCourse, getCategories, searchInstructors, type CourseDoc, type CategoryOption, type InstructorRef } from './actions';

const ITEMS_PER_PAGE = 12;

const DIFFICULTY_COLORS: Record<string, string> = {
    standard: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-red-100 text-red-700',
};

const DIFFICULTY_LABELS: Record<string, string> = {
    standard: 'Standard',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
];

const DURATION_LABELS: Record<string, string> = {
    minutes: 'min',
    hours: 'hrs',
    days: 'days',
    weeks: 'wks',
};

export default function CoursesPage() {
    const [courses, setCourses] = useState<CourseDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    // Create modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', courseCode: '', instructor: '', instructorSearch: '', category: [] as string[], status: 'draft' as string, price: 0, excerpt: '' });
    const [instructorOptions, setInstructorOptions] = useState<InstructorRef[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<CourseDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Detail slide-over
    const [detailCourse, setDetailCourse] = useState<CourseDoc | null>(null);

    const loadCourses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCourses({
                search: debouncedSearch || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setCourses(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter, currentPage]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    useEffect(() => {
        if (isCreateOpen) {
            getCategories().then(setCategoryOptions).catch(() => {});
        }
    }, [isCreateOpen]);

    useEffect(() => {
        if (createForm.instructorSearch.length < 1) {
            setInstructorOptions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const results = await searchInstructors(createForm.instructorSearch);
                setInstructorOptions(results);
            } catch { setInstructorOptions([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [createForm.instructorSearch]);

    const handleStatusChange = async (course: CourseDoc, newStatus: string) => {
        try {
            await updateCourse(course.id, { status: newStatus as any });
            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus as any } : c));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteCourse(deleteTarget.id);
            setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
            setTotalDocs(prev => prev - 1);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreate = async () => {
        if (!createForm.title.trim() || !createForm.courseCode.trim() || !createForm.instructor) return;
        try {
            setIsSaving(true);
            const created = await createCourse({
                title: createForm.title,
                courseCode: createForm.courseCode,
                instructor: createForm.instructor,
                category: createForm.category.length > 0 ? createForm.category : undefined,
                status: createForm.status,
                price: createForm.price,
                excerpt: createForm.excerpt || undefined,
            });
            setCourses(prev => [created, ...prev]);
            setTotalDocs(prev => prev + 1);
            setIsCreateOpen(false);
            setCreateForm({ title: '', courseCode: '', instructor: '', instructorSearch: '', category: [], status: 'draft', price: 0, excerpt: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const getImageUrl = (course: CourseDoc): string | null => {
        const t = course.thumbnail;
        if (!t) return null;
        if (typeof t === 'object') {
            // @ts-ignore
            return t.cloudinaryURL || t.url || null;
        }
        return null;
    };

    const getInstructorName = (course: CourseDoc): string => {
        const inst = course.instructor;
        if (!inst) return 'Unknown';
        if (typeof inst === 'object' && inst.user && typeof inst.user === 'object') {
            return `${inst.user.firstName} ${inst.user.lastName}`.trim() || 'Unknown';
        }
        return 'Unknown';
    };

    const getCategoryNames = (course: CourseDoc): string[] => {
        const cats = course.category;
        if (!cats || !Array.isArray(cats)) return [];
        return cats.map(c => {
            if (typeof c === 'object') return c.name || c.title || '';
            return '';
        }).filter(Boolean);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-yellow-100 text-yellow-700';
            case 'archived': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Published';
            case 'draft': return 'Draft';
            case 'archived': return 'Archived';
            default: return status;
        }
    };

    const metricCards = [
        { label: 'Total Courses', value: totalDocs, color: 'text-blue-600', bg: 'bg-blue-50', icon: BookOpen },
        { label: 'Published', value: courses.filter(c => c.status === 'published').length, color: 'text-green-600', bg: 'bg-green-50', icon: Eye },
        { label: 'Draft', value: courses.filter(c => c.status === 'draft').length, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
        { label: 'Archived', value: courses.filter(c => c.status === 'archived').length, color: 'text-gray-600', bg: 'bg-gray-50', icon: ArchiveIcon },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <BookOpen className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">Failed to load courses</p>
                    <p className="text-gray-500 text-sm mb-4">{error}</p>
                    <button onClick={loadCourses} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
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
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="text-gray-500 mt-1">Manage all courses across the platform</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metricCards.map((card) => (
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
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or course code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === opt.value
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
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : courses.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {debouncedSearch || statusFilter !== 'all'
                            ? 'No courses match your search criteria. Try adjusting the filters.'
                            : 'Get started by creating your first course.'}
                    </p>
                    {!debouncedSearch && statusFilter === 'all' && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Course Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.map((course) => {
                                    const imageUrl = getImageUrl(course);
                                    const instructorName = getInstructorName(course);
                                    const categoryNames = getCategoryNames(course);
                                    return (
                                        <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-14 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <BookOpen className="h-5 w-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/courses/${course.id}/edit`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block">
                                                            {course.title}
                                                        </Link>
                                                        <p className="text-xs text-gray-400 font-mono">{course.courseCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{instructorName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {categoryNames.slice(0, 2).map((name, i) => (
                                                        <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                            {name}
                                                        </span>
                                                    ))}
                                                    {course.difficultyLevel && (
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${DIFFICULTY_COLORS[course.difficultyLevel] || 'bg-gray-100 text-gray-600'}`}>
                                                            {DIFFICULTY_LABELS[course.difficultyLevel] || course.difficultyLevel}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                                                    </span>
                                                    {course.discountedPrice && course.discountedPrice < course.price && (
                                                        <span className="text-xs text-gray-400 line-through ml-1">${course.discountedPrice.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                                                        {getStatusLabel(course.status)}
                                                    </span>
                                                    {course.isFeatured && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setDetailCourse(course)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <Link
                                                        href={`/courses/${course.id}/edit`}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="Edit Course"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteTarget(course)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
                            <p className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}
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
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Course Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isSaving && setIsCreateOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Create New Course</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={createForm.title}
                                    onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="e.g. React Fundamentals"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                                <input
                                    type="text"
                                    value={createForm.courseCode}
                                    onChange={e => setCreateForm(f => ({ ...f, courseCode: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="e.g. CS101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor *</label>
                                <input
                                    type="text"
                                    value={createForm.instructorSearch}
                                    onChange={e => setCreateForm(f => ({ ...f, instructorSearch: e.target.value, instructor: '' }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="Search instructors..."
                                />
                                {instructorOptions.length > 0 && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                                        {instructorOptions.map(inst => (
                                            <button
                                                key={inst.id}
                                                onClick={() => {
                                                    setCreateForm(f => ({
                                                        ...f,
                                                        instructor: inst.id,
                                                        instructorSearch: inst.user ? `${inst.user.firstName} ${inst.user.lastName}`.trim() || inst.id : inst.id,
                                                    }));
                                                    setInstructorOptions([]);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50"
                                            >
                                                {inst.user ? `${inst.user.firstName} ${inst.user.lastName}`.trim() || `Instructor #${inst.id}` : `Instructor #${inst.id}`}
                                                {inst.user?.email && <span className="text-gray-400 ml-1">({inst.user.email})</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categoryOptions.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCreateForm(f => ({
                                                ...f,
                                                category: f.category.includes(cat.id)
                                                    ? f.category.filter(id => id !== cat.id)
                                                    : [...f.category, cat.id],
                                            }))}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                                createForm.category.includes(cat.id)
                                                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.price}
                                        onChange={e => setCreateForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={createForm.status}
                                        onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                                <textarea
                                    value={createForm.excerpt}
                                    onChange={e => setCreateForm(f => ({ ...f, excerpt: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="Brief description of the course..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isSaving || !createForm.title.trim() || !createForm.courseCode.trim() || !createForm.instructor}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSaving ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteTarget.title}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-Over */}
            {detailCourse && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailCourse(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{detailCourse.title}</h2>
                            <button onClick={() => setDetailCourse(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Thumbnail */}
                            {getImageUrl(detailCourse) && (
                                <img src={getImageUrl(detailCourse)!} alt={detailCourse.title} className="w-full rounded-xl border border-gray-200" />
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Course Code</span>
                                    <p className="font-medium text-gray-900 font-mono">{detailCourse.courseCode}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Status</span>
                                    <p className={`font-medium ${getStatusColor(detailCourse.status)} inline-block px-2 py-0.5 rounded text-xs mt-1`}>
                                        {getStatusLabel(detailCourse.status)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Instructor</span>
                                    <p className="font-medium text-gray-900">{getInstructorName(detailCourse)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Difficulty</span>
                                    <p className="font-medium text-gray-900">{DIFFICULTY_LABELS[detailCourse.difficultyLevel] || detailCourse.difficultyLevel}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Price</span>
                                    <p className="font-medium text-gray-900">{detailCourse.price === 0 ? 'Free' : `$${detailCourse.price.toFixed(2)}`}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Language</span>
                                    <p className="font-medium text-gray-900">{detailCourse.language?.toUpperCase() || 'EN'}</p>
                                </div>
                                {detailCourse.estimatedDuration && (
                                    <div>
                                        <span className="text-gray-500">Duration</span>
                                        <p className="font-medium text-gray-900">
                                            {detailCourse.estimatedDuration} {DURATION_LABELS[detailCourse.estimatedDurationUnit || 'hours'] || 'hrs'}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">Passing Grade</span>
                                    <p className="font-medium text-gray-900">{detailCourse.passingGrade}%</p>
                                </div>
                            </div>

                            {/* Categories */}
                            {getCategoryNames(detailCourse).length > 0 && (
                                <div>
                                    <span className="text-sm text-gray-500">Categories</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {getCategoryNames(detailCourse).map((name, i) => (
                                            <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Excerpt */}
                            {detailCourse.excerpt && (
                                <div>
                                    <span className="text-sm text-gray-500">Description</span>
                                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{detailCourse.excerpt}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                                <Link
                                                    href={`/courses/${detailCourse.id}/edit`}
                                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Course
                                                </Link>
                                {detailCourse.status !== 'archived' && (
                                    <button
                                        onClick={() => {
                                            const newStatus = detailCourse.status === 'published' ? 'draft' : 'published';
                                            handleStatusChange(detailCourse, newStatus);
                                            setDetailCourse(prev => prev ? { ...prev, status: newStatus as any } : null);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                    >
                                        {detailCourse.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="5" rx="1" />
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
        </svg>
    );
}
