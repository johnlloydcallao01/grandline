import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Seed notification templates
 * Run: pnpm tsx src/seeders/notification-templates.ts
 */
async function seedNotificationTemplates() {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding notification templates...')

  const templates: Array<{
    name: string
    code: string
    category: 'learning' | 'account' | 'system-update' | 'other'
    titleTemplate: string
    bodyTemplate: string
    defaultLink: string
    channels: ('in-app' | 'email' | 'push')[]
    automatic: boolean
    manual: boolean
    metadataSchema: Record<string, unknown>
  }> = [
    {
      name: 'Course Enrolled',
      code: 'COURSE_ENROLLED',
      category: 'learning',
      titleTemplate: '🎓 Welcome to {{courseName}}!',
      bodyTemplate: 'You have been successfully enrolled in {{courseName}}. Start learning now!',
      defaultLink: '/portal/courses/{{courseId}}',
      channels: ['in-app', 'push'],
      automatic: true,
      manual: false,
      metadataSchema: {
        type: 'object',
        properties: {
          enrollmentId: { type: 'number' },
          courseId: { type: 'number' },
          courseName: { type: 'string' },
          enrollmentType: { type: 'string' },
          enrollmentStatus: { type: 'string' },
        },
      },
    },
    {
      name: 'Course Enrollment Pending',
      code: 'COURSE_ENROLLMENT_PENDING',
      category: 'learning',
      titleTemplate: '📝 Enrollment Request Received: {{courseName}}',
      bodyTemplate: 'Your enrollment request for {{courseName}} has been received and is now pending review.',
      defaultLink: '/portal/account/enrollments/{{enrollmentId}}',
      channels: ['in-app', 'push'],
      automatic: true,
      manual: false,
      metadataSchema: {
        type: 'object',
        properties: {
          enrollmentId: { type: 'number' },
          courseId: { type: 'number' },
          courseName: { type: 'string' },
          enrollmentType: { type: 'string' },
          enrollmentStatus: { type: 'string' },
        },
      },
    },
  ]

  try {
    for (const template of templates) {
      const existing = await payload.find({
        collection: 'notification-templates',
        where: {
          code: {
            equals: template.code,
          },
        },
        limit: 1,
      })

      if (existing.totalDocs > 0) {
        console.log(`✓ Template "${template.code}" already exists (ID: ${existing.docs[0].id})`)
      } else {
        const created = await payload.create({
          collection: 'notification-templates',
          data: template,
        })
        console.log(`✓ Created template "${template.code}" (ID: ${created.id})`)
      }
    }

    console.log('✅ Notification templates seeding complete')
  } catch (error) {
    console.error('❌ Error seeding notification templates:', error)
    process.exit(1)
  }

  process.exit(0)
}

seedNotificationTemplates()
