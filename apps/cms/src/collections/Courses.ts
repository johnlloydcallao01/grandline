import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// Field component is referenced via admin importMap
import { titleField, excerptField, statusField, publishedAtField } from '../fields'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'courseCode', 'instructor', 'status', 'price'],
    group: 'Learning Management',
    description: 'Manage courses, content, and learning paths',
  },
  access: {
    // PayloadCMS automatically authenticates API keys and populates req.user
    read: ({ req: { user } }) => {
      // If user exists, they've been authenticated (either via API key or login)
      if (user) {
        // Allow service accounts (for website display) and admins
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
      }

      // Block all unauthenticated requests and other roles
      return false
    },
    create: ({ req: { user } }) => {
      // Allow both service accounts and admins to create courses
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update courses
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete courses
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    // === BASIC COURSE INFORMATION ===
    titleField,
    {
      name: 'courseCode',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique course identifier (e.g., CS101, MATH201)',
      },
    },
    excerptField,
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Detailed course description with rich formatting',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },
    {
      name: 'modules',
      type: 'relationship',
      relationTo: 'course-modules',
      hasMany: true,
      admin: {
        description: 'Manage the order of modules in this course.',
      },
    },
    {
      name: 'descriptionBlocks',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    // === INSTRUCTOR & CATEGORY ===
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'instructors',
      required: true,
      admin: {
        description: 'Primary instructor for this course',
      },
    },
    {
      name: 'coInstructors',
      type: 'relationship',
      relationTo: 'instructors',
      hasMany: true,
      admin: {
        description: 'Additional instructors (optional)',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'course-categories',
      hasMany: true,
      admin: {
        description: 'Course category for organization',
      },
    },

    // === MEDIA & VISUAL ===
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Course thumbnail image (original size from Cloudinary)',
      },
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Course banner image for course page header',
      },
    },

    // === PRICING & ENROLLMENT ===
    {
      name: 'price',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Course price (0 for free courses)',
      },
    },
    {
      name: 'discountedPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Discounted course price (leave empty if no discount applies)',
      },
    },
    {
      name: 'maxStudents',
      type: 'number',
      min: 1,
      admin: {
        description: 'Maximum number of students (leave empty for unlimited)',
      },
    },
    {
      name: 'enrollmentStartDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When enrollment opens',
      },
    },
    {
      name: 'enrollmentEndDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When enrollment closes',
      },
    },

    // === COURSE SCHEDULE ===
    {
      name: 'courseStartDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the course begins',
      },
    },
    {
      name: 'courseEndDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the course ends',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      admin: {
        description: 'Estimated course duration value',
      },
    },
    {
      name: 'estimatedDurationUnit',
      type: 'select',
      options: [
        { label: 'Minute(s)', value: 'minutes' },
        { label: 'Hour(s)', value: 'hours' },
        { label: 'Day(s)', value: 'days' },
        { label: 'Week(s)', value: 'weeks' },
      ],
      defaultValue: 'hours',
      admin: {
        description: 'Unit for estimated course duration',
      },
    },

    // === COURSE SETTINGS ===
    {
      name: 'difficultyLevel',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      defaultValue: 'beginner',
      admin: {
        description: 'Course difficulty level',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark this course as featured',
      },
    },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
      ],
      defaultValue: 'en',
      admin: {
        description: 'Course language',
      },
    },
    {
      name: 'passingGrade',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 70,
      admin: {
        description: 'Minimum grade required to pass (percentage)',
      },
    },
    {
      name: 'evaluationMode',
      type: 'select',
      options: [
        { label: 'Evaluate via Lessons (Progress-Based)', value: 'lessons' },
        { label: 'Evaluate via Final Quiz/Exam (Mastery-Based)', value: 'exam' },
        { label: 'Evaluate via Passed Quizzes (Continuous Assessment)', value: 'quizzes' },
        { label: 'Evaluate via Lessons + Final Exam (Prerequisite Model)', value: 'lessons_exam' },
        { label: 'Evaluate via Lessons + Quizzes (Continuous Progress)', value: 'lessons_quizzes' },
        { label: 'Evaluate via Quizzes + Final Exam (Performance Only)', value: 'quizzes_exam' },
        { label: 'Evaluate via Lessons + Quizzes + Final Exam (Strict Academic)', value: 'lessons_quizzes_exam' },
      ],
      defaultValue: 'lessons_exam',
      admin: {
        description: 'Determines how the student passes the course',
      },
    },

    // === LEARNING OBJECTIVES & PREREQUISITES ===
    {
      name: 'learningObjectives',
      type: 'array',
      fields: [
        {
          name: 'objective',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'What students will learn in this course',
      },
    },
    {
      name: 'prerequisites',
      type: 'array',
      fields: [
        {
          name: 'prerequisite',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'What students need to know before taking this course',
      },
    },

    // === PUBLISHING & STATUS ===
    statusField,
    publishedAtField,

    // === FLEXIBLE SETTINGS ===
    {
      name: 'settings',
      type: 'json',
      admin: {
        description: 'Additional course settings and configurations',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-set published date when status changes to published
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
