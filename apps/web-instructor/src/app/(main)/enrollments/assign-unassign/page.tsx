'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    getEnrollments,
    searchCourses,
    searchTrainees,
    createEnrollment,
    updateEnrollmentStatus,
    unassignEnrollment,
    type EnrollmentDoc,
    type CourseOption,
    type TraineeOption,
} from './actions';

const ITEMS_PER_PAGE = 10;

// Inline SVG icon components (matching web-instructor pattern)
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
const Loader2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);
const Trash2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
);
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

type SortKey = 'student' | 'course' | 'status' | 'enrolledAt' | 'progressPercentage';

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
            return <span className={`${base} bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-200 dark:ring-orange-700/50`}><AlertTriangleIcon className="h-3 w-3" />Suspended</span>;
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

function getEnrollmentTypeTag(type: string): string | null {
    if (!type || type === 'free') return null;
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function downloadCSV(docs: EnrollmentDoc[]) {
    const header = ['Student Name', 'Email', 'Course', 'Type', 'Status', 'Enrolled', 'Progress'];
    const rows = docs.map((d) => {
        const name = d.student && typeof d.student === 'object'
            ? [d.student.user?.firstName, d.student.user?.lastName].filter(Boolean).join(' ') || '\u2014'
            : '\u2014';
        const email = d.student && typeof d.student === 'object' ? d.student.user?.email || '' : '';
        const course = d.course && typeof d.course === 'object' ? d.course.title || '' : '';
        const type = d.enrollmentType || '';
        const status = d.status || '';
        const enrolled = d.enrolledAt ? formatDate(d.enrolledAt) : '';
        const progress = `${d.progressPercentage || 0}%`;
        return [name, email, course, type, status, enrolled, progress];
    });

    const csv = [header, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-course-enrollments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

const EDIT_STATUSES = ['active', 'pending', 'suspended', 'dropped'];

export default function AssignUnassignPage() {
    const [enrollments, setEnrollments] = useState<EnrollmentDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Assign slide-over state
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignMounted, setAssignMounted] = useState(false);
    const [animateAssign, setAnimateAssign] = useState(false);
    const [traineeSearch, setTraineeSearch] = useState('');
    const [traineeResults, setTraineeResults] = useState<TraineeOption[]>([]);
    const [isSearchingTrainees, setIsSearchingTrainees] = useState(false);
    const [selectedTrainee, setSelectedTrainee] = useState<TraineeOption | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
    const [courseSearch, setCourseSearch] = useState('');
    const [courseResults, setCourseResults] = useState<CourseOption[]>([]);
    const [isSearchingCourses, setIsSearchingCourses] = useState(false);
    const [assignNotes, setAssignNotes] = useState('');
    const [assignError, setAssignError] = useState<string | null>(null);
    const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);

    // Unassign (drop) confirmation state
    const [unassignTarget, setUnassignTarget] = useState<EnrollmentDoc | null>(null);
    const [isUnassignSubmitting, setIsUnassignSubmitting] = useState(false);
    const [unassignError, setUnassignError] = useState<string | null>(null);

    // Edit enrollment state
    const [editTarget, setEditTarget] = useState<EnrollmentDoc | null>(null);
    const [editStatus, setEditStatus] = useState('');
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const courseSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchEnrollments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getEnrollments({
                search: search || undefined,
                status: statusFilter || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setEnrollments(result.docs || []);
            setTotalDocs(result.totalDocs);
            setTotalPages(result.totalPages);
        } catch (e: any) {
            setError(e.message || 'Failed to load enrollments');
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, currentPage]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    useEffect(() => {
        if (isAssignOpen) {
            setAssignMounted(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setAnimateAssign(true)));
        } else {
            setAnimateAssign(false);
            const timer = setTimeout(() => setAssignMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isAssignOpen]);

    const handleTraineeSearch = useCallback((value: string) => {
        setTraineeSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (value.length < 1) {
            setTraineeResults([]);
            return;
        }
        searchTimer.current = setTimeout(async () => {
            setIsSearchingTrainees(true);
            try {
                const results = await searchTrainees(value);
                setTraineeResults(results);
            } catch {
                setTraineeResults([]);
            } finally {
                setIsSearchingTrainees(false);
            }
        }, 300);
    }, []);

    const handleCourseSearch = useCallback((value: string) => {
        setCourseSearch(value);
        if (courseSearchTimer.current) clearTimeout(courseSearchTimer.current);
        if (value.length < 1) {
            setCourseResults([]);
            return;
        }
        courseSearchTimer.current = setTimeout(async () => {
            setIsSearchingCourses(true);
            try {
                const results = await searchCourses(value, 20);
                setCourseResults(results);
            } catch {
                setCourseResults([]);
            } finally {
                setIsSearchingCourses(false);
            }
        }, 300);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(statusFilter === value ? '' : value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            if (sortDir === 'asc') {
                setSortDir('desc');
            } else {
                setSortKey(null);
                setSortDir('asc');
            }
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const openAssign = () => {
        setSelectedTrainee(null);
        setSelectedCourse(null);
        setCourseSearch('');
        setCourseResults([]);
        setAssignNotes('');
        setTraineeSearch('');
        setTraineeResults([]);
        setAssignError(null);
        setIsAssignOpen(true);
    };

    const closeAssign = () => {
        setIsAssignOpen(false);
        setSelectedTrainee(null);
        setSelectedCourse(null);
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssignError(null);

        if (!selectedTrainee) {
            setAssignError('Please select a trainee');
            return;
        }
        if (!selectedCourse) {
            setAssignError('Please select a course');
            return;
        }

        setIsAssignSubmitting(true);
        try {
            await createEnrollment({
                student: selectedTrainee.id,
                course: selectedCourse.id,
                notes: assignNotes || undefined,
            });
            closeAssign();
            fetchEnrollments();
        } catch (e: any) {
            setAssignError(e.message || 'Failed to create enrollment');
        } finally {
            setIsAssignSubmitting(false);
        }
    };

    const handleUnassign = async () => {
        if (!unassignTarget) return;
        setUnassignError(null);
        setIsUnassignSubmitting(true);
        try {
            await unassignEnrollment(unassignTarget.id);
            setEnrollments((prev) =>
                prev.map((e) => (e.id === unassignTarget.id ? { ...e, status: 'dropped' } : e))
            );
            setUnassignTarget(null);
        } catch (e: any) {
            setUnassignError(e.message || 'Failed to unassign enrollment');
        } finally {
            setIsUnassignSubmitting(false);
        }
    };

    const openEdit = (enrollment: EnrollmentDoc) => {
        setEditTarget(enrollment);
        setEditStatus(enrollment.status);
        setEditError(null);
    };

    const handleEditSave = async () => {
        if (!editTarget) return;
        setEditError(null);
        setIsEditSubmitting(true);
        try {
            await updateEnrollmentStatus(editTarget.id, editStatus);
            setEnrollments((prev) =>
                prev.map((e) => (e.id === editTarget.id ? { ...e, status: editStatus } : e))
            );
            setEditTarget(null);
        } catch (e: any) {
            setEditError(e.message || 'Failed to update enrollment');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const getStudentName = (doc: EnrollmentDoc): string => {
        if (!doc.student || typeof doc.student === 'string') return '\u2014';
        const u = doc.student.user;
        if (!u) return '\u2014';
        return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '\u2014';
    };

    const getStudentEmail = (doc: EnrollmentDoc): string => {
        if (!doc.student || typeof doc.student === 'string') return '\u2014';
        return doc.student.user?.email || '\u2014';
    };

    const getCourseTitle = (doc: EnrollmentDoc): string => {
        if (!doc.course || typeof doc.course === 'string') return '\u2014';
        return doc.course.title || '\u2014';
    };

    const metrics = useMemo(() => {
        return {
            total: totalDocs,
            active: enrollments.filter((d) => d.status === 'active').length,
            completed: enrollments.filter((d) => d.status === 'completed').length,
            pending: enrollments.filter((d) => d.status === 'pending').length,
        };
    }, [totalDocs, enrollments]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const d of enrollments) {
            counts[d.status] = (counts[d.status] || 0) + 1;
        }
        return counts;
    }, [enrollments]);

    const sortedEnrollments = useMemo(() => {
        if (!sortKey) return enrollments;
        const sorted = [...enrollments];
        sorted.sort((a, b) => {
            let va: any, vb: any;
            switch (sortKey) {
                case 'student':
                    va = getStudentName(a).toLowerCase();
                    vb = getStudentName(b).toLowerCase();
                    break;
                case 'course':
                    va = getCourseTitle(a).toLowerCase();
                    vb = getCourseTitle(b).toLowerCase();
                    break;
                case 'status':
                    va = a.status;
                    vb = b.status;
                    break;
                case 'enrolledAt':
                    va = a.enrolledAt || '';
                    vb = b.enrolledAt || '';
                    break;
                case 'progressPercentage':
                    va = a.progressPercentage || 0;
                    vb = b.progressPercentage || 0;
                    break;
                default:
                    return 0;
            }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [enrollments, sortKey, sortDir]);

    const renderSortIndicator = (key: SortKey) => {
        if (sortKey !== key) {
            return <span className="ml-1 inline-block w-3 text-gray-300">{'\u2195'}</span>;
        }
        return (
            <span className="ml-1 inline-block w-3 text-blue-500">
                {sortDir === 'asc' ? '\u2191' : '\u2193'}
            </span>
        );
    };

    const SortHeader = ({ sortKey: key, label }: { sortKey: SortKey; label: string }) => (
        <button
            onClick={() => handleSort(key)}
            className="group inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
            {label}
            {renderSortIndicator(key)}
        </button>
    );

    const metricCards = [
        { label: 'Total Enrollments', value: metrics.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: UsersIcon },
        { label: 'Active', value: metrics.active, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: CheckCircleIcon },
        { label: 'Completed', value: metrics.completed, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: BookOpenIcon },
        { label: 'Pending', value: metrics.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: ClockIcon },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Course Enrollments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Assign and manage student enrollments for your courses</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => downloadCSV(enrollments)}
                        disabled={enrollments.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={openAssign}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Assign Enrollment
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            {!isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {metricCards.map((card) => (
                        <div key={card.label} className="rounded-xl border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by student name, email, or course..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-[#201a7c] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 outline-none bg-white dark:bg-[var(--card-background)]"
                    />
                </div>
                {(search || statusFilter) && (
                    <button
                        onClick={() => { setSearch(''); setStatusFilter(''); setCurrentPage(1); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <XIcon className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Quick-Filter Status Chips */}
            {!isLoading && enrollments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleStatusFilter('')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            !statusFilter
                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        All
                        <span className={`tabular-nums ${!statusFilter ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                            {enrollments.length}
                        </span>
                    </button>
                    {['active', 'pending', 'completed', 'suspended', 'dropped', 'expired']
                        .filter((s) => statusCounts[s] || statusFilter === s)
                        .map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusFilter(s)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                    statusFilter === s
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                <span className={`tabular-nums ${statusFilter === s ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {statusCounts[s] || 0}
                                </span>
                            </button>
                        ))}
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                    {error}
                    <button onClick={fetchEnrollments} className="ml-auto text-red-700 dark:text-red-400 underline hover:no-underline">Retry</button>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2Icon className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-500 dark:text-gray-400">Loading enrollments...</span>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No enrollments found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        {search || statusFilter
                            ? 'No enrollments match your current filters. Try adjusting your search or status filter.'
                            : 'Get started by assigning a trainee to one of your courses.'}
                    </p>
                    {!search && !statusFilter && (
                        <button
                            onClick={openAssign}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Assign Enrollment
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left"><SortHeader sortKey="student" label="Student" /></th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left"><SortHeader sortKey="course" label="Course" /></th>
                                    <th className="px-4 py-3 text-left"><SortHeader sortKey="status" label="Status" /></th>
                                    <th className="px-4 py-3 text-left"><SortHeader sortKey="enrolledAt" label="Enrolled" /></th>
                                    <th className="px-4 py-3 text-left"><SortHeader sortKey="progressPercentage" label="Progress" /></th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {sortedEnrollments.map((enrollment) => {
                                    const pct = enrollment.progressPercentage || 0;
                                    const typeTag = getEnrollmentTypeTag(enrollment.enrollmentType);
                                    return (
                                        <tr
                                            key={enrollment.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-l-[3px] ${getStatusRowAccent(enrollment.status)}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                                        <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{getStudentName(enrollment)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{getStudentEmail(enrollment)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{getCourseTitle(enrollment)}</span>
                                                    {typeTag && (
                                                        <span className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                            {typeTag}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(enrollment.enrolledAt)}</td>
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
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEdit(enrollment)}
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                        title="Edit enrollment"
                                                    >
                                                        <EditIcon className="h-3.5 w-3.5" />
                                                        Edit
                                                    </button>
                                                    {enrollment.status !== 'dropped' && (
                                                        <button
                                                            onClick={() => setUnassignTarget(enrollment)}
                                                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            title="Unassign enrollment"
                                                        >
                                                            <Trash2Icon className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}{'\u2013'}{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs} enrollments
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-[var(--card-background)]"
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const start = Math.max(1, currentPage - 2);
                                const pageNum = start + i;
                                if (pageNum > totalPages) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                            pageNum === currentPage
                                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-[var(--card-background)]"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Assign SlideOver */}
            {assignMounted && createPortal(
                <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animateAssign ? 'bg-black/50' : 'bg-transparent'}`} onClick={closeAssign}>
                    <div className={`flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl transition-all duration-300 ease-in-out ${animateAssign ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assign Enrollment</h3>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Enroll a trainee in one of your courses</p>
                            </div>
                            <button type="button" onClick={closeAssign} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <form onSubmit={handleAssignSubmit} className="space-y-5">
                                {assignError && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                                        <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                                        {assignError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Trainee <span className="text-red-500">*</span>
                                    </label>
                                    {selectedTrainee ? (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                    <UserIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {selectedTrainee.user.firstName} {selectedTrainee.user.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTrainee.user.email}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setSelectedTrainee(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <XIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <input type="text" value={traineeSearch} onChange={(e) => handleTraineeSearch(e.target.value)} placeholder="Search by name or email..." className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none bg-white dark:bg-[var(--card-background)]" />
                                                {isSearchingTrainees && (
                                                    <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                                                )}
                                            </div>
                                            {traineeResults.length > 0 && (
                                                <div className="mt-2 rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm max-h-48 overflow-y-auto">
                                                    {traineeResults.map((trainee) => (
                                                        <button key={trainee.id} type="button" onClick={() => { setSelectedTrainee(trainee); setTraineeSearch(''); setTraineeResults([]); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                                            <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                                                <UserIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{trainee.user.firstName} {trainee.user.lastName}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{trainee.user.email}{trainee.srn ? ` \u2022 ${trainee.srn}` : ''}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {traineeSearch.length >= 1 && !isSearchingTrainees && traineeResults.length === 0 && (
                                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">No trainees found matching &quot;{traineeSearch}&quot;</p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    {selectedCourse ? (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                    <BookOpenIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCourse.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCourse.courseCode}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { setSelectedCourse(null); setCourseSearch(''); setCourseResults([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <XIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={courseSearch}
                                                    onChange={(e) => handleCourseSearch(e.target.value)}
                                                    placeholder="Search your courses by title or code..."
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none bg-white dark:bg-[var(--card-background)]"
                                                />
                                                {isSearchingCourses && (
                                                    <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                                                )}
                                            </div>
                                            {courseResults.length > 0 && (
                                                <div className="mt-2 rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-background)] shadow-sm max-h-48 overflow-y-auto">
                                                    {courseResults.map((course) => (
                                                        <button
                                                            key={course.id}
                                                            type="button"
                                                            onClick={() => { setSelectedCourse(course); setCourseSearch(''); setCourseResults([]); }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                                        >
                                                            <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                                                <BookOpenIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.courseCode || 'No code'}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {courseSearch.length >= 1 && !isSearchingCourses && courseResults.length === 0 && (
                                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">No courses found matching &quot;{courseSearch}&quot;</p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                                    <textarea value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} rows={3} placeholder="Optional notes..." className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none resize-none bg-white dark:bg-[var(--card-background)]" />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <button type="button" onClick={closeAssign} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                                    <button type="submit" disabled={isAssignSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                        {isAssignSubmitting ? (<><Loader2Icon className="h-4 w-4 animate-spin" /> Enrolling...</>) : (<><PlusIcon className="h-4 w-4" /> Enroll Trainee</>)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Edit SlideOver */}
            {editTarget && createPortal(
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setEditTarget(null)}>
                    <div className="flex w-full max-w-lg flex-col bg-white dark:bg-[var(--card-background)] shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Enrollment</h3>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{getStudentName(editTarget)}{'\u2014'}{getCourseTitle(editTarget)}</p>
                            </div>
                            <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-5">
                                {editError && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                                        <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                                        {editError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                                    <div className="relative">
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400/20 outline-none bg-white dark:bg-[var(--card-background)]"
                                        >
                                            {EDIT_STATUSES.map((s) => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50 p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    <div className="flex justify-between"><span>Student</span><span className="font-medium text-gray-700 dark:text-gray-200">{getStudentName(editTarget)}</span></div>
                                    <div className="flex justify-between"><span>Email</span><span className="font-medium text-gray-700 dark:text-gray-200">{getStudentEmail(editTarget)}</span></div>
                                    <div className="flex justify-between"><span>Course</span><span className="font-medium text-gray-700 dark:text-gray-200">{getCourseTitle(editTarget)}</span></div>
                                    <div className="flex justify-between"><span>Enrolled</span><span className="font-medium text-gray-700 dark:text-gray-200">{formatDate(editTarget.enrolledAt)}</span></div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[var(--card-border)]">
                                    <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                                    <button type="button" onClick={handleEditSave} disabled={isEditSubmitting || editStatus === editTarget.status} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                        {isEditSubmitting ? (<><Loader2Icon className="h-4 w-4 animate-spin" /> Saving...</>) : (<>Save Changes</>)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Unassign Modal — sets status to dropped */}
            {unassignTarget && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => { setUnassignTarget(null); setUnassignError(null); }}>
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[var(--card-background)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Unassign Enrollment</h2>
                            <button onClick={() => { setUnassignTarget(null); setUnassignError(null); }} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            {unassignError && (<div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangleIcon className="h-4 w-4 shrink-0" />{unassignError}</div>)}
                            <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700 dark:text-amber-400">
                                <p className="font-medium">Unassign student?</p>
                                <p className="mt-1">This will unassign <strong>{getStudentName(unassignTarget)}</strong> from <strong>{getCourseTitle(unassignTarget)}</strong>. The enrollment status will be marked as <strong>Dropped</strong>. Progress data will be preserved and the record will remain visible.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => { setUnassignTarget(null); setUnassignError(null); }} disabled={isUnassignSubmitting} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors bg-white dark:bg-[var(--card-background)]">Cancel</button>
                                <button onClick={handleUnassign} disabled={isUnassignSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 dark:bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                    {isUnassignSubmitting ? (<><Loader2Icon className="h-4 w-4 animate-spin" /> Unassigning...</>) : (<>Unassign</>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}
