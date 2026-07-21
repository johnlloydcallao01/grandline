'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Save, Loader2, X, CheckCircle, AlertTriangle, HelpCircle, Plus, Trash2
} from '@/components/ui/IconWrapper';
import {
    getQuestionById, updateQuestion,
    type QuestionDoc
} from '../../actions';

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

export default function EditQuestionPage() {
    const params = useParams();
    const questionId = params.questionId as string;

    const [question, setQuestion] = useState<QuestionDoc | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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
    const [options, setOptions] = useState<OptionEntry[]>([]);

    const isTrueFalse = type === 'true_false';

    const loadQuestion = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getQuestionById(questionId);
            setQuestion(data);

            setPrompt(data.prompt || '');
            setType(data.type || 'single_choice');
            setExplanation(data.explanation || '');
            setDifficulty(data.difficulty || 'medium');
            setStatus(data.status || 'active');
            setTagsInput(data.tags?.join(', ') || '');

            if (data.type === 'true_false') {
                setTrueFalseCorrect(data.trueFalseCorrect || 'true');
                setOptions([]);
            } else {
                setOptions((data.options || []).map(o => ({
                    id: Math.random().toString(36).slice(2, 9),
                    label: o.label || '',
                    isCorrect: o.isCorrect || false,
                })));
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load question'));
        } finally {
            setIsLoading(false);
        }
    }, [questionId]);

    useEffect(() => { loadQuestion(); }, [loadQuestion]);

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

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const handleSave = async () => {
        if (!prompt.trim()) return;
        if (!isTrueFalse && options.some(o => !o.label.trim())) return;
        if (!isTrueFalse && !options.some(o => o.isCorrect)) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            await updateQuestion(questionId, {
                prompt: prompt.trim(),
                type: type as QuestionDoc['type'],
                explanation: explanation.trim() || undefined,
                difficulty: difficulty as QuestionDoc['difficulty'],
                status: status as QuestionDoc['status'],
                tags: tags.length > 0 ? tags : [],
                trueFalseCorrect: isTrueFalse ? trueFalseCorrect : undefined,
                options: isTrueFalse ? undefined : options.map(o => ({
                    label: o.label.trim(),
                    isCorrect: o.isCorrect,
                })),
            } as any);

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save question');
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
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                                <div className="h-4 bg-gray-100 rounded w-32" />
                                <div className="h-20 bg-gray-100 rounded w-full" />
                                <div className="h-10 bg-gray-100 rounded w-full" />
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
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><HelpCircle className="h-8 w-8 text-gray-400" /></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Question Not Found</h2>
                    <p className="text-gray-500 mb-6">This question does not exist or has been removed.</p>
                    <Link href="/courses/questions" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Questions
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
                        <button onClick={loadQuestion} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Retry</button>
                        <Link href="/courses/questions" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Back</Link>
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
                    <Link href="/courses/questions" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{question?.prompt}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses/questions" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving || !prompt.trim() || (!isTrueFalse && options.some(o => !o.label.trim())) || (!isTrueFalse && !options.some(o => o.isCorrect))}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {error && error !== 'not-found' && (
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
                            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                                <span className="text-sm text-gray-900 font-medium">{TYPE_OPTIONS.find(o => o.value === type)?.label}</span>
                                <span className="text-xs text-gray-400">(type cannot be changed)</span>
                            </div>
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
                            placeholder="Explain why the correct answer is right..." />
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

                    {/* Publishing Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500">Last Updated</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {question?.updatedAt ? new Date(question.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Created At</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {question?.createdAt ? new Date(question.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Question ID</span>
                            <p className="text-xs text-gray-400 font-mono break-all bg-gray-50 p-2 rounded mt-1">{questionId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Question saved successfully
                        <button onClick={() => setSaveSuccess(false)} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
