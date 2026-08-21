'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Activity, UserCheck, CheckCircle, TrendingUp,
    FileText, BookOpen, Clock, X, Search, ArrowLeft
} from '@/components/ui/IconWrapper';
import {
    getRecentActivity,
} from '../actions';
import type {
    GradebookActivityEvent,
    GradebookActivityCourseOption,
    GradebookActivityStats,
} from '@encreasl/cms-types';

const ITEMS_PER_PAGE = 20;

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<any>; label: string; color: string; bgColor: string; dotColor: string }> = {
    enrollment_created: {
        icon: UserCheck,
        label: 'Enrolled',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
        dotColor: 'bg-blue-500',
    },
    enrollment_completed: {
        icon: CheckCircle,
        label: 'Completed',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
        dotColor: 'bg-green-500',
    },
    grade_updated: {
        icon: TrendingUp,
        label: 'Grade Updated',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
        dotColor: 'bg-amber-500',
    },
    assessment_graded: {
        icon: FileText,
        label: 'Assessment Graded',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
        dotColor: 'bg-purple-500',
    },
    assignment_graded: {
        icon: BookOpen,
        label: 'Assignment Graded',
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800',
        dotColor: 'bg-indigo-500',
    },
};

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return 'yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 5) return `${diffWeek}w ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export default function RecentActivityPage() {
    const [events, setEvents] = useState<GradebookActivityEvent[]>([]);
    const [stats, setStats] = useState<GradebookActivityStats | null>(null);
    const [courses, setCourses] = useState<GradebookActivityCourseOption[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const loadActivity = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getRecentActivity({
                search: debouncedSearch || undefined,
                type: filterType || undefined,
                courseId: filterCourse || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setEvents(data.events || []);
            setStats(data.stats);
            setCourses(data.courses || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load activity');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, filterType, filterCourse, currentPage]);

    useEffect(() => { loadActivity(); }, [loadActivity]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, filterCourse]);

    const metricCards = [
        { label: 'Total Events', value: stats?.totalEvents ?? 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: Activity },
        { label: 'Assignments Graded', value: stats?.gradedAssignments ?? 0, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: BookOpen },
        { label: 'Assessments Graded', value: stats?.gradedAssessments ?? 0, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: FileText },
        { label: 'Completions', value: stats?.completions ?? 0, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: CheckCircle },
    ];

    // Group the *current page* events by date for the timeline.
    const groupedByDate = new Map<string, GradebookActivityEvent[]>();
    for (const e of events) {
        const dateKey = new Date(e.timestamp).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
        });
        if (!groupedByDate.has(dateKey)) groupedByDate.set(dateKey, []);
        groupedByDate.get(dateKey)!.push(e);
    }

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-red-500 dark:text-red-400" />
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load activity</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadActivity}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    const hasFilters = Boolean(filterType || filterCourse || debouncedSearch);

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/gradebook" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Grading events, enrollments, and completions across your courses</p>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoading || !stats ? (
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" /></div>
                                    <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    metricCards.map((card) => (
                        <div key={card.label} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${card.bg}`}>
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

            {/* Filters */}
            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by student, course, or description..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="w-full sm:w-72 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                    >
                        <option value="">All Courses</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setFilterType('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterType ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        All <span className="ml-1 opacity-70">({stats?.totalEvents ?? 0})</span>
                    </button>
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => setFilterType(filterType === key ? '' : key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === key ? `${cfg.bgColor} ${cfg.color}` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <cfg.icon className="h-3 w-3 inline mr-1" />
                            {cfg.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(day => (
                            <div key={day} className="space-y-3">
                                <div className="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map(item => (
                                        <div key={item} className="flex gap-4 animate-pulse">
                                            <div className="flex flex-col items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                                                <div className="flex-1 w-px bg-gray-100 dark:bg-gray-800" />
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 space-y-2">
                                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No activity found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {hasFilters
                                ? 'No events match your current filters. Try adjusting the search or clearing a filter.'
                                : 'Gradebook activity will appear here as students enroll, submit work, and receive grades.'}
                        </p>
                        {hasFilters && (
                            <button onClick={() => { setFilterType(''); setFilterCourse(''); setSearchTerm(''); setDebouncedSearch(''); setCurrentPage(1); }}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                                <X className="h-4 w-4 inline mr-1" />
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    Array.from(groupedByDate.entries()).map(([dateLabel, dayEvents]) => (
                        <div key={dateLabel}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{dateLabel}</h2>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                <span className="text-xs text-gray-400 dark:text-gray-500">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="space-y-2">
                                {dayEvents.map((event, idx) => {
                                    const cfg = TYPE_CONFIG[event.type];
                                    const Icon = cfg?.icon || Activity;
                                    const isLast = idx === dayEvents.length - 1;

                                    return (
                                        <div key={event.id} className="flex gap-4 group">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[var(--card-background)] ${cfg?.dotColor || 'bg-gray-300'}`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                {!isLast && <div className="flex-1 w-px bg-gray-200 dark:bg-gray-700 min-h-[8px]" />}
                                            </div>

                                            <div className={`flex-1 ${isLast ? '' : 'mb-2'}`}>
                                                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${cfg?.bgColor || ''} ${cfg?.color || ''}`}>
                                                                    {cfg?.label || event.type}
                                                                </span>
                                                                {event.metadata?.score != null && (
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                        {Math.round(event.metadata.score)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1.5 leading-snug">
                                                                {event.description}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                                {event.detail}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[11px] text-gray-400 dark:text-gray-500" title={formatDateTime(event.timestamp)}>
                                                                    {relativeTime(event.timestamp)}
                                                                </span>
                                                                {event.courseId && (
                                                                    <Link href={`/gradebook/${event.courseId}`}
                                                                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                                        View Course
                                                                    </Link>
                                                                )}
                                                                {event.enrollmentId && event.courseId && (
                                                                    <Link href={`/gradebook/${event.courseId}/${event.enrollmentId}/edit`}
                                                                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                                        Edit Grade
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
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
                                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}