'use server';

import { getServerToken, getServerUser } from '@/app/actions/auth';
import { slugify } from '@/utils/course-player';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export interface MergedAssessment {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    moduleSlug: string | null;
    assessmentSlug: string;
    assessmentKind: 'quiz' | 'exam' | 'final';
    maxAttempts: number | null;
    passingScore: number;
    status: 'pending' | 'in_progress' | 'submitted' | 'graded';
    score: number | null;
    attemptNumber: number;
    completedAt: string | null;
    startedAt: string | null;
    isPassed: boolean | null;
}

export async function getTraineeAssessments(): Promise<MergedAssessment[]> {
    const token = await getServerToken();
    const user = await getServerUser();

    if (!token || !user) throw new Error('Unauthorized');

    if (user.role !== 'trainee') {
        return []; // Only trainees have assessments in this view
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

    // 2. Fetch Enrollments with depth=3 to populate course -> modules -> items & course -> finalExam
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

    // 3. Extract Assessments from the course modules and final exam
    const extractedAssessments = new Map<string, any>();

    for (const enrollment of enrollments) {
        const course = enrollment.course;
        if (!course || typeof course !== 'object') continue;

        // Handle Module Assessments (Quizzes/Exams)
        if (course.modules) {
            for (const mod of course.modules) {
                if (!mod.items) continue;

                for (const item of mod.items) {
                    if (item.relationTo === 'assessments' && item.value && typeof item.value === 'object') {
                        const assessment = item.value;

                        extractedAssessments.set(String(assessment.id), {
                            id: String(assessment.id),
                            title: assessment.title,
                            courseId: String(course.id),
                            courseTitle: course.title,
                            moduleSlug: slugify(mod.title),
                            assessmentSlug: slugify(assessment.title),
                            assessmentKind: assessment.assessmentKind || 'quiz',
                            maxAttempts: assessment.maxAttempts || null,
                            passingScore: assessment.passingScore || 70,
                        });
                    }
                }
            }
        }

        // Handle Final Exam
        if (course.curriculum?.finalExam && typeof course.curriculum.finalExam === 'object') {
            const finalExam = course.curriculum.finalExam;
            extractedAssessments.set(String(finalExam.id), {
                id: String(finalExam.id),
                title: finalExam.title,
                courseId: String(course.id),
                courseTitle: course.title,
                moduleSlug: null, // Final exams are at the course level, not inside a module
                assessmentSlug: slugify(finalExam.title),
                assessmentKind: 'final',
                maxAttempts: finalExam.maxAttempts || null,
                passingScore: finalExam.passingScore || 70,
            });
        }
    }

    // 4. Fetch Submissions for this trainee
    const submissionsRes = await fetch(
        `${API_BASE_URL}/assessment-submissions?where[trainee][equals]=${traineeId}&limit=1000`,
        {
            headers: headersWithKey,
            cache: 'no-store',
        }
    );

    const submissionsData = await submissionsRes.ok ? await submissionsRes.json() : { docs: [] };
    const submissions = submissionsData.docs || [];

    // Map submissions to assessments (keeping the latest attempt)
    const submissionsMap = new Map<string, any>();
    for (const sub of submissions) {
        const assessmentId = typeof sub.assessment === 'object' ? String(sub.assessment.id) : String(sub.assessment);
        const existing = submissionsMap.get(assessmentId);

        if (!existing) {
            submissionsMap.set(assessmentId, sub);
        } else {
            // Prefer highest attempt number
            if ((sub.attemptNumber || 0) > (existing.attemptNumber || 0)) {
                submissionsMap.set(assessmentId, sub);
            } else if ((sub.attemptNumber || 0) === (existing.attemptNumber || 0)) {
                if (new Date(sub.updatedAt) > new Date(existing.updatedAt)) {
                    submissionsMap.set(assessmentId, sub);
                }
            }
        }
    }

    // 5. Merge Data
    const mergedList: MergedAssessment[] = [];

    for (const [assessId, baseData] of extractedAssessments.entries()) {
        const sub = submissionsMap.get(assessId);

        let status: MergedAssessment['status'] = 'pending';
        let score: number | null = null;
        let attemptNumber = 0;
        let completedAt = null;
        let startedAt = null;
        let isPassed: boolean | null = null;

        if (sub) {
            status = sub.status as 'in_progress' | 'submitted' | 'graded';
            score = sub.score ?? null;
            attemptNumber = sub.attemptNumber ?? 1;
            completedAt = sub.completedAt ?? null;
            startedAt = sub.startedAt ?? null;

            if (score !== null) {
                const passingThreshold = sub.passingScoreSnapshot ?? baseData.passingScore;
                isPassed = score >= passingThreshold;
            }
        }

        mergedList.push({
            ...baseData,
            status,
            score,
            attemptNumber,
            completedAt,
            startedAt,
            isPassed,
        });
    }

    return mergedList;
}
