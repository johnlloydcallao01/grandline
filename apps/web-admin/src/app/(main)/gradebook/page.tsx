'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, GraduationCap, BookOpen, TrendingUp, Users,
    CheckCircle, ArrowUpRight
} from '@/components/ui/IconWrapper';
import {
    getCoursesWithStats, type CourseWithStats
} from './actions';

export default function GradebookPage() {
    const [courses, setCourses] = useState<CourseWithStats[]>([]);
    const [totalCourses, setTotalCourses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadCourses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCoursesWithStats();
            setCourses(data);
            setTotalCourses(data.length);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadCourses(); }, [loadCourses]);

    const filtered = searchTerm
        ? courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : courses;

    const totalEnrollments = courses.reduce((s, c) => s + c.enrollmentCount, 0);
    const totalGraded = courses.reduce((s, c) => s + c.gradedCount, 0);
    const totalPassed = courses.reduce((s, c) => s + c.passedCount, 0);

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-4"><GraduationCap className="h-12 w-12 mx-auto" /></div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load gradebook</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadCourses} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gradebook</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View grades by course &mdash; select a course to see student performance</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><div className="h-5 w-5 bg-blue-200 dark:bg-blue-700 rounded" /></div>
                                    <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCourses}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30"><Users className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEnrollments}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30"><TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalGraded}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Graded</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30"><CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPassed}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Passed</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input type="text" placeholder="Search courses..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Graded</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Grade</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passed</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No courses found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {searchTerm ? 'No courses match your search.' : 'No courses with enrollments yet.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Graded</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Grade</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passed</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{c.enrollmentCount}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{c.gradedCount}</td>
                                    <td className="px-4 py-3 text-center">
                                        {c.avgGrade != null
                                            ? <span className={`text-sm font-semibold ${c.avgGrade >= 70 ? 'text-green-600 dark:text-green-400' : c.avgGrade >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{c.avgGrade}%</span>
                                            : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{c.passedCount}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/gradebook/${c.id}`}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                            View Gradebook
                                            <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
