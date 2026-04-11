import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import { authenticatedUsers, adminOnly } from '../access'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: authenticatedUsers,
    update: authenticatedUsers,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only process on create with a file upload
        if (operation !== 'create' || !req.file) {
          return data
        }

        const file = req.file
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

        if (!cloudName) {
          req.payload.logger.error('[Media beforeChange] Cloudinary cloud name not configured')
          return data
        }

        try {
          const timestamp = Date.now()
          const baseName = file.name.replace(/\.[^/.]+$/, '') // Remove file extension
          const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
          
          // For raw files (like PPT/DOC/PDF), Cloudinary requires the extension in the public_id 
          // to serve it with the correct extension in the URL. We'll append it for all to be safe.
          const uniquePublicId = extension ? `${baseName}_${timestamp}.${extension}` : `${baseName}_${timestamp}`

          req.payload.logger.info(`[Media beforeChange] Uploading file: ${file.name} as ${uniquePublicId}`)

          // Upload to Cloudinary
          const uploadOptions = {
            folder: 'main-uploads',
            public_id: uniquePublicId,
            use_filename: true,
            unique_filename: false,
            overwrite: false,
            resource_type: 'auto' as const,
          }

          const result: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              uploadOptions,
              (error, result) => {
                if (error) {
                  reject(error)
                } else {
                  resolve(result!)
                }
              }
            )
            uploadStream.end(Buffer.from(file.data))
          })

          // Populate data fields directly - this is saved to database
          data.cloudinaryPublicId = result.public_id
          data.cloudinaryURL = result.secure_url
          data.url = result.secure_url
          data.filename = result.public_id
          data.filesize = result.bytes
          data.width = result.width
          data.height = result.height
          
          if (result.resource_type !== 'raw') {
            if (result.format === 'pdf') {
              data.mimeType = 'application/pdf'
            } else {
              data.mimeType = `${result.resource_type}/${result.format}`
            }
          }

          req.payload.logger.info(`[Media beforeChange] SUCCESS: Uploaded to Cloudinary, public_id=${result.public_id}`)
        } catch (error) {
          req.payload.logger.error(`[Media beforeChange] FAILED to upload to Cloudinary: ${error}`)
          throw error // Re-throw to prevent saving document if upload fails
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'cloudinaryPublicId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'cloudinaryURL',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  upload: {
    disableLocalStorage: true,
    mimeTypes: [
      'image/*',
      'video/*',
      'application/pdf',
      'application/zip',
      'audio/*',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/x-cfb', // Old Office format (doc, xls, ppt)
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12', // .pptm
      'application/vnd.ms-powerpoint.slideshow.macroEnabled.12', // .ppsm
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow', // .ppsx
    ],
  },
}
