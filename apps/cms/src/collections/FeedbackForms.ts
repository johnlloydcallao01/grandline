import { CollectionConfig, Access } from 'payload'

const anyone: Access = () => true;

const checkRole = (roles: string[], user?: any): boolean => {
    if (user && roles.includes(user.role)) return true;
    return false;
};

export const FeedbackForms: CollectionConfig = {
    slug: 'feedback-forms',
    admin: {
        useAsTitle: 'title',
        group: 'Learning Management System',
        description: 'Create advanced survey and feedback forms for courses',
    },
    access: {
        read: anyone, // Anyone can read the form structure to render it
        create: ({ req: { user } }) => checkRole(['admin', 'service'], user),
        update: ({ req: { user } }) => checkRole(['admin', 'service'], user),
        delete: ({ req: { user } }) => checkRole(['admin', 'service'], user),
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'fields',
            type: 'blocks',
            required: true,
            minRows: 1,
            blocks: [
                {
                    slug: 'textInput',
                    labels: {
                        singular: 'Text Input',
                        plural: 'Text Inputs',
                    },
                    fields: [
                        { name: 'name', type: 'text', required: true, admin: { description: 'Unique identifier for this field (e.g. first_name)' } },
                        { name: 'label', type: 'text', required: true },
                        { name: 'placeholder', type: 'text' },
                        {
                            name: 'format',
                            type: 'select',
                            options: [
                                { label: 'Text', value: 'text' },
                                { label: 'Email', value: 'email' },
                                { label: 'Phone', value: 'phone' },
                                { label: 'Number', value: 'number' },
                                { label: 'Textarea (Long)', value: 'textarea' },
                            ],
                            defaultValue: 'text',
                        },
                        { name: 'isRequired', type: 'checkbox', defaultValue: false },
                    ],
                },
                {
                    slug: 'choiceInput',
                    labels: {
                        singular: 'Choice Input',
                        plural: 'Choice Inputs',
                    },
                    fields: [
                        { name: 'name', type: 'text', required: true, admin: { description: 'Unique identifier for this field (e.g. favorite_color)' } },
                        { name: 'label', type: 'text', required: true },
                        {
                            name: 'uiType',
                            type: 'select',
                            options: [
                                { label: 'Radio Buttons (Single Choice)', value: 'radio' },
                                { label: 'Dropdown (Single Choice)', value: 'dropdown' },
                                { label: 'Checkboxes (Multiple Choice)', value: 'checkbox_group' },
                            ],
                            required: true,
                            defaultValue: 'radio',
                        },
                        {
                            name: 'options',
                            type: 'array',
                            required: true,
                            minRows: 1,
                            fields: [
                                { name: 'label', type: 'text', required: true },
                                { name: 'value', type: 'text', required: true },
                            ],
                        },
                        { name: 'isRequired', type: 'checkbox', defaultValue: false },
                    ],
                },
                {
                    slug: 'surveyMatrix',
                    labels: {
                        singular: 'Survey Matrix',
                        plural: 'Survey Matrices',
                    },
                    fields: [
                        { name: 'name', type: 'text', required: true, admin: { description: 'Unique identifier for this field (e.g. course_evaluation)' } },
                        { name: 'question', type: 'text', required: true },
                        {
                            name: 'columns',
                            type: 'array',
                            required: true,
                            minRows: 2,
                            admin: { description: 'e.g., Strongly Disagree, Neutral, Strongly Agree' },
                            fields: [
                                { name: 'label', type: 'text', required: true },
                                { name: 'value', type: 'text', required: true },
                            ],
                        },
                        {
                            name: 'rows',
                            type: 'array',
                            required: true,
                            minRows: 1,
                            admin: { description: 'Specific statements to evaluate' },
                            fields: [
                                { name: 'statement', type: 'text', required: true },
                                { name: 'value', type: 'text', required: true, admin: { description: 'Internal value for this row' } },
                            ],
                        },
                        { name: 'isRequired', type: 'checkbox', defaultValue: false },
                    ],
                },
            ],
        },
    ],
}