'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Activity, UserCheck, CheckCircle, TrendingUp,
    FileText, BookOpen, Clock, X
} from '@/components/ui/IconWrapper';
import {
    getRecentActivity, type ActivityEvent
} from '../actions';

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
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('');

    const loadActivity = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getRecentActivity(100);
            setEvents(data.events);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
            setError('Failed to load activity');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadActivity(); }, [loadActivity]);

    const filtered = filterType ? events.filter(e => e.type === filterType) : events;

    // Group by date for timeline
    const groupedByDate = new Map<string, ActivityEvent[]>();
    for (const e of filtered) {
        const dateKey = new Date(e.timestamp).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
        });
        if (!groupedByDate.has(dateKey)) groupedByDate.set(dateKey, []);
        groupedByDate.get(dateKey)!.push(e);
    }

    const typeCounts = events.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/gradebook" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Track grading events, enrollments, and course completions</p>
                    </div>
                </div>
            </div>

            {/* Filter pills + summary bar */}
            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setFilterType('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterType ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        All <span className="ml-1 opacity-70">({total})</span>
                    </button>
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                        const count = typeCounts[key] || 0;
                        if (count === 0) return null;
                        return (
                            <button key={key} onClick={() => setFilterType(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === key ? `${cfg.bgColor} ${cfg.color}` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                <cfg.icon className="h-3 w-3 inline mr-1" />
                                {cfg.label} <span className="ml-0.5 opacity-70">({count})</span>
                            </button>
                        );
                    })}
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
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                        <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No activity yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {filterType ? 'No events of this type yet.' : 'Gradebook activity will appear here as students submit work and receive grades.'}
                        </p>
                        {filterType && (
                            <button onClick={() => setFilterType('')}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                                <X className="h-4 w-4 inline mr-1" />
                                Clear Filter
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
                                            {/* Timeline dot + line */}
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[var(--card-background)] ${cfg?.dotColor || 'bg-gray-300'}`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                {!isLast && <div className="flex-1 w-px bg-gray-200 dark:bg-gray-700 min-h-[8px]" />}
                                            </div>

                                            {/* Event card */}
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
        </div>
    );
}
