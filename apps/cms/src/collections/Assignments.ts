import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Assignments: CollectionConfig = {
  slug: 'assignments',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'maxScore', 'passingScore', 'submissionType', 'dueDate'],
    group: 'Learning Management',
    description: 'Instructor-graded assignments (e.g., essays, file uploads, practical tasks)',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Service, Admin, Instructor, and Trainees can read (to see the task)
      return true
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'instructor'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'instructor'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.role === 'instructor'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Detailed instructions, rubrics, and prompts',
        components: {
          Field: '/components/fields/CourseDescriptionEditor#CourseDescriptionEditor',
        },
      },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Downloadable templates or reference files for the student',
      },
    },
    {
      name: 'maxScore',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: {
        description: 'The maximum possible grade',
      },
    },
    {
      name: 'passingScore',
      type: 'number',
      required: true,
      defaultValue: 75,
      admin: {
        description: 'Minimum score required to pass',
      },
    },
    {
      name: 'submissionType',
      type: 'select',
      required: true,
      defaultValue: 'both',
      options: [
        { label: 'File Upload Only', value: 'file_upload' },
        { label: 'Text Entry Only', value: 'text_entry' },
        { label: 'Both (Text & File)', value: 'both' },
      ],
    },
    {
      name: 'allowedFileTypes',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'Word (DOC/DOCX)', value: 'word' },
        { label: 'Excel (XLS/XLSX)', value: 'excel' },
        { label: 'PowerPoint (PPT/PPTX)', value: 'powerpoint' },
        { label: 'Images (JPG/PNG)', value: 'images' },
        { label: 'ZIP Archives', value: 'zip' },
      ],
      admin: {
        description: 'Allowed file extensions (if file upload is permitted)',
        condition: (data) => data.submissionType === 'file_upload' || data.submissionType === 'both',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Optional deadline for submission',
      },
    },
  ],
}
