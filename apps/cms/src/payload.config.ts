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
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Services } from './collections/Services'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Instructors, Trainees, Admins, Media, Posts, Services],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: '*',
  csrf: [
    'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://web-admin.encreasl.com',
    'https://encreasl.com',
    'https://www.encreasl.com'
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
