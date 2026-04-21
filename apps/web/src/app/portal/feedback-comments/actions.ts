'use server';

import { getServerToken, getServerUser } from '@/app/actions/auth';
import { slugify } from '@/utils/course-player';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export interface FeedbackItem {
    id: string;
    instructor: string;
    instructorRole: string;
    avatar: string;
    date: string;
    content: string;
    relatedItem: string;
    itemType: string;
    course: string;
    read: boolean;
    sourceType: 'assignment-submissions' | 'assessment-submissions' | 'submission-answers';
    linkUrl: string;
}

function extractTextFromLexical(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (node.text) return node.text;
    if (node.children && Array.isArray(node.children)) {
        return node.children.map((child: any) => extractTextFromLexical(child)).join(' ');
    }
    if (node.root) {
        return extractTextFromLexical(node.root);
    }
    return '';
}

function getDeepLinkUrl(course: any, itemType: 'assignment' | 'assessment', itemId: string, itemTitle: string): string {
    if (!course || !course.id) return '#';
    
    const itemSlug = slugify(itemTitle);
    
    // Check if it's the final exam
    if (itemType === 'assessment' && course.curriculum?.finalExam) {
        const finalExamId = typeof course.curriculum.finalExam === 'object' ? course.curriculum.finalExam.id : course.curriculum.finalExam;
        if (String(finalExamId) === String(itemId)) {
            return `/portal/courses/${course.id}/player/assessment/${itemSlug}`;
        }
    }

    // Find the module
    if (course.modules && Array.isArray(course.modules)) {
        for (const mod of course.modules) {
            if (!mod.items) continue;
            for (const i of mod.items) {
                const relationMatch = itemType === 'assignment' ? 'assignments' : 'assessments';
                if (i.relationTo === relationMatch) {
                    const iId = typeof i.value === 'object' ? i.value.id : i.value;
                    if (String(iId) === String(itemId)) {
                        const moduleSlug = slugify(mod.title);
                        return `/portal/courses/${course.id}/player/module/${moduleSlug}/${itemType}/${itemSlug}`;
                    }
                }
            }
        }
    }

    return `/portal/courses/${course.id}/player`;
}

