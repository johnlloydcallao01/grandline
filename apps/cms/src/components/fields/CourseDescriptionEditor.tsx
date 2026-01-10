'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import { LexicalCourseEditor, type SharedMediaItem } from '@encreasl/ui/lexical-course-editor'

async function loadCmsMedia(): Promise<SharedMediaItem[]> {
  const res = await fetch('/api/media?limit=60', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Failed to load media: ${res.status}`)
  }

  const json = await res.json()
  const docs = Array.isArray(json?.docs) ? json.docs : []

  return docs
    .filter((d: any) =>
      typeof d?.mimeType === 'string' ? d.mimeType.startsWith('image/') : true,
    )
    .map((d: any) => ({
      id: String(d.id ?? d._id ?? d.filename ?? Math.random().toString(36)),
      url: d.cloudinaryURL ?? d.thumbnailURL ?? d.url ?? '',
      alt: d.alt ?? '',
      mimeType: d.mimeType ?? '',
    }))
}

export const CourseDescriptionEditor: React.FC = () => {
  const { value, setValue } = useField<any>({ path: 'description' })

  return (
    <div>
      <FieldLabel htmlFor="description" label="Description" />
      <LexicalCourseEditor
        value={value}
        onChange={(json) => {
          setValue(json)
        }}
        placeholder="Type /image to insert an image"
        loadMedia={loadCmsMedia}
      />
    </div>
  )
}
