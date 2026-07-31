'use client';

import React, { useEffect, useState } from 'react';
import { searchCollection, type SimpleDocRef, type CourseDoc } from '@/app/(main)/courses/actions';

const DIFFICULTY_OPTIONS = [
    { value: 'standard', label: 'Standard' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
];

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
];

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

const DURATION_UNIT_OPTIONS = [
    { value: 'minutes', label: 'Minute(s)' },
    { value: 'hours', label: 'Hour(s)' },
    { value: 'days', label: 'Day(s)' },
    { value: 'weeks', label: 'Week(s)' },
];

const EVALUATION_MODE_OPTIONS = [
    { value: 'lessons', label: 'Via Lessons (Progress-Based)' },
    { value: 'exam', label: 'Via Final Exam (Mastery-Based)' },
    { value: 'quizzes', label: 'Via Passed Quizzes (Continuous)' },
    { value: 'lessons_exam', label: 'Via Lessons + Final Exam' },
    { value: 'lessons_quizzes', label: 'Via Lessons + Quizzes' },
    { value: 'quizzes_exam', label: 'Via Quizzes + Final Exam' },
    { value: 'lessons_quizzes_exam', label: 'Via Lessons + Quizzes + Final Exam' },
];

interface FormState {
    title: string;
    courseCode: string;
    status: string;
    description: string;
    excerpt: string;
    modules: string[];
    thumbnailUrl: string;
    bannerImageUrl: string;
    maxStudents: number;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    courseStartDate: string;
    courseEndDate: string;
    estimatedDuration: number;
    estimatedDurationUnit: string;
    difficultyLevel: string;
    language: string;
    passingGrade: number;
    evaluationMode: string;
    learningObjectives: string[];
    prerequisites: string[];
}

const DEFAULTS: FormState = {
    title: '', courseCode: '', status: 'draft',
    description: '', excerpt: '',
    modules: [],
    thumbnailUrl: '', bannerImageUrl: '',
    maxStudents: 0,
    enrollmentStartDate: '', enrollmentEndDate: '',
    courseStartDate: '', courseEndDate: '',
    estimatedDuration: 0, estimatedDurationUnit: 'hours',
    difficultyLevel: 'standard', language: 'en',
    passingGrade: 70, evaluationMode: 'lessons_exam',
    learningObjectives: [], prerequisites: [],
};

