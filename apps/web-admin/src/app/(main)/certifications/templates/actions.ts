'use server';

import { cmsConfig } from '@/lib/cms';

export async function getCertificateTemplates() {
  const apiKey = process.env.PAYLOAD_API_KEY;

  if (!apiKey) {
    console.error('PAYLOAD_API_KEY is not defined in environment variables');
    throw new Error('Server configuration error: Missing API Key');
  }

  try {
    const response = await fetch(`${cmsConfig.apiUrl}/certificate-templates?depth=1&limit=100`, {
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CMS Error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching certificate templates:', error);
    throw error;
  }
}

export async function getCertificateTemplateById(id: string) {
  const apiKey = process.env.PAYLOAD_API_KEY;

  if (!apiKey) {
    console.error('PAYLOAD_API_KEY is not defined in environment variables');
    throw new Error('Server configuration error: Missing API Key');
  }

  try {
    const response = await fetch(`${cmsConfig.apiUrl}/certificate-templates/${id}?depth=1`, {
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CMS Error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching certificate template ${id}:`, error);
    throw error;
  }
}

export async function updateCertificateTemplate(id: string | null, payload: any) {
  const apiKey = process.env.PAYLOAD_API_KEY;

  if (!apiKey) {
    console.error('PAYLOAD_API_KEY is not defined in environment variables');
    throw new Error('Server configuration error: Missing API Key');
  }

  try {
    const url = id
      ? `${cmsConfig.apiUrl}/certificate-templates/${id}`
      : `${cmsConfig.apiUrl}/certificate-templates`;

    const method = id ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CMS Error (${response.status}):`, errorText);

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.errors?.[0]?.message || `Failed to save template: ${response.statusText}`);
      } catch (_e) {
        throw new Error(`Failed to save template: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving certificate template:', error);
    throw error;
  }
}
