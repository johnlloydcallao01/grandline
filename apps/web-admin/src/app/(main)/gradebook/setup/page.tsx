'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Plus, Edit, Trash2, X, Save, Loader2, Settings, AlertTriangle
} from '@/components/ui/IconWrapper';
import {
    getGradeScalesList, createGradeScale, updateGradeScale, deleteGradeScale,
    type GradeScaleDoc, type GradeGrade
} from '../actions';

interface FormData {
    title: string;
    description: string;
    grades: GradeGrade[];
}

const emptyGrade = (): GradeGrade => ({ label: '', minScore: 0, maxScore: 100, gpaValue: null, description: '' });

function initForm(scale?: GradeScaleDoc | null): FormData {
    return {
        title: scale?.title || '',
        description: scale?.description || '',
        grades: scale?.grades?.length ? scale.grades.map(g => ({ ...g })) : [emptyGrade()],
    };
}

export default function GradeSetupPage() {
    const [scales, setScales] = useState<GradeScaleDoc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingScale, setEditingScale] = useState<GradeScaleDoc | null>(null);
    const [form, setForm] = useState<FormData>(initForm());
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<GradeScaleDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadScales = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getGradeScalesList();
            setScales(data.docs || []);
        } catch {
            setError('Failed to load grade scales');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadScales(); }, [loadScales]);

    function openCreate() {
        setEditingScale(null);
        setForm(initForm());
        setFormError(null);
        setShowForm(true);
    }

    function openEdit(scale: GradeScaleDoc) {
        setEditingScale(scale);
        setForm(initForm(scale));
        setFormError(null);
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingScale(null);
    }

    function updateField(field: keyof FormData, value: any) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function updateGrade(index: number, field: keyof GradeGrade, value: any) {
        setForm(prev => {
            const grades = [...prev.grades];
            grades[index] = { ...grades[index], [field]: value };
            return { ...prev, grades };
        });
    }

    function addGrade() {
        setForm(prev => ({ ...prev, grades: [...prev.grades, emptyGrade()] }));
    }

    function removeGrade(index: number) {
        setForm(prev => {
            const grades = prev.grades.filter((_, i) => i !== index);
            return { ...prev, grades: grades.length ? grades : [emptyGrade()] };
        });
    }

    async function handleSave() {
        if (!form.title.trim()) { setFormError('Title is required'); return; }
        for (let i = 0; i < form.grades.length; i++) {
            const g = form.grades[i];
            if (!g.label.trim()) { setFormError(`Grade #${i + 1} label is required`); return; }
            if (g.minScore == null || g.maxScore == null) { setFormError(`Grade #${i + 1} score range is incomplete`); return; }
            if (g.minScore > g.maxScore) { setFormError(`Grade #${i + 1}: min score cannot exceed max score`); return; }
        }

        try {
            setIsSaving(true);
            setFormError(null);
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                grades: form.grades,
            };
            if (editingScale) {
                await updateGradeScale(editingScale.id, payload);
            } else {
                await createGradeScale(payload);
            }
            closeForm();
            await loadScales();
        } catch (err: any) {
            setFormError(err.message || 'Failed to save grade scale');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteGradeScale(deleteTarget.id);
            setDeleteTarget(null);
            await loadScales();
        } catch (err: any) {
            setError(err.message || 'Failed to delete grade scale');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grade Setup</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage grade scales for mapping percentage scores to letter grades</p>
                </div>
                <button onClick={openCreate}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors gap-2">
                    <Plus className="h-4 w-4" />
                    Create Grade Scale
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"><X className="h-3 w-3" /></button>
                </div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grades</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8 mx-auto" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-64" /></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : scales.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No grade scales yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Create your first grade scale to define how percentage scores map to letter grades.</p>
                    <button onClick={openCreate}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 gap-2">
                        <Plus className="h-4 w-4" />
                        Create Grade Scale
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grades</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {scales.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                                <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {s.grades?.length || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {s.description || <span className="italic">No description</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(s)}
                                                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setDeleteTarget(s)}
                                                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12">
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={closeForm} />
                    <div className="relative bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingScale ? 'Edit Grade Scale' : 'Create Grade Scale'}
                            </h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {formError && (
                                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                <input type="text" value={form.title}
                                    onChange={e => updateField('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                    placeholder="e.g., Standard A-F, Pass/Fail" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea value={form.description}
                                    onChange={e => updateField('description', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] resize-none"
                                    placeholder="Optional description of this grading scheme" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade Ranges *</label>
                                    <button onClick={addGrade}
                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Add Grade
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {form.grades.map((g, i) => (
                                        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade #{i + 1}</span>
                                                <button onClick={() => removeGrade(i)}
                                                    className="p-1 rounded text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Label *</label>
                                                    <input type="text" value={g.label}
                                                        onChange={e => updateGrade(i, 'label', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                                        placeholder="e.g., A, B+, Pass" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">GPA Value</label>
                                                    <input type="number" step="0.1" min="0" max="4" value={g.gpaValue ?? ''}
                                                        onChange={e => updateGrade(i, 'gpaValue', e.target.value ? Number(e.target.value) : null)}
                                                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                                        placeholder="e.g., 4.0" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Score *</label>
                                                    <input type="number" min="0" max="100" value={g.minScore}
                                                        onChange={e => updateGrade(i, 'minScore', Number(e.target.value))}
                                                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Score *</label>
                                                    <input type="number" min="0" max="100" value={g.maxScore}
                                                        onChange={e => updateGrade(i, 'maxScore', Number(e.target.value))}
                                                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description</label>
                                                    <input type="text" value={g.description || ''}
                                                        onChange={e => updateGrade(i, 'description', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                                        placeholder="Optional description" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[var(--card-background)] border-t border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-end gap-3">
                            <button onClick={closeForm}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? 'Saving...' : editingScale ? 'Update Grade Scale' : 'Create Grade Scale'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-xl w-full max-w-md p-6 z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-full bg-red-50 dark:bg-red-900/30">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Delete Grade Scale</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Are you sure you want to delete <strong className="text-gray-700 dark:text-gray-300">&ldquo;{deleteTarget.title}&rdquo;</strong>?
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 pl-11">
                            Courses using this grade scale will have their reference set to null. This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[var(--card-background)]">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
