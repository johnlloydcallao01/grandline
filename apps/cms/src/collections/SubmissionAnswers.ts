import type { CollectionConfig } from 'payload'

export const SubmissionAnswers: CollectionConfig = {
  slug: 'submission-answers',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['submission', 'question', 'isCorrect', 'pointsEarned'],
    group: 'Learning Management',
    description: 'Individual question responses for assessment submissions',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      if (user.role === 'trainee') {
        // Trainees can only see their own answers through the submission relation
        return {
          'submission.trainee': {
            equals: user.id,
          },
        }
      }
      return false
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'service'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'service'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'submission',
      type: 'relationship',
      relationTo: 'assessment-submissions',
      required: true,
      index: true,
    },
    {
      name: 'question',
      type: 'relationship',
      relationTo: 'questions',
      required: true,
      index: true,
    },
    {
      name: 'questionType',
      type: 'select',
      options: [
        { label: 'Single Choice', value: 'single_choice' },
        { label: 'Multiple Choice', value: 'multiple_choice' },
        { label: 'True / False', value: 'true_false' },
      ],
      required: true,
    },
    {
      name: 'response',
      type: 'json',
      required: true,
      admin: {
        description: 'Selected optionId or optionIds',
      },
    },
    {
      name: 'isCorrect',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'pointsEarned',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'feedback',
      type: 'textarea',
      admin: {
        description: 'Optional instructor feedback for this specific answer',
      },
    },
  ],
}
