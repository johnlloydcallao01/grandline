'use client';

import React, { useState } from 'react';
import {
    X, Plus, Trash2, CheckCircle, AlertTriangle
} from '@/components/ui/IconWrapper';

const TYPE_OPTIONS = [
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True / False' },
];

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'deprecated', label: 'Deprecated' },
];

interface OptionEntry {
    id: string;
    label: string;
    isCorrect: boolean;
}

interface QuestionFormProps {
    mode: 'create' | 'edit';
    questionId?: string;
    question?: any;
    initialData?: {
        prompt?: string;
        type?: string;
        explanation?: string;
        difficulty?: string;
        status?: string;
        tags?: string;
        trueFalseCorrect?: 'true' | 'false';
        options?: OptionEntry[];
    };
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function QuestionForm({
    mode,
    questionId,
    question,
    initialData,
    isSaving: _isSaving,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: QuestionFormProps) {
    const [prompt, setPrompt] = useState(initialData?.prompt || '');
    const [type, setType] = useState(initialData?.type || 'single_choice');
    const [explanation, setExplanation] = useState(initialData?.explanation || '');
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'medium');
    const [status, setStatus] = useState(initialData?.status || 'active');
    const [tagsInput, setTagsInput] = useState(initialData?.tags || '');
    const [trueFalseCorrect, setTrueFalseCorrect] = useState<'true' | 'false'>(initialData?.trueFalseCorrect || 'true');
    const [options, setOptions] = useState<OptionEntry[]>(initialData?.options || [{ id: '1', label: '', isCorrect: false }]);

    const isTrueFalse = type === 'true_false';
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const addOption = () => {
        setOptions(prev => [...prev, { id: Math.random().toString(36).slice(2, 9), label: '', isCorrect: false }]);
    };

    const removeOption = (id: string) => {
        if (options.length <= 1) return;
        setOptions(prev => prev.filter(o => o.id !== id));
    };

    const updateOption = (id: string, field: keyof OptionEntry, value: any) => {
        setOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        if (!isTrueFalse && options.some(o => !o.label.trim())) return;
        if (!isTrueFalse && !options.some(o => o.isCorrect)) return;

        const payload: Record<string, any> = {
            prompt: prompt.trim(),
            type,
            explanation: explanation.trim() || undefined,
            difficulty,
            status,
            tags: tags.length > 0 ? tags : [],
            trueFalseCorrect: isTrueFalse ? trueFalseCorrect : undefined,
            options: isTrueFalse ? undefined : options.map(o => ({
                label: o.label.trim(),
                isCorrect: o.isCorrect,
            })),
        };

        await onSave(payload);
    };

    return (
        <form id="question-form" onSubmit={handleSubmit} className="contents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* === MAIN CONTENT === */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prompt */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Question</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt *</label>
                            <textarea
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Enter the question text..."
                            />
                        </div>
                    </div>

                    {/* Type & Options */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Type & Options</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type *</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            >
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {isTrueFalse ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer *</label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${trueFalseCorrect === 'true' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                                        <input type="radio" name="tfCorrect" value="true" checked={trueFalseCorrect === 'true'}
                                            onChange={() => setTrueFalseCorrect('true')} className="sr-only" />
                                        True
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${trueFalseCorrect === 'false' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                                        <input type="radio" name="tfCorrect" value="false" checked={trueFalseCorrect === 'false'}
                                            onChange={() => setTrueFalseCorrect('false')} className="sr-only" />
                                        False
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options *</label>
                                    <button onClick={addOption} type="button"
                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                                        <Plus className="h-3 w-3" />
                                        Add Option
                                    </button>
                                </div>
                                {options.map((opt, idx) => (
                                    <div key={opt.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex-1 space-y-1">
                                            <input type="text" value={opt.label}
                                                onChange={e => updateOption(opt.id, 'label', e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                                        </div>
                                        <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${opt.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' : 'bg-white dark:bg-[var(--card-background)] border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                                            <input type={type === 'single_choice' ? 'radio' : 'checkbox'} name="correctOption"
                                                checked={opt.isCorrect}
                                                onChange={e => {
                                                    if (type === 'single_choice') {
                                                        setOptions(prev => prev.map(o => ({ ...o, isCorrect: o.id === opt.id })));
                                                    } else {
                                                        updateOption(opt.id, 'isCorrect', e.target.checked);
                                                    }
                                                }}
                                                className="sr-only" />
                                            {opt.isCorrect ? 'Correct' : 'Mark Correct'}
                                        </label>
                                        <button onClick={() => removeOption(opt.id)} disabled={options.length <= 1} type="button"
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Explanation</h2>
                        <textarea
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Explain why the correct answer is right (shown after answering)..."
                        />
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Tags</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                            <input type="text" value={tagsInput}
                                onChange={e => setTagsInput(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="e.g. react, hooks, beginner" />
                            {tags.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* === SIDEBAR === */}
                <div className="space-y-6">
                    {/* Settings */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty *</label>
                            <select value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                {DIFFICULTY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                            <select value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Summary (create mode) */}
                    {mode === 'create' && (
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{TYPE_OPTIONS.find(o => o.value === type)?.label}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{DIFFICULTY_OPTIONS.find(o => o.value === difficulty)?.label}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{STATUS_OPTIONS.find(o => o.value === status)?.label}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Options</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{isTrueFalse ? '2 (True / False)' : `${options.length} option${options.length !== 1 ? 's' : ''}`}</p>
                            </div>
                        </div>
                    )}

                    {/* Publishing (edit mode) */}
                    {mode === 'edit' && (
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {question?.updatedAt ? new Date(question.updatedAt).toLocaleString() : '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {question?.createdAt ? new Date(question.createdAt).toLocaleString() : '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Question ID</span>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{questionId}</p>
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
                            <button onClick={onClearError} className="ml-1 hover:bg-red-700 rounded p-0.5"><X className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                )}

                {/* Success Toast */}
                {saveSuccess && (
                    <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            {mode === 'create' ? 'Question created successfully — redirecting...' : 'Question saved successfully'}
                            <button onClick={onClearError} className="ml-1 hover:bg-green-700 rounded p-0.5"><X className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
