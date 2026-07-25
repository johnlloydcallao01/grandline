'use client';

import React, { useState } from 'react';
import {
    X, Plus, Trash2, CheckCircle, AlertTriangle, Folder
} from '@/components/ui/IconWrapper';
import {
    type ModuleOption, type CourseOption, type QuestionOption
} from '@/app/(main)/courses/assessments/actions';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

const TYPE_LABELS: Record<string, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    final_exam: 'Final Exam',
};

const TYPE_COLORS: Record<string, string> = {
    quiz: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    exam: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    final_exam: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

const TYPE_OPTIONS = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'final_exam', label: 'Final Exam' },
];

interface FormState {
    title: string;
    assessmentType: string;
    module: string;
    moduleSearch: string;
    moduleLabel: string;
    course: string;
    courseSearch: string;
    courseLabel: string;
    description: unknown;
    passingScore: number;
    maxAttempts: number;
    timeLimitMinutes: number;
    showCorrectAnswer: boolean;
}

interface ItemEntry {
    id: string;
    questionId: string;
    questionSearch: string;
    questionLabel: string;
    order: number;
    points: number;
}

const DEFAULTS: FormState = {
    title: '', assessmentType: 'quiz',
    module: '', moduleSearch: '', moduleLabel: '',
    course: '', courseSearch: '', courseLabel: '',
    description: '', passingScore: 70, maxAttempts: 1,
    timeLimitMinutes: 0, showCorrectAnswer: false,
};

