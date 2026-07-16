'use server';

import { cmsConfig } from '@/lib/cms';

async function cmsFetch(path: string, options: RequestInit = {}) {
  const apiKey = process.env.PAYLOAD_API_KEY;

  if (!apiKey) {
    console.error('PAYLOAD_API_KEY is not defined in environment variables');
    throw new Error('Server configuration error: Missing API Key');
  }

  const url = `${cmsConfig.apiUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `users API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`CMS Error (${res.status}):`, errorText);
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getCertificateTemplates() {
  const data = await cmsFetch('/lms/certificate-templates?limit=100');
  return data.docs || [];
}

export async function getCertificateTemplateById(id: string) {
  return cmsFetch(`/lms/certificate-templates?id=${encodeURIComponent(id)}`);
}

export async function updateCertificateTemplate(id: string | null, payload: any) {
  if (id) {
    return cmsFetch(`/lms/certificate-templates?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  return cmsFetch('/lms/certificate-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getLmsMedia(limit = 60) {
  const data = await cmsFetch(`/lms/media?limit=${limit}`);
  return data;
}

export async function getLmsMediaById(id: string | number) {
  return cmsFetch(`/lms/media?id=${encodeURIComponent(String(id))}`);
}
