/**
 * CMS integration utilities for web-admin
 */

import { createCMSClient } from '@encreasl/cms-types/api';
import { payloadAuth } from './payload-auth';
import { env } from './env';

// ========================================
// CMS CLIENT INSTANCE
// ========================================

export const cmsClient = createCMSClient(
  env.NEXT_PUBLIC_CMS_SERVER_URL || 'https://cms.encreasl.com'
);

// ========================================
// AUTHENTICATED CMS CLIENT
// ========================================

export function createAuthenticatedCMSClient() {
  const token = payloadAuth.getToken();
  if (!token) {
    throw new Error('No authentication token available. Please login first.');
  }

  return createCMSClient(
    env.NEXT_PUBLIC_CMS_SERVER_URL || 'https://cms.encreasl.com',
    token
  );
}

// ========================================
// CMS CONFIGURATION
// ========================================

export const cmsConfig = {
  serverUrl: env.NEXT_PUBLIC_CMS_SERVER_URL || 'https://cms.encreasl.com',
  apiUrl: env.NEXT_PUBLIC_CMS_SERVER_URL || 'https://cms.encreasl.com',
  collections: {
    posts: 'posts',
    media: 'media',
    users: 'users',
  },
  endpoints: {
    posts: '/api/posts',
    media: '/api/media',
    users: '/api/users',
  },
} as const;

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
