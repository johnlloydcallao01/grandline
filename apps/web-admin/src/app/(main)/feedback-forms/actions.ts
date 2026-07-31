'use server';

import { getServerToken } from '@/app/actions/auth';

const CMS_API = process.env.NEXT_PUBLIC_API_URL || '';

function headers() {
    return { 'Content-Type': 'application/json' };
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getServerToken();
    const response = await fetch(`${CMS_API}${path}`, {
        ...init,
        headers: {
            ...headers(),
            ...(token ? { Authorization: `JWT ${token}` } : {}),
            ...init?.headers,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            msg = err.errors?.[0]?.message || err.message || msg;
        } catch { /* ignore parse errors */ }
        throw new Error(msg);
    }

    return response.json();
}

export interface TextInputBlock {
    id?: string;
    blockType: 'textInput';
    name: string;
    label: string;
    placeholder?: string;
    format: 'text' | 'email' | 'phone' | 'number' | 'textarea';
    isRequired?: boolean;
}

export interface ChoiceOption {
    id?: string;
    label: string;
    value: string;
}

export interface ChoiceInputBlock {
    id?: string;
    blockType: 'choiceInput';
    name: string;
    label: string;
    uiType: 'radio' | 'dropdown' | 'checkbox_group';
    options: ChoiceOption[];
    isRequired?: boolean;
}

export interface MatrixColumn {
    id?: string;
    label: string;
    value: string;
}

export interface MatrixRow {
    id?: string;
    statement: string;
    value: string;
}

export interface SurveyMatrixBlock {
    id?: string;
    blockType: 'surveyMatrix';
    name: string;
    question: string;
    columns: MatrixColumn[];
    rows: MatrixRow[];
    isRequired?: boolean;
}

export type FormFieldBlock = TextInputBlock | ChoiceInputBlock | SurveyMatrixBlock;

export interface FeedbackFormDoc {
    id: number;
    title: string;
    description?: string | null;
    fields: FormFieldBlock[];
    updatedAt: string;
    createdAt: string;
}

export interface FeedbackFormListResult {
    docs: FeedbackFormDoc[];
    totalDocs: number;
    totalPages: number;
    page: number;
    limit: number;
}

interface ListParams {
    search?: string;
    page?: number;
    limit?: number;
}

export async function getFormsList(params: ListParams = {}): Promise<FeedbackFormListResult> {
    const qs = new URLSearchParams();
    if (params.search) qs.append('where[title][like]', params.search);
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    qs.append('sort', '-createdAt');
    qs.append('depth', '1');
    return authFetch<FeedbackFormListResult>(`/feedback-forms?${qs}`);
}

export async function getFormById(id: number | string): Promise<FeedbackFormDoc> {
    const data = await authFetch<{ doc?: FeedbackFormDoc } | FeedbackFormDoc>(`/feedback-forms/${id}?depth=2`);
    return (data as any).doc || (data as FeedbackFormDoc);
}

export async function createForm(payload: Record<string, any>): Promise<FeedbackFormDoc> {
    const data = await authFetch<{ doc?: FeedbackFormDoc } | FeedbackFormDoc>(`/feedback-forms`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as FeedbackFormDoc);
}

export async function updateForm(id: number | string, payload: Record<string, any>): Promise<FeedbackFormDoc> {
    const data = await authFetch<{ doc?: FeedbackFormDoc } | FeedbackFormDoc>(`/feedback-forms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as FeedbackFormDoc);
}

export async function deleteForm(id: number | string): Promise<void> {
    await authFetch(`/feedback-forms/${id}`, { method: 'DELETE' });
}
