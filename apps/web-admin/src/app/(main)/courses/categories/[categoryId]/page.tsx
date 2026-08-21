'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search, Edit, BookOpen, Users, AlertTriangle, Folder,
} from '@/components/ui/IconWrapper';
import { getCategoryById } from '../actions';
import { getCourses } from '../../actions';
import type { CategoryDoc, Course } from '@encreasl/cms-types';

const ITEMS_PER_PAGE = 12;

const TYPE_LABELS: Record<string, string> = {
    course: 'Course',
    skill: 'Skill',
    topic: 'Topic',
    industry: 'Industry',
};

const TYPE_COLORS: Record<string, string> = {
    course: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    skill: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    topic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    industry: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
];

export default function CategoryViewPage() {
    const params = useParams();
    const categoryId = params.categoryId as string;

    const [category, setCategory] = useState<CategoryDoc | null>(null);
    const [isCategoryLoading, setIsCategoryLoading] = useState(true);
    const [categoryError, setCategoryError] = useState<string | null>(null);
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

    const loadCategory = useCallback(async () => {
        try {
            setIsCategoryLoading(true);
            setCategoryError(null);
            setCategory(await getCategoryById(categoryId));
        } catch (err: any) {
            console.error(err);
            setCategoryError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load category'));
        } finally {
            setIsCategoryLoading(false);
        }
    }, [categoryId]);

    const loadCourses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCourses({
                category: categoryId,
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
    }, [categoryId, debouncedSearch, statusFilter, currentPage]);

    useEffect(() => { loadCategory(); }, [loadCategory]);
    useEffect(() => { loadCourses(); }, [loadCourses]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const getParentName = (value: CategoryDoc): string => {
        if (!value.parent) return '';
        return typeof value.parent === 'object' ? value.parent.name || `#${value.parent.id}` : '';
    };

    const getImageUrl = (course: Course): string | null => {
        if (!course.thumbnail || typeof course.thumbnail !== 'object') return null;
        return course.thumbnail.cloudinaryURL || course.thumbnail.url || null;
    };

    const getInstructorName = (course: Course): string => {
        const instructor = course.instructor;
        if (typeof instructor !== 'object' || !instructor?.user || typeof instructor.user !== 'object') return 'Unknown';
        return `${instructor.user.firstName} ${instructor.user.lastName}`.trim() || 'Unknown';
    };

    const statusClass = (status: string) => {
        if (status === 'published') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        if (status === 'draft') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    };

    if (isCategoryLoading) {
        return <div className="p-6 space-y-6 animate-pulse"><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-64" /><div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl" /><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" /></div>;
    }

    if (categoryError === 'not-found') {
        return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Category Not Found</h2><p className="text-gray-500 dark:text-gray-400 mb-6">This category does not exist or has been removed.</p><Link href="/courses/categories" className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Back to Categories</Link></div></div>;
    }

    if (categoryError) {
        return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Failed to load category</h2><p className="text-gray-500 dark:text-gray-400 mb-6">{categoryError}</p><button onClick={loadCategory} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Retry</button></div></div>;
    }

    return (
        <div className="py-6 w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/courses/categories" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center shrink-0"><Folder className="h-5 w-5 text-blue-500 dark:text-blue-400" /></div>
                        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{category?.name}</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{category?.slug}</p></div>
                    </div>
                </div>
                <Link href={`/courses/categories/${categoryId}/edit`} className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium"><Edit className="h-4 w-4 mr-2" />Edit Category</Link>
            </div>

            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${category ? TYPE_COLORS[category.categoryType] || 'bg-gray-100 text-gray-600' : ''}`}>{category ? TYPE_LABELS[category.categoryType] || category.categoryType : ''}</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${category?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{category?.isActive ? 'Active' : 'Inactive'}</span></div>
                    <span className="text-xs text-gray-400 font-mono">#{categoryId}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Parent</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{category ? getParentName(category) || 'None (top-level)' : '-'}</p></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Display Order</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{category?.displayOrder ?? 0}</p></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Color</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">{category?.colorCode ? <><span className="h-4 w-4 rounded border border-gray-200 inline-block" style={{ backgroundColor: category.colorCode }} />{category.colorCode}</> : '-'}</p></div>
                </div>
                {category?.description && <div><span className="text-sm text-gray-500 dark:text-gray-400">Description</span><p className="text-sm text-gray-900 dark:text-gray-100 mt-1 leading-relaxed">{category.description}</p></div>}
            </div>

            <div><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Courses</h2><p className="text-gray-500 dark:text-gray-400 mt-1">{totalDocs} course{totalDocs === 1 ? '' : 's'} assigned to this category</p></div>

            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search assigned courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" /></div>
                <div className="flex gap-2">{STATUS_OPTIONS.map(option => <button key={option.value} onClick={() => { setStatusFilter(option.value); setCurrentPage(1); }} className={`px-3 py-2 rounded-lg text-sm font-medium ${statusFilter === option.value ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{option.label}</button>)}</div>
            </div>

            {error ? <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 p-12 text-center"><AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" /><p className="text-gray-900 dark:text-gray-100 font-medium mb-4">{error}</p><button onClick={loadCourses} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Retry</button></div> : isLoading ? <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /> : courses.length === 0 ? <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 p-12 text-center"><Folder className="h-10 w-10 text-gray-400 mx-auto mb-3" /><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No courses found</h3><p className="text-gray-500 dark:text-gray-400 mt-1">No courses are currently assigned to this category.</p></div> : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Instructor</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{courses.map(course => { const imageUrl = getImageUrl(course); return <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-10 w-14 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">{imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-5 w-5 text-gray-300" />}</div><div className="min-w-0"><Link href={`/courses/${course.id}/edit`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 truncate block">{course.title}</Link><p className="text-xs text-gray-400 font-mono">{course.courseCode}</p></div></div></td><td className="px-4 py-3"><div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400"><Users className="h-3.5 w-3.5 text-gray-400" /><span className="truncate">{getInstructorName(course)}</span></div></td><td className="px-4 py-3"><span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{category?.name || '-'}</span></td><td className="px-4 py-3"><div className="flex items-center gap-1"><span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{course.price === 0 ? 'Free' : `₱${course.price.toFixed(2)}`}</span></div></td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(course.status)}`}>{course.status}</span></td></tr>; })}</tbody></table></div>
                    {totalPages > 1 && <div className="flex items-center justify-between bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm px-4 py-3"><p className="text-sm text-gray-500">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}</p><div className="flex items-center gap-2"><button onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Previous</button><span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Next</button></div></div>}
                </>
            )}
        </div>
    );
}
