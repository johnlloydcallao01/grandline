'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    X, Plus, CheckCircle, AlertTriangle
} from '@/components/ui/IconWrapper';
import {
    getCategories, getTags, searchInstructors, searchCollection, listCollection,
} from '@/app/(main)/courses/actions';
import type { CategoryOption, InstructorRef, SimpleDocRef, Course, TagOption } from '@encreasl/cms-types';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

const DIFFICULTY_OPTIONS = [
    { value: 'standard', label: 'Standard' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
];

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
];

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

const DURATION_UNIT_OPTIONS = [
    { value: 'minutes', label: 'Minute(s)' },
    { value: 'hours', label: 'Hour(s)' },
    { value: 'days', label: 'Day(s)' },
    { value: 'weeks', label: 'Week(s)' },
];

const EVALUATION_MODE_OPTIONS = [
    { value: 'lessons', label: 'Evaluate via Lessons (Progress-Based)' },
    { value: 'exam', label: 'Evaluate via Final Quiz/Exam (Mastery-Based)' },
    { value: 'quizzes', label: 'Evaluate via Passed Quizzes (Continuous Assessment)' },
    { value: 'lessons_exam', label: 'Evaluate via Lessons + Final Exam (Prerequisite Model)' },
    { value: 'lessons_quizzes', label: 'Evaluate via Lessons + Quizzes (Continuous Progress)' },
    { value: 'quizzes_exam', label: 'Evaluate via Quizzes + Final Exam (Performance Only)' },
    { value: 'lessons_quizzes_exam', label: 'Evaluate via Lessons + Quizzes + Final Exam (Strict Academic)' },
];

interface FormState {
    title: string;
    courseCode: string;
    status: string;
    description: unknown;
    excerpt: string;
    instructor: string;
    instructorSearch: string;
    instructorLabel: string;
    coInstructors: string[];
    category: string[];
    tags: string[];
    modules: string[];
    thumbnailUrl: string;
    bannerImageUrl: string;
    price: number;
    discountedPrice: number;
    maxStudents: number;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    courseStartDate: string;
    courseEndDate: string;
    estimatedDuration: number;
    estimatedDurationUnit: string;
    difficultyLevel: string;
    isFeatured: boolean;
    language: string;
    passingGrade: number;
    evaluationMode: string;
    certificateTemplate: string;
    certificateTemplateSearch: string;
    certificateTemplateLabel: string;
    feedbackForm: string;
    feedbackFormSearch: string;
    feedbackFormLabel: string;
    isFeedbackRequired: boolean;
    learningObjectives: string[];
    prerequisites: string[];
}

const DEFAULTS: FormState = {
    title: '', courseCode: '', status: 'draft',
    description: '', excerpt: '',
    instructor: '', instructorSearch: '', instructorLabel: '',
    coInstructors: [], category: [], tags: [], modules: [],
    thumbnailUrl: '', bannerImageUrl: '',
    price: 0, discountedPrice: 0, maxStudents: 0,
    enrollmentStartDate: '', enrollmentEndDate: '',
    courseStartDate: '', courseEndDate: '',
    estimatedDuration: 0, estimatedDurationUnit: 'hours',
    difficultyLevel: 'standard', isFeatured: false, language: 'en',
    passingGrade: 70, evaluationMode: 'lessons_exam',
    certificateTemplate: '', certificateTemplateSearch: '', certificateTemplateLabel: '',
    feedbackForm: '', feedbackFormSearch: '', feedbackFormLabel: '',
    isFeedbackRequired: false,
    learningObjectives: [], prerequisites: [],
};

interface CourseFormProps {
    mode: 'create' | 'edit';
    courseId?: string;
    course?: Course | null;
    initialData?: Partial<FormState>;
    isSaving: boolean;
    error: string | null;
    saveSuccess: boolean;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onClearError: () => void;
}

