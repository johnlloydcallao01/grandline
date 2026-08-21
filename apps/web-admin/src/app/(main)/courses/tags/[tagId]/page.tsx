'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search, Edit, BookOpen, Users, AlertTriangle,
} from '@/components/ui/IconWrapper';
import { getTagById } from '../actions';
import { getCourses } from '../../actions';
import type { TagDoc, Course } from '@encreasl/cms-types';

const ITEMS_PER_PAGE = 12;

const DIFFICULTY_COLORS: Record<string, string> = {
    standard: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    intermediate: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
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

const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

export default function TagViewPage() {
    const params = useParams();
    const tagId = params.tagId as string;

    const [tag, setTag] = useState<TagDoc | null>(null);
    const [isTagLoading, setIsTagLoading] = useState(true);
    const [tagError, setTagError] = useState<string | null>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const loadTag = useCallback(async () => {
        try {
            setIsTagLoading(true);
            setTagError(null);
            const data = await getTagById(tagId);
            setTag(data);
        } catch (err: any) {
            console.error(err);
            setTagError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load tag'));
        } finally {
            setIsTagLoading(false);
        }
    }, [tagId]);

    useEffect(() => { loadTag(); }, [loadTag]);

    const loadCourses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCourses({
                tag: tagId,
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
    }, [tagId, debouncedSearch, statusFilter, currentPage]);

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

    const getImageUrl = (course: Course): string | null => {
        const t = course.thumbnail;
        if (!t) return null;
        if (typeof t === 'object') {
            // @ts-ignore
            return t.cloudinaryURL || t.url || null;
        }
        return null;
    };

    const getInstructorName = (course: Course): string => {
        const inst = course.instructor;
        if (!inst) return 'Unknown';
        if (typeof inst === 'object' && inst.user && typeof inst.user === 'object') {
            return `${inst.user.firstName} ${inst.user.lastName}`.trim() || 'Unknown';
        }
        return 'Unknown';
    };

    const getCategoryNames = (course: Course): string[] => {
        const cats = course.category;
        if (!cats || !Array.isArray(cats)) return [];
        return cats.map(c => {
            if (typeof c === 'object') return c.name || c.title || '';
            return '';
        }).filter(Boolean);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'draft': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
            case 'archived': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
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

    if (isTagLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-48" /><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mt-1.5" /></div>
                    </div>
                    <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                    <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                </div>
            </div>
        );
    }

    if (tagError === 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tag Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">This tag does not exist or has been removed.</p>
                    <Link href="/courses/tags" className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Tags
                    </Link>
                </div>
            </div>
        );
    }

    if (tagError && tagError !== 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{tagError}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={loadTag} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                        <Link href="/courses/tags" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/courses/tags" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div className="flex items-center gap-3">
                        {tag?.colorCode && (
                            <div className="h-10 w-10 rounded-lg shrink-0 border border-gray-200 dark:border-gray-600" style={{ backgroundColor: tag.colorCode }} />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tag?.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{tag?.slug}</p>
                        </div>
                    </div>
                </div>
                <Link href={`/courses/tags/${tagId}/edit`}
                    className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tag
                </Link>
            </div>

            {/* Tag Details */}
            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tag?.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                        {tag?.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{tagId}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Display Order</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{tag?.displayOrder ?? 0}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Color</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
                            {tag?.colorCode ? (
                                <><span className="h-4 w-4 rounded border border-gray-200 dark:border-gray-600 inline-block" style={{ backgroundColor: tag.colorCode }} />{tag.colorCode}</>
                            ) : '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{tag?.updatedAt ? new Date(tag.updatedAt).toLocaleDateString() : '-'}</p>
                    </div>
                </div>
                {tag?.description && (
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 leading-relaxed">{tag.description}</p>
                    </div>
                )}
            </div>

            {/* Assigned Courses */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Courses</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{totalDocs} course{totalDocs === 1 ? '' : 's'} assigned to this tag</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search assigned courses..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]" />
                </div>
                <div className="flex gap-2">
                    {STATUS_OPTIONS.map(opt => (
                        <button key={opt.value}
                            onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === opt.value ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {error ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-4" />
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load courses</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
                    <button onClick={loadCourses} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            ) : isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No courses found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch || statusFilter !== 'all'
                            ? 'No courses match your search criteria. Try adjusting the filters.'
                            : 'No courses are currently assigned to this tag.'}
                    </p>
                    {!debouncedSearch && statusFilter === 'all' && (
                        <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                            Browse All Courses
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {courses.map(course => {
                                    const imageUrl = getImageUrl(course);
                                    const instructorName = getInstructorName(course);
                                    const categoryNames = getCategoryNames(course);
                                    return (
                                        <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-14 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <BookOpen className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/courses/${course.id}/edit`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block">
                                                            {course.title}
                                                        </Link>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{course.courseCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                    <Users className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                                    <span className="truncate">{instructorName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {categoryNames.slice(0, 2).map((name, i) => (
                                                        <span key={i} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{name}</span>
                                                    ))}
                                                    {course.difficultyLevel && (
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${DIFFICULTY_COLORS[course.difficultyLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                                            {DIFFICULTY_LABELS[course.difficultyLevel] || course.difficultyLevel}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {course.price === 0 ? 'Free' : formatPrice(course.price)}
                                                    </span>
                                                    {course.discountedPrice && course.discountedPrice < course.price && (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 line-through ml-1">{formatPrice(course.discountedPrice)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                                                    {getStatusLabel(course.status)}
                                                </span>
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
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
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
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
