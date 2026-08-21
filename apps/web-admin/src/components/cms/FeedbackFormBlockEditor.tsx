'use client';

import React from 'react';
import {
    Plus, X, AlertTriangle, CheckCircle
} from '@/components/ui/IconWrapper';
import type { FormFieldBlock, TextInputBlock, ChoiceInputBlock, SurveyMatrixBlock, ChoiceOption, MatrixColumn, MatrixRow } from '@encreasl/cms-types';

interface Props {
    fields: FormFieldBlock[];
    onChange: (fields: FormFieldBlock[]) => void;
    error: string | null;
    saveSuccess: boolean;
    onClearError: () => void;
}

const FORMAT_OPTIONS = [
    { label: 'Text', value: 'text' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Number', value: 'number' },
    { label: 'Textarea', value: 'textarea' },
];

const UI_TYPE_OPTIONS = [
    { label: 'Radio Buttons', value: 'radio' },
    { label: 'Dropdown', value: 'dropdown' },
    { label: 'Checkboxes', value: 'checkbox_group' },
];

let blockCounter = 0;
function nextId(): string {
    blockCounter++;
    return `block_${blockCounter}_${Date.now()}`;
}

function addBlock(fields: FormFieldBlock[], blockType: FormFieldBlock['blockType']): FormFieldBlock[] {
    const base = { id: nextId() };
    switch (blockType) {
        case 'textInput':
            return [...fields, { ...base, blockType: 'textInput', name: '', label: '', placeholder: '', format: 'text', isRequired: false } as TextInputBlock];
        case 'choiceInput':
            return [...fields, { ...base, blockType: 'choiceInput', name: '', label: '', uiType: 'radio', options: [], isRequired: false } as ChoiceInputBlock];
        case 'surveyMatrix':
            return [...fields, { ...base, blockType: 'surveyMatrix', name: '', question: '', columns: [], rows: [], isRequired: false } as SurveyMatrixBlock];
    }
}

function removeBlock(fields: FormFieldBlock[], index: number): FormFieldBlock[] {
    return fields.filter((_, i) => i !== index);
}

function moveBlock(fields: FormFieldBlock[], from: number, to: number): FormFieldBlock[] {
    if (to < 0 || to >= fields.length) return fields;
    const result = [...fields];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);
    return result;
}

function updateBlock<T extends FormFieldBlock>(fields: FormFieldBlock[], index: number, updates: Partial<T>): FormFieldBlock[] {
    return fields.map((f, i) => i === index ? { ...f, ...updates } as T : f);
}

