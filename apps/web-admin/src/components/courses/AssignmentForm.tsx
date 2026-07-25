'use client';

import React, { useState } from 'react';
import {
    X, Plus, CheckCircle, AlertTriangle
} from '@/components/ui/IconWrapper';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

const SUBMISSION_TYPE_OPTIONS = [
    { value: 'file_upload', label: 'File Upload Only' },
    { value: 'text_entry', label: 'Text Entry Only' },
    { value: 'both', label: 'Both (Text & File)' },
];

const FILE_TYPE_OPTIONS = [
    { value: 'pdf', label: 'PDF' },
    { value: 'word', label: 'Word (DOC/DOCX)' },
    { value: 'excel', label: 'Excel (XLS/XLSX)' },
    { value: 'powerpoint', label: 'PowerPoint (PPT/PPTX)' },
    { value: 'images', label: 'Images (JPG/PNG)' },
    { value: 'zip', label: 'ZIP Archives' },
];

interface FormState {
    title: string;
    description: unknown;
    attachments: string[];
    maxScore: number;
    passingScore: number;
    submissionType: string;
    allowedFileTypes: string[];
    dueDate: string;
}

const DEFAULTS: FormState = {
    title: '',
    description: '',
    attachments: [],
    maxScore: 100,
    passingScore: 75,
    submissionType: 'both',
    allowedFileTypes: [],
    dueDate: '',
};

interface AssignmentFormProps {
    mode: 'create' | 'edit';
    assignmentId?: string;
    assignment?: any;
    initialData?: Partial<FormState>;
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function AssignmentForm({
    mode,
    assignmentId,
    assignment,
    initialData,
    isSaving: _isSaving,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: AssignmentFormProps) {
    const [form, setForm] = useState<FormState>(() => initialData ? { ...DEFAULTS, ...initialData } : { ...DEFAULTS });

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const showFileTypes = form.submissionType === 'file_upload' || form.submissionType === 'both';

    const toggleFileType = (value: string) => {
        setForm(prev => ({
            ...prev,
            allowedFileTypes: prev.allowedFileTypes.includes(value)
                ? prev.allowedFileTypes.filter(v => v !== value)
                : [...prev.allowedFileTypes, value],
        }));
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) return;

        let description: any = form.description || undefined;
        if (description && typeof description === 'string') {
            try { description = JSON.parse(description); } catch { /* empty */ }
        }

        const payload: Record<string, any> = {
            title: form.title,
            maxScore: form.maxScore,
            passingScore: form.passingScore,
            submissionType: form.submissionType,
        };

        if (description) payload.description = description;
        if (form.attachments.filter(Boolean).length > 0) payload.attachments = form.attachments.filter(Boolean);
        if (showFileTypes && form.allowedFileTypes.length > 0) payload.allowedFileTypes = form.allowedFileTypes;
        if (form.dueDate) payload.dueDate = form.dueDate;

        await onSave(payload);
    };

    return (
        <form id="assignment-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="contents">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* === MAIN CONTENT === */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                        <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="e.g. Week 1 Essay: React Fundamentals" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <RichTextEditor
                            value={form.description}
                            onChange={(json) => updateField('description', json)}
                            placeholder="Detailed instructions, rubrics, and prompts..." />
                    </div>
                </div>

                {/* Attachments */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Attachments</h2>
                        <button type="button" onClick={() => updateField('attachments', [...form.attachments, ''])}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5" />Add Attachment
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Downloadable templates or reference files for the student</p>
                    {form.attachments.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No attachments added</p>
                    ) : (
                        <div className="space-y-2">
                            {form.attachments.map((url, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={url}
                                        onChange={e => {
                                            const u = [...form.attachments];
                                            u[i] = e.target.value;
                                            updateField('attachments', u);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                                        placeholder="Cloudinary or media URL..." />
                                    <button type="button" onClick={() => updateField('attachments', form.attachments.filter((_, idx) => idx !== i))}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"><X className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submission Settings */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Submission Settings</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submission Type *</label>
                        <select value={form.submissionType} onChange={e => updateField('submissionType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                            {SUBMISSION_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    {showFileTypes && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed File Types</label>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Select which file types trainees may upload</p>
                            <div className="flex flex-wrap gap-2">
                                {FILE_TYPE_OPTIONS.map(ft => (
                                    <button key={ft.value} type="button" onClick={() => toggleFileType(ft.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.allowedFileTypes.includes(ft.value) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        {ft.label}
                                    </button>
                                ))}
                            </div>
                            {form.allowedFileTypes.length === 0 && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">No file types selected — all types will be allowed.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* === SIDEBAR === */}
            <div className="space-y-6">
                {/* Grading */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Grading</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Score *</label>
                        <input type="number" min="1" value={form.maxScore}
                            onChange={e => updateField('maxScore', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score *</label>
                        <input type="number" min="0" max={form.maxScore} value={form.passingScore}
                            onChange={e => updateField('passingScore', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                </div>

                {/* Due Date */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Due Date</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date (optional)</label>
                        <input type="datetime-local" value={form.dueDate}
                            onChange={e => updateField('dueDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Optional deadline for submission</p>
                    </div>
                </div>

                {/* Summary (create mode) */}
                {mode === 'create' && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Max Score</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.maxScore}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Passing Score</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.passingScore}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Submission Type</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">
                                {SUBMISSION_TYPE_OPTIONS.find(o => o.value === form.submissionType)?.label}
                            </p>
                        </div>
                    </div>
                )}

                {/* Publishing (edit mode only) */}
                {mode === 'edit' && assignment && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {assignment.updatedAt ? new Date(assignment.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {assignment.createdAt ? new Date(assignment.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Assignment ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{assignmentId}</p>
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
                        {mode === 'create' ? 'Assignment created successfully — redirecting...' : 'Assignment saved successfully'}
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
