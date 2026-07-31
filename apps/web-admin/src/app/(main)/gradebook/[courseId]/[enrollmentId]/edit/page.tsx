'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, GraduationCap, AlertTriangle } from '@/components/ui/IconWrapper';
import {
    getEnrollmentById, updateEnrollment,
    type EnrollmentDoc
} from '../../../actions';
import { getStudentName, getCourseTitle } from '../../../utils';

export default function EditEnrollmentGradePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const enrollmentId = params.enrollmentId as string;

    const [enrollment, setEnrollment] = useState<EnrollmentDoc | null>(null);
    const [currentGrade, setCurrentGrade] = useState<string>('');
    const [finalGrade, setFinalGrade] = useState<string>('');
    const [finalEvaluation, setFinalEvaluation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const loadEnrollment = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getEnrollmentById(enrollmentId);
            setEnrollment(data);
            setCurrentGrade(data.currentGrade != null ? String(data.currentGrade) : '');
            setFinalGrade(data.finalGrade != null ? String(data.finalGrade) : '');
            setFinalEvaluation(data.finalEvaluation || '');
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load enrollment'));
        } finally {
            setIsLoading(false);
        }
    }, [enrollmentId]);

    useEffect(() => { loadEnrollment(); }, [loadEnrollment]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            const payload: Record<string, any> = {};

            if (currentGrade !== '') {
                const val = parseFloat(currentGrade);
                if (!isNaN(val)) payload.currentGrade = Math.max(0, Math.min(100, val));
            } else {
                payload.currentGrade = null;
            }

            if (finalGrade !== '') {
                const val = parseFloat(finalGrade);
                if (!isNaN(val)) payload.finalGrade = Math.max(0, Math.min(100, val));
            } else {
                payload.finalGrade = null;
            }

            if (finalEvaluation) {
                payload.finalEvaluation = finalEvaluation;
            } else {
                payload.finalEvaluation = null;
            }

            await updateEnrollment(enrollmentId, payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-48" /><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mt-1.5" /></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error === 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><GraduationCap className="h-8 w-8 text-gray-400 dark:text-gray-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Enrollment Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">This enrollment does not exist or has been removed.</p>
                    <Link href={`/gradebook/${courseId}`} className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Course Gradebook
                    </Link>
                </div>
            </div>
        );
    }

    if (error && error !== 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={loadEnrollment} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                        <Link href={`/gradebook/${courseId}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/gradebook/${courseId}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Grades</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {enrollment ? getStudentName(enrollment.student as any) : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/gradebook/${courseId}`} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {saveSuccess && (
                <div className="mt-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                    Grades saved successfully.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Grade Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Grade (0–100)</label>
                            <input type="number" min="0" max="100" step="0.1" value={currentGrade}
                                onChange={e => setCurrentGrade(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="e.g. 85.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Final Grade (0–100)</label>
                            <input type="number" min="0" max="100" step="0.1" value={finalGrade}
                                onChange={e => setFinalGrade(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="e.g. 92.0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Final Evaluation</label>
                            <select value={finalEvaluation} onChange={e => setFinalEvaluation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                <option value="">Not evaluated</option>
                                <option value="passed">Passed</option>
                                <option value="failed">Failed</option>
                            </select>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Setting to Passed/Failed will trigger certificate issuance if applicable.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Student</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{enrollment ? getStudentName(enrollment.student as any) : '-'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Course</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{enrollment ? getCourseTitle(enrollment.course as any) : '-'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1 capitalize">{enrollment?.status || '-'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{enrollment?.progressPercentage ?? 0}%</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Enrollment ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">#{enrollmentId}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
