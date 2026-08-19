'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, BookOpen, AlertTriangle } from '@/components/ui/IconWrapper';
import { getCourseEditData, updateCourse } from '../../actions';
import CourseForm from '@/components/courses/CourseForm';

const extractIds = (items: any[] | undefined | string): string[] => {
    if (!items || !Array.isArray(items)) return [];
    return items.map(i => {
        const val = typeof i === 'object' && i !== null ? i.id : i;
        return val != null ? String(val) : '';
    }).filter(Boolean);
};

const toDatetimeLocal = (iso: string | undefined) => {
    if (!iso) return '';
    try { const d = new Date(iso); return d.toISOString().slice(0, 16); } catch { return ''; }
};

export default function EditCoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    const loadCourse = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await getCourseEditData(courseId);
            const data = result.course;
            setCourse(data);

            const inst = data.instructor;
            let instructorId = '';
            let instructorLabel = '';
            if (inst && typeof inst === 'object') {
                instructorId = String(inst.id);
                instructorLabel = inst.user && typeof inst.user === 'object'
                    ? `${inst.user.firstName || ''} ${inst.user.lastName || ''}`.trim() || `Instructor #${inst.id}`
                    : `Instructor #${inst.id}`;
            }

            const desc = data.description;
            const description = desc || undefined;

            const thumb = data.thumbnail;
            const thumbUrl = thumb && typeof thumb === 'object'
                ? (thumb as any).cloudinaryURL || (thumb as any).url || ''
                : '';

            const banner = data.bannerImage;
            const bannerUrl = banner && typeof banner === 'object'
                ? (banner as any).cloudinaryURL || (banner as any).url || ''
                : '';

            const ct = data.certificateTemplate;
            let ctId = '', ctLabel = '';
            if (ct && typeof ct === 'object') { ctId = String(ct.id); ctLabel = ct.title || ct.name || `#${ct.id}`; }
            else if (typeof ct === 'string') ctId = ct;

            const ff = data.feedbackForm;
            let ffId = '', ffLabel = '';
            if (ff && typeof ff === 'object') { ffId = String(ff.id); ffLabel = ff.title || `#${ff.id}`; }
            else if (typeof ff === 'string') ffId = ff;

            setInitialData({
                title: data.title || '',
                courseCode: data.courseCode || '',
                status: data.status || 'draft',
                description,
                excerpt: data.excerpt || '',
                instructor: instructorId,
                instructorSearch: instructorLabel,
                instructorLabel,
                coInstructors: extractIds(data.coInstructors as any),
                category: extractIds(data.category as any),
                tags: extractIds(data.tags as any),
                modules: extractIds(data.modules as any),
                thumbnailUrl: thumbUrl,
                bannerImageUrl: bannerUrl,
                price: data.price || 0,
                discountedPrice: data.discountedPrice || 0,
                maxStudents: data.maxStudents || 0,
                enrollmentStartDate: toDatetimeLocal(data.enrollmentStartDate),
                enrollmentEndDate: toDatetimeLocal(data.enrollmentEndDate),
                courseStartDate: toDatetimeLocal(data.courseStartDate),
                courseEndDate: toDatetimeLocal(data.courseEndDate),
                estimatedDuration: data.estimatedDuration || 0,
                estimatedDurationUnit: data.estimatedDurationUnit || 'hours',
                difficultyLevel: data.difficultyLevel || 'standard',
                isFeatured: data.isFeatured || false,
                language: data.language || 'en',
                passingGrade: data.passingGrade || 70,
                evaluationMode: data.evaluationMode || 'lessons_exam',
                certificateTemplate: ctId,
                certificateTemplateSearch: ctLabel,
                certificateTemplateLabel: ctLabel,
                feedbackForm: ffId,
                feedbackFormSearch: ffLabel,
                feedbackFormLabel: ffLabel,
                isFeedbackRequired: data.isFeedbackRequired || false,
                learningObjectives: (data as any).learningObjectives?.map((o: any) => typeof o === 'object' ? (o.objective || '') : o) || [],
                prerequisites: (data as any).prerequisites?.map((p: any) => typeof p === 'object' ? (p.prerequisite || '') : p) || [],
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load course'));
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => { loadCourse(); }, [loadCourse]);

    const handleSave = async (payload: Record<string, any>) => {
        if (!courseId) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);
            const safeData: Record<string, any> = { ...payload };
            for (const key of ['instructor', 'certificateTemplate', 'feedbackForm']) {
                if (safeData[key] != null && typeof safeData[key] !== 'object') safeData[key] = Number(safeData[key]);
            }
            for (const key of ['category', 'coInstructors', 'modules', 'tags']) {
                if (Array.isArray(safeData[key])) safeData[key] = safeData[key].map((v: any) => typeof v === 'object' ? v : Number(v));
            }
            await updateCourse(courseId, safeData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save course');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                        <div><div className="h-6 bg-gray-100 dark:bg-gray-700 rounded w-48" /><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24 mt-1.5" /></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                        <div className="h-9 w-32 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                                <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-16" />
                                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-32" />
                                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error === 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Course Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">This course does not exist or has been removed.</p>
                    <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Courses
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
                        <button onClick={loadCourse} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Retry</button>
                        <Link href="/courses" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Course</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{course?.courseCode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</Link>
                    <button form="course-form" type="submit" disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <CourseForm
                mode="edit"
                courseId={courseId}
                course={course}
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
