'use client';

import React, { useEffect, useState } from 'react';
import {
    X, CheckCircle, AlertTriangle
} from '@/components/ui/IconWrapper';
import {
    getModuleOptions,
} from '@/app/(main)/courses/lessons/actions';
import type { LessonDoc, LessonModuleOption } from '@encreasl/cms-types';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

interface FormState {
    title: string;
    module: string;
    moduleSearch: string;
    moduleLabel: string;
    description: unknown;
    estimatedDuration: number;
}

const DEFAULTS: FormState = {
    title: '', module: '', moduleSearch: '', moduleLabel: '',
    description: '', estimatedDuration: 0,
};

interface LessonFormProps {
    mode: 'create' | 'edit';
    lessonId?: string;
    lesson?: LessonDoc | null;
    initialData?: Partial<FormState>;
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function LessonForm({
    mode,
    lessonId,
    lesson,
    initialData,
    isSaving: _isSaving,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: LessonFormProps) {
    const [form, setForm] = useState<FormState>(() => initialData ? { ...DEFAULTS, ...initialData } : { ...DEFAULTS });
    const [moduleOptions, setModuleOptions] = useState<LessonModuleOption[]>([]);

    useEffect(() => {
        getModuleOptions().then(setModuleOptions).catch(() => {});
    }, []);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const filteredModules = form.moduleSearch
        ? moduleOptions.filter(m => m.title.toLowerCase().includes(form.moduleSearch.toLowerCase()))
        : moduleOptions;

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.module) return;
        let description: any = form.description || undefined;
        if (description && typeof description === 'string') {
            try { description = JSON.parse(description); } catch { /* empty */ }
        }
        const payload: Record<string, any> = {
            title: form.title,
            module: form.module || undefined,
            description,
            estimatedDuration: form.estimatedDuration > 0 ? form.estimatedDuration : undefined,
        };
        await onSave(payload);
    };

    return (
        <form id="lesson-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="contents">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* === MAIN CONTENT === */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                        <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module *</label>
                        <input type="text" value={form.moduleSearch}
                            onChange={e => { updateField('moduleSearch', e.target.value); if (e.target.value !== form.moduleLabel) updateField('module', ''); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Search modules..." />
                        {form.moduleSearch !== form.moduleLabel && filteredModules.length > 0 && (
                            <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                {filteredModules.map(mod => (
                                    <button key={mod.id}
                                        onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                        {mod.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        {!form.moduleSearch && (
                            <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                {moduleOptions.map(mod => (
                                    <button key={mod.id}
                                        onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        {mod.title}
                                    </button>
                                ))}
                                {moduleOptions.length === 0 && (
                                    <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No modules available</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Description</h2>
                    <RichTextEditor
                        value={form.description}
                        onChange={(json) => updateField('description', json)}
                        placeholder="Lesson content with rich formatting..." />
                </div>

                {/* Settings */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Duration (minutes)</label>
                        <input type="number" min="0" value={form.estimatedDuration || ''} onChange={e => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="e.g. 30" />
                    </div>
                </div>
            </div>

            {/* === SIDEBAR === */}
            <div className="space-y-6">
                {/* Summary (create mode) */}
                {mode === 'create' && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Module</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.moduleLabel || 'Not selected'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Duration</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.estimatedDuration ? `${form.estimatedDuration} min` : 'Not set'}</p>
                        </div>
                    </div>
                )}

                {/* Module Info (edit mode) */}
                {mode === 'edit' && form.module && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Module</h2>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{form.moduleLabel || `#${form.module}`}</p>
                    </div>
                )}

                {/* Publishing (edit mode only) */}
                {mode === 'edit' && lesson && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {lesson.createdAt ? new Date(lesson.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Lesson ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{lessonId}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Toast */}
            {error && (
                <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                        <button onClick={onClearError} className="ml-1 hover:bg-red-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {saveSuccess && (
                <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {mode === 'create' ? 'Lesson created successfully — redirecting...' : 'Lesson saved successfully'}
                        <button onClick={onClearError} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
        </form>
    );
}
