'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
    createAssessment, getAssessments, getQuestions,
    type ModuleOption, type CourseOption, type QuestionOption
} from '../actions';
import AssessmentForm from '@/components/courses/AssessmentForm';

const Link = NextLink as any;

export default function CreateAssessmentPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
    const [questions, setQuestions] = useState<QuestionOption[]>([]);

    const loadOptions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [assessData, questionData] = await Promise.all([
                getAssessments({ limit: 1 }),
                getQuestions({ limit: 200 }),
            ]);
            if (assessData.moduleOptions) setModuleOptions(assessData.moduleOptions);
            if (assessData.courseOptions) setCourseOptions(assessData.courseOptions);
            setQuestions(questionData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load options');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadOptions(); }, [loadOptions]);

    const handleSave = async (payload: Record<string, any>) => {
        try {
            setIsSaving(true);
            setError(null);
            const created = await createAssessment(payload as any);
            setSaveSuccess(true);
            setTimeout(() => router.push(`/courses/assessments/${created.id}/edit` as any), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to create assessment');
        } finally {
            setIsSaving(false);
        }
    };

    if (error && !isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={loadOptions} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                        <Link href="/courses/assessments" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/courses/assessments"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 12H5" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Assessment</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create a new quiz, exam, or final exam</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/courses/assessments"
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]"
                    >
                        Cancel
                    </Link>
                    <button
                        form="assessment-form"
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1" /><path d="M9 18V8m0 0L5 12m4-4l4 4" /></svg>
                        )}
                        {isSaving ? 'Creating...' : 'Create Assessment'}
                    </button>
                </div>
            </div>

            <AssessmentForm
                mode="create"
                moduleOptions={moduleOptions}
                courseOptions={courseOptions}
                questions={questions}
                isSaving={isSaving}
                error={error}
                saveSuccess={saveSuccess}
                onSave={handleSave}
                onClearError={() => setError(null)}
            />
        </div>
    );
}
