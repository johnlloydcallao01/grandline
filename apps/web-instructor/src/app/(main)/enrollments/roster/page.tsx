'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    getRoster,
    searchCourses,
    type RosterDoc,
    type RosterCourseOption,
} from './actions';

const ITEMS_PER_PAGE = 10;

// Inline SVG icon components (matching web-instructor pattern)
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

function getStatusBadge(status: string) {
    const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium';
    switch (status) {
        case 'active':
            return <span className={`${base} bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-200 dark:ring-green-700/50`}><CheckCircleIcon className="h-3 w-3" />Active</span>;
        case 'completed':
            return <span className={`${base} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-700/50`}><CheckCircleIcon className="h-3 w-3" />Completed</span>;
        case 'pending':
            return <span className={`${base} bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-700/50`}><ClockIcon className="h-3 w-3" />Pending</span>;
        case 'suspended':
            return <span className={`${base} bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-200 dark:ring-orange-700/50`}><ClockIcon className="h-3 w-3" />Suspended</span>;
        case 'dropped':
            return <span className={`${base} bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-200 dark:ring-red-700/50`}><XIcon className="h-3 w-3" />Dropped</span>;
        case 'expired':
            return <span className={`${base} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700`}><ClockIcon className="h-3 w-3" />Expired</span>;
        default:
            return <span className={`${base} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700`}>{status}</span>;
    }
}

function getStatusRowAccent(status: string): string {
    switch (status) {
        case 'active': return 'border-l-green-500';
        case 'completed': return 'border-l-blue-500';
        case 'pending': return 'border-l-amber-500';
        case 'suspended': return 'border-l-orange-500';
        case 'dropped': return 'border-l-red-500';
        case 'expired': return 'border-l-gray-400';
        default: return 'border-l-transparent';
    }
}

