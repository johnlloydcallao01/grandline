import type { CollectionConfig } from 'payload'
import { lmsAccess } from '../access'
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
    read: () => true, // Public can read published courses
    create: lmsAccess.courseManagement, // Instructors and admins can create
    update: lmsAccess.courseManagement, // Instructors and admins can update
    delete: lmsAccess.courseManagement, // Instructors and admins can delete
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
      admin: {
        description: 'Detailed course description with rich formatting',
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
      admin: {
        description: 'Course category for organization',
      },
    },

    // === MEDIA & VISUAL ===
    {
      name: 'thumbnail',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Course thumbnail image (original size from Cloudinary)',
      },
    },
    {
      name: 'bannerImage',
      type: 'relationship',
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
        description: 'Estimated course duration in hours',
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
