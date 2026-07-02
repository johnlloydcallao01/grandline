'use server';

const CMS_API = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.PAYLOAD_API_KEY;

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  };
}

function apiUrl(path: string): string {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL');
  return `${CMS_API}${path}`;
}

export async function getEligibleEnrollments(search?: string) {
  if (!CMS_API || !API_KEY) {
    throw new Error('Missing API configuration');
  }

  const url = new URL(apiUrl('/lms/enrollments/eligible'));

  if (search && search.trim()) {
    url.searchParams.set('search', search.trim());
  }
  url.searchParams.set('limit', '100');

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Failed to fetch enrollments: ${res.statusText}`);
  }

  const data = await res.json();

  return (data.docs || []) as any[];
}

export async function issueCertificate(enrollmentId: number) {
  if (!CMS_API || !API_KEY) {
    throw new Error('Missing API configuration');
  }

  const res = await fetch(apiUrl('/generate-certificate'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ enrollmentId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate certificate: ${res.statusText}`);
  }

  return await res.json();
}
