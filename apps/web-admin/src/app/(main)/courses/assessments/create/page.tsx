'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Save, Loader2, X, CheckCircle, AlertTriangle, Folder, Plus, Trash2
} from '@/components/ui/IconWrapper';
import {
    getAssessments, createAssessment, getQuestions,
    type ModuleOption, type CourseOption, type QuestionOption
} from '../actions';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

const TYPE_LABELS: Record<string, string> = {
    quiz: 'Quiz',
    exam: 'Exam',
    final_exam: 'Final Exam',
};

const TYPE_OPTIONS = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'final_exam', label: 'Final Exam' },
];

interface FormState {
    title: string;
    assessmentType: 'quiz' | 'exam' | 'final_exam';
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

export default function CreateAssessmentPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
    const [questions, setQuestions] = useState<QuestionOption[]>([]);

    const [form, setForm] = useState<FormState>({
        title: '',
        assessmentType: 'quiz',
        module: '',
        moduleSearch: '',
        moduleLabel: '',
        course: '',
        courseSearch: '',
        courseLabel: '',
        description: '',
        passingScore: 70,
        maxAttempts: 1,
        timeLimitMinutes: 0,
        showCorrectAnswer: false,
    });

    const [items, setItems] = useState<ItemEntry[]>([]);

    const isFinalExam = form.assessmentType === 'final_exam';

