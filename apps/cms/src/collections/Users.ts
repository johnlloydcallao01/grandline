import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'isActive'],
  },
  auth: true,
  // Note: Automatic role record creation is now handled by database triggers
  // See: apps/cms/src/migrations/20250826_enterprise_schema_optimization.sql
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
      name: 'middleName',
      type: 'text',
      admin: {
        description: 'Middle name (optional)',
      },
    },
    {
      name: 'nameExtension',
      type: 'text',
      admin: {
        description: 'Name extension (e.g. Jr., II, Sr.)',
      },
    },
    {
      name: 'username',
      type: 'text',
      unique: true,
      admin: {
        description: 'Unique username for login (separate from email)',
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
        description: 'Gender identity',
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
        description: 'Civil/marital status',
      },
    },
    {
      name: 'nationality',
      type: 'text',
      admin: {
        description: 'Nationality/citizenship',
      },
    },
    {
      name: 'birthDate',
      type: 'date',
      admin: {
        description: 'Date of birth',
      },
    },
    {
      name: 'placeOfBirth',
      type: 'text',
      admin: {
        description: 'Place of birth (city, country)',
      },
    },
    {
      name: 'completeAddress',
      type: 'textarea',
      admin: {
        description: 'Complete residential address',
      },
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

    // SHARED FIELDS (moved from role tables based on semantic analysis)
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Master active status for user across all roles',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'User biography/profile description (available for all roles)',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Contact phone number',
      },
    },
    {
      name: 'profileImageUrl',
      type: 'text',
      admin: {
        description: 'URL to user profile image/avatar',
      },
    },
    {
      name: 'emergencyContact',
      type: 'text',
      admin: {
        description: 'Emergency contact information (legacy field - use EmergencyContacts collection for new entries)',
      },
    },

    // FLEXIBLE ATTRIBUTES (JSONB fields for extensibility)
    {
      name: 'preferences',
      type: 'json',
      admin: {
        description: 'User preferences (theme, notifications, etc.)',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional user metadata (extensible)',
      },
    },

    // SYSTEM FIELDS
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last login timestamp',
      },
    },
  ],
}
