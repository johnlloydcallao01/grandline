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
