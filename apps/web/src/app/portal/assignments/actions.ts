'use server';

import { getServerToken, getServerUser } from '@/app/actions/auth';
import { slugify } from '@/utils/course-player';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export interface MergedAssignment {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  moduleSlug: string;
  assignmentSlug: string;
  dueDate: string | null;
  maxScore: number;
  passingScore: number;
  submissionType: string;
  status: 'pending' | 'submitted' | 'graded' | 'returned_for_revision';
  score: number | null;
  feedback: any | null;
  submittedAt: string | null;
}

export async function getTraineeAssignments(): Promise<MergedAssignment[]> {
  const token = await getServerToken();
  const user = await getServerUser();

  if (!token || !user) throw new Error('Unauthorized');
  
  if (user.role !== 'trainee') {
    return []; // Only trainees have assignments in this view
  }

  const apiKey = process.env.PAYLOAD_API_KEY;
  if (!apiKey) throw new Error('API key not configured');

  const headersWithKey = {
    'Content-Type': 'application/json',
    'Authorization': `users API-Key ${apiKey}`,
  };

  // 1. Fetch Trainee Profile
  const traineeRes = await fetch(`${API_BASE_URL}/trainees?where[user][equals]=${user.id}`, {
    headers: headersWithKey,
    cache: 'no-store',
  });

  if (!traineeRes.ok) return [];
  const traineeData = await traineeRes.json();
  const trainee = traineeData.docs?.[0];
  if (!trainee) return [];
  const traineeId = trainee.id;

  // 2. Fetch Enrollments with depth=3 to populate course -> modules -> items
  const enrollmentsRes = await fetch(
    `${API_BASE_URL}/course-enrollments?where[student][equals]=${traineeId}&depth=3&limit=100`,
    {
      headers: headersWithKey,
      cache: 'no-store',
    }
  );

  if (!enrollmentsRes.ok) return [];
  const enrollmentsData = await enrollmentsRes.json();
  const enrollments = enrollmentsData.docs || [];

  // 3. Extract Assignments from the course modules
  const extractedAssignments = new Map<string, any>();

  for (const enrollment of enrollments) {
    const course = enrollment.course;
    if (!course || typeof course !== 'object') continue;

    if (!course.modules) continue;

    for (const mod of course.modules) {
      if (!mod.items) continue;

      for (const item of mod.items) {
        if (item.relationTo === 'assignments' && item.value && typeof item.value === 'object') {
          const assignment = item.value;
          
          extractedAssignments.set(String(assignment.id), {
            id: String(assignment.id),
            title: assignment.title,
            courseId: String(course.id),
            courseTitle: course.title,
            moduleSlug: slugify(mod.title),
            assignmentSlug: slugify(assignment.title),
            dueDate: assignment.dueDate || null,
            maxScore: assignment.maxScore || 100,
            passingScore: assignment.passingScore || 75,
            submissionType: assignment.submissionType || 'both',
          });
        }
      }
    }
  }

  // 4. Fetch Submissions for this trainee
  const submissionsRes = await fetch(
    `${API_BASE_URL}/assignment-submissions?where[trainee][equals]=${traineeId}&limit=1000`,
    {
      headers: headersWithKey,
      cache: 'no-store',
    }
  );

  const submissionsData = await submissionsRes.ok ? await submissionsRes.json() : { docs: [] };
  const submissions = submissionsData.docs || [];

  // Map submissions to assignments
  const submissionsMap = new Map<string, any>();
  for (const sub of submissions) {
    const assignmentId = typeof sub.assignment === 'object' ? String(sub.assignment.id) : String(sub.assignment);
    const existing = submissionsMap.get(assignmentId);
    
    if (!existing) {
      submissionsMap.set(assignmentId, sub);
    } else {
      const rank = (s: string) => s === 'graded' ? 3 : s === 'returned_for_revision' ? 2 : s === 'submitted' ? 1 : 0;
      const subRank = rank(sub.status);
      const existingRank = rank(existing.status);

      if (subRank > existingRank) {
        submissionsMap.set(assignmentId, sub);
      } else if (subRank === existingRank) {
        if (new Date(sub.updatedAt) > new Date(existing.updatedAt)) {
          submissionsMap.set(assignmentId, sub);
        }
      }
    }
  }

  // 5. Merge Data
  const mergedList: MergedAssignment[] = [];

  for (const [assignId, baseData] of extractedAssignments.entries()) {
    const sub = submissionsMap.get(assignId);
    
    let status: MergedAssignment['status'] = 'pending';
    let score = null;
    let feedback = null;
    let submittedAt = null;

    if (sub && sub.status !== 'draft') {
      status = sub.status as 'submitted' | 'graded' | 'returned_for_revision';
      score = sub.score ?? null;
      feedback = sub.feedback ?? null;
      submittedAt = sub.submittedAt ?? null;

      // Auto-correct: If an instructor added a score but forgot to change the status dropdown to 'Graded'
      if (score !== null && status === 'submitted') {
        status = 'graded';
      }
    }

    mergedList.push({
      ...baseData,
      status,
      score,
      feedback,
      submittedAt,
    });
  }

  // Sort: pending first (by due date), then others
  return mergedList.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}
