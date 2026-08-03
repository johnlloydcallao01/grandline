'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { createLesson } from '../actions';
import LessonForm from '@/components/courses/LessonForm';

const Link = NextLink as any;

export default function CreateLessonPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async (payload: Record<string, any>) => {
        try {
            setIsSaving(true);
            setError(null);
            const created = await createLesson(payload as any);
            setSaveSuccess(true);
            setTimeout(() => router.push(`/courses/lessons/${created.id}/edit` as any), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to create lesson');
        } finally {
            setIsSaving(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Lesson</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Add a new lesson to a module</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/courses/lessons"
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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
                        {isSaving ? 'Creating...' : 'Create Lesson'}
                    </button>
                </div>
            </div>

            <LessonForm
                mode="create"
                isSaving={isSaving}
                error={error}
                saveSuccess={saveSuccess}
                onSave={handleSave}
                onClearError={() => setError(null)}
            />
        </div>
    );
}
