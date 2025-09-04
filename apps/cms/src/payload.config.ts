// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { cloudinaryAdapter } from './storage/cloudinary-adapter'
// import sharp from 'sharp'

import { Users } from './collections/Users'
import { Instructors } from './collections/Instructors'
import { Trainees } from './collections/Trainees'
import { Admins } from './collections/Admins'
import { UserCertifications } from './collections/UserCertifications'
import { UserEvents } from './collections/UserEvents'
import { EmergencyContacts } from './collections/EmergencyContacts'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
// LMS Collections
import { Courses } from './collections/Courses'
import { CourseCategories } from './collections/CourseCategories'
import { CourseEnrollments } from './collections/CourseEnrollments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // User Management
    Users,
    Instructors,
    Trainees,
    Admins,
    UserCertifications,
    UserEvents,
    EmergencyContacts,

    // Content & Media
    Media,
    Posts,

    // Learning Management System
    Courses,
    CourseCategories,
    CourseEnrollments,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: [
    // Production web-admin
    process.env.ADMIN_PROD_URL!,
    // Local development
    process.env.ADMIN_LOCAL_URL!,
    // Production web app (for trainee registration)
    process.env.WEB_PROD_URL!,
    // Local web app development
    process.env.WEB_LOCAL_URL!,
    // CMS admin panel itself
    process.env.CMS_PROD_URL!,
    process.env.CMS_LOCAL_URL!,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  // sharp,
  plugins: [
    payloadCloudPlugin(),
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
            apiKey: process.env.CLOUDINARY_API_KEY!,
            apiSecret: process.env.CLOUDINARY_API_SECRET!,
            folder: 'main-uploads',
          }),
        },
      },
    }),
    // storage-adapter-placeholder
  ],
})