interface CourseFormProps {
    mode: 'create' | 'edit';
    courseId?: string;
    course?: CourseDoc | null;
    initialData?: Partial<FormState>;
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function CourseForm({
    mode,
    courseId,
    course,
    initialData,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: CourseFormProps) {
    const [form, setForm] = useState<FormState>(() => initialData ? { ...DEFAULTS, ...initialData } : { ...DEFAULTS });
    const [moduleSearch, setModuleSearch] = useState('');
    const [moduleResults, setModuleResults] = useState<SimpleDocRef[]>([]);

    useEffect(() => {
        const s = document.createElement('style');
        s.textContent = '.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator,.dark input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1)}';
        s.id = 'calendar-picker-dark-fix';
        document.head.appendChild(s);
        return () => { const e = document.getElementById('calendar-picker-dark-fix'); if (e) e.remove(); };
    }, []);

    useEffect(() => {
        if (!moduleSearch || moduleSearch.length < 1) { setModuleResults([]); return; }
        const t = setTimeout(async () => {
            try { setModuleResults(await searchCollection('course-modules', moduleSearch)); } catch { setModuleResults([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [moduleSearch]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const addModule = (id: string) => {
        if (!form.modules.includes(id)) updateField('modules', [...form.modules, id]);
        setModuleResults([]);
        setModuleSearch('');
    };

    const removeModule = (id: string) => {
        updateField('modules', form.modules.filter(m => m !== id));
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.courseCode.trim()) return;
        const payload: Record<string, any> = {
            title: form.title,
            courseCode: form.courseCode,
            status: form.status,
            modules: form.modules.length > 0 ? form.modules : [],
            maxStudents: form.maxStudents > 0 ? form.maxStudents : undefined,
            excerpt: form.excerpt || undefined,
            description: form.description || undefined,
            difficultyLevel: form.difficultyLevel,
            language: form.language,
            estimatedDuration: form.estimatedDuration > 0 ? form.estimatedDuration : undefined,
            estimatedDurationUnit: form.estimatedDurationUnit,
            passingGrade: form.passingGrade,
            evaluationMode: form.evaluationMode,
            enrollmentStartDate: form.enrollmentStartDate || undefined,
            enrollmentEndDate: form.enrollmentEndDate || undefined,
            courseStartDate: form.courseStartDate || undefined,
            courseEndDate: form.courseEndDate || undefined,
            learningObjectives: form.learningObjectives.filter(Boolean).map(o => ({ objective: o })),
            prerequisites: form.prerequisites.filter(Boolean).map(p => ({ prerequisite: p })),
        };
        if (form.thumbnailUrl) payload.thumbnailUrl = form.thumbnailUrl;
        if (form.bannerImageUrl) payload.bannerImageUrl = form.bannerImageUrl;
        await onSave(payload);
    };

    return (
        <form id="course-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="contents">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code *</label>
                            <input type="text" value={form.courseCode} onChange={e => updateField('courseCode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 font-mono bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select value={form.status} onChange={e => updateField('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Description</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Description</label>
                        <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={6}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Describe your course..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                        <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Brief summary for listings..." />
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Media</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                        <input type="text" value={form.thumbnailUrl} onChange={e => updateField('thumbnailUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 font-mono text-xs bg-white dark:bg-[var(--card-background)]"
                            placeholder="Cloudinary or media URL..." />
                        {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="thumbnail preview" className="mt-2 h-24 rounded border border-gray-200 dark:border-[var(--card-border)] object-cover" />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image URL</label>
                        <input type="text" value={form.bannerImageUrl} onChange={e => updateField('bannerImageUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 font-mono text-xs bg-white dark:bg-[var(--card-background)]"
                            placeholder="Cloudinary or media URL..." />
                        {form.bannerImageUrl && <img src={form.bannerImageUrl} alt="banner preview" className="mt-2 h-24 rounded border border-gray-200 dark:border-[var(--card-border)] object-cover" />}
                    </div>
                </div>

                {/* Enrollment */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Enrollment</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Students</label>
                        <input type="number" min="0" value={form.maxStudents} onChange={e => updateField('maxStudents', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="0 = unlimited" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment Start</label>
                            <input type="datetime-local" value={form.enrollmentStartDate} onChange={e => updateField('enrollmentStartDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment End</label>
                            <input type="datetime-local" value={form.enrollmentEndDate} onChange={e => updateField('enrollmentEndDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Start</label>
                            <input type="datetime-local" value={form.courseStartDate} onChange={e => updateField('courseStartDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course End</label>
                            <input type="datetime-local" value={form.courseEndDate} onChange={e => updateField('courseEndDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Duration</label>
                            <input type="number" min="0" value={form.estimatedDuration} onChange={e => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Value" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                            <select value={form.estimatedDurationUnit} onChange={e => updateField('estimatedDurationUnit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                {DURATION_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modules */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Modules</h2>
                    {form.modules.length > 0 && (
                        <div className="space-y-1.5">
                            {form.modules.map(id => (
                                <div key={id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm">
                                    <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">Module #{String(id).slice(0, 8)}</span>
                                    <button onClick={() => removeModule(id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div>
                        <input type="text" value={moduleSearch} onChange={e => setModuleSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Search modules to add..." />
                        {moduleResults.length > 0 && (
                            <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                {moduleResults.map((opt: any) => (
                                    <button key={opt.id} onClick={() => addModule(opt.id)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                        {opt.title || opt.name || `#${opt.id}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Learning Objectives & Prerequisites */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Learning Objectives & Prerequisites</h2>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Objectives</label>
                            <button onClick={() => updateField('learningObjectives', [...form.learningObjectives, ''])}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                                Add Objective
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.learningObjectives.map((obj, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={obj} onChange={e => { const u = [...form.learningObjectives]; u[i] = e.target.value; updateField('learningObjectives', u); }}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="e.g. Understand React fundamentals" />
                                    <button onClick={() => updateField('learningObjectives', form.learningObjectives.filter((_, idx) => idx !== i))}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prerequisites</label>
                            <button onClick={() => updateField('prerequisites', [...form.prerequisites, ''])}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                                Add Prerequisite
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.prerequisites.map((pr, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={pr} onChange={e => { const u = [...form.prerequisites]; u[i] = e.target.value; updateField('prerequisites', u); }}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="e.g. Basic JavaScript" />
                                    <button onClick={() => updateField('prerequisites', form.prerequisites.filter((_, idx) => idx !== i))}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* === SIDEBAR === */}
            <div className="space-y-6">
                {/* Settings */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
                        <select value={form.difficultyLevel} onChange={e => updateField('difficultyLevel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                            {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                        <select value={form.language} onChange={e => updateField('language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                            {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Grade (%)</label>
                        <input type="number" min="0" max="100" value={form.passingGrade} onChange={e => updateField('passingGrade', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evaluation Mode</label>
                        <select value={form.evaluationMode} onChange={e => updateField('evaluationMode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                            {EVALUATION_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Publishing (edit mode only) */}
                {mode === 'edit' && course && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Published At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {course.publishedAt ? new Date(course.publishedAt).toLocaleString() : 'Not published'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {course.updatedAt ? new Date(course.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {course.createdAt ? new Date(course.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Course ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{courseId}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {error}
                        <button onClick={onClearError} className="ml-1 hover:bg-red-700 rounded p-0.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Success */}
            {saveSuccess && (
                <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        {mode === 'create' ? 'Course created successfully — redirecting...' : 'Course saved successfully'}
                        <button onClick={onClearError} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
            )}

        </div>
        </form>
    );
}
