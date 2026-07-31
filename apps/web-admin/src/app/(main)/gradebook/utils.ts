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

export function getStudentName(student: number | TraineeStub | undefined | null): string {
    if (!student) return 'Unknown';
    if (typeof student === 'number') return `Student #${student}`;
    return [student.firstName, student.lastName].filter(Boolean).join(' ') || `Student #${student.id}`;
}

export function getCourseTitle(course: number | CourseStub | undefined | null): string {
    if (!course) return 'Unknown';
    if (typeof course === 'number') return `Course #${course}`;
    return course.title || `Course #${course.id}`;
}

export interface UserStub {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface TraineeDoc {
    id: number;
    user: number | UserStub;
    srn: string;
    currentLevel?: string | null;
    enrollmentDate?: string | null;
    updatedAt: string;
    createdAt: string;
}

function getUserName(user: number | UserStub | undefined | null): string {
    if (!user) return 'Unknown';
    if (typeof user === 'number') return `User #${user}`;
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `User #${user.id}`;
}

export function getTraineeDisplayName(trainee: TraineeDoc | undefined | null): string {
    if (!trainee) return 'Unknown Student';
    return getUserName(trainee.user);
}

export function getTraineeEmail(trainee: TraineeDoc | undefined | null): string {
    if (!trainee) return '';
    if (typeof trainee.user === 'object' && trainee.user) return (trainee.user as UserStub).email || '';
    return '';
}
