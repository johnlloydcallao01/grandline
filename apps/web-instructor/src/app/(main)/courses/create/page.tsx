'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { createCourse } from '../actions';
import CourseForm from '@/components/courses/CourseForm';
const Link = NextLink as any;

export default function CreateCoursePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async (payload: Record<string, any>) => {
        try {
            setIsSaving(true);
            setError(null);
            const created = await createCourse(payload as any);
            setSaveSuccess(true);
            setTimeout(() => router.push(`/courses/${created.id}/edit` as any), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to create course');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="py-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Course</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create a new course for your students</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</Link>
                    <button form="course-form" type="submit" disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        )}
                        {isSaving ? 'Creating...' : 'Create Course'}
                    </button>
                </div>
            </div>

            <CourseForm
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
