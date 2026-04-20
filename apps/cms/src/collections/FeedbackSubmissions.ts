import { CollectionConfig } from 'payload'

const checkRole = (roles: string[], user?: any): boolean => {
    if (user && roles.includes(user.role)) return true;
    return false;
};

export const FeedbackSubmissions: CollectionConfig = {
    slug: 'feedback-submissions',
    admin: {
        useAsTitle: 'id',
        group: 'Learning Management System',
        description: 'Dynamic feedback submissions from trainees',
    },
    access: {
        // Only admins, service accounts, and instructors can read feedback submissions.
        read: ({ req: { user } }) => {
            if (!user) return false;
            return checkRole(['admin', 'service', 'instructor'], user);
        },
        // Trainees can create
        create: ({ req: { user } }) => {
            if (!user) return false;
            return checkRole(['admin', 'service', 'trainee'], user);
        },
        update: ({ req: { user } }) => checkRole(['admin', 'service'], user),
        delete: ({ req: { user } }) => checkRole(['admin', 'service'], user),
    },
    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                if (operation === 'create') {
                    // If the user is a trainee, ensure they are submitting for their own trainee profile
                    // and ensure they are enrolled in the course.
                    if (req.user && req.user.role === 'trainee') {
                        const traineeRes = await req.payload.find({
                            collection: 'trainees',
                            where: {
                                user: {
                                    equals: req.user.id,
                                },
                            },
                            limit: 1,
                        });

                        const traineeId = traineeRes.docs[0]?.id;
                        if (!traineeId) {
                            throw new Error('Trainee profile not found');
                        }

                        // Override trainee field to ensure they can't spoof another trainee
                        data.trainee = traineeId;

                        // Verify enrollment
                        const enrollmentRes = await req.payload.find({
                            collection: 'course-enrollments',
                            where: {
                                student: { equals: traineeId },
                                course: { equals: data.course },
                            },
                            limit: 1,
                        });

                        if (enrollmentRes.docs.length === 0) {
                            throw new Error('Trainee is not enrolled in this course');
                        }
                    }
                }
                return data;
            }
        ]
    },
    fields: [
        {
            name: 'form',
            type: 'relationship',
            relationTo: 'feedback-forms',
            required: true,
            admin: {
                description: 'The feedback form version that was filled out',
            },
        },
        {
            name: 'course',
            type: 'relationship',
            relationTo: 'courses',
            required: true,
        },
        {
            name: 'trainee',
            type: 'relationship',
            relationTo: 'trainees',
            required: true,
        },
        {
            name: 'responses',
            type: 'json',
            required: true,
            admin: {
                description: 'Stores the dynamic key-value pairs submitted by the trainee',
            },
        },
    ],
}