export default function FeedbackFormBlockEditor({ fields, onChange, error, saveSuccess, onClearError }: Props) {
    return (
        <div className="space-y-4">
            {/* Field Blocks */}
            {fields.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No fields added yet. Add a field to start building your form.</p>
                </div>
            ) : (
                fields.map((field, index) => (
                    <FieldBlockEditor
                        key={field.id || index}
                        field={field}
                        index={index}
                        total={fields.length}
                        onChange={(updates) => onChange(updateBlock(fields, index, updates))}
                        onRemove={() => onChange(removeBlock(fields, index))}
                        onMoveUp={() => onChange(moveBlock(fields, index, index - 1))}
                        onMoveDown={() => onChange(moveBlock(fields, index, index + 1))}
                    />
                ))
            )}

            {/* Add Field Buttons */}
            <div className="flex flex-wrap gap-2">
                <AddBlockDropdown onSelect={(type) => onChange(addBlock(fields, type))} />
            </div>

            {error && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                        <button onClick={onClearError} className="ml-1 hover:bg-red-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {saveSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Form saved successfully
                        <button onClick={onClearError} className="ml-1 hover:bg-green-700 rounded p-0.5">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddBlockDropdown({ onSelect }: { onSelect: (type: FormFieldBlock['blockType']) => void }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen(!open)}
                className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-lg z-50 py-1">
                    {([
                        { type: 'textInput' as const, label: 'Text Input', desc: 'Single/multi-line text, email, number' },
                        { type: 'choiceInput' as const, label: 'Choice Input', desc: 'Radio, dropdown, or checkboxes' },
                        { type: 'surveyMatrix' as const, label: 'Survey Matrix', desc: 'Grid of statements × ratings' },
                    ]).map(item => (
                        <button key={item.type} type="button" onClick={() => { onSelect(item.type); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function FieldBlockEditor({ field, index, total, onChange, onRemove, onMoveUp, onMoveDown }: {
    key?: string | number;
    field: FormFieldBlock;
    index: number;
    total: number;
    onChange: (updates: Partial<FormFieldBlock>) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const blockLabel = field.blockType === 'textInput' ? 'Text Input'
        : field.blockType === 'choiceInput' ? 'Choice Input'
        : 'Survey Matrix';

    const blockColor = field.blockType === 'textInput' ? 'border-l-blue-500'
        : field.blockType === 'choiceInput' ? 'border-l-amber-500'
        : 'border-l-purple-500';

    return (
        <div className={`bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] border-l-4 ${blockColor} shadow-sm overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-[var(--card-border)]">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5 text-gray-400 dark:text-gray-500">
                        <button type="button" onClick={onMoveUp} disabled={index === 0}
                            className="disabled:opacity-30 hover:text-gray-600 dark:hover:text-gray-300 leading-none text-xs">▲</button>
                        <button type="button" onClick={onMoveDown} disabled={index === total - 1}
                            className="disabled:opacity-30 hover:text-gray-600 dark:hover:text-gray-300 leading-none text-xs">▼</button>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{blockLabel}</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{field.name || `Field ${index + 1}`}</p>
                    </div>
                </div>
                <button type="button" onClick={onRemove}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                {field.blockType === 'textInput' && <TextInputEditor field={field} onChange={onChange as (u: Partial<TextInputBlock>) => void} />}
                {field.blockType === 'choiceInput' && <ChoiceInputEditor field={field} onChange={onChange as (u: Partial<ChoiceInputBlock>) => void} />}
                {field.blockType === 'surveyMatrix' && <SurveyMatrixEditor field={field} onChange={onChange as (u: Partial<SurveyMatrixBlock>) => void} />}
            </div>
        </div>
    );
}

function TextInputEditor({ field, onChange }: { field: TextInputBlock; onChange: (u: Partial<TextInputBlock>) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" value={field.name} onChange={e => onChange({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                    placeholder="e.g. full_name" />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label *</label>
                <input type="text" value={field.label} onChange={e => onChange({ label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                    placeholder="e.g. Full Name" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placeholder</label>
                <input type="text" value={field.placeholder || ''} onChange={e => onChange({ placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                    placeholder="Optional placeholder" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                <select value={field.format} onChange={e => onChange({ format: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                    {FORMAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id={`required-${field.id}`} checked={field.isRequired || false}
                    onChange={e => onChange({ isRequired: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 bg-white dark:bg-[var(--card-background)]" />
                <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">Required</label>
            </div>
        </div>
    );
}

function ChoiceInputEditor({ field, onChange }: { field: ChoiceInputBlock; onChange: (u: Partial<ChoiceInputBlock>) => void }) {
    const addOption = () => onChange({
        options: [...field.options, { label: '', value: '' }]
    });
    const removeOption = (i: number) => onChange({
        options: field.options.filter((_, idx) => idx !== i)
    });
    const updateOption = (i: number, updates: Partial<ChoiceOption>) => onChange({
        options: field.options.map((o, idx) => idx === i ? { ...o, ...updates } : o)
    });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                    <input type="text" value={field.name} onChange={e => onChange({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                        placeholder="e.g. experience_level" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UI Type</label>
                    <select value={field.uiType} onChange={e => onChange({ uiType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]">
                        {UI_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label *</label>
                    <input type="text" value={field.label} onChange={e => onChange({ label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                        placeholder="e.g. Experience Level" />
                </div>
            </div>

            {/* Options */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options *</label>
                <div className="space-y-2">
                    {field.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="text" value={opt.label} onChange={e => updateOption(i, { label: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Label (e.g. Beginner)" />
                            <input type="text" value={opt.value} onChange={e => updateOption(i, { value: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                                placeholder="Value (e.g. beginner)" />
                            <button type="button" onClick={() => removeOption(i)}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addOption}
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id={`required-${field.id}`} checked={field.isRequired || false}
                    onChange={e => onChange({ isRequired: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 bg-white dark:bg-[var(--card-background)]" />
                <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">Required</label>
            </div>
        </div>
    );
}

function SurveyMatrixEditor({ field, onChange }: { field: SurveyMatrixBlock; onChange: (u: Partial<SurveyMatrixBlock>) => void }) {
    const addColumn = () => onChange({
        columns: [...field.columns, { label: '', value: '' }]
    });
    const removeColumn = (i: number) => onChange({
        columns: field.columns.filter((_, idx) => idx !== i)
    });
    const updateColumn = (i: number, updates: Partial<MatrixColumn>) => onChange({
        columns: field.columns.map((c, idx) => idx === i ? { ...c, ...updates } : c)
    });

    const addRow = () => onChange({
        rows: [...field.rows, { statement: '', value: '' }]
    });
    const removeRow = (i: number) => onChange({
        rows: field.rows.filter((_, idx) => idx !== i)
    });
    const updateRow = (i: number, updates: Partial<MatrixRow>) => onChange({
        rows: field.rows.map((r, idx) => idx === i ? { ...r, ...updates } : r)
    });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                    <input type="text" value={field.name} onChange={e => onChange({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                        placeholder="e.g. course_evaluation" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question *</label>
                    <input type="text" value={field.question} onChange={e => onChange({ question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                        placeholder="e.g. Rate each aspect of the course" />
                </div>
            </div>

            {/* Columns */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating Columns * (min 2)</label>
                <div className="space-y-2">
                    {field.columns.map((col, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="text" value={col.label} onChange={e => updateColumn(i, { label: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Label (e.g. Strongly Disagree)" />
                            <input type="text" value={col.value} onChange={e => updateColumn(i, { value: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                                placeholder="Value (e.g. strongly_disagree)" />
                            <button type="button" onClick={() => removeColumn(i)}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addColumn}
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Column
                    </button>
                </div>
            </div>

            {/* Rows */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statements / Rows * (min 1)</label>
                <div className="space-y-2">
                    {field.rows.map((row, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="text" value={row.statement} onChange={e => updateRow(i, { statement: e.target.value })}
                                className="flex-[2] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)]"
                                placeholder="Statement (e.g. Content was clear)" />
                            <input type="text" value={row.value} onChange={e => updateRow(i, { value: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 focus:border-blue-500 dark:focus:border-[#201a7c] text-gray-900 dark:text-gray-100 bg-white dark:bg-[var(--card-background)] font-mono text-xs"
                                placeholder="Value (e.g. content_clarity)" />
                            <button type="button" onClick={() => removeRow(i)}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addRow}
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Row
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id={`required-${field.id}`} checked={field.isRequired || false}
                    onChange={e => onChange({ isRequired: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-[#201a7c]/20 bg-white dark:bg-[var(--card-background)]" />
                <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">Required</label>
            </div>
        </div>
    );
}
