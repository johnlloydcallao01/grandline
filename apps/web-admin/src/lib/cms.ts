/**
 * CMS integration utilities for web-admin
 * Now using Redux RTK Query for consistency with apps/web
 */

import { env } from './env';

// ========================================
// CMS CONFIGURATION
// ========================================

export const cmsConfig = {
  apiUrl: env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api',
  serverUrl: env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://cms.grandlinemaritime.com',
  collections: {
    posts: 'posts',
    media: 'media',
    users: 'users',
  },
  endpoints: {
    posts: '/posts',
    media: '/media',
    users: '/users',
  },
} as const;

// ========================================
// AUTHENTICATED FETCH HELPER
// ========================================

/**
 * Drop-in replacement for fetch() that automatically attaches the admin JWT
 * Authorization header from localStorage. Use this for ALL CMS API calls in
 * web-admin to avoid intermittent 403s caused by missing credentials.
 *
 * Example:
 *   const res = await cmsApiFetch(`${cmsConfig.apiUrl}/certificate-templates?depth=1&limit=100`);
 */
export function cmsApiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);

  // Attach JWT from localStorage (admin-specific key)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('grandline_auth_token_admin');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `users JWT ${token}`);
    }
  }

  return fetch(url, {
    ...options,
    headers,
    // Do NOT set credentials: 'include' — cookies don't work cross-domain.
    // The Authorization header is the only reliable auth mechanism here.
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function getCMSImageUrl(filename: string): string {
  if (!filename) return '';
  
  // If it's already a full URL, return as-is
  if (filename.startsWith('http')) return filename;
  
  // Construct URL from CMS server
  return `${cmsConfig.serverUrl}/media/${filename}`;
}

export function formatCMSDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatCMSDateTime(dateString: string): string {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