export default function CourseForm({
    mode,
    courseId,
    course,
    initialData,
    isSaving: _isSaving,
    error,
    saveSuccess,
    onSave,
    onClearError,
}: CourseFormProps) {
    const [form, setForm] = useState<FormState>(() => initialData ? { ...DEFAULTS, ...initialData } : { ...DEFAULTS });
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
    const [instructorOptions, setInstructorOptions] = useState<InstructorRef[]>([]);
    const [coInstructorOptions, setCoInstructorOptions] = useState<InstructorRef[]>([]);
    const [coInstructorSearch, setCoInstructorSearch] = useState('');
    const [moduleSearch, setModuleSearch] = useState('');
    const [moduleResults, setModuleResults] = useState<SimpleDocRef[]>([]);
    const [openSelector, setOpenSelector] = useState<string | null>(null);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const s = document.createElement('style');
        s.textContent = '.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator,.dark input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1)}';
        s.id = 'calendar-picker-dark-fix';
        document.head.appendChild(s);
        return () => { const e = document.getElementById('calendar-picker-dark-fix'); if (e) e.remove(); };
    }, []);

    useEffect(() => { getCategories().then(setCategoryOptions).catch(() => {}); }, []);

    useEffect(() => { getTags().then(setTagOptions).catch(() => {}); }, []);

    useEffect(() => {
        if (form.instructorSearch.length < 1 || form.instructorSearch === form.instructorLabel) {
            setInstructorOptions([]);
            return;
        }
        const t = setTimeout(async () => {
            try { setInstructorOptions(await searchInstructors(form.instructorSearch)); } catch { setInstructorOptions([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [form.instructorSearch, form.instructorLabel]);

    useEffect(() => {
        if (!coInstructorSearch || coInstructorSearch.length < 1) { setCoInstructorOptions([]); return; }
        const t = setTimeout(async () => {
            try { setCoInstructorOptions(await searchInstructors(coInstructorSearch)); } catch { setCoInstructorOptions([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [coInstructorSearch]);

    useEffect(() => {
        if (!moduleSearch || moduleSearch.length < 1) { setModuleResults([]); return; }
        const t = setTimeout(async () => {
            try { setModuleResults(await searchCollection('course-modules', moduleSearch)); } catch { setModuleResults([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [moduleSearch]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
                setOpenSelector(null);
            }
        };
        if (openSelector) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [openSelector]);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const addCoInstructor = (id: string) => {
        if (!form.coInstructors.includes(id)) updateField('coInstructors', [...form.coInstructors, id]);
        setCoInstructorOptions([]);
        setCoInstructorSearch('');
    };

    const removeCoInstructor = (id: string) => {
        updateField('coInstructors', form.coInstructors.filter(i => i !== id));
    };

    const addModule = (id: string) => {
        if (!form.modules.includes(id)) updateField('modules', [...form.modules, id]);
        setModuleResults([]);
        setModuleSearch('');
    };

    const removeModule = (id: string) => {
        updateField('modules', form.modules.filter(m => m !== id));
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.courseCode.trim()) return;
        let description: any = form.description || undefined;
        if (description && typeof description === 'string') { try { description = JSON.parse(description); } catch { /* empty */ } }
        const payload: Record<string, any> = {
            title: form.title,
            courseCode: form.courseCode,
            status: form.status,
            instructor: form.instructor || undefined,
            coInstructors: form.coInstructors.length > 0 ? form.coInstructors : [],
            category: form.category.length > 0 ? form.category : [],
            tags: form.tags.length > 0 ? form.tags : [],
            modules: form.modules.length > 0 ? form.modules : [],
            price: form.price,
            discountedPrice: form.discountedPrice || undefined,
            maxStudents: form.maxStudents > 0 ? form.maxStudents : undefined,
            excerpt: form.excerpt || undefined,
            description,
            difficultyLevel: form.difficultyLevel,
            language: form.language,
            estimatedDuration: form.estimatedDuration > 0 ? form.estimatedDuration : undefined,
            estimatedDurationUnit: form.estimatedDurationUnit,
            passingGrade: form.passingGrade,
            evaluationMode: form.evaluationMode,
            isFeatured: form.isFeatured,
            enrollmentStartDate: form.enrollmentStartDate || undefined,
            enrollmentEndDate: form.enrollmentEndDate || undefined,
            courseStartDate: form.courseStartDate || undefined,
            courseEndDate: form.courseEndDate || undefined,
            certificateTemplate: form.certificateTemplate || undefined,
            feedbackForm: form.feedbackForm || undefined,
            isFeedbackRequired: form.isFeedbackRequired,
            learningObjectives: form.learningObjectives.filter(Boolean).map(o => ({ objective: o })),
            prerequisites: form.prerequisites.filter(Boolean).map(p => ({ prerequisite: p })),
        };
        if (form.thumbnailUrl) payload.thumbnailUrl = form.thumbnailUrl;
        if (form.bannerImageUrl) payload.bannerImageUrl = form.bannerImageUrl;
        await onSave(payload);
    };

    const renderSearchDropdown = (options: any[], onSelect: (item: any) => void) => {
        if (options.length === 0) return null;
        return (
            <div className="mt-1 border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-800 shadow-sm">
                {options.map((opt: any) => (
                    <button key={opt.id} onClick={() => onSelect(opt)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                        {opt.title || opt.name || `#${opt.id}`}
                    </button>
                ))}
            </div>
        );
    };

    const RelationSelector = ({
        id, label, value, displayLabel, fetchFn, onSelect, onClear, placeholder = 'Select a value',
    }: {
        id: string; label: string; value: string; displayLabel: string;
        fetchFn: () => Promise<SimpleDocRef[]>; onSelect: (item: SimpleDocRef) => void; onClear: () => void; placeholder?: string;
    }) => {
        const isOpen = openSelector === id;
        const [items, setItems] = useState<SimpleDocRef[]>([]);
        const [loading, setLoading] = useState(false);
        const [search, setSearch] = useState('');

        useEffect(() => {
            if (isOpen && items.length === 0 && !loading) {
                setLoading(true);
                fetchFn().then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
            }
            if (!isOpen) setSearch('');
        }, [isOpen]);

        const filtered = search
            ? items.filter(i => (i.title || i.name || '').toLowerCase().includes(search.toLowerCase()))
            : items;

        return (
            <div ref={isOpen ? selectorRef : undefined}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                {value ? (
                    <div className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[var(--card-background)] text-sm text-gray-900 dark:text-gray-100">
                        <span className="truncate">{displayLabel}</span>
                        <button onClick={onClear} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 shrink-0 ml-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setOpenSelector(isOpen ? null : id)} type="button"
                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 bg-white dark:bg-[var(--card-background)] text-left">
                        <span>{placeholder}</span>
                        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                )}
                {isOpen && (
                    <div className="mt-1 border border-gray-200 dark:border-[var(--card-border)] rounded-lg bg-white dark:bg-[var(--card-background)] shadow-sm">
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <input autoFocus type="text" value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                                placeholder="Filter results..." />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="px-3 py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-0 animate-pulse">
                                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                                    </div>
                                ))
                            ) : filtered.length === 0 ? (
                                <p className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">{search ? 'No matches' : 'No items'}</p>
                            ) : (
                                filtered.map(opt => (
                                    <button key={opt.id} onClick={() => { onSelect(opt); setOpenSelector(null); }} type="button"
                                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                        {opt.title || opt.name || `#${opt.id}`}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
    <form id="course-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="contents">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* === MAIN CONTENT === */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code *</label>
                            <input type="text" value={form.courseCode} onChange={e => updateField('courseCode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select value={form.status} onChange={e => updateField('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] bg-white">
                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Description</h2>
                    <RichTextEditor
                        value={form.description}
                        onChange={(json) => updateField('description', json)}
                        placeholder="Type /image to insert an image" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                        <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Brief summary for listings..." />
                    </div>
                </div>

                {/* Instructor & Classification */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Instructor & Classification</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Instructor *</label>
                        <input type="text" value={form.instructorSearch}
                            onChange={e => { updateField('instructorSearch', e.target.value); updateField('instructor', ''); }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Search instructors..." />
                        {renderSearchDropdown(instructorOptions, (inst) => {
                            const label = inst.user ? `${inst.user.firstName} ${inst.user.lastName}`.trim() || `Instructor #${inst.id}` : `Instructor #${inst.id}`;
                            updateField('instructor', inst.id); updateField('instructorSearch', label); updateField('instructorLabel', label);
                            setInstructorOptions([]);
                        })}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Co-Instructors</label>
                        {form.coInstructors.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {form.coInstructors.map(id => (
                                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                                        #{String(id).slice(0, 8)}
                                        <button onClick={() => removeCoInstructor(id)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <input type="text" value={coInstructorSearch} onChange={e => setCoInstructorSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Search co-instructors..." />
                        {renderSearchDropdown(coInstructorOptions, (inst) => addCoInstructor(inst.id))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {categoryOptions.map(cat => (
                                <button key={cat.id} onClick={() => updateField('category',
                                    form.category.includes(cat.id) ? form.category.filter(id => id !== cat.id) : [...form.category, cat.id])}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.category.includes(cat.id) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {cat.name}
                                </button>
                            ))}
                            {categoryOptions.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500">No categories</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {tagOptions.map(tag => (
                                <button key={tag.id} onClick={() => updateField('tags',
                                    form.tags.includes(tag.id) ? form.tags.filter(id => id !== tag.id) : [...form.tags, tag.id])}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.tags.includes(tag.id) ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {tag.name}
                                </button>
                            ))}
                            {tagOptions.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500">No tags</p>}
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Media</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                        <input type="text" value={form.thumbnailUrl} onChange={e => updateField('thumbnailUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                            placeholder="Cloudinary or media URL..." />
                        {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="thumbnail preview" className="mt-2 h-24 rounded border border-gray-200 dark:border-gray-600 object-cover" />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image URL</label>
                        <input type="text" value={form.bannerImageUrl} onChange={e => updateField('bannerImageUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                            placeholder="Cloudinary or media URL..." />
                        {form.bannerImageUrl && <img src={form.bannerImageUrl} alt="banner preview" className="mt-2 h-24 rounded border border-gray-200 dark:border-gray-600 object-cover" />}
                    </div>
                </div>

                {/* Pricing & Enrollment */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Pricing & Enrollment</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                            <input type="number" min="0" step="0.01" value={form.price} onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discounted Price ($)</label>
                            <input type="number" min="0" step="0.01" value={form.discountedPrice} onChange={e => updateField('discountedPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Students</label>
                            <input type="number" min="0" value={form.maxStudents} onChange={e => updateField('maxStudents', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="0 = unlimited" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment Start</label>
                            <input type="datetime-local" value={form.enrollmentStartDate} onChange={e => updateField('enrollmentStartDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment End</label>
                            <input type="datetime-local" value={form.enrollmentEndDate} onChange={e => updateField('enrollmentEndDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Start</label>
                            <input type="datetime-local" value={form.courseStartDate} onChange={e => updateField('courseStartDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course End</label>
                            <input type="datetime-local" value={form.courseEndDate} onChange={e => updateField('courseEndDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Duration</label>
                            <input type="number" min="0" value={form.estimatedDuration} onChange={e => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="Value" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                            <select value={form.estimatedDurationUnit} onChange={e => updateField('estimatedDurationUnit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] bg-white">
                                {DURATION_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modules */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Modules</h2>
                    {form.modules.length > 0 && (
                        <div className="space-y-1.5">
                            {form.modules.map(id => (
                                <div key={id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm">
                                    <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">Module #{String(id).slice(0, 8)}</span>
                                    <button onClick={() => removeModule(id)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div>
                        <input type="text" value={moduleSearch} onChange={e => setModuleSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                            placeholder="Search modules to add..." />
                        {renderSearchDropdown(moduleResults, (m: SimpleDocRef) => addModule(m.id))}
                    </div>
                </div>

                {/* Learning Objectives & Prerequisites */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Learning Objectives & Prerequisites</h2>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Objectives</label>
                            <button onClick={() => updateField('learningObjectives', [...form.learningObjectives, ''])}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"><Plus className="h-3.5 w-3.5" />Add Objective</button>
                        </div>
                        <div className="space-y-2">
                            {form.learningObjectives.map((obj, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={obj} onChange={e => { const u = [...form.learningObjectives]; u[i] = e.target.value; updateField('learningObjectives', u); }}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="e.g. Understand React fundamentals" />
                                    <button onClick={() => updateField('learningObjectives', form.learningObjectives.filter((_, idx) => idx !== i))}
                                        className="p-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prerequisites</label>
                            <button onClick={() => updateField('prerequisites', [...form.prerequisites, ''])}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"><Plus className="h-3.5 w-3.5" />Add Prerequisite</button>
                        </div>
                        <div className="space-y-2">
                            {form.prerequisites.map((pr, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={pr} onChange={e => { const u = [...form.prerequisites]; u[i] = e.target.value; updateField('prerequisites', u); }}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" placeholder="e.g. Basic JavaScript" />
                                    <button onClick={() => updateField('prerequisites', form.prerequisites.filter((_, idx) => idx !== i))}
                                        className="p-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* === SIDEBAR === */}
            <div className="space-y-6">
                {/* Settings */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
                        <select value={form.difficultyLevel} onChange={e => updateField('difficultyLevel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] bg-white">
                            {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                        <select value={form.language} onChange={e => updateField('language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] bg-white">
                            {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Grade (%)</label>
                        <input type="number" min="0" max="100" value={form.passingGrade} onChange={e => updateField('passingGrade', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evaluation Mode</label>
                        <select value={form.evaluationMode} onChange={e => updateField('evaluationMode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] bg-white">
                            {EVALUATION_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured} onChange={e => updateField('isFeatured', e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800" />
                        <span className="text-sm font-medium text-gray-700">Featured Course</span>
                    </label>
                </div>

                {/* Certification */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Certification</h2>
                    <RelationSelector
                        id="certificateTemplate"
                        label="Certificate Template"
                        value={form.certificateTemplate}
                        displayLabel={form.certificateTemplateSearch}
                        fetchFn={() => listCollection('certificate-templates', 'name')}
                        onSelect={(ct) => {
                            const label = ct.title || ct.name || `#${ct.id}`;
                            updateField('certificateTemplate', ct.id);
                            updateField('certificateTemplateSearch', label);
                            updateField('certificateTemplateLabel', label);
                        }}
                        onClear={() => {
                            updateField('certificateTemplate', '');
                            updateField('certificateTemplateSearch', '');
                            updateField('certificateTemplateLabel', '');
                        }}
                        placeholder="Select a value" />
                </div>

                {/* Feedback */}
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Feedback</h2>
                    <RelationSelector
                        id="feedbackForm"
                        label="Feedback Form"
                        value={form.feedbackForm}
                        displayLabel={form.feedbackFormSearch}
                        fetchFn={() => listCollection('feedback-forms')}
                        onSelect={(ff) => {
                            const label = ff.title || ff.name || `#${ff.id}`;
                            updateField('feedbackForm', ff.id);
                            updateField('feedbackFormSearch', label);
                            updateField('feedbackFormLabel', label);
                        }}
                        onClear={() => {
                            updateField('feedbackForm', '');
                            updateField('feedbackFormSearch', '');
                            updateField('feedbackFormLabel', '');
                        }}
                        placeholder="Select a value" />
                    {form.feedbackForm && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFeedbackRequired} onChange={e => updateField('isFeedbackRequired', e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800" />
                            <span className="text-sm font-medium text-gray-700">Require feedback to complete</span>
                        </label>
                    )}
                </div>

                {/* Publishing (edit mode only) */}
                {mode === 'edit' && course && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Published At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {course.publishedAt ? new Date(course.publishedAt).toLocaleString() : 'Not published'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {course.updatedAt ? new Date(course.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {course.createdAt ? new Date(course.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Course ID</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{courseId}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
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

            {/* Success */}
            {saveSuccess && (
                <div className="lg:col-span-3 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {mode === 'create' ? 'Course created successfully — redirecting...' : 'Course saved successfully'}
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
