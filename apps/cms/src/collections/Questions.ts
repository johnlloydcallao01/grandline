import type { CollectionConfig } from 'payload'

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'prompt',
    defaultColumns: ['prompt', 'type', 'difficulty', 'status'],
    group: 'Learning Management',
    description: 'Question bank for quizzes and assessments',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'service' || user.role === 'admin' || user.role === 'instructor') {
        return true
      }
      return false
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
      name: 'prompt',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Single Choice', value: 'single_choice' },
        { label: 'Multiple Choice', value: 'multiple_choice' },
        { label: 'True / False', value: 'true_false' },
      ],
      defaultValue: 'single_choice',
      required: true,
    },
    {
      name: 'explanation',
      type: 'textarea',
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      defaultValue: 'medium',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Deprecated', value: 'deprecated' },
      ],
      defaultValue: 'active',
      required: true,
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'trueFalseCorrect',
      type: 'radio',
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData.type === 'true_false',
        description: 'Select which statement is correct for True / False questions',
      },
    },
    {
      name: 'options',
      type: 'array',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData.type !== 'true_false',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        const questionType = data.type ?? originalDoc?.type

        if (questionType === 'true_false') {
          const selected = data.trueFalseCorrect ?? originalDoc?.trueFalseCorrect ?? 'true'

          data.options = [
            {
              label: 'True',
              isCorrect: selected === 'true',
            },
            {
              label: 'False',
              isCorrect: selected === 'false',
            },
          ]
        }

        return data
      },
    ],
  },
}
