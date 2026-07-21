'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Save, Loader2, BookOpen, X, CheckCircle, AlertTriangle, Folder
} from '@/components/ui/IconWrapper';
import {
    getAssessmentById, updateAssessment,
    type AssessmentDoc, type ModuleOption, type CourseOption
} from '../../actions';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

const TYPE_LABELS: Record<string, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    final_exam: 'Final Exam',
};

const TYPE_COLORS: Record<string, string> = {
    quiz: 'bg-blue-100 text-blue-700',
    exam: 'bg-orange-100 text-orange-700',
    final_exam: 'bg-purple-100 text-purple-700',
};

interface FormState {
    title: string;
    module: string;
    moduleSearch: string;
    moduleLabel: string;
    course: string;
    courseSearch: string;
    courseLabel: string;
    description: unknown;
    passingScore: number;
    maxAttempts: number;
    timeLimitMinutes: number;
    showCorrectAnswer: boolean;
}

export default function EditAssessmentPage() {
    const params = useParams();
    const assessmentId = params.assessmentId as string;

    const [assessment, setAssessment] = useState<AssessmentDoc | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);

    const [form, setForm] = useState<FormState>({
        title: '',
        module: '',
        moduleSearch: '',
        moduleLabel: '',
        course: '',
        courseSearch: '',
        courseLabel: '',
        description: '',
        passingScore: 70,
        maxAttempts: 1,
        timeLimitMinutes: 0,
        showCorrectAnswer: false,
    });

    const assessmentType = assessment?.assessmentType || 'quiz';
    const isFinalExam = assessmentType === 'final_exam';

    const loadAssessment = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await getAssessmentById(assessmentId);
            const data = result.assessment;
            setAssessment(data);
            setModuleOptions(result.moduleOptions || []);
            setCourseOptions(result.courseOptions || []);

            let moduleId = '';
            let moduleLabel = '';
            let courseId = '';
            let courseLabel = '';

            if (data.assessmentType === 'final_exam') {
                const c = data.course;
                if (c && typeof c === 'object') {
                    courseId = String(c.id);
                    courseLabel = c.title || `Course #${c.id}`;
                }
            } else {
                const mod = data.module;
                if (mod && typeof mod === 'object') {
                    moduleId = String(mod.id);
                    moduleLabel = mod.title || `Module #${mod.id}`;
                }
            }

            const desc = data.description;
            const description = desc || undefined;

            setForm({
                title: data.title || '',
                module: moduleId,
                moduleSearch: moduleLabel,
                moduleLabel,
                course: courseId,
                courseSearch: courseLabel,
                courseLabel,
                description,
                passingScore: data.passingScore ?? 70,
                maxAttempts: data.maxAttempts ?? 1,
                timeLimitMinutes: data.timeLimitMinutes || 0,
                showCorrectAnswer: data.showCorrectAnswer ?? false,
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load assessment'));
        } finally {
            setIsLoading(false);
        }
    }, [assessmentId]);

    useEffect(() => { loadAssessment(); }, [loadAssessment]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const filteredModules = form.moduleSearch
        ? moduleOptions.filter(m => m.title.toLowerCase().includes(form.moduleSearch.toLowerCase()))
        : moduleOptions;

    const filteredCourses = form.courseSearch
        ? courseOptions.filter(c => c.title.toLowerCase().includes(form.courseSearch.toLowerCase()))
        : courseOptions;

    const handleSave = async () => {
        if (!form.title.trim()) return;
        if (!isFinalExam && !form.module) return;
        if (isFinalExam && !form.course) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            let description: any = form.description || undefined;
            if (description && typeof description === 'string') {
                try { description = JSON.parse(description); } catch { /* empty */ }
            }

            const payload: Record<string, any> = {
                title: form.title,
                description,
                passingScore: form.passingScore,
                maxAttempts: form.maxAttempts,
                timeLimitMinutes: form.timeLimitMinutes > 0 ? form.timeLimitMinutes : undefined,
                showCorrectAnswer: form.showCorrectAnswer,
            };

            if (isFinalExam) {
                if (form.course) payload.course = form.course;
            } else {
                if (form.module) payload.module = form.module;
            }

            await updateAssessment(assessmentId, payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save assessment');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 bg-gray-100 rounded-lg" />
                        <div>
                            <div className="h-6 bg-gray-100 rounded w-48" />
                            <div className="h-4 bg-gray-100 rounded w-24 mt-1.5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-gray-100 rounded-lg" />
                        <div className="h-9 w-32 bg-gray-100 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                                <div className="h-4 bg-gray-100 rounded w-32" />
                                <div className="h-10 bg-gray-100 rounded w-full" />
                                <div className="h-10 bg-gray-100 rounded w-full" />
                                <div className="h-20 bg-gray-100 rounded w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                            <div className="h-4 bg-gray-100 rounded w-24" />
                            <div className="h-5 bg-gray-100 rounded w-16" />
                            <div className="h-5 bg-gray-100 rounded w-32" />
                            <div className="h-5 bg-gray-100 rounded w-20" />
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
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-gray-400" /></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
                    <p className="text-gray-500 mb-6">This assessment does not exist or has been removed.</p>
                    <Link href="/courses/assessments" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Assessments
                    </Link>
                </div>
            </div>
        );
    }

    if (error && error !== 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="h-8 w-8 text-red-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={loadAssessment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Retry</button>
                        <Link href="/courses/assessments" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/courses/assessments" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Assessment</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{assessment?.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses/assessments" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving || !form.title.trim() || (!isFinalExam && !form.module) || (isFinalExam && !form.course)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* === MAIN CONTENT === */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[assessmentType] || 'bg-gray-100 text-gray-600'}`}>
                                    {TYPE_LABELS[assessmentType] || assessmentType}
                                </span>
                                <span className="text-xs text-gray-400">(type cannot be changed)</span>
                            </div>
                        </div>
                        {isFinalExam ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                                <input type="text" value={form.courseSearch}
                                    onChange={e => { updateField('courseSearch', e.target.value); if (e.target.value !== form.courseLabel) updateField('course', ''); updateField('courseLabel', ''); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Search courses..." />
                                {form.courseSearch !== form.courseLabel && filteredCourses.length > 0 && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {filteredCourses.map(c => (
                                            <button key={c.id}
                                                onClick={() => { updateField('course', c.id); updateField('courseSearch', c.title); updateField('courseLabel', c.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50">
                                                {c.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!form.courseSearch && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {courseOptions.map(c => (
                                            <button key={c.id}
                                                onClick={() => { updateField('course', c.id); updateField('courseSearch', c.title); updateField('courseLabel', c.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                {c.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Module *</label>
                                <input type="text" value={form.moduleSearch}
                                    onChange={e => { updateField('moduleSearch', e.target.value); if (e.target.value !== form.moduleLabel) updateField('module', ''); updateField('moduleLabel', ''); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Search modules..." />
                                {form.moduleSearch !== form.moduleLabel && filteredModules.length > 0 && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {filteredModules.map(mod => (
                                            <button key={mod.id}
                                                onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50">
                                                {mod.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!form.moduleSearch && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {moduleOptions.map(mod => (
                                            <button key={mod.id}
                                                onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                {mod.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Description</h2>
                        <RichTextEditor
                            value={form.description}
                            onChange={(json) => updateField('description', json)}
                            placeholder="Type /image to insert an image"
                        />
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Settings</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                <input type="number" min="0" max="100" value={form.passingScore}
                                    onChange={e => updateField('passingScore', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                <input type="number" min="1" value={form.maxAttempts}
                                    onChange={e => updateField('maxAttempts', parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (min)</label>
                                <input type="number" min="0" value={form.timeLimitMinutes || ''}
                                    onChange={e => updateField('timeLimitMinutes', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="0 = unlimited" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input type="checkbox" id="showCorrectAnswer" checked={form.showCorrectAnswer}
                                onChange={e => updateField('showCorrectAnswer', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="showCorrectAnswer" className="text-sm font-medium text-gray-700">Show correct answer after submission</label>
                        </div>
                    </div>
                </div>

                {/* === SIDEBAR === */}
                <div className="space-y-6">
                    {/* Publishing Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500">Last Updated</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {assessment?.updatedAt ? new Date(assessment.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Created At</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {assessment?.createdAt ? new Date(assessment.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Assessment ID</span>
                            <p className="text-xs text-gray-400 font-mono break-all bg-gray-50 p-2 rounded mt-1">{assessmentId}</p>
                        </div>
                    </div>

                    {/* Module / Course Info */}
                    {isFinalExam ? (
                        form.course && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                                <h2 className="text-sm font-bold text-gray-900">Course</h2>
                                <div className="flex items-center gap-1.5">
                                    <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <p className="text-sm text-gray-900 font-medium">{form.courseLabel || `#${form.course}`}</p>
                                </div>
                            </div>
                        )
                    ) : (
                        form.module && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                                <h2 className="text-sm font-bold text-gray-900">Module</h2>
                                <div className="flex items-center gap-1.5">
                                    <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <p className="text-sm text-gray-900 font-medium">{form.moduleLabel || `#${form.module}`}</p>
                                </div>
                            </div>
                        )
                    )}

                    {/* Questions Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Questions</h2>
                        <p className="text-sm text-gray-900 font-medium">{assessment?.items?.length || 0} items</p>
                        <p className="text-xs text-gray-500">Manage questions in the assessment builder</p>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Assessment saved successfully
                        <button onClick={() => setSaveSuccess(false)} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
