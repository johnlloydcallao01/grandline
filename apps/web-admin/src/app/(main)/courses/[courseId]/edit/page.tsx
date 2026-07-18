'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Save, Loader2, BookOpen, X, CheckCircle, AlertTriangle, Plus
} from '@/components/ui/IconWrapper';
import {
    updateCourse, searchInstructors, searchCollection, listCollection, getCourseEditData,
    type CourseDoc, type CategoryOption, type InstructorRef, type SimpleDocRef
} from '../../actions';
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

const toDatetimeLocal = (iso: string | undefined) => {
    if (!iso) return '';
    try { const d = new Date(iso); return d.toISOString().slice(0, 16); }
    catch { return ''; }
};

export default function EditCoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<CourseDoc | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [instructorOptions, setInstructorOptions] = useState<InstructorRef[]>([]);
    const [coInstructorOptions, setCoInstructorOptions] = useState<InstructorRef[]>([]);
    const [, setModuleOptions] = useState<SimpleDocRef[]>([]);

    const [form, setForm] = useState<FormState>({
        title: '', courseCode: '', status: 'draft',
        description: '', excerpt: '',
        instructor: '', instructorSearch: '', instructorLabel: '',
        coInstructors: [], category: [], modules: [],
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
    });

    const extractIds = (items: any[] | undefined | string): string[] => {
        if (!items || !Array.isArray(items)) return [];
        return items.map(i => {
            const val = typeof i === 'object' && i !== null ? i.id : i;
            return val != null ? String(val) : '';
        }).filter(Boolean);
    };

    const loadCourse = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await getCourseEditData(courseId);
            const data = result.course;
            setCourse(data);
            setCategoryOptions(result.categories);
            setModuleOptions(result.modules);

            const inst = data.instructor;
            let instructorId = '';
            let instructorLabel = '';
            if (inst && typeof inst === 'object') {
                instructorId = String(inst.id);
                instructorLabel = inst.user && typeof inst.user === 'object'
                    ? `${inst.user.firstName || ''} ${inst.user.lastName || ''}`.trim() || `Instructor #${inst.id}`
                    : `Instructor #${inst.id}`;
            }

            const desc = data.description;
            const description = desc || undefined;

            const thumb = data.thumbnail;
            const thumbUrl = thumb && typeof thumb === 'object'
                ? (thumb as any).cloudinaryURL || (thumb as any).url || ''
                : '';

            const banner = data.bannerImage;
            const bannerUrl = banner && typeof banner === 'object'
                ? (banner as any).cloudinaryURL || (banner as any).url || ''
                : '';

            const ct = data.certificateTemplate;
            let ctId = '', ctLabel = '';
            if (ct && typeof ct === 'object') { ctId = String(ct.id); ctLabel = ct.title || ct.name || `#${ct.id}`; }
            else if (typeof ct === 'string') ctId = ct;

            const ff = data.feedbackForm;
            let ffId = '', ffLabel = '';
            if (ff && typeof ff === 'object') { ffId = String(ff.id); ffLabel = ff.title || `#${ff.id}`; }
            else if (typeof ff === 'string') ffId = ff;

            setForm({
                title: data.title || '',
                courseCode: data.courseCode || '',
                status: data.status || 'draft',
                description,
                excerpt: data.excerpt || '',
                instructor: instructorId,
                instructorSearch: instructorLabel,
                instructorLabel,
                coInstructors: extractIds(data.coInstructors as any),
                category: extractIds(data.category as any),
                modules: extractIds(data.modules as any),
                thumbnailUrl: thumbUrl,
                bannerImageUrl: bannerUrl,
                price: data.price || 0,
                discountedPrice: data.discountedPrice || 0,
                maxStudents: data.maxStudents || 0,
                enrollmentStartDate: toDatetimeLocal(data.enrollmentStartDate),
                enrollmentEndDate: toDatetimeLocal(data.enrollmentEndDate),
                courseStartDate: toDatetimeLocal(data.courseStartDate),
                courseEndDate: toDatetimeLocal(data.courseEndDate),
                estimatedDuration: data.estimatedDuration || 0,
                estimatedDurationUnit: data.estimatedDurationUnit || 'hours',
                difficultyLevel: data.difficultyLevel || 'standard',
                isFeatured: data.isFeatured || false,
                language: data.language || 'en',
                passingGrade: data.passingGrade || 70,
                evaluationMode: data.evaluationMode || 'lessons_exam',
                certificateTemplate: ctId,
                certificateTemplateSearch: ctLabel,
                certificateTemplateLabel: ctLabel,
                feedbackForm: ffId,
                feedbackFormSearch: ffLabel,
                feedbackFormLabel: ffLabel,
                isFeedbackRequired: data.isFeedbackRequired || false,
                learningObjectives: (data as any).learningObjectives?.map((o: any) => typeof o === 'object' ? (o.objective || '') : o) || [],
                prerequisites: (data as any).prerequisites?.map((p: any) => typeof p === 'object' ? (p.prerequisite || '') : p) || [],
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message?.includes('404') || err.message?.includes('Not Found') ? 'not-found' : (err.message || 'Failed to load course'));
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => { loadCourse(); }, [loadCourse]);

    // Search debounce hook
    const useSearchEffect = (
        searchTerm: string,
        labelRef: string,
        setOptions: React.Dispatch<React.SetStateAction<any[]>>,
        searchFn: (s: string) => Promise<any[]>,
        currentValue: string
    ) => {
        useEffect(() => {
            if (searchTerm.length < 1 || searchTerm === labelRef) { setOptions([]); return; }
            const t = setTimeout(async () => {
                try { setOptions(await searchFn(searchTerm)); } catch { setOptions([]); }
            }, 300);
            return () => clearTimeout(t);
        }, [searchTerm, labelRef, currentValue]);
    };

    useSearchEffect(form.instructorSearch, form.instructorLabel, setInstructorOptions, searchInstructors, form.instructor);
    useSearchEffect(form.coInstructors.length > 0 ? 'active' : '', '', setCoInstructorOptions, async (s) => {
        if (!s || s.length < 1) return [];
        return searchInstructors(s);
    }, '');

    const [coInstructorSearch, setCoInstructorSearch] = useState('');
    useEffect(() => {
        if (!coInstructorSearch || coInstructorSearch.length < 1) { setCoInstructorOptions([]); return; }
        const t = setTimeout(async () => {
            try { setCoInstructorOptions(await searchInstructors(coInstructorSearch)); }
            catch { setCoInstructorOptions([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [coInstructorSearch]);

    const useModuleSearch = () => {
        const [modSearch, setModSearch] = useState('');
        const [modResults, setModResults] = useState<SimpleDocRef[]>([]);
        useEffect(() => {
            if (!modSearch || modSearch.length < 1) { setModResults([]); return; }
            const t = setTimeout(async () => {
                try { setModResults(await searchCollection('course-modules', modSearch)); }
                catch { setModResults([]); }
            }, 300);
            return () => clearTimeout(t);
        }, [modSearch]);
        return { modSearch, setModSearch, modResults, setModResults };
    };

    const modHook = useModuleSearch();

    const [openSelector, setOpenSelector] = useState<string | null>(null);
    const selectorRef = useRef<HTMLDivElement>(null);

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
        if (!form.coInstructors.includes(id)) {
            updateField('coInstructors', [...form.coInstructors, id]);
        }
        setCoInstructorOptions([]);
        setCoInstructorSearch('');
    };

    const removeCoInstructor = (id: string) => {
        updateField('coInstructors', form.coInstructors.filter(i => i !== id));
    };

    const addModule = (id: string) => {
        if (!form.modules.includes(id)) {
            updateField('modules', [...form.modules, id]);
        }
        modHook.setModResults([]);
        modHook.setModSearch('');
    };

    const removeModule = (id: string) => {
        updateField('modules', form.modules.filter(m => m !== id));
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.courseCode.trim()) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            let description: any = form.description || undefined;
            if (description && typeof description === 'string') { try { description = JSON.parse(description); } catch { /* keep as-is */ } }
            const payload: Record<string, any> = {
                title: form.title,
                courseCode: form.courseCode,
                status: form.status,
                instructor: form.instructor || undefined,
                coInstructors: form.coInstructors.length > 0 ? form.coInstructors : [],
                category: form.category.length > 0 ? form.category : [],
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

            await updateCourse(courseId, payload);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save course');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                {/* Header skeleton */}
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
                {/* Grid skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                                <div className="h-4 bg-gray-100 rounded w-32" />
                                <div className="h-10 bg-gray-100 rounded w-full" />
                                <div className="h-10 bg-gray-100 rounded w-full" />
                                <div className="h-20 bg-gray-100 rounded w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-24" />
                                <div className="h-5 bg-gray-100 rounded w-16" />
                                <div className="h-5 bg-gray-100 rounded w-32" />
                                <div className="h-5 bg-gray-100 rounded w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error === 'not-found') {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-gray-400" /></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                    <p className="text-gray-500 mb-6">This course does not exist or has been removed.</p>
                    <Link href="/courses" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Courses
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
                        <button onClick={loadCourse} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Retry</button>
                        <Link href="/courses" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Back</Link>
                    </div>
                </div>
            </div>
        );
    }

    const renderSearchDropdown = (
        options: any[],
        onSelect: (item: any) => void,
        labelKey: string = 'title'
    ) => {
        if (options.length === 0) return null;
        return (
            <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                {options.map((opt: any) => (
                    <button key={opt.id} onClick={() => onSelect(opt)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50">
                        {opt.title || opt.name || opt[labelKey] || `#${opt.id}`}
                    </button>
                ))}
            </div>
        );
    };

    const RelationSelector = ({
        id,
        label,
        value,
        displayLabel,
        fetchFn,
        onSelect,
        onClear,
        placeholder = 'Select a value',
    }: {
        id: string;
        label: string;
        value: string;
        displayLabel: string;
        fetchFn: () => Promise<SimpleDocRef[]>;
        onSelect: (item: SimpleDocRef) => void;
        onClear: () => void;
        placeholder?: string;
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
            if (!isOpen) { setSearch(''); }
        }, [isOpen]);

        const filtered = search
            ? items.filter(i => (i.title || i.name || '').toLowerCase().includes(search.toLowerCase()))
            : items;

        return (
            <div ref={isOpen ? selectorRef : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                {value ? (
                    <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900">
                        <span className="truncate">{displayLabel}</span>
                        <button onClick={onClear} className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 shrink-0 ml-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setOpenSelector(isOpen ? null : id)} type="button"
                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 bg-white text-left">
                        <span>{placeholder}</span>
                        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                )}
                {isOpen && (
                    <div className="mt-1 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="p-2 border-b border-gray-100">
                            <input autoFocus type="text" value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Filter results..." />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="px-3 py-2.5 border-b border-gray-50 last:border-0 animate-pulse">
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    </div>
                                ))
                            ) : filtered.length === 0 ? (
                                <p className="px-3 py-3 text-sm text-gray-400 text-center">{search ? 'No matches' : 'No items'}</p>
                            ) : (
                                filtered.map(opt => (
                                    <button key={opt.id} onClick={() => { onSelect(opt); setOpenSelector(null); }} type="button"
                                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 border-b border-gray-50 last:border-0">
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
        <div className="p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{course?.courseCode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/courses" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button onClick={handleSave} disabled={isSaving || !form.title.trim() || !form.courseCode.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* === MAIN CONTENT === */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                                <input type="text" value={form.courseCode} onChange={e => updateField('courseCode', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={form.status} onChange={e => updateField('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <RichTextEditor
                                value={form.description}
                                onChange={(json) => updateField('description', json)}
                                placeholder="Type /image to insert an image"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                            <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Brief summary for listings..." />
                        </div>
                    </div>

                    {/* Instructor & Categories */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Instructor & Classification</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Instructor *</label>
                            <input type="text" value={form.instructorSearch} onChange={e => { updateField('instructorSearch', e.target.value); updateField('instructor', ''); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Search instructors..." />
                            {renderSearchDropdown(instructorOptions, (inst) => {
                                const label = inst.user ? `${inst.user.firstName} ${inst.user.lastName}`.trim() || `Instructor #${inst.id}` : `Instructor #${inst.id}`;
                                updateField('instructor', inst.id); updateField('instructorSearch', label); updateField('instructorLabel', label);
                                setInstructorOptions([]);
                            })}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Co-Instructors</label>
                            {form.coInstructors.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {form.coInstructors.map(id => (
                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                            #{String(id).slice(0, 8)}
                                            <button onClick={() => removeCoInstructor(id)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <input type="text" value={coInstructorSearch} onChange={e => setCoInstructorSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Search co-instructors..." />
                            {renderSearchDropdown(coInstructorOptions, (inst) => {
                                addCoInstructor(inst.id);
                            })}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {categoryOptions.map(cat => (
                                    <button key={cat.id} onClick={() => updateField('category',
                                        form.category.includes(cat.id) ? form.category.filter(id => id !== cat.id) : [...form.category, cat.id])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.category.includes(cat.id) ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                                {categoryOptions.length === 0 && <p className="text-sm text-gray-400">No categories</p>}
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Media</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                            <input type="text" value={form.thumbnailUrl} onChange={e => updateField('thumbnailUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono text-xs"
                                placeholder="Cloudinary or media URL..." />
                            {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="thumbnail preview" className="mt-2 h-24 rounded border border-gray-200 object-cover" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                            <input type="text" value={form.bannerImageUrl} onChange={e => updateField('bannerImageUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono text-xs"
                                placeholder="Cloudinary or media URL..." />
                            {form.bannerImageUrl && <img src={form.bannerImageUrl} alt="banner preview" className="mt-2 h-24 rounded border border-gray-200 object-cover" />}
                        </div>
                    </div>

                    {/* Pricing & Enrollment */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Pricing & Enrollment</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input type="number" min="0" step="0.01" value={form.price} onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price ($)</label>
                                <input type="number" min="0" step="0.01" value={form.discountedPrice} onChange={e => updateField('discountedPrice', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                                <input type="number" min="0" value={form.maxStudents} onChange={e => updateField('maxStudents', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="0 = unlimited" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Start</label>
                                <input type="datetime-local" value={form.enrollmentStartDate} onChange={e => updateField('enrollmentStartDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment End</label>
                                <input type="datetime-local" value={form.enrollmentEndDate} onChange={e => updateField('enrollmentEndDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Start</label>
                                <input type="datetime-local" value={form.courseStartDate} onChange={e => updateField('courseStartDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course End</label>
                                <input type="datetime-local" value={form.courseEndDate} onChange={e => updateField('courseEndDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                                <input type="number" min="0" value={form.estimatedDuration} onChange={e => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="Value" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select value={form.estimatedDurationUnit} onChange={e => updateField('estimatedDurationUnit', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                    {DURATION_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Modules</h2>
                        {form.modules.length > 0 && (
                            <div className="space-y-1.5">
                                {form.modules.map(id => (
                                    <div key={id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
                                        <span className="text-gray-700 font-mono text-xs">Module #{String(id).slice(0, 8)}</span>
                                        <button onClick={() => removeModule(id)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div>
                            <input type="text" value={modHook.modSearch} onChange={e => modHook.setModSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Search modules to add..." />
                            {renderSearchDropdown(modHook.modResults, (m: SimpleDocRef) => addModule(m.id))}
                        </div>
                    </div>

                    {/* Learning Objectives & Prerequisites */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Learning Objectives & Prerequisites</h2>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Learning Objectives</label>
                                <button onClick={() => updateField('learningObjectives', [...form.learningObjectives, ''])}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="h-3.5 w-3.5" />Add Objective</button>
                            </div>
                            <div className="space-y-2">
                                {form.learningObjectives.map((obj, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input type="text" value={obj} onChange={e => { const u = [...form.learningObjectives]; u[i] = e.target.value; updateField('learningObjectives', u); }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="e.g. Understand React fundamentals" />
                                        <button onClick={() => updateField('learningObjectives', form.learningObjectives.filter((_, idx) => idx !== i))}
                                            className="p-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Prerequisites</label>
                                <button onClick={() => updateField('prerequisites', [...form.prerequisites, ''])}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="h-3.5 w-3.5" />Add Prerequisite</button>
                            </div>
                            <div className="space-y-2">
                                {form.prerequisites.map((pr, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input type="text" value={pr} onChange={e => { const u = [...form.prerequisites]; u[i] = e.target.value; updateField('prerequisites', u); }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" placeholder="e.g. Basic JavaScript" />
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                        <h2 className="text-base font-bold text-gray-900">Settings</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                            <select value={form.difficultyLevel} onChange={e => updateField('difficultyLevel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <select value={form.language} onChange={e => updateField('language', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passing Grade (%)</label>
                            <input type="number" min="0" max="100" value={form.passingGrade} onChange={e => updateField('passingGrade', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Mode</label>
                            <select value={form.evaluationMode} onChange={e => updateField('evaluationMode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                                {EVALUATION_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFeatured} onChange={e => updateField('isFeatured', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Featured Course</span>
                        </label>
                    </div>

                    {/* Certification */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Certification</h2>
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Feedback</h2>
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
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Require feedback to complete</span>
                            </label>
                        )}
                    </div>

                    {/* Publishing Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h2 className="text-sm font-bold text-gray-900">Publishing</h2>
                        <div>
                            <span className="text-xs text-gray-500">Published At</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {course?.publishedAt ? new Date(course.publishedAt).toLocaleString() : 'Not published'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Last Updated</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {course?.updatedAt ? new Date(course.updatedAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Created At</span>
                            <p className="text-sm text-gray-900 font-medium">
                                {course?.createdAt ? new Date(course.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Course ID</span>
                            <p className="text-xs text-gray-400 font-mono break-all bg-gray-50 p-2 rounded mt-1">{courseId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Course saved successfully
                        <button onClick={() => setSaveSuccess(false)} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
