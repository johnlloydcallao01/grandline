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

export interface PostTagDoc {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    colorCode?: string | null;
    displayOrder?: number | null;
    isActive?: boolean | null;
    updatedAt: string;
    createdAt: string;
}

export interface PostTagListResult {
    docs: PostTagDoc[];
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

export async function getTagsList(params: ListParams = {}): Promise<PostTagListResult> {
    const qs = new URLSearchParams();
    if (params.search) qs.append('where[name][like]', params.search);
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    qs.append('sort', 'displayOrder');
    qs.append('depth', '1');
    return authFetch<PostTagListResult>(`/post-tags?${qs}`);
}

export async function getTagById(id: number | string): Promise<PostTagDoc> {
    const data = await authFetch<{ doc?: PostTagDoc } | PostTagDoc>(`/post-tags/${id}?depth=2`);
    return (data as any).doc || (data as PostTagDoc);
}

export async function createTag(payload: Record<string, any>): Promise<PostTagDoc> {
    const data = await authFetch<{ doc?: PostTagDoc } | PostTagDoc>(`/post-tags`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as PostTagDoc);
}

export async function updateTag(id: number | string, payload: Record<string, any>): Promise<PostTagDoc> {
    const data = await authFetch<{ doc?: PostTagDoc } | PostTagDoc>(`/post-tags/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as PostTagDoc);
}

export async function deleteTag(id: number | string): Promise<void> {
    await authFetch(`/post-tags/${id}`, { method: 'DELETE' });
}