export async function getFeedbackComments(): Promise<FeedbackItem[]> {
    const token = await getServerToken();
    const user = await getServerUser();

    if (!token || !user) throw new Error('Unauthorized');

    if (user.role !== 'trainee') {
        return [];
    }

    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) throw new Error('API key not configured');

    const headersWithKey = {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${apiKey}`,
    };

    // 1. Fetch Trainee Profile & Site Settings
    const [traineeRes, siteSettingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trainees?where[user][equals]=${user.id}`, {
            headers: headersWithKey,
            cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/globals/site-settings?depth=1`, {
            headers: headersWithKey,
            cache: 'no-store',
        })
    ]);

    if (!traineeRes.ok) return [];
    const traineeData = await traineeRes.json();
    const trainee = traineeData.docs?.[0];
    if (!trainee) return [];
    const traineeId = trainee.id;

    // Extract System Logo from Site Settings
    let systemLogoUrl = `https://ui-avatars.com/api/?name=System&background=64748b&color=fff`;
    if (siteSettingsRes.ok) {
        const siteSettings = await siteSettingsRes.json();
        if (siteSettings.logo && typeof siteSettings.logo === 'object') {
            if (siteSettings.logo.cloudinaryURL) {
                systemLogoUrl = siteSettings.logo.cloudinaryURL.replace(/[`'"]/g, '').trim();
            } else if (siteSettings.logo.url) {
                systemLogoUrl = siteSettings.logo.url.startsWith('http')
                    ? siteSettings.logo.url
                    : `${API_BASE_URL.replace('/api', '')}${siteSettings.logo.url}`;
            }
        }
    }

    const items: FeedbackItem[] = [];

    // Query 1: AssignmentSubmissions
    // Fetch assignments where feedback is not empty and status is Graded or Returned
    // Because Payload doesn't have an easy "is not empty" for richText in REST API out of the box,
    // we fetch graded/returned submissions and filter in JS
    const assignmentSubmissionsRes = await fetch(
        `${API_BASE_URL}/assignment-submissions?where[trainee][equals]=${traineeId}&where[status][in]=graded,returned_for_revision&limit=100&depth=5`,
        { headers: headersWithKey, cache: 'no-store' }
    );

    if (assignmentSubmissionsRes.ok) {
        const data = await assignmentSubmissionsRes.json();
        for (const doc of data.docs || []) {
            if (!doc.feedback) continue;

            // Attempt to extract text from lexical
            const content = extractTextFromLexical(doc.feedback);
            if (!content || content.trim() === '') continue;

            const assignment = doc.assignment || {};
            const course = doc.enrollment?.course || {};

            // We look up the instructor assigned to this course as the primary fallback.
            const courseInstructor = course.instructor || {};
            const courseInstructorUser = courseInstructor.user || {};

            let instructorUser = doc.gradedBy || {};
            let instructorRole = courseInstructor.specialization || 'Instructor';

            // If gradedBy is missing or lacks a name, fallback to the course instructor's user
            if (!instructorUser.firstName && !instructorUser.lastName) {
                instructorUser = courseInstructorUser;
            }

            const instructorName = `${instructorUser.firstName || ''} ${instructorUser.lastName || ''}`.trim() || 'Instructor';
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random`;

            if (instructorUser.profilePicture && typeof instructorUser.profilePicture === 'object') {
                if (instructorUser.profilePicture.cloudinaryURL) {
                    avatarUrl = instructorUser.profilePicture.cloudinaryURL.replace(/[`'"]/g, '').trim();
                } else if (instructorUser.profilePicture.url) {
                    avatarUrl = instructorUser.profilePicture.url.startsWith('http')
                        ? instructorUser.profilePicture.url
                        : `${API_BASE_URL.replace('/api', '')}${instructorUser.profilePicture.url}`;
                }
            }

            items.push({
                id: String(doc.id),
                instructor: instructorName,
                instructorRole: instructorRole,
                avatar: avatarUrl,
                date: doc.gradedAt || doc.updatedAt,
                content: content,
                relatedItem: assignment.title || 'Assignment',
                itemType: assignment.submissionType === 'project' ? 'Project' : 'Assignment',
                course: course.title || 'Course',
                read: doc.isFeedbackRead || false,
                sourceType: 'assignment-submissions',
                linkUrl: assignment.id ? getDeepLinkUrl(course, 'assignment', String(assignment.id), assignment.title || 'Assignment') : '#',
            });
        }
    }

    // Query 2: AssessmentSubmissions
    // To generate automated feedback for completed assessments
    const assessmentSubmissionsRes = await fetch(
        `${API_BASE_URL}/assessment-submissions?where[trainee][equals]=${traineeId}&where[status][in]=submitted,graded&limit=100&depth=4`,
        { headers: headersWithKey, cache: 'no-store' }
    );

    if (assessmentSubmissionsRes.ok) {
        const data = await assessmentSubmissionsRes.json();
        for (const doc of data.docs || []) {
            const score = doc.score ?? 0;
            const assessment = doc.assessment || {};
            const course = doc.course || {};

            const passText = score >= (doc.passingScoreSnapshot || assessment.passingScore || 0) ? 'Great job' : 'Keep practicing';
            const content = `You scored ${score}% on the ${assessment.title || 'Assessment'}. ${passText}!`;

            items.push({
                id: String(doc.id),
                instructor: 'System',
                instructorRole: 'Automated Feedback',
                avatar: systemLogoUrl,
                date: doc.completedAt || doc.updatedAt,
                content: content,
                relatedItem: assessment.title || 'Assessment',
                itemType: assessment.assessmentType === 'final_exam' ? 'Exam' : 'Quiz',
                course: course.title || 'Course',
                read: doc.isFeedbackRead || false,
                sourceType: 'assessment-submissions',
                linkUrl: assessment.id ? getDeepLinkUrl(course, 'assessment', String(assessment.id), assessment.title || 'Assessment') : '#',
            });
        }
    }

    // Query 3: SubmissionAnswers
    // For specific question feedback
    const submissionAnswersRes = await fetch(
        `${API_BASE_URL}/submission-answers?where[submission.trainee][equals]=${traineeId}&limit=100&depth=5`,
        { headers: headersWithKey, cache: 'no-store' }
    );

    if (submissionAnswersRes.ok) {
        const data = await submissionAnswersRes.json();
        for (const doc of data.docs || []) {
            if (!doc.feedback || doc.feedback.trim() === '') continue;

            const submission = doc.submission || {};
            const assessment = submission.assessment || {};
            const course = submission.course || {};

            // Submission answers don't explicitly track 'gradedBy' currently,
            // so we fetch the course instructor to show their avatar instead of a generic "IN" letter.
            const courseInstructor = course.instructor || {};
            const courseInstructorUser = courseInstructor.user || {};

            const instructorName = `${courseInstructorUser.firstName || ''} ${courseInstructorUser.lastName || ''}`.trim() || 'Instructor';
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random`;

            if (courseInstructorUser.profilePicture && typeof courseInstructorUser.profilePicture === 'object') {
                if (courseInstructorUser.profilePicture.cloudinaryURL) {
                    avatarUrl = courseInstructorUser.profilePicture.cloudinaryURL.replace(/[`'"]/g, '').trim();
                } else if (courseInstructorUser.profilePicture.url) {
                    avatarUrl = courseInstructorUser.profilePicture.url.startsWith('http')
                        ? courseInstructorUser.profilePicture.url
                        : `${API_BASE_URL.replace('/api', '')}${courseInstructorUser.profilePicture.url}`;
                }
            }

            items.push({
                id: String(doc.id),
                instructor: instructorName,
                instructorRole: courseInstructor.specialization || 'Course Faculty',
                avatar: avatarUrl,
                date: doc.updatedAt,
                content: doc.feedback,
                relatedItem: `${assessment.title || 'Assessment'} (Question Feedback)`,
                itemType: 'Quiz',
                course: course.title || 'Course',
                read: doc.isFeedbackRead || false,
                sourceType: 'submission-answers',
                linkUrl: assessment.id ? getDeepLinkUrl(course, 'assessment', String(assessment.id), assessment.title || 'Assessment') : '#',
            });
        }
    }

    // Sort all items by date descending
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function markAsRead(id: string, sourceType: string, isRead: boolean = true): Promise<boolean> {
    const token = await getServerToken();
    const user = await getServerUser();

    if (!token || !user || user.role !== 'trainee') return false;

    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/${sourceType}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `users API-Key ${apiKey}`,
            },
            body: JSON.stringify({
                isFeedbackRead: isRead,
            }),
        });

        return res.ok;
    } catch (error) {
        console.error('Failed to mark as read/unread:', error);
        return false;
    }
}

export async function markAllAsRead(items: FeedbackItem[]): Promise<boolean> {
    const unreadItems = items.filter(i => !i.read);
    if (unreadItems.length === 0) return true;

    const results = await Promise.all(
        unreadItems.map(item => markAsRead(item.id, item.sourceType, true))
    );

    return results.every(r => r === true);
}

export async function markAllAsUnread(items: FeedbackItem[]): Promise<boolean> {
    const readItems = items.filter(i => i.read);
    if (readItems.length === 0) return true;

    const results = await Promise.all(
        readItems.map(item => markAsRead(item.id, item.sourceType, false))
    );

    return results.every(r => r === true);
}
