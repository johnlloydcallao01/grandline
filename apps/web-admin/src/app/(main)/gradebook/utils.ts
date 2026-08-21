import type {
  GradebookCourseStub,
  GradebookTraineeDoc,
  GradebookTraineeStub,
  GradebookUserStub,
} from '@encreasl/cms-types'

export function getStudentName(student: number | GradebookTraineeStub | undefined | null): string {
    if (!student) return 'Unknown';
    if (typeof student === 'number') return `Student #${student}`;
    return [student.firstName, student.lastName].filter(Boolean).join(' ') || `Student #${student.id}`;
}

export function getCourseTitle(course: number | GradebookCourseStub | undefined | null): string {
    if (!course) return 'Unknown';
    if (typeof course === 'number') return `Course #${course}`;
    return course.title || `Course #${course.id}`;
}

function getUserName(user: number | GradebookUserStub | undefined | null): string {
    if (!user) return 'Unknown';
    if (typeof user === 'number') return `User #${user}`;
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `User #${user.id}`;
}

export function getTraineeDisplayName(trainee: GradebookTraineeDoc | undefined | null): string {
    if (!trainee) return 'Unknown Student';
    return getUserName(trainee.user);
}

export function getTraineeEmail(trainee: GradebookTraineeDoc | undefined | null): string {
    if (!trainee) return '';
    if (typeof trainee.user === 'object' && trainee.user) return (trainee.user as GradebookUserStub).email || '';
    return '';
}