function getProgressBarColor(pct: number): string {
    if (pct >= 100) return 'bg-green-500';
    if (pct > 0) return 'bg-blue-500 dark:bg-blue-400';
    return 'bg-gray-200 dark:bg-gray-700';
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function InstructorRosterPage() {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedCourseLabel, setSelectedCourseLabel] = useState('');
    const [courseOptions, setCourseOptions] = useState<RosterCourseOption[]>([]);
    const [courseQuery, setCourseQuery] = useState('');
    const [debouncedCourseQuery, setDebouncedCourseQuery] = useState('');
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
    const [isSearchingCourses, setIsSearchingCourses] = useState(false);
    const courseSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const courseDropdownRef = useRef<HTMLDivElement | null>(null);
    const [roster, setRoster] = useState<RosterDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [detailTarget, setDetailTarget] = useState<RosterDoc | null>(null);

    const loadCourseOptions = useCallback(async (query: string) => {
        try {
            setIsSearchingCourses(true);
            const options = await searchCourses(query, 10);
            setCourseOptions(options);
        } catch {
            setCourseOptions([]);
        } finally {
            setIsSearchingCourses(false);
        }
    }, []);

    const loadRoster = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getRoster({
                courseId: selectedCourseId || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setRoster(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err: any) {
            setError(err.message || 'Failed to load roster');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCourseId, statusFilter, debouncedSearch, currentPage]);

    useEffect(() => {
        loadRoster();
    }, [loadRoster]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    // Load the first 10 courses on mount and whenever the dropdown search query changes.
    useEffect(() => {
        loadCourseOptions(debouncedCourseQuery);
    }, [debouncedCourseQuery, loadCourseOptions]);

    useEffect(() => {
        if (courseSearchTimer.current) clearTimeout(courseSearchTimer.current);
        courseSearchTimer.current = setTimeout(() => {
            setDebouncedCourseQuery(courseQuery);
        }, 300);
        return () => { if (courseSearchTimer.current) clearTimeout(courseSearchTimer.current); };
    }, [courseQuery]);

    // Close the dropdown when clicking outside.
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
                setIsCourseDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleCourseSelect = (course: RosterCourseOption | null) => {
        if (course) {
            setSelectedCourseId(course.id);
            setSelectedCourseLabel(course.courseCode ? `${course.title} (${course.courseCode})` : course.title);
        } else {
            setSelectedCourseId('');
            setSelectedCourseLabel('');
        }
        setIsCourseDropdownOpen(false);
        setCurrentPage(1);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const getStudentName = (doc: RosterDoc): string => {
        if (!doc.student || typeof doc.student === 'string') return '\u2014';
        const u = doc.student.user;
        if (!u) return '\u2014';
        return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '\u2014';
    };

    const getStudentEmail = (doc: RosterDoc): string => {
        if (!doc.student || typeof doc.student === 'string') return '\u2014';
        return doc.student.user?.email || '\u2014';
    };

    const getStudentSrn = (doc: RosterDoc): string => {
        if (!doc.student || typeof doc.student === 'string') return '';
        return doc.student.srn || '';
    };

    const getCourseTitle = (doc: RosterDoc): string => {
        if (!doc.course || typeof doc.course === 'string') return '\u2014';
        return doc.course.title || '\u2014';
    };

    const getCourseCode = (doc: RosterDoc): string => {
        if (!doc.course || typeof doc.course === 'string') return '';
        return doc.course.courseCode || '';
    };

    const metricCards = [
        { label: 'Total Students', value: totalDocs, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: UsersIcon },
        { label: 'Active', value: roster.filter((d) => d.status === 'active').length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: CheckCircleIcon },
        { label: 'Pending', value: roster.filter((d) => d.status === 'pending').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: ClockIcon },
        { label: 'Completed', value: roster.filter((d) => d.status === 'completed').length, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: BookOpenIcon },
    ];

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'expired', label: 'Expired' },
    ];

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <UsersIcon className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load roster</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={loadRoster}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Roster</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View the students enrolled in your courses</p>
                </div>
                <div className="w-full sm:w-80">
                    <div className="relative" ref={courseDropdownRef}>
                        <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <button
                            type="button"
                            onClick={() => setIsCourseDropdownOpen((open) => !open)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] outline-none text-left truncate"
                        >
                            {selectedCourseLabel || 'All My Courses'}
                        </button>
                        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        {isCourseDropdownOpen && (
                            <div className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--card-background)] shadow-lg overflow-hidden">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search courses..."
                                            autoFocus
                                            value={courseQuery}
                                            onChange={(e) => {
                                                setCourseQuery(e.target.value);
                                                setIsCourseDropdownOpen(true);
                                            }}
                                            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                                        />
                                    </div>
                                </div>
                                <ul className="max-h-60 overflow-y-auto py-1">
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => handleCourseSelect(null)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${!selectedCourseId ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                        >
                                            All My Courses
                                        </button>
                                    </li>
                                    {isSearchingCourses ? (
                                        <li className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">Searching...</li>
                                    ) : courseOptions.length === 0 ? (
                                        <li className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">No courses found</li>
                                    ) : (
                                        courseOptions.map((course) => (
                                            <li key={course.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCourseSelect(course)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedCourseId === course.id ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    {course.title}{course.courseCode ? ` (${course.courseCode})` : ''}
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {card.value}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {card.label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Status Filters */}
            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by student name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {statusOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleStatusFilter(opt.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === opt.value
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" /></td>
                                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : roster.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No students found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                        {debouncedSearch || statusFilter !== 'all' || selectedCourseId
                            ? 'No students match your current filters. Try adjusting the course, search, or status filter.'
                            : 'You do not have any enrolled students yet. Students appear here once they enroll in your courses.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Roster Table */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {roster.map((doc) => {
                                    const pct = doc.progressPercentage || 0;
                                    return (
                                        <tr
                                            key={doc.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-l-[3px] ${getStatusRowAccent(doc.status)}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                                        <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                                                            {getStudentName(doc)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 block truncate">
                                                            {getStudentEmail(doc)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900 dark:text-gray-100 font-medium truncate">{getCourseTitle(doc)}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{getCourseCode(doc) || '\u00A0'}</div>
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(doc.enrolledAt)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${getProgressBarColor(pct)}`}
                                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setDetailTarget(doc)}
                                                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="View Student"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {/* Detail Slide-Over */}
            {detailTarget && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailTarget(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">Student Details</h2>
                            <button onClick={() => setDetailTarget(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                    <UserIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{getStudentName(detailTarget)}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{getStudentEmail(detailTarget)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Enrollment ID</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">#{detailTarget.id}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">SRN</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{getStudentSrn(detailTarget) || '\u2014'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Course</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{getCourseTitle(detailTarget)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Course Code</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{getCourseCode(detailTarget) || '\u2014'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                                    <p className="mt-1">{getStatusBadge(detailTarget.status)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Enrolled</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(detailTarget.enrolledAt)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{detailTarget.progressPercentage || 0}%</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Current Grade</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {detailTarget.currentGrade != null ? `${detailTarget.currentGrade}%` : '\u2014'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Final Grade</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {detailTarget.finalGrade != null ? `${detailTarget.finalGrade}%` : '\u2014'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Certificate</span>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                        {detailTarget.certificateIssued ? 'Issued' : 'Not issued'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button
                                    onClick={() => setDetailTarget(null)}
                                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                                >
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
