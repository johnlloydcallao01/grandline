import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role'],
  },
  auth: true,

  fields: [
    // Email and password are added automatically by auth: true
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Instructor',
          value: 'instructor',
        },
        {
          label: 'Trainee',
          value: 'trainee',
        },
      ],
      defaultValue: 'trainee',
      required: true,
      admin: {
        description: 'User role determines access permissions',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Inactive users cannot log in',
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last login timestamp',
      },
    },

    // EXISTING DATABASE FIELDS (Hidden from admin interface)
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'profileImageUrl',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'emergencyContact',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'preferences',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'middleName',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'nameExtension',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'username',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'nationality',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'birthDate',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'placeOfBirth',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'completeAddress',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'civilStatus',
      type: 'select',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' },
        { label: 'Separated', value: 'separated' },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
}
