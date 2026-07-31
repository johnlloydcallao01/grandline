'use server';

import { getServerToken } from '@/app/actions/auth';

const CMS_API = process.env.NEXT_PUBLIC_API_URL || '';

function headers() {
    return { 'Content-Type': 'application/json' };
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getServerToken();
    const response = await fetch(`${CMS_API}${path}`, {
        ...init,
        headers: {
            ...headers(),
            ...(token ? { Authorization: `JWT ${token}` } : {}),
            ...init?.headers,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            msg = err.errors?.[0]?.message || err.message || msg;
        } catch { /* ignore parse errors */ }
        throw new Error(msg);
    }

    return response.json();
}

export interface TraineeStub {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface CourseStub {
    id: number;
    title?: string;
}

export interface EnrollmentDoc {
    id: number;
    student: number | TraineeStub;
    course: number | CourseStub;
    status: string;
    enrollmentType: string;
    currentGrade?: number | null;
    finalGrade?: number | null;
    finalEvaluation?: string | null;
    progressPercentage?: number;
    certificateIssued?: boolean | null;
    enrolledAt: string;
    completedAt?: string | null;
    updatedAt: string;
    createdAt: string;
    displayTitle?: string;
}

export interface EnrollmentListResult {
    docs: EnrollmentDoc[];
    totalDocs: number;
    totalPages: number;
    page: number;
    limit: number;
}

interface ListParams {
    search?: string;
    page?: number;
    limit?: number;
    courseId?: number;
    status?: string;
}

export async function getEnrollmentsList(params: ListParams = {}): Promise<EnrollmentListResult> {
    const qs = new URLSearchParams();
    if (params.search) qs.append('where[displayTitle][like]', params.search);
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.courseId) qs.append('where[course][equals]', String(params.courseId));
    if (params.status) qs.append('where[status][equals]', params.status);
    qs.append('sort', '-updatedAt');
    qs.append('depth', '2');
    return authFetch<EnrollmentListResult>(`/course-enrollments?${qs}`);
}

export async function getEnrollmentById(id: number | string): Promise<EnrollmentDoc> {
    const data = await authFetch<{ doc?: EnrollmentDoc } | EnrollmentDoc>(`/course-enrollments/${id}?depth=2`);
    return (data as any).doc || (data as EnrollmentDoc);
}

export async function updateEnrollment(id: number | string, payload: Record<string, any>): Promise<EnrollmentDoc> {
    const data = await authFetch<{ doc?: EnrollmentDoc } | EnrollmentDoc>(`/course-enrollments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as EnrollmentDoc);
}

export async function deleteEnrollment(id: number | string): Promise<void> {
    await authFetch(`/course-enrollments/${id}`, { method: 'DELETE' });
}

export interface CourseDoc {
    id: number;
    title: string;
}

export interface CourseListResult {
    docs: CourseDoc[];
    totalDocs: number;
}

export async function getCoursesList(): Promise<CourseListResult> {
    const qs = new URLSearchParams();
    qs.append('limit', '200');
    qs.append('sort', 'title');
    qs.append('depth', '1');
    return authFetch<CourseListResult>(`/courses?${qs}`);
}

// ===== Recent Activity Types =====

export interface AssessmentStub {
    id: number;
    title?: string;
    assessmentType?: string;
}

export interface AssignmentStub {
    id: number;
    title?: string;
    maxScore?: number;
}

export interface AssessmentSubmissionStub {
    id: number;
    trainee: number | TraineeStub;
    assessment: number | AssessmentStub;
    enrollment: number | { id: number; course?: number | CourseStub };
    score?: number | null;
    status: string;
    updatedAt: string;
    createdAt: string;
}

export interface AssignmentSubmissionStub {
    id: number;
    trainee: number | TraineeStub;
    assignment: number | AssignmentStub;
    enrollment: number | { id: number; course?: number | CourseStub };
    score?: number | null;
    gradedAt?: string | null;
    status: string;
    updatedAt: string;
    createdAt: string;
}

export interface ActivityEvent {
    id: string;
    type: 'enrollment_created' | 'enrollment_completed' | 'enrollment_status_change' | 'grade_updated' | 'assessment_graded' | 'assignment_graded';
    timestamp: string;
    traineeName?: string;
    traineeId?: number;
    courseTitle?: string;
    courseId?: number;
    enrollmentId?: number;
    description: string;
    detail: string;
    metadata?: Record<string, any>;
}

export interface ActivityResult {
    events: ActivityEvent[];
    total: number;
}

export async function getRecentActivity(limit: number = 50): Promise<ActivityResult> {
    const PER_SOURCE = Math.ceil(limit * 1.5);

    const [enrollmentsRes, assessmentSubs, assignmentSubs] = await Promise.all([
        // Recent enrollments (created and status changes)
        authFetch<EnrollmentListResult>(`/course-enrollments?limit=${PER_SOURCE}&sort=-updatedAt&depth=2`),

        // Recent graded assessment submissions
        authFetch<{ docs: AssessmentSubmissionStub[] }>(`/assessment-submissions?limit=${PER_SOURCE}&sort=-updatedAt&depth=2&where[status][equals]=graded`),

        // Recent graded assignment submissions
        authFetch<{ docs: AssignmentSubmissionStub[] }>(`/assignment-submissions?limit=${PER_SOURCE}&sort=-updatedAt&depth=2&where[status][equals]=graded`),
    ]);

    const events: ActivityEvent[] = [];

    for (const e of enrollmentsRes.docs || []) {
        const studentName = getStudentNameInline(e.student as any);
        const courseTitle = getCourseTitleInline(e.course as any);
        const courseId = typeof e.course === 'number' ? e.course : (e.course as any)?.id;
        const studentId = typeof e.student === 'number' ? e.student : (e.student as any)?.id;

        if (e.createdAt && Math.abs(new Date(e.createdAt).getTime() - new Date(e.updatedAt).getTime()) < 5000) {
            events.push({
                id: `enroll-created-${e.id}`,
                type: 'enrollment_created',
                timestamp: e.createdAt,
                traineeName: studentName,
                traineeId: studentId,
                courseTitle,
                courseId,
                enrollmentId: e.id,
                description: `${studentName} enrolled`,
                detail: `${courseTitle}`,
                metadata: { enrollmentType: e.enrollmentType, status: e.status },
            });
        }

        if (e.status === 'completed' && e.completedAt) {
            events.push({
                id: `enroll-completed-${e.id}`,
                type: 'enrollment_completed',
                timestamp: e.completedAt,
                traineeName: studentName,
                traineeId: studentId,
                courseTitle,
                courseId,
                enrollmentId: e.id,
                description: `${studentName} completed`,
                detail: `${courseTitle}${e.finalGrade != null ? ` — ${Math.round(e.finalGrade)}%` : ''}${e.finalEvaluation ? ` (${e.finalEvaluation})` : ''}`,
                metadata: { finalGrade: e.finalGrade, finalEvaluation: e.finalEvaluation },
            });
        }

        if (e.finalGrade != null && e.status !== 'completed') {
            events.push({
                id: `grade-${e.id}-${e.updatedAt}`,
                type: 'grade_updated',
                timestamp: e.updatedAt,
                traineeName: studentName,
                traineeId: studentId,
                courseTitle,
                courseId,
                enrollmentId: e.id,
                description: `${studentName} grade updated`,
                detail: `${Math.round(e.currentGrade ?? 0)}% in ${courseTitle}`,
                metadata: { currentGrade: e.currentGrade, finalGrade: e.finalGrade },
            });
        }
    }

    for (const s of assessmentSubs.docs || []) {
        const traineeName = getTraineeNameInline(s.trainee as any);
        const assessmentTitle = typeof s.assessment === 'object' ? (s.assessment as any)?.title || 'Assessment' : 'Assessment';
        const enrollment = s.enrollment as any;
        const courseTitle = enrollment?.course ? getCourseTitleInline(enrollment.course) : undefined;
        const courseId = enrollment?.course ? (typeof enrollment.course === 'number' ? enrollment.course : enrollment.course?.id) : undefined;
        const traineeId = typeof s.trainee === 'number' ? s.trainee : (s.trainee as any)?.id;

        events.push({
            id: `assess-graded-${s.id}`,
            type: 'assessment_graded',
            timestamp: s.updatedAt,
            traineeName,
            traineeId,
            courseTitle,
            courseId,
            enrollmentId: typeof enrollment === 'object' ? enrollment.id : enrollment,
            description: `${traineeName} scored ${s.score ?? 0}%`,
            detail: `on ${assessmentTitle}${courseTitle ? ` — ${courseTitle}` : ''}`,
            metadata: { score: s.score, assessmentTitle },
        });
    }

    for (const s of assignmentSubs.docs || []) {
        const traineeName = getTraineeNameInline(s.trainee as any);
        const assignmentTitle = typeof s.assignment === 'object' ? (s.assignment as any)?.title || 'Assignment' : 'Assignment';
        const enrollment = s.enrollment as any;
        const courseTitle = enrollment?.course ? getCourseTitleInline(enrollment.course) : undefined;
        const courseId = enrollment?.course ? (typeof enrollment.course === 'number' ? enrollment.course : enrollment.course?.id) : undefined;
        const traineeId = typeof s.trainee === 'number' ? s.trainee : (s.trainee as any)?.id;

        events.push({
            id: `assign-graded-${s.id}`,
            type: 'assignment_graded',
            timestamp: s.gradedAt || s.updatedAt,
            traineeName,
            traineeId,
            courseTitle,
            courseId,
            enrollmentId: typeof enrollment === 'object' ? enrollment.id : enrollment,
            description: `${traineeName} scored ${s.score ?? 0}%`,
            detail: `on ${assignmentTitle}${courseTitle ? ` — ${courseTitle}` : ''}`,
            metadata: { score: s.score, assignmentTitle },
        });
    }

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { events: events.slice(0, limit), total: events.length };
}

function getStudentNameInline(student: number | TraineeStub | undefined | null): string {
    if (!student) return 'Unknown Student';
    if (typeof student === 'number') return `Student #${student}`;
    return [student.firstName, student.lastName].filter(Boolean).join(' ') || `Student #${student.id}`;
}

function getCourseTitleInline(course: number | CourseStub | undefined | null): string {
    if (!course) return 'Unknown Course';
    if (typeof course === 'number') return `Course #${course}`;
    return course.title || `Course #${course.id}`;
}

function getTraineeNameInline(trainee: number | TraineeStub | undefined | null): string {
    return getStudentNameInline(trainee);
}

export interface CourseWithStats extends CourseDoc {
    enrollmentCount: number;
    gradedCount: number;
    avgGrade: number | null;
    passedCount: number;
}

export async function getCoursesWithStats(): Promise<CourseWithStats[]> {
    const courses = await getCoursesList();
    if (courses.docs.length === 0) return [];

    const courseIds = courses.docs.map(c => c.id);
    const qs = new URLSearchParams();
    qs.append('limit', '500');
    qs.append('depth', '0');
    qs.append('sort', '-updatedAt');
    courseIds.forEach(id => qs.append('where[course][in]', String(id)));
    const enrollments = await authFetch<EnrollmentListResult>(`/course-enrollments?${qs}`);
    const enrDocs = enrollments.docs || [];

    const grouped = new Map<number, { enrollmentCount: number; gradedCount: number; gradeSum: number; passedCount: number }>();
    for (const c of courses.docs) {
        grouped.set(c.id, { enrollmentCount: 0, gradedCount: 0, gradeSum: 0, passedCount: 0 });
    }
    for (const e of enrDocs) {
        const courseId = typeof e.course === 'number' ? e.course : (e.course as any)?.id;
        if (!courseId || !grouped.has(courseId)) continue;
        const g = grouped.get(courseId)!;
        g.enrollmentCount++;
        if (e.finalGrade != null) {
            g.gradedCount++;
            g.gradeSum += e.finalGrade;
        }
        if (e.finalEvaluation === 'passed') g.passedCount++;
    }

    return courses.docs.map(c => {
        const g = grouped.get(c.id)!;
        return {
            ...c,
            enrollmentCount: g.enrollmentCount,
            gradedCount: g.gradedCount,
            avgGrade: g.gradedCount > 0 ? Math.round(g.gradeSum / g.gradedCount) : null,
            passedCount: g.passedCount,
        };
    });
}

// ===== Student Overview Types & Functions =====

import type { TraineeDoc } from './utils';

export interface TraineeListResult {
    docs: TraineeDoc[];
    totalDocs: number;
    totalPages?: number;
    page?: number;
}

export interface CourseStubFull {
    id: number;
    title: string;
}

export interface SubmissionItem {
    id: string;
    type: 'assessment' | 'assignment';
    title: string;
    score: number | null | undefined;
    status: string;
    submittedAt: string;
    courseTitle?: string;
    courseId?: number;
}

export interface StudentOverviewData {
    trainee: TraineeDoc;
    enrollments: EnrollmentDoc[];
    submissions: SubmissionItem[];
    stats: {
        totalCourses: number;
        completedCourses: number;
        inProgressCourses: number;
        avgGrade: number | null;
        passedCount: number;
        failedCount: number;
        certificateCount: number;
        totalSubmissions: number;
    };
}

export interface TraineeWithStats extends TraineeDoc {
    enrollmentCount: number;
    completedCount: number;
    avgGrade: number | null;
    passedCount: number;
    failedCount: number;
    certificateCount: number;
}

export interface TraineeListWithStatsResult {
    docs: TraineeWithStats[];
    totalDocs: number;
    totalPages: number;
    page: number;
}

export async function getTraineesList(params: { page?: number; limit?: number; search?: string } = {}): Promise<TraineeListWithStatsResult> {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.search) {
        qs.append('where[or][0][srn][like]', params.search);
        qs.append('where[or][1][user.firstName][like]', params.search);
        qs.append('where[or][2][user.lastName][like]', params.search);
    }
    qs.append('depth', '2');
    qs.append('sort', '-updatedAt');
    const result = await authFetch<TraineeListResult>(`/trainees?${qs}`);

    const trainees = result.docs || [];
    if (trainees.length === 0) {
        return { docs: [], totalDocs: 0, totalPages: 0, page: params.page || 1 };
    }

    const traineeIds = trainees.map(t => t.id);
    const enrQs = new URLSearchParams();
    enrQs.append('limit', '500');
    enrQs.append('depth', '0');
    traineeIds.forEach(id => enrQs.append('where[student][in]', String(id)));
    const enrResult = await authFetch<EnrollmentListResult>(`/course-enrollments?${enrQs}`);
    const enrollments = enrResult.docs || [];

    const grouped = new Map<number, { total: number; completed: number; gradeSum: number; gradedCount: number; passed: number; failed: number; certificates: number }>();
    for (const t of trainees) grouped.set(t.id, { total: 0, completed: 0, gradeSum: 0, gradedCount: 0, passed: 0, failed: 0, certificates: 0 });
    for (const e of enrollments) {
        const sid = typeof e.student === 'number' ? e.student : (e.student as any)?.id;
        if (!sid || !grouped.has(sid)) continue;
        const g = grouped.get(sid)!;
        g.total++;
        if (e.status === 'completed') g.completed++;
        if (e.finalGrade != null) { g.gradedCount++; g.gradeSum += e.finalGrade; }
        if (e.finalEvaluation === 'passed') g.passed++;
        if (e.finalEvaluation === 'failed') g.failed++;
        if (e.certificateIssued) g.certificates++;
    }

    const docs: TraineeWithStats[] = trainees.map(t => {
        const g = grouped.get(t.id)!;
        return {
            ...t,
            enrollmentCount: g.total,
            completedCount: g.completed,
            avgGrade: g.gradedCount > 0 ? Math.round(g.gradeSum / g.gradedCount) : null,
            passedCount: g.passed,
            failedCount: g.failed,
            certificateCount: g.certificates,
        };
    });

    return {
        docs,
        totalDocs: result.totalDocs || docs.length,
        totalPages: result.totalPages || 1,
        page: result.page || 1,
    };
}

export async function searchTrainees(query: string): Promise<TraineeDoc[]> {
    if (!query.trim()) return [];
    const qs = new URLSearchParams();
    qs.append('depth', '2');
    qs.append('limit', '20');
    qs.append('sort', '-updatedAt');
    qs.append('where[or][0][srn][like]', query);
    qs.append('where[or][1][user.firstName][like]', query);
    qs.append('where[or][2][user.lastName][like]', query);
    const result = await authFetch<TraineeListResult>(`/trainees?${qs}`);
    return result.docs || [];
}

export async function getTraineeById(id: number | string): Promise<TraineeDoc> {
    const data = await authFetch<{ doc?: TraineeDoc } | TraineeDoc>(`/trainees/${id}?depth=2`);
    return (data as any).doc || (data as TraineeDoc);
}

export async function getStudentOverview(traineeId: number | string): Promise<StudentOverviewData> {
    const [trainee, enrResult, assessResult, assignResult] = await Promise.all([
        getTraineeById(traineeId),
        authFetch<EnrollmentListResult>(`/course-enrollments?where[student][equals]=${traineeId}&depth=2&limit=50&sort=-updatedAt`),
        authFetch<{ docs: AssessmentSubmissionStub[] }>(`/assessment-submissions?where[trainee][equals]=${traineeId}&depth=2&limit=20&sort=-updatedAt`),
        authFetch<{ docs: AssignmentSubmissionStub[] }>(`/assignment-submissions?where[trainee][equals]=${traineeId}&depth=2&limit=20&sort=-updatedAt`),
    ]);

    const enrollments = enrResult.docs || [];
    const assessSubs = assessResult.docs || [];
    const assignSubs = assignResult.docs || [];

    const submissions: SubmissionItem[] = [];
    for (const s of assessSubs) {
        const assessTitle = typeof s.assessment === 'object' ? (s.assessment as any)?.title || 'Assessment' : 'Assessment';
        const enr = s.enrollment as any;
        const courseTitle = enr?.course ? getCourseTitleInline(enr.course) : undefined;
        const courseId = enr?.course ? (typeof enr.course === 'number' ? enr.course : enr.course?.id) : undefined;
        submissions.push({
            id: `assessment-${s.id}`,
            type: 'assessment',
            title: assessTitle,
            score: s.score,
            status: s.status,
            submittedAt: s.updatedAt,
            courseTitle,
            courseId,
        });
    }
    for (const s of assignSubs) {
        const assignTitle = typeof s.assignment === 'object' ? (s.assignment as any)?.title || 'Assignment' : 'Assignment';
        const enr = s.enrollment as any;
        const courseTitle = enr?.course ? getCourseTitleInline(enr.course) : undefined;
        const courseId = enr?.course ? (typeof enr.course === 'number' ? enr.course : enr.course?.id) : undefined;
        submissions.push({
            id: `assignment-${s.id}`,
            type: 'assignment',
            title: assignTitle,
            score: s.score,
            status: s.status,
            submittedAt: s.gradedAt || s.updatedAt,
            courseTitle,
            courseId,
        });
    }
    submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const completed = enrollments.filter(e => e.status === 'completed');
    const gradedEnrollments = enrollments.filter(e => e.finalGrade != null);
    const avgGrade = gradedEnrollments.length > 0
        ? Math.round(gradedEnrollments.reduce((s, e) => s + (e.finalGrade ?? 0), 0) / gradedEnrollments.length)
        : null;

    return {
        trainee,
        enrollments,
        submissions: submissions.slice(0, 10),
        stats: {
            totalCourses: enrollments.length,
            completedCourses: completed.length,
            inProgressCourses: enrollments.filter(e => e.status === 'active').length,
            avgGrade,
            passedCount: completed.filter(e => e.finalEvaluation === 'passed').length,
            failedCount: completed.filter(e => e.finalEvaluation === 'failed').length,
            certificateCount: enrollments.filter(e => e.certificateIssued).length,
            totalSubmissions: submissions.length,
        },
    };
}

// ===== GradeScale Types & Actions =====

export interface GradeGrade {
    id?: string | null;
    label: string;
    minScore: number;
    maxScore: number;
    gpaValue?: number | null;
    description?: string | null;
}

export interface GradeScaleDoc {
    id: number;
    title: string;
    description?: string | null;
    grades: GradeGrade[];
    updatedAt: string;
    createdAt: string;
}

export interface GradeScaleListResult {
    docs: GradeScaleDoc[];
    totalDocs: number;
}

export async function getGradeScalesList(): Promise<GradeScaleListResult> {
    const qs = new URLSearchParams();
    qs.append('limit', '100');
    qs.append('sort', 'title');
    qs.append('depth', '2');
    return authFetch<GradeScaleListResult>(`/grade-scales?${qs}`);
}

export async function getGradeScaleById(id: number | string): Promise<GradeScaleDoc> {
    const data = await authFetch<{ doc?: GradeScaleDoc } | GradeScaleDoc>(`/grade-scales/${id}?depth=2`);
    return (data as any).doc || (data as GradeScaleDoc);
}

export async function createGradeScale(payload: { title: string; description?: string | null; grades: GradeGrade[] }): Promise<GradeScaleDoc> {
    const data = await authFetch<{ doc?: GradeScaleDoc } | GradeScaleDoc>('/grade-scales', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as GradeScaleDoc);
}

export async function updateGradeScale(id: number | string, payload: { title?: string; description?: string | null; grades?: GradeGrade[] }): Promise<GradeScaleDoc> {
    const data = await authFetch<{ doc?: GradeScaleDoc } | GradeScaleDoc>(`/grade-scales/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return (data as any).doc || (data as GradeScaleDoc);
}

export async function deleteGradeScale(id: number | string): Promise<void> {
    await authFetch(`/grade-scales/${id}`, { method: 'DELETE' });
}