    const loadOptions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [assessData, questionData] = await Promise.all([
                getAssessments({ limit: 1 }),
                getQuestions({ limit: 200 }),
            ]);
            if (assessData.moduleOptions) setModuleOptions(assessData.moduleOptions);
            if (assessData.courseOptions) setCourseOptions(assessData.courseOptions);
            setQuestions(questionData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load options');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadOptions(); }, [loadOptions]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const filteredModules = form.moduleSearch
        ? moduleOptions.filter(m => m.title.toLowerCase().includes(form.moduleSearch.toLowerCase()))
        : moduleOptions;

    const filteredCourses = form.courseSearch
        ? courseOptions.filter(c => c.title.toLowerCase().includes(form.courseSearch.toLowerCase()))
        : courseOptions;

    const addItem = () => {
        setItems(prev => [...prev, {
            id: Math.random().toString(36).slice(2, 9),
            questionId: '',
            questionSearch: '',
            questionLabel: '',
            order: prev.length + 1,
            points: 1,
        }]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof ItemEntry, value: any) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const filteredQuestions = (search: string) =>
        search
            ? questions.filter(q => q.prompt.toLowerCase().includes(search.toLowerCase()))
            : questions;

    const handleSave = async () => {
        if (!form.title.trim()) return;
        if (!isFinalExam && !form.module) return;
        if (isFinalExam && !form.course) return;
        if (items.length === 0) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            let description: any = form.description || undefined;
            if (description && typeof description === 'string') {
                try { description = JSON.parse(description); } catch { /* empty */ }
            }

            const created = await createAssessment({
                title: form.title,
                assessmentType: form.assessmentType,
                module: !isFinalExam ? form.module : undefined,
                course: isFinalExam ? form.course : undefined,
                passingScore: form.passingScore,
                maxAttempts: form.maxAttempts,
                timeLimitMinutes: form.timeLimitMinutes > 0 ? form.timeLimitMinutes : undefined,
                showCorrectAnswer: form.showCorrectAnswer,
                items: items.map(it => ({
                    question: it.questionId,
                    order: it.order,
                    points: it.points,
                })),
            });

            setSaveSuccess(true);
            setTimeout(() => {
                router.push(`/courses/assessments/${created.id}/edit`);
            }, 800);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create assessment');
        } finally {
            setIsSaving(false);
        }
    };

    if (error && !isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="h-8 w-8 text-red-500" /></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={loadOptions} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Retry</button>
                        <Link href="/courses/assessments" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Back</Link>
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
                    <Link href="/courses/assessments" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Create a new quiz, exam, or final exam</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses/assessments" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving || !form.title.trim() || (!isFinalExam && !form.module) || (isFinalExam && !form.course) || items.length === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Creating...' : 'Create Assessment'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* === MAIN CONTENT === */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="e.g. React Hooks Final Exam" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select value={form.assessmentType}
                                onChange={e => {
                                    const t = e.target.value as 'quiz' | 'exam' | 'final_exam';
                                    setForm(prev => ({ ...prev, assessmentType: t, module: '', moduleSearch: '', moduleLabel: '', course: '', courseSearch: '', courseLabel: '' }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {isFinalExam ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                                <input type="text" value={form.courseSearch}
                                    onChange={e => { updateField('courseSearch', e.target.value); if (e.target.value !== form.courseLabel) { updateField('course', ''); updateField('courseLabel', ''); } }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Search courses..." />
                                {isLoading ? (
                                    <div className="mt-1 h-10 bg-gray-50 rounded-lg animate-pulse" />
                                ) : form.courseSearch !== form.courseLabel && filteredCourses.length > 0 ? (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {filteredCourses.map(c => (
                                            <button key={c.id}
                                                onClick={() => { updateField('course', c.id); updateField('courseSearch', c.title); updateField('courseLabel', c.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50">
                                                {c.title}
                                            </button>
                                        ))}
                                    </div>
                                ) : !form.courseSearch && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {courseOptions.map(c => (
                                            <button key={c.id}
                                                onClick={() => { updateField('course', c.id); updateField('courseSearch', c.title); updateField('courseLabel', c.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                {c.title}
                                            </button>
                                        ))}
                                        {courseOptions.length === 0 && (
                                            <p className="px-3 py-2 text-sm text-gray-400">No courses available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Module *</label>
                                <input type="text" value={form.moduleSearch}
                                    onChange={e => { updateField('moduleSearch', e.target.value); if (e.target.value !== form.moduleLabel) { updateField('module', ''); updateField('moduleLabel', ''); } }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Search modules..." />
                                {isLoading ? (
                                    <div className="mt-1 h-10 bg-gray-50 rounded-lg animate-pulse" />
                                ) : form.moduleSearch !== form.moduleLabel && filteredModules.length > 0 ? (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {filteredModules.map(mod => (
                                            <button key={mod.id}
                                                onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50">
                                                {mod.title}
                                            </button>
                                        ))}
                                    </div>
                                ) : !form.moduleSearch && (
                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                        {moduleOptions.map(mod => (
                                            <button key={mod.id}
                                                onClick={() => { updateField('module', mod.id); updateField('moduleSearch', mod.title); updateField('moduleLabel', mod.title); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                {mod.title}
                                            </button>
                                        ))}
                                        {moduleOptions.length === 0 && (
                                            <p className="px-3 py-2 text-sm text-gray-400">No modules available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Description</h2>
                        <RichTextEditor
                            value={form.description}
                            onChange={(json) => updateField('description', json)}
                            placeholder="Type /image to insert an image"
                        />
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">Items *</h2>
                            {items.length > 1 && (
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <button onClick={() => setItems(prev => prev.map((i, idx) => ({ ...i, order: idx + 1 })).sort((a, b) => a.order - b.order))}
                                        className="hover:text-blue-600 font-medium">Reorder</button>
                                </div>
                            )}
                        </div>
                        {items.length > 0 && (
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const fq = filteredQuestions(item.questionSearch);
                                    return (
                                        <div key={item.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-700">Item {String(index + 1).padStart(2, '0')}</span>
                                                <button onClick={() => removeItem(item.id)}
                                                    className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                                                <input type="text" value={item.questionSearch}
                                                    onChange={e => {
                                                        updateItem(item.id, 'questionSearch', e.target.value);
                                                        if (e.target.value !== item.questionLabel) {
                                                            updateItem(item.id, 'questionId', '');
                                                            updateItem(item.id, 'questionLabel', '');
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                    placeholder="Search questions..." />
                                                {isLoading ? (
                                                    <div className="mt-1 h-10 bg-gray-50 rounded-lg animate-pulse" />
                                                ) : item.questionSearch !== item.questionLabel && fq.length > 0 ? (
                                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                                        {fq.map(q => (
                                                            <button key={q.id}
                                                                onClick={() => {
                                                                    updateItem(item.id, 'questionId', q.id);
                                                                    updateItem(item.id, 'questionSearch', q.prompt);
                                                                    updateItem(item.id, 'questionLabel', q.prompt);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                                <span className="block truncate">{q.prompt}</span>
                                                                <span className="text-xs text-gray-400">{q.type} &middot; {q.difficulty}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : !item.questionSearch && (
                                                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                                                        {questions.map(q => (
                                                            <button key={q.id}
                                                                onClick={() => {
                                                                    updateItem(item.id, 'questionId', q.id);
                                                                    updateItem(item.id, 'questionSearch', q.prompt);
                                                                    updateItem(item.id, 'questionLabel', q.prompt);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                                                                <span className="block truncate">{q.prompt}</span>
                                                                <span className="text-xs text-gray-400">{q.type} &middot; {q.difficulty}</span>
                                                            </button>
                                                        ))}
                                                        {questions.length === 0 && (
                                                            <p className="px-3 py-2 text-sm text-gray-400">No questions available</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                                    <input type="number" min="1" value={item.order}
                                                        onChange={e => updateItem(item.id, 'order', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                                    <input type="number" min="1" value={item.points}
                                                        onChange={e => updateItem(item.id, 'points', parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <button onClick={addItem}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Settings</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                <input type="number" min="0" max="100" value={form.passingScore}
                                    onChange={e => updateField('passingScore', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                <input type="number" min="1" value={form.maxAttempts}
                                    onChange={e => updateField('maxAttempts', parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (min)</label>
                                <input type="number" min="0" value={form.timeLimitMinutes || ''}
                                    onChange={e => updateField('timeLimitMinutes', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="0 = unlimited" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input type="checkbox" id="showCorrectAnswer" checked={form.showCorrectAnswer}
                                onChange={e => updateField('showCorrectAnswer', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="showCorrectAnswer" className="text-sm font-medium text-gray-700">Show correct answer after submission</label>
                        </div>
                    </div>
                </div>

                {/* === SIDEBAR === */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Summary</h2>
                        <div>
                            <span className="text-xs text-gray-500">Type</span>
                            <p className="text-sm text-gray-900 font-medium">{TYPE_LABELS[form.assessmentType]}</p>
                        </div>
                        {isFinalExam ? (
                            form.course && (
                                <div>
                                    <span className="text-xs text-gray-500">Course</span>
                                    <p className="text-sm text-gray-900 font-medium flex items-center gap-1.5 mt-1">
                                        <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        {form.courseLabel || `#${form.course}`}
                                    </p>
                                </div>
                            )
                        ) : (
                            form.module && (
                                <div>
                                    <span className="text-xs text-gray-500">Module</span>
                                    <p className="text-sm text-gray-900 font-medium flex items-center gap-1.5 mt-1">
                                        <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        {form.moduleLabel || `#${form.module}`}
                                    </p>
                                </div>
                            )
                        )}
                        <div>
                            <span className="text-xs text-gray-500">Questions</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Passing Score</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{form.passingScore}%</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Max Attempts</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{form.maxAttempts}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Time Limit</span>
                            <p className="text-sm text-gray-900 font-medium mt-1">{form.timeLimitMinutes > 0 ? `${form.timeLimitMinutes} min` : 'No limit'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Assessment created successfully — redirecting...
                        <button onClick={() => setSaveSuccess(false)} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
