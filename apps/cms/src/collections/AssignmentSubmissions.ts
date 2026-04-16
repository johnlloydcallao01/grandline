import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AssignmentSubmissions: CollectionConfig = {
  slug: 'assignment-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['assignment', 'trainee', 'status', 'score', 'submittedAt'],
    group: 'Learning Management',
    description: 'Student submissions and instructor grading for assignments',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Admins and Instructors can read all
      if (['admin', 'instructor', 'service'].includes(user.role)) return true
      // Trainees can only read their own
      return {
        'trainee.user': {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      // Trainees create submissions. Admins/Service can also create.
      return ['admin', 'service', 'trainee'].includes(user.role)
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      // Admins/Instructors can grade. Trainees can update their own drafts.
      if (['admin', 'instructor', 'service'].includes(user.role)) return true
      return {
        'trainee.user': {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'assignment',
      type: 'relationship',
      relationTo: 'assignments',
      required: true,
      index: true,
    },
    {
      name: 'trainee',
      type: 'relationship',
      relationTo: 'trainees',
      required: true,
      index: true,
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true,
      index: true,
      admin: {
        description: 'The specific course enrollment context',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted (Pending Grade)', value: 'submitted' },
        { label: 'Graded', value: 'graded' },
        { label: 'Returned for Revision', value: 'returned_for_revision' },
      ],
      index: true,
    },
    {
      name: 'submittedText',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'The written answer provided by the student',
      },
    },
    {
      name: 'uploadedFiles',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Files uploaded by the student',
      },
    },
    {
      name: 'score',
      type: 'number',
      admin: {
        description: 'Grade given by the instructor',
      },
    },
    {
      name: 'feedback',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Instructor notes or rubric feedback',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'gradedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'gradedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The instructor who graded this submission',
      },
    },
  ],
}