interface AssessmentFormProps {
    mode: 'create' | 'edit';
    assessmentType?: string;
    assessmentId?: string;
    assessment?: any;
    initialData?: Partial<FormState>;
    initialItems?: ItemEntry[];
    moduleOptions: ModuleOption[];
    courseOptions: CourseOption[];
    questions: QuestionOption[];
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function AssessmentForm({
    mode,
    assessmentType: fixedType,
    assessmentId,
    assessment,
    initialData,
    initialItems,
    moduleOptions,
    courseOptions,
    questions,
    isSaving: _isSaving,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: AssessmentFormProps) {
    const [form, setForm] = useState<FormState>(() => initialData ? { ...DEFAULTS, ...initialData } : { ...DEFAULTS });
    const [items, setItems] = useState<ItemEntry[]>(initialItems || []);

    const effectiveType = mode === 'create' ? form.assessmentType : (fixedType || 'quiz');
    const isFinalExam = effectiveType === 'final_exam';

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const filteredModules = form.moduleSearch
        ? moduleOptions.filter(m => m.title.toLowerCase().includes(form.moduleSearch.toLowerCase()))
        : moduleOptions;

    const filteredCourses = form.courseSearch
        ? courseOptions.filter(c => c.title.toLowerCase().includes(form.courseSearch.toLowerCase()))
        : courseOptions;

    const filteredQuestions = (search: string) =>
        search
            ? questions.filter(q => q.prompt.toLowerCase().includes(search.toLowerCase()))
            : questions;

    const addItem = () => {
        setItems(prev => [...prev, {
            id: Math.random().toString(36).slice(2, 9),
            questionId: '', questionSearch: '', questionLabel: '',
            order: prev.length + 1, points: 1,
        }]);
    };

    const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

    const updateItem = (id: string, field: keyof ItemEntry, value: any) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        if (!isFinalExam && !form.module) return;
        if (isFinalExam && !form.course) return;
        if (items.length === 0) return;

        let description: any = form.description || undefined;
        if (description && typeof description === 'string') {
            try { description = JSON.parse(description); } catch { /* empty */ }
        }

        const payload: Record<string, any> = {
            title: form.title,
            description,
            passingScore: form.passingScore,
            maxAttempts: form.maxAttempts,
            timeLimitMinutes: form.timeLimitMinutes > 0 ? form.timeLimitMinutes : undefined,
            showCorrectAnswer: form.showCorrectAnswer,
        };

        if (isFinalExam) {
            if (form.course) payload.course = form.course;
        } else {
            if (form.module) payload.module = form.module;
        }

        if (mode === 'create') {
            payload.assessmentType = form.assessmentType;
        }

        payload.items = items.map(it => ({
            question: it.questionId,
            order: it.order,
            points: it.points,
        }));

        await onSave(payload);
    };

    return (
        <form id="assessment-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="contents">
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
                            placeholder="e.g. React Hooks Final Exam" />
                    </div>
                    {mode === 'create' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                            <select value={form.assessmentType}
                                onChange={e => {
                                    const t = e.target.value;
                                    setForm(prev => ({ ...prev, assessmentType: t, module: '', moduleSearch: '', moduleLabel: '', course: '', courseSearch: '', courseLabel: '' }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-[var(--card-border)] rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[effectiveType] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                    {TYPE_LABELS[effectiveType] || effectiveType}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">(type cannot be changed)</span>
                            </div>
                        </div>
                    )}
                    {isFinalExam ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
                            <input type="text" value={form.courseSearch}
                                onChange={e => { updateField('courseSearch', e.target.value); if (e.target.value !== form.courseLabel) { updateField('course', ''); updateField('courseLabel', ''); } }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Search courses..." />
                            {form.courseSearch !== form.courseLabel && filteredCourses.length > 0 ? (
                                <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                    {filteredCourses.map(c => (
                                        <button key={c.id}
                                            onClick={() => { updateField('course', c.id); updateField('courseSearch', c.title); updateField('courseLabel', c.title); }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20">{c.title}</button>
                                    ))}
                                </div>
                            ) : !form.courseSearch && (
                                <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                    {courseOptions.map(c => (
                                        <button key={c.id}
                                            onClick={() => { updateField('course', c.id); updateField('courseSearch', c.title); updateField('courseLabel', c.title); }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-50 dark:border-gray-800 last:border-0">{c.title}</button>
                                    ))}
                                    {courseOptions.length === 0 && <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No courses available</p>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module *</label>
                            <input type="text" value={form.moduleSearch}
                                onChange={e => { updateField('moduleSearch', e.target.value); if (e.target.value !== form.moduleLabel) { updateField('module', ''); updateField('moduleLabel', ''); } }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Search modules..." />
                            {form.moduleSearch !== form.moduleLabel && filteredModules.length > 0 ? (
                                <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                    {filteredModules.map(mod => (
                                        <button key={mod.id}
                                            onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20">{mod.title}</button>
                                    ))}
                                </div>
                            ) : !form.moduleSearch && (
                                <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                    {moduleOptions.map(mod => (
                                        <button key={mod.id}
                                            onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-50 dark:border-gray-800 last:border-0">{mod.title}</button>
                                    ))}
                                    {moduleOptions.length === 0 && <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No modules available</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Description</h2>
                    <RichTextEditor
                        value={form.description}
                        onChange={(json) => updateField('description', json)}
                        placeholder="Type /image to insert an image" />
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Items *</h2>
                        {items.length > 1 && (
                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <button onClick={() => setItems(prev => prev.map((i, idx) => ({ ...i, order: idx + 1 })).sort((a, b) => a.order - b.order))}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Reorder</button>
                            </div>
                        )}
                    </div>
                        {items.length > 0 && (
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const fq = filteredQuestions(item.questionSearch);
                                    return (
                                        <div key={item.id} className="border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Item {String(index + 1).padStart(2, '0')}</span>
                                                <button onClick={() => removeItem(item.id)}
                                                    className="p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question *</label>
                                                <input type="text" value={item.questionSearch}
                                                    onChange={e => {
                                                        updateItem(item.id, 'questionSearch', e.target.value);
                                                        if (e.target.value !== item.questionLabel) {
                                                            updateItem(item.id, 'questionId', '');
                                                            updateItem(item.id, 'questionLabel', '');
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                                    placeholder="Search questions..." />
                                                {item.questionSearch !== item.questionLabel && fq.length > 0 ? (
                                                    <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                                        {fq.map(q => (
                                                            <button key={q.id}
                                                                onClick={() => {
                                                                    updateItem(item.id, 'questionId', q.id);
                                                                    updateItem(item.id, 'questionSearch', q.prompt);
                                                                    updateItem(item.id, 'questionLabel', q.prompt);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                                                <span className="block truncate">{q.prompt}</span>
                                                                <span className="text-xs text-gray-400 dark:text-gray-500">{q.type} &middot; {q.difficulty}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : !item.questionSearch && (
                                                    <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-[var(--card-background)] shadow-sm">
                                                        {questions.map(q => (
                                                            <button key={q.id}
                                                                onClick={() => {
                                                                    updateItem(item.id, 'questionId', q.id);
                                                                    updateItem(item.id, 'questionSearch', q.prompt);
                                                                    updateItem(item.id, 'questionLabel', q.prompt);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                                                <span className="block truncate">{q.prompt}</span>
                                                                <span className="text-xs text-gray-400 dark:text-gray-500">{q.type} &middot; {q.difficulty}</span>
                                                            </button>
                                                        ))}
                                                        {questions.length === 0 && <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No questions available</p>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                                                    <input type="number" min="1" value={item.order}
                                                        onChange={e => updateItem(item.id, 'order', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                                                    <input type="number" min="1" value={item.points}
                                                        onChange={e => updateItem(item.id, 'points', parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <button onClick={addItem}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </button>
                </div>

                {/* Settings */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label>
                            <input type="number" min="0" max="100" value={form.passingScore}
                                onChange={e => updateField('passingScore', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label>
                            <input type="number" min="1" value={form.maxAttempts}
                                onChange={e => updateField('maxAttempts', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (min)</label>
                            <input type="number" min="0" value={form.timeLimitMinutes || ''}
                                onChange={e => updateField('timeLimitMinutes', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="0 = unlimited" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="showCorrectAnswer" checked={form.showCorrectAnswer}
                            onChange={e => updateField('showCorrectAnswer', e.target.checked)}
                            className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 bg-white dark:bg-[var(--card-background)]" />
                        <label htmlFor="showCorrectAnswer" className="text-sm font-medium text-gray-700 dark:text-gray-300">Show correct answer after submission</label>
                    </div>
                </div>
            </div>

            {/* === SIDEBAR === */}
            <div className="space-y-6">
                {/* Summary (both modes) */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Summary</h2>
                    {mode === 'create' && (
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{TYPE_LABELS[form.assessmentType]}</p>
                        </div>
                    )}
                    {isFinalExam ? (
                        form.course && (
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Course</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium flex items-center gap-1.5 mt-1">
                                    <Folder className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                    {form.courseLabel || `#${form.course}`}
                                </p>
                            </div>
                        )
                    ) : (
                        form.module && (
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Module</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium flex items-center gap-1.5 mt-1">
                                    <Folder className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                    {form.moduleLabel || `#${form.module}`}
                                </p>
                            </div>
                        )
                    )}
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Items</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Passing Score</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.passingScore}%</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Max Attempts</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.maxAttempts}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Time Limit</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">{form.timeLimitMinutes > 0 ? `${form.timeLimitMinutes} min` : 'No limit'}</p>
                    </div>
                </div>

                {/* Publishing (edit mode only) */}
                {mode === 'edit' && (
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {assessment?.updatedAt ? new Date(assessment.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {assessment?.createdAt ? new Date(assessment.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Assessment ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{assessmentId}</p>
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
                        {mode === 'create' ? 'Assessment created successfully — redirecting...' : 'Assessment saved successfully'}
                        <button onClick={onClearError} className="ml-1 hover:bg-green-700 rounded p-0.5"><X className="h-3.5 w-3.5" /></button>
                    </div>
                </div>
            )}
        </div>
        </form>
    );
}
