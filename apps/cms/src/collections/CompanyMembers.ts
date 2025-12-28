import type { CollectionConfig } from 'payload'
import { adminOnly, serviceOrAbove } from '../access'

export const CompanyMembers: CollectionConfig = {
    slug: 'company-members',
    admin: {
        useAsTitle: 'firstName',
        defaultColumns: ['firstName', 'lastName', 'position', 'order', 'isActive'],
        group: 'Content & Media',
        description: 'Manage company team members for website display',
    },
    access: {
        // Service accounts (website) and admins can read
        read: serviceOrAbove,
        // Only admins can create, update, or delete
        create: adminOnly,
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        // === BASIC INFORMATION ===
        {
            name: 'firstName',
            type: 'text',
            required: true,
            admin: {
                description: 'First name of the team member',
            },
        },
        {
            name: 'lastName',
            type: 'text',
            required: true,
            admin: {
                description: 'Last name of the team member',
            },
        },
        {
            name: 'middleName',
            type: 'text',
            admin: {
                description: 'Middle name of the team member (optional)',
            },
        },
        {
            name: 'position',
            type: 'text',
            required: true,
            admin: {
                description: 'Job title or role (e.g., CEO, CTO, Lead Developer)',
            },
        },
        {
            name: 'bio',
            type: 'textarea',
            admin: {
                description: 'Short biography or description of the team member',
            },
        },

        // === MEDIA ===
        {
            name: 'profilePicture',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Team member profile picture',
            },
        },

        // === DISPLAY SETTINGS ===
        {
            name: 'order',
            type: 'number',
            defaultValue: 0,
            admin: {
                description: 'Display order on team page (lower numbers appear first)',
            },
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                description: 'Hide team member from public display without deleting',
            },
        },

        // === CONTACT INFORMATION (OPTIONAL) ===
        {
            name: 'email',
            type: 'email',
            admin: {
                description: 'Public contact email (optional)',
            },
        },
        {
            name: 'linkedinUrl',
            type: 'text',
            admin: {
                description: 'LinkedIn profile URL (optional)',
            },
        },
        {
            name: 'twitterUrl',
            type: 'text',
            admin: {
                description: 'Twitter/X profile URL (optional)',
            },
        },
    ],
}
