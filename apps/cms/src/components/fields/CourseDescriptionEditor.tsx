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
