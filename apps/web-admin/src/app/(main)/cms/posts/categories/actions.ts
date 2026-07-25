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

export interface PostCategoryDoc {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: { id: number; url?: string; filename?: string; alt?: string } | number | null;
    colorCode?: string | null;
    displayOrder?: number | null;
    isActive?: boolean | null;
    updatedAt: string;
    createdAt: string;
}

export interface PostCategoryListResult {
    docs: PostCategoryDoc[];
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

export async function getCategoriesList(params: ListParams = {}): Promise<PostCategoryListResult> {
    const qs = new URLSearchParams();
    if (params.search) qs.append('where[name][like]', params.search);
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    qs.append('sort', 'displayOrder');
    qs.append('depth', '1');
    return authFetch<PostCategoryListResult>(`/post-categories?${qs}`);
}

export async function getCategoryById(id: number | string): Promise<PostCategoryDoc> {
    const data = await authFetch<{ doc?: PostCategoryDoc } | PostCategoryDoc>(`/post-categories/${id}?depth=2`);
    return (data as any).doc || (data as PostCategoryDoc);
}

export async function createCategory(payload: Record<string, any>): Promise<PostCategoryDoc> {
    const data = await authFetch<{ doc?: PostCategoryDoc } | PostCategoryDoc>(`/post-categories`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as PostCategoryDoc);
}

export async function updateCategory(id: number | string, payload: Record<string, any>): Promise<PostCategoryDoc> {
    const data = await authFetch<{ doc?: PostCategoryDoc } | PostCategoryDoc>(`/post-categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as PostCategoryDoc);
}

export async function deleteCategory(id: number | string): Promise<void> {
    await authFetch(`/post-categories/${id}`, { method: 'DELETE' });
}

export async function getAllCategories(): Promise<{ id: number; name: string }[]> {
    const data = await authFetch<PostCategoryListResult>(`/post-categories?depth=0&limit=200&sort=name`);
    return (data.docs || []).map(c => ({ id: c.id, name: c.name }));
}
