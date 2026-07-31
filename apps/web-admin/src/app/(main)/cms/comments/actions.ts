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

export interface PostRef {
    id: number;
    title?: string;
    slug?: string;
}

export interface AuthorRef {
    id: number;
    name?: string;
    email?: string;
}

export interface PostCommentDoc {
    id: number;
    post: PostRef | number;
    parent?: PostCommentDoc | number | null;
    content: string;
    author?: AuthorRef | number | null;
    authorName?: string | null;
    authorEmail?: string | null;
    status: 'approved' | 'pending' | 'spam';
    updatedAt: string;
    createdAt: string;
}

export interface PostCommentListResult {
    docs: PostCommentDoc[];
    totalDocs: number;
    totalPages: number;
    page: number;
    limit: number;
}

interface ListParams {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export async function getCommentsList(params: ListParams = {}): Promise<PostCommentListResult> {
    const qs = new URLSearchParams();
    const where: string[] = [];
    if (params.search) {
        where.push(`or[content][like]=${encodeURIComponent(params.search)}`);
        where.push(`or[authorName][like]=${encodeURIComponent(params.search)}`);
    }
    if (params.status) qs.append('where[status][equals]', params.status);
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    qs.append('sort', '-createdAt');
    qs.append('depth', '1');
    const queryStr = where.length ? `&${where.join('&')}` : '';
    return authFetch<PostCommentListResult>(`/post-comments?${qs}${queryStr}`);
}

export async function getCommentById(id: number | string): Promise<PostCommentDoc> {
    const data = await authFetch<{ doc?: PostCommentDoc } | PostCommentDoc>(`/post-comments/${id}?depth=2`);
    return (data as any).doc || (data as PostCommentDoc);
}

export async function updateComment(id: number | string, payload: Record<string, any>): Promise<PostCommentDoc> {
    const data = await authFetch<{ doc?: PostCommentDoc } | PostCommentDoc>(`/post-comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as PostCommentDoc);
}

export async function deleteComment(id: number | string): Promise<void> {
    await authFetch(`/post-comments/${id}`, { method: 'DELETE' });
}
