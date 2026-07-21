'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save } from '@/components/ui/IconWrapper';
import { createCourse } from '../actions';
import CourseForm from '@/components/courses/CourseForm';

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
            setTimeout(() => router.push(`/courses/${created.id}/edit`), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to create course');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Course</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Add a new course to the platform</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button form="course-form" type="submit" disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
