'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import { getLessonById, updateLesson, type LessonDoc } from '../../actions';
import LessonForm from '@/components/courses/LessonForm';

const Link = NextLink as any;

export default function EditLessonPage() {
    const params = useParams();
    const lessonId = params.lessonId as string;

    const [lesson, setLesson] = useState<LessonDoc | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    const loadLesson = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getLessonById(lessonId);
            setLesson(data as LessonDoc);

            const mod = data.module;
            let moduleId = '';
            let moduleLabel = '';
            if (mod && typeof mod === 'object') {
                moduleId = String(mod.id);
                moduleLabel = mod.title || `Module #${mod.id}`;
            }

            // Extract description from bodyBlocks or description field
            let description = '';
            if ((data as any).description) {
                description = typeof (data as any).description === 'string'
                    ? (data as any).description
                    : JSON.stringify((data as any).description);
            }

            setInitialData({
                title: data.title || '',
                module: moduleId,
                moduleSearch: moduleLabel,
                moduleLabel,
                description,
                estimatedDuration: data.estimatedDuration || 0,
            });
        } catch (err: any) {
            console.error(err);
            setError(
                err.message?.includes('404') || err.message?.includes('Not Found')
                    ? 'not-found'
                    : (err.message || 'Failed to load lesson')
            );
        } finally {
            setIsLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        loadLesson();
    }, [loadLesson]);

    const handleSave = async (payload: Record<string, any>) => {
        if (!lessonId) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);
            await updateLesson(lessonId, payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save lesson');
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
                        <div>
                            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-48" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mt-1.5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4"
                            >
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded w-full" />
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
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2v20H20a2.5 2.5 0 002.5-2.5V6.5A2.5 2.5 0 0020 4H6.5A2.5 2.5 0 004 6.5v13z"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Lesson Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        This lesson does not exist or has been removed.
                    </p>
                    <Link
                        href="/courses/lessons"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                    >
                        <svg
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 12H5" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Lessons
                    </Link>
                </div>
            </div>
        );
    }

    if (error && error !== 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-red-500 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={loadLesson}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                        >
                            Retry
                        </button>
                        <Link
                            href="/courses/lessons"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-sm font-medium"
                        >
                            Back
                        </Link>
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
                        href="/courses/lessons"
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Lesson</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {lesson?.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/courses/lessons"
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]"
                    >
                        Cancel
                    </Link>
                    <button
                        form="lesson-form"
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
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <LessonForm
                mode="edit"
                lessonId={lessonId}
                lesson={lesson}
                initialData={initialData}
                isSaving={isSaving}
                error={error}
                saveSuccess={saveSuccess}
                onSave={handleSave}
                onClearError={() => setError(null)}
            />
        </div>
    );
}
