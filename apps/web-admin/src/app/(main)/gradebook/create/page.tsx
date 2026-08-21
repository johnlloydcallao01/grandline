'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save } from '@/components/ui/IconWrapper';
import { getCoursesList, createEnrollment } from '../actions';
import type { GradebookCourseDoc } from '@encreasl/cms-types';

export default function CreateEnrollmentPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<GradebookCourseDoc[]>([]);
    const [courseId, setCourseId] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [enrollmentType, setEnrollmentType] = useState('free');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getCoursesList();
                setCourses(data.docs || []);
            } catch {
                setError('Failed to load courses');
            } finally {
                setIsLoadingCourses(false);
            }
        })();
    }, []);

    const handleCreate = async () => {
        if (!courseId) { setError('Please select a course'); return; }
        if (!studentEmail.trim()) { setError('Student email is required'); return; }

        try {
            setIsSaving(true);
            setError(null);

            await createEnrollment({
                course: Number(courseId),
                studentEmail: studentEmail.trim(),
                enrollmentType,
            });

            router.push(`/gradebook/${courseId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create enrollment');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/gradebook" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Enrollment</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Enroll a student in a course</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/gradebook" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">Cancel</Link>
                    <button onClick={handleCreate} disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Creating...' : 'Create Enrollment'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Enrollment Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
                            {isLoadingCourses ? (
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                            ) : (
                                <select value={courseId} onChange={e => setCourseId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                    <option value="">Select a course...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Email *</label>
                            <input type="email" value={studentEmail}
                                onChange={e => setStudentEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="student@example.com" />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">The student must already have an account in the system.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment Type</label>
                            <select value={enrollmentType} onChange={e => setEnrollmentType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                                <option value="scholarship">Scholarship</option>
                                <option value="trial">Trial</option>
                                <option value="corporate">Corporate</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Course</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{courseId ? courses.find(c => c.id === Number(courseId))?.title || `Course #${courseId}` : '(not selected)'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Student</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{studentEmail || '(not set)'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1 capitalize">{enrollmentType}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
