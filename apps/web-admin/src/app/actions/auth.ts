'use server';

import { cookies } from 'next/headers';
import type { LoginCredentials, AuthResponse, User } from '@/types/auth';
import { sanitizeUser } from '@/lib/sanitizeUser';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export async function serverLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Login failed');
    }

    const user = sanitizeUser(data.user);

    if (!user || user.role !== 'admin') {
        throw new Error('Access denied. Only administrators can access this application.');
    }

    if (data.token) {
        const cookieStore = await cookies();
        cookieStore.set('grandline-admin-token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });
    }

    return {
        message: data.message,
        user,
        token: data.token,
        exp: data.exp,
    };
}

export async function serverLogout() {
    const cookieStore = await cookies();
    cookieStore.delete('grandline-admin-token');

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
    const token = cookieStore.get('grandline-admin-token')?.value;

    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/users/me?depth=2`, {
            headers: { Authorization: `JWT ${token}` },
            cache: 'no-store',
        });

        if (!response.ok) return null;

        const data = await response.json();

        const user = sanitizeUser(data.user);

        if (user && user.role === 'admin') {
            return user;
        }

        return null;
    } catch {
        return null;
    }
}

export async function getServerToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('grandline-admin-token')?.value || null;
}

export async function serverRefresh(): Promise<AuthResponse> {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('grandline-admin-token')?.value;

    if (!currentToken) {
        throw new Error('No authentication token available for refresh');
    }

    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { Authorization: `JWT ${currentToken}` },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Access denied during refresh');
    }

    const user = sanitizeUser(data.user);

    if (!user || user.role !== 'admin') {
        throw new Error('Access denied during refresh');
    }

    const refreshedToken = data.refreshedToken || data.token;

    if (refreshedToken) {
        cookieStore.set('grandline-admin-token', refreshedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });
    }

    return {
        message: data.message,
        user,
        token: refreshedToken,
        exp: data.exp,
    };
}
