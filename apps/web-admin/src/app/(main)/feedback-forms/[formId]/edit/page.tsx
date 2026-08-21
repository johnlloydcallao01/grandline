'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, FileText, AlertTriangle } from '@/components/ui/IconWrapper';
import { getFormById, updateForm } from '../../actions';
import type { FeedbackFormDoc, FeedbackFormPayload, FormFieldBlock } from '@encreasl/cms-types';
import FeedbackFormBlockEditor from '@/components/cms/FeedbackFormBlockEditor';

export default function EditFeedbackFormPage() {
    const params = useParams();
    const formId = params.formId as string;

    const [form, setForm] = useState<FeedbackFormDoc | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormFieldBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const loadForm = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getFormById(formId);
            setForm(data);
            setTitle(data.title || '');
            setDescription(data.description || '');
            setFields((data.fields || []) as FormFieldBlock[]);
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load form'));
        } finally {
            setIsLoading(false);
        }
    }, [formId]);

    useEffect(() => { loadForm(); }, [loadForm]);

    const handleSave = async () => {
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            setIsSaving(true);
            setSaveSuccess(false);

            const payload: FeedbackFormPayload = {
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

            await updateForm(formId, payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save form');
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
                        <div><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-48" /><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mt-1.5" /></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                        <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
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
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Form Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">This feedback form does not exist or has been removed.</p>
                    <Link href="/feedback-forms" className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Forms
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
                        <button onClick={loadForm} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium">Retry</button>
                        <Link href="/feedback-forms" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)] text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/feedback-forms" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Form</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{form?.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/feedback-forms" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
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
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Title</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{title || '(untitled)'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Fields</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{fields.length} field{fields.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {form?.updatedAt ? new Date(form.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {form?.createdAt ? new Date(form.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Form ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{formId}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
