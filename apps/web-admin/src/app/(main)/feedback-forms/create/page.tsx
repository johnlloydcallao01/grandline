'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save } from '@/components/ui/IconWrapper';
import { createForm, type FormFieldBlock } from '../actions';
import FeedbackFormBlockEditor from '@/components/cms/FeedbackFormBlockEditor';

export default function CreateFeedbackFormPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormFieldBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            const payload: Record<string, any> = {
                title: title.trim(),
                fields: fields.map(f => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...rest } = f as any;
                    return rest;
                }),
            };

            if (description.trim()) {
                payload.description = description.trim();
            }

            const created: any = await createForm(payload as any);
            setSaveSuccess(true);
            setTimeout(() => router.push(`/feedback-forms/${created.id}/edit`), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to create form');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/feedback-forms" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Form</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create a new feedback form</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/feedback-forms" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Creating...' : 'Create Form'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                            <input type="text" value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="e.g. Course Feedback, Satisfaction Survey" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Brief description of this form..." />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Form Fields</h2>
                        <FeedbackFormBlockEditor
                            fields={fields}
                            onChange={setFields}
                            error={error}
                            saveSuccess={saveSuccess}
                            onClearError={() => setError(null)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Title</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{title || '(no title)'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Fields</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{fields.length} field{fields.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
