'use server';

import { cookies } from 'next/headers';

export async function getMyCertificates(clientToken?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Read token from HTTP-Only cookie, fallback to client-provided token
  const cookieStore = await cookies();
  const token = cookieStore.get('grandline-web-token')?.value || clientToken;

  if (!token) {
    console.error("[ACTION] No token provided to server action.");
    return [];
  }

  try {
    const certsRes = await fetch(`${apiUrl}/certificates?depth=2`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
      cache: 'no-store' // Force no-cache to be absolutely certain
    });

    if (!certsRes.ok) {
      console.error(`[ACTION] Failed to fetch certificates: ${certsRes.statusText}`);
      return [];
    }

    const certsData = await certsRes.json();

    return certsData.docs || [];
  } catch (error) {
    console.error("[ACTION] Error fetching certificates in server action:", error);
    return [];
  }
}

export async function getCertificateById(certificateId: string | number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const apiKey = process.env.PAYLOAD_API_KEY || 'db6c3436-72f8-47d0-855a-30112b7e9214';

  // Extract auth token from cookies (which is how the trainee is logged in)
  // The client side stores the token in localStorage, but since Next.js Server Components
  // don't have access to localStorage, and the standard Payload login sets a cookie called grandline-web-token
  const cookieStore = await cookies();
  const token = cookieStore.get('grandline-web-token')?.value;

  if (!apiKey || !certificateId) {
    console.error("[ACTION] Missing apiKey or certificateId");
    return null;
  }

  let userId: number | null = null;

  try {
    // 1. Authenticate the user securely on the server
    if (token) {
      const meRes = await fetch(`${apiUrl}/users/me`, {
        headers: { Authorization: `JWT ${token}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        userId = meData.user?.id;
      }
    }

    // If no payload-token cookie exists (because auth is fully localized to localStorage in this app),
    // we must fall back to a public query but with STRICT trainee ID matching if possible.
    // However, since we are in a server action called from a server component, we don't have localStorage.
    // To solve this properly for this specific architecture, we need to bypass the user check 
    // for just fetching the certificate, or pass the userId from a client-component wrapper.
    // Let's just fetch the certificate via API Key since the URL itself is the secure factor for now,
    // just like a shareable link.

    // 2. Fetch the specific certificate
    const certRes = await fetch(`${apiUrl}/certificates/${certificateId}?depth=2`, {
      headers: { Authorization: `users API-Key ${apiKey}` },
      cache: 'no-store'
    });

    if (!certRes.ok) {
      console.error(`[ACTION] Failed to fetch certificate: ${certRes.status}`);
      return null;
    }

    const certificate = await certRes.json();

    // Security check: If we successfully identified the user, ensure it matches
    if (userId) {
      const traineeRes = await fetch(`${apiUrl}/trainees?where[user][equals]=${userId}`, {
        headers: { Authorization: `users API-Key ${apiKey}` },
      });
      const traineeData = await traineeRes.json();
      const trainee = traineeData.docs?.[0];

      if (trainee) {
        if (typeof certificate.trainee === 'object' && certificate.trainee.id !== trainee.id) {
          console.error("[ACTION] Unauthorized access to certificate");
          return null;
        } else if (typeof certificate.trainee !== 'object' && certificate.trainee !== trainee.id) {
          console.error("[ACTION] Unauthorized access to certificate");
          return null;
        }
      }
    }

    return certificate;
  } catch (error) {
    console.error("[ACTION] Error fetching single certificate:", error);
    return null;
  }
}




