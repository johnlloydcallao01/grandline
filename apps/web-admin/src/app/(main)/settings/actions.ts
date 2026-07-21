'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type SocialLink = {
  id?: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
};

export type SiteSettingsData = {
  id?: number;
  siteName: string;
  description?: string | null;
  logo?: { id: number; url?: string; cloudinaryURL?: string; alt?: string; filename?: string } | number | null;
  favicon?: { id: number; url?: string; cloudinaryURL?: string; alt?: string; filename?: string } | number | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  socialLinks?: SocialLink[] | null;
  createdAt?: string;
  updatedAt?: string;
};

async function fetchAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as T | { errors?: Array<{ message: string }> } | null;

  if (!response.ok) {
    let errorMessage = 'Failed to load site settings.';
    if (payload && typeof payload === 'object') {
      const p = payload as Record<string, unknown>;
      if (Array.isArray(p.errors) && p.errors.length > 0) {
        errorMessage = p.errors[0].message;
      } else if (typeof p.error === 'string') {
        errorMessage = p.error;
      }
    }
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function fetchSiteSettings(): Promise<SiteSettingsData> {
  return fetchAdmin<SiteSettingsData>('/globals/site-settings?depth=1');
}

export async function updateSiteSettings(data: Record<string, unknown>): Promise<SiteSettingsData> {
  return fetchAdmin<SiteSettingsData>('/globals/site-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
