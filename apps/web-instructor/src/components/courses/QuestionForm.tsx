'use client';

import React, { useState } from 'react';

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

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /></svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

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
    const [tags, setTags] = useState(initialData?.tags || '');
    const [trueFalseCorrect, setTrueFalseCorrect] = useState<'true' | 'false'>(initialData?.trueFalseCorrect || 'true');
    const [options, setOptions] = useState<OptionEntry[]>(initialData?.options || []);

    const addOption = () => {
        setOptions([...options, { id: Math.random().toString(36).slice(2, 9), label: '', isCorrect: false }]);
    };

    const removeOption = (id: string) => {
        setOptions(options.filter(o => o.id !== id));
    };

    const updateOption = (id: string, field: keyof OptionEntry, value: any) => {
        setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        if (newType === 'true_false') {
            setOptions([]);
        } else if (options.length === 0) {
            addOption();
        }
    };

    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        const payload: Record<string, any> = {
            prompt,
            type,
            difficulty,
            status,
        };

        if (explanation) payload.explanation = explanation;
        if (tags) payload.tags = tags.split(',').map(t => t.trim()).filter(Boolean);

        if (type === 'true_false') {
            payload.trueFalseCorrect = trueFalseCorrect;
        } else {
            payload.options = options.filter(o => o.label.trim());
        }

        await onSave(payload);
    };

    return (
        <form
            id="question-form"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            className="contents"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Question Prompt *
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Enter your question..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type *
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                >
                                    {TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Difficulty *
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                >
                                    {DIFFICULTY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Answer Options */}
                    {type === 'true_false' ? (
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Correct Answer</h2>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="trueFalse"
                                        value="true"
                                        checked={trueFalseCorrect === 'true'}
                                        onChange={() => setTrueFalseCorrect('true')}
                                        className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">True</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="trueFalse"
                                        value="false"
                                        checked={trueFalseCorrect === 'false'}
                                        onChange={() => setTrueFalseCorrect('false')}
                                        className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">False</span>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Answer Options *</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {type === 'single_choice' ? 'Select one correct answer' : 'Select all correct answers'}
                                </p>
                            </div>
                            {options.length > 0 && (
                                <div className="space-y-3">
                                    {options.map((option, index) => (
                                        <div key={option.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-[var(--card-border)] rounded-lg">
                                            <input
                                                type={type === 'single_choice' ? 'radio' : 'checkbox'}
                                                name={type === 'single_choice' ? 'correct-option' : undefined}
                                                checked={option.isCorrect}
                                                onChange={(e) => {
                                                    if (type === 'single_choice') {
                                                        setOptions(options.map(o => ({ ...o, isCorrect: o.id === option.id })));
                                                    } else {
                                                        updateOption(option.id, 'isCorrect', e.target.checked);
                                                    }
                                                }}
                                                className="mt-2 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600"
                                            />
                                            <input
                                                type="text"
                                                value={option.label}
                                                onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(option.id)}
                                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={addOption}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Option
                            </button>
                        </div>
                    )}

                    {/* Explanation */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Explanation</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Answer Explanation (Optional)
                            </label>
                            <textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Explain why this is the correct answer..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Tags */}
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. math, algebra"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            />
                        </div>
                    </div>

                    {/* Publishing Info (edit mode) */}
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
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                                    {questionId}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Toast */}
                {error && (
                    <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                            {error}
                            <button
                                onClick={onClearError}
                                className="ml-1 hover:bg-red-700 rounded p-0.5"
                            >
                                <XIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Toast */}
                {saveSuccess && (
                    <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                            {mode === 'create'
                                ? 'Question created successfully — redirecting...'
                                : 'Question saved successfully'}
                            <button
                                onClick={onClearError}
                                className="ml-1 hover:bg-green-700 rounded p-0.5"
                            >
                                <XIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
