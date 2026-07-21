'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Save, Loader2, X, CheckCircle, AlertTriangle, Plus, Trash2
} from '@/components/ui/IconWrapper';
import { createQuestion } from '../actions';

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

export default function CreateQuestionPage() {
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [prompt, setPrompt] = useState('');
    const [type, setType] = useState('single_choice');
    const [explanation, setExplanation] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [status, setStatus] = useState('active');
    const [tagsInput, setTagsInput] = useState('');
    const [trueFalseCorrect, setTrueFalseCorrect] = useState<'true' | 'false'>('true');
    const [options, setOptions] = useState<OptionEntry[]>([
        { id: '1', label: '', isCorrect: false },
    ]);

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

    const handleSave = async () => {
        if (!prompt.trim()) return;
        if (!isTrueFalse && options.some(o => !o.label.trim())) return;
        if (!isTrueFalse && !options.some(o => o.isCorrect)) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            const created = await createQuestion({
                prompt: prompt.trim(),
                type,
                explanation: explanation.trim() || undefined,
                difficulty,
                status,
                tags: tags.length > 0 ? tags : undefined,
                trueFalseCorrect: isTrueFalse ? trueFalseCorrect : undefined,
                options: isTrueFalse ? undefined : options.map(o => ({
                    label: o.label.trim(),
                    isCorrect: o.isCorrect,
                })),
            });

            setSaveSuccess(true);
            setTimeout(() => {
                router.push(`/courses/questions/${created.id}/edit`);
            }, 800);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create question');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/courses/questions" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Question</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Add a new question to the question bank</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses/questions" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving || !prompt.trim() || (!isTrueFalse && options.some(o => !o.label.trim())) || (!isTrueFalse && !options.some(o => o.isCorrect))}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Creating...' : 'Create Question'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* === MAIN CONTENT === */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prompt */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Question</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt *</label>
                            <textarea value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Enter the question text..." />
                        </div>
                    </div>

                    {/* Type & Options */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Type & Options</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type *</label>
                            <select value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {isTrueFalse ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${trueFalseCorrect === 'true' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                                        <input type="radio" name="tfCorrect" value="true" checked={trueFalseCorrect === 'true'}
                                            onChange={() => setTrueFalseCorrect('true')} className="sr-only" />
                                        True
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${trueFalseCorrect === 'false' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                                        <input type="radio" name="tfCorrect" value="false" checked={trueFalseCorrect === 'false'}
                                            onChange={() => setTrueFalseCorrect('false')} className="sr-only" />
                                        False
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Options *</label>
                                    <button onClick={addOption}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                        <Plus className="h-3 w-3" />
                                        Add Option
                                    </button>
                                </div>
                                {options.map((opt, idx) => (
                                    <div key={opt.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 space-y-1">
                                            <input type="text" value={opt.label}
                                                onChange={e => updateOption(opt.id, 'label', e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                                        </div>
                                        <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${opt.isCorrect ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
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
                                        <button onClick={() => removeOption(opt.id)} disabled={options.length <= 1}
                                            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Explanation</h2>
                        <textarea value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Explain why the correct answer is right (shown after answering)..." />
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Tags</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                            <input type="text" value={tagsInput}
                                onChange={e => setTagsInput(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="e.g. react, hooks, beginner" />
                            {tags.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* === SIDEBAR === */}
                <div className="space-y-6">
                    {/* Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900">Settings</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                            <select value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {DIFFICULTY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500">Type</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{TYPE_OPTIONS.find(o => o.value === type)?.label}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Difficulty</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{DIFFICULTY_OPTIONS.find(o => o.value === difficulty)?.label}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Status</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{STATUS_OPTIONS.find(o => o.value === status)?.label}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Options</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{isTrueFalse ? '2 (True / False)' : `${options.length} option${options.length !== 1 ? 's' : ''}`}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Question created successfully — redirecting...
                        <button onClick={() => setSaveSuccess(false)} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
