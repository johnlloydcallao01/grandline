'use client';

import React, { useState } from 'react';
import {
    X, CheckCircle, AlertTriangle
} from '@/components/ui/IconWrapper';

interface FormState {
    name: string;
    slug: string;
    description: string;
    colorCode: string;
    displayOrder: number;
    isActive: boolean;
}

const DEFAULTS: FormState = {
    name: '',
    slug: '',
    description: '',
    colorCode: '',
    displayOrder: 0,
    isActive: true,
};

interface PostCategoryFormProps {
    mode: 'create' | 'edit';
    categoryId?: string;
    category?: any;
    initialData?: Partial<FormState>;
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function PostCategoryForm({
    mode,
    categoryId,
    category,
    initialData,
    isSaving: _isSaving,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: PostCategoryFormProps) {
    const [form, setForm] = useState<FormState>(() => initialData ? { ...DEFAULTS, ...initialData } : { ...DEFAULTS });

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;

        const payload: Record<string, any> = {
            name: form.name.trim(),
            isActive: form.isActive,
        };

        if (form.slug.trim()) payload.slug = form.slug.trim();
        if (form.description.trim()) payload.description = form.description.trim();
        if (form.colorCode.trim()) payload.colorCode = form.colorCode.trim();
        if (form.displayOrder > 0) payload.displayOrder = form.displayOrder;

        await onSave(payload);
    };

    return (
        <form id="post-category-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="contents">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* === MAIN CONTENT === */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                        <input type="text" value={form.name}
                            onChange={e => {
                                updateField('name', e.target.value);
                                if (mode === 'create' && !form.slug) {
                                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                    updateField('slug', slug);
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="e.g. Technology, Maritime News" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                        <input type="text" value={form.slug}
                            onChange={e => updateField('slug', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                            placeholder="e.g. technology" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">URL-friendly identifier. Auto-generated from name if left empty.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea value={form.description}
                            onChange={e => updateField('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Brief description of this category..." />
                    </div>
                </div>
            </div>

            {/* === SIDEBAR === */}
            <div className="space-y-6">
                {/* Status & Styling */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Status & Styling</h2>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={e => updateField('isActive', e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 bg-white dark:bg-[var(--card-background)]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Code</label>
                        <div className="flex items-center gap-2">
                            {form.colorCode && (
                                <div className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-600 shrink-0" style={{ backgroundColor: form.colorCode }} />
                            )}
                            <input type="text" value={form.colorCode}
                                onChange={e => updateField('colorCode', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                                placeholder="#3B82F6" />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hex color for category theming</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                        <input type="number" min="0" value={form.displayOrder}
                            onChange={e => updateField('displayOrder', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="0" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Lower numbers appear first</p>
                    </div>
                </div>

                {/* Summary (create mode) */}
                {mode === 'create' && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Slug</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1 font-mono text-xs">{form.slug || '(auto)'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                )}

                {/* Publishing (edit mode only) */}
                {mode === 'edit' && category && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Slug</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium font-mono text-xs mt-1">{category.slug}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {category.updatedAt ? new Date(category.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {category.createdAt ? new Date(category.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Category ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{categoryId}</p>
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
                        {mode === 'create' ? 'Category created successfully — redirecting...' : 'Category saved successfully'}
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
