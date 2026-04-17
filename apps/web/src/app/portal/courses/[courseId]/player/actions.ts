'use server';

import { getServerToken, getServerUser } from '@/app/actions/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

/**
 * Uploads a file to the CMS media collection.
 */
export async function uploadMedia(formData: FormData) {
  const token = await getServerToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_BASE_URL}/media`, {
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
      // Do not set Content-Type for FormData, the browser sets it with the boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.errors?.[0]?.message || 'Failed to upload file');
  }

  const data = await res.json();
  return data.doc;
}

/**
 * Fetches all assignment submissions for a specific course for the current trainee.
 */
export async function fetchAssignmentSubmissions(courseId: string) {
  const token = await getServerToken();
  const user = await getServerUser();

  if (!token || !user) throw new Error('Unauthorized');

  // Only trainees can have assignment submissions
  if (user.role !== 'trainee') return {};

  // Find the trainee ID for this user using API key for bypass
  const apiKey = process.env.PAYLOAD_API_KEY;
  if (!apiKey) throw new Error('API key not configured');

  const headersWithKey = {
    'Content-Type': 'application/json',
    'Authorization': `users API-Key ${apiKey}`,
  };

  const traineeRes = await fetch(`${API_BASE_URL}/trainees?where[user][equals]=${user.id}`, {
    headers: headersWithKey,
    cache: 'no-store',
  });

  if (!traineeRes.ok) return {}; // Not a trainee or failed to fetch
  const traineeData = await traineeRes.json();
  const trainee = traineeData.docs?.[0];

  if (!trainee) return {}; // Not a trainee profile, safely return empty object
  const traineeId = trainee.id;

  // Fetch the enrollment for this trainee and course using API key to bypass restrictions
  const enrollmentRes = await fetch(
    `${API_BASE_URL}/course-enrollments?where[student][equals]=${traineeId}&where[course][equals]=${courseId}`,
    {
      headers: headersWithKey,
      cache: 'no-store',
    }
  );

  if (!enrollmentRes.ok) throw new Error('Failed to find course enrollment');
  const enrollmentData = await enrollmentRes.json();
  const enrollmentId = enrollmentData.docs?.[0]?.id;

  if (!enrollmentId) return {}; // Not enrolled, no submissions

  // Fetch the assignment submissions using API key
  const submissionsRes = await fetch(
    `${API_BASE_URL}/assignment-submissions?where[trainee][equals]=${traineeId}&where[enrollment][equals]=${enrollmentId}&limit=1000`,
    {
      headers: headersWithKey,
      cache: 'no-store',
    }
  );

  if (!submissionsRes.ok) throw new Error('Failed to fetch assignment submissions');
  const submissionsData = await submissionsRes.json();

  // Group by assignment ID
  const submissionsMap: Record<string, any[]> = {};
  for (const doc of submissionsData.docs || []) {
    const assignmentId = typeof doc.assignment === 'object' ? doc.assignment.id : doc.assignment;
    if (!submissionsMap[assignmentId]) {
      submissionsMap[assignmentId] = [];
    }
    submissionsMap[assignmentId].push(doc);
  }

  return submissionsMap;
}

/**
 * Submits an assignment.
 */
export async function submitAssignment(
  courseId: string,
  assignmentId: string,
  content: string,
  fileIds: string[]
) {
  const token = await getServerToken();
  const user = await getServerUser();

  if (!token || !user) throw new Error('Unauthorized');

  if (user.role !== 'trainee') throw new Error('Only trainees can submit assignments');

  // Find the trainee ID for this user using API key for bypass
  const apiKey = process.env.PAYLOAD_API_KEY;
  if (!apiKey) throw new Error('API key not configured');

  const headersWithKey = {
    'Content-Type': 'application/json',
    'Authorization': `users API-Key ${apiKey}`,
  };

  const traineeRes = await fetch(`${API_BASE_URL}/trainees?where[user][equals]=${user.id}`, {
    headers: headersWithKey,
    cache: 'no-store',
  });

  if (!traineeRes.ok) throw new Error('Failed to find trainee profile');
  const traineeData = await traineeRes.json();
  const trainee = traineeData.docs?.[0];

  if (!trainee) throw new Error('Trainee profile not found');
  const traineeId = trainee.id;

  // Fetch the enrollment for this trainee and course using API key to bypass restrictions
  const enrollmentRes = await fetch(
    `${API_BASE_URL}/course-enrollments?where[student][equals]=${traineeId}&where[course][equals]=${courseId}`,
    {
      headers: headersWithKey,
      cache: 'no-store',
    }
  );

  if (!enrollmentRes.ok) throw new Error('Failed to find course enrollment');
  const enrollmentData = await enrollmentRes.json();
  const enrollmentId = enrollmentData.docs?.[0]?.id;

  if (!enrollmentId) throw new Error('Not enrolled in this course');

  // Convert simple string to Payload Lexical richText JSON
  let lexicalContent: any = null;
  if (content) {
    lexicalContent = {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: content,
                type: 'text',
                version: 1
              }
            ]
          }
        ]
      }
    };
  }

  // Find if there's already a draft submission to update
  const existingRes = await fetch(
    `${API_BASE_URL}/assignment-submissions?where[trainee][equals]=${traineeId}&where[assignment][equals]=${assignmentId}&where[status][equals]=draft`,
    {
      headers: headersWithKey,
      cache: 'no-store',
    }
  );

  const existingData = await existingRes.json();
  const existingDraftId = existingData.docs?.[0]?.id;

  const payloadData = {
    assignment: Number(assignmentId),
    trainee: Number(traineeId),
    enrollment: Number(enrollmentId),
    status: 'submitted',
    submittedText: lexicalContent,
    uploadedFiles: fileIds.length > 0 ? fileIds.map(Number) : undefined,
    submittedAt: new Date().toISOString(),
  };

  const url = existingDraftId
    ? `${API_BASE_URL}/assignment-submissions/${existingDraftId}`
    : `${API_BASE_URL}/assignment-submissions`;

  const method = existingDraftId ? 'PATCH' : 'POST';

  const submitRes = await fetch(url, {
    method,
    headers: headersWithKey,
    body: JSON.stringify(payloadData),
  });

  if (!submitRes.ok) {
    const err = await submitRes.json();
    throw new Error(err.error || err.errors?.[0]?.message || 'Failed to submit assignment');
  }

  const result = await submitRes.json();

  // Also trigger a course progress sync here
  try {
    // Optimistic progress update on server side can be added here if needed
  } catch (e) {
    console.error('Failed to trigger progress update after assignment submission', e);
  }

  return result.doc;
}
