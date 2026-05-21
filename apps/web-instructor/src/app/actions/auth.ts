'use server';

import { cookies } from 'next/headers';
import type { LoginCredentials, AuthResponse, User } from '@/types/auth';

function normalizeApiBaseUrl(raw?: string): string {
    const fallback = 'https://cms.grandlinemaritime.com/api';
    const trimmed = (raw || '').trim();
    let base = trimmed || fallback;

    if (!/^https?:\/\//i.test(base)) {
        base = `https://${base}`;
    }

    base = base.replace(/\/+$/, '');

    if (!/\/api$/i.test(base)) {
        base = `${base}/api`;
    }

    return base;
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

async function readJsonResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        if (contentType.includes('text/html') || text.trim().startsWith('<')) {
            throw new Error(`Instructor auth endpoint returned HTML instead of JSON. Check NEXT_PUBLIC_API_URL: ${API_BASE_URL}`);
        }

        throw new Error(`Instructor auth endpoint returned a non-JSON response. Check NEXT_PUBLIC_API_URL: ${API_BASE_URL}`);
    }
}

export async function serverLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/instructor-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Login failed');
    }

    if (data.user?.role !== 'instructor') {
        throw new Error('Access denied. Only instructors can access this application.');
    }

    if (data.token) {
        const cookieStore = await cookies();
        cookieStore.set('grandline-instructor-token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });
    }

    return {
        message: data.message,
        user: data.user,
        token: data.token,
        exp: data.exp,
    };
}

export async function serverLogout() {
    const cookieStore = await cookies();
    cookieStore.delete('grandline-instructor-token');

    try {
        await fetch(`${API_BASE_URL}/users/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (_e) {
        // Ignore payload logout errors
    }
}

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('grandline-instructor-token')?.value;

    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/users/me?depth=2`, {
            headers: { Authorization: `JWT ${token}` },
            cache: 'no-store',
        });

        if (!response.ok) return null;

        const data = await readJsonResponse(response);

        if (data.user && data.user.role === 'instructor') {
            return data.user;
        }

        return null;
    } catch {
        return null;
    }
}

export async function getServerToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('grandline-instructor-token')?.value || null;
}

export async function serverRefresh(): Promise<AuthResponse> {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('grandline-instructor-token')?.value;

    if (!currentToken) {
        throw new Error('No authentication token available for refresh');
    }

    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { Authorization: `users JWT ${currentToken}` },
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
        throw new Error(data.message || 'Access denied during refresh');
    }

    if (data.user?.role !== 'instructor') {
        throw new Error('Access denied during refresh');
    }

    if (data.token) {
        cookieStore.set('grandline-instructor-token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });
    }

    return {
        message: data.message,
        user: data.user,
        token: data.token,
        exp: data.exp,
    };
}
