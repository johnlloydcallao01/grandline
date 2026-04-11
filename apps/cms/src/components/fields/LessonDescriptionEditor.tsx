'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import {
  LexicalCourseEditor,
  type SharedMediaItem,
  mapPayloadMediaDocsToSharedMediaItems,
} from '@encreasl/ui/lexical-course-editor'

async function loadCmsMedia(): Promise<SharedMediaItem[]> {
  const res = await fetch('/api/media?limit=60', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Failed to load media: ${res.status}`)
  }

  const json = await res.json()
  return mapPayloadMediaDocsToSharedMediaItems(json?.docs)
}

async function uploadCmsMedia(file: File): Promise<SharedMediaItem> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('alt', file.name)

  const res = await fetch('/api/media', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Failed to upload media: ${res.status}`)
  }

  const json = await res.json()
  const doc = json.doc || json
  return {
    id: doc.id,
    url: doc.cloudinaryURL || doc.url,
    alt: doc.alt || doc.filename,
    mimeType: doc.mimeType,
    filename: doc.filename,
  }
}

export const LessonDescriptionEditor: React.FC = () => {
  const { value, setValue } = useField<any>({ path: 'description' })

  return (
    <div>
      <FieldLabel htmlFor="description" label="Lesson Content" />
      <LexicalCourseEditor
        value={value}
        onChange={(json) => {
          setValue(json)
        }}
        placeholder="Start writing lesson content"
        loadMedia={loadCmsMedia}
        uploadMedia={uploadCmsMedia}
      />
    </div>
  )
}

