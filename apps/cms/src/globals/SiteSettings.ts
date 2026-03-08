import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    label: 'Site Settings',
    access: {
        read: () => true, // Everyone can read site settings
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'General',
                    fields: [
                        {
                            name: 'siteName',
                            type: 'text',
                            required: true,
                            label: 'Website Name',
                            defaultValue: 'Grandline Maritime',
                        },
                        {
                            name: 'description',
                            type: 'textarea',
                            label: 'Site Description (SEO)',
                        },
                        {
                            name: 'logo',
                            type: 'upload',
                            relationTo: 'media',
                            label: 'Logo',
                        },
                        {
                            name: 'favicon',
                            type: 'upload',
                            relationTo: 'media',
                            label: 'Favicon / Icon',
                        },
                    ],
                },
                {
                    label: 'Contact Info',
                    fields: [
                        {
                            name: 'email',
                            type: 'email',
                            label: 'Contact Email',
                        },
                        {
                            name: 'phone',
                            type: 'text',
                            label: 'Phone Number',
                        },
                        {
                            name: 'address',
                            type: 'textarea',
                            label: 'Physical Address',
                        },
                    ],
                },
                {
                    label: 'Social Media',
                    fields: [
                        {
                            name: 'socialLinks',
                            type: 'array',
                            label: 'Social Links',
                            fields: [
                                {
                                    name: 'platform',
                                    type: 'select',
                                    options: [
                                        { label: 'Facebook', value: 'facebook' },
                                        { label: 'Twitter / X', value: 'twitter' },
                                        { label: 'Instagram', value: 'instagram' },
                                        { label: 'LinkedIn', value: 'linkedin' },
                                        { label: 'YouTube', value: 'youtube' },
                                        { label: 'TikTok', value: 'tiktok' },
                                    ],
                                    required: true,
                                },
                                {
                                    name: 'url',
                                    type: 'text',
                                    required: true,
                                    label: 'URL',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
}
