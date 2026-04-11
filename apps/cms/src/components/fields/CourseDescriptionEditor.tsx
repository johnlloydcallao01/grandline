'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import {
  LexicalCourseEditor,
  type SharedMediaItem,
  mapPayloadMediaDocsToSharedMediaItems,
} from '@encreasl/ui/lexical-course-editor'

type CourseDescriptionEditorProps = {
  path?: string
  label?: string
  admin?: {
    label?: string
    placeholder?: string
  }
}

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

export const CourseDescriptionEditor: React.FC<CourseDescriptionEditorProps> = (props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fieldPath = props.path || 'description'
  const fieldLabel =
    props.label || props.admin?.label || (fieldPath === 'bodyBlocks' ? 'Content' : fieldPath === 'biography' ? 'Biography' : fieldPath === 'certifications' ? 'Certifications' : 'Description')
  const placeholder =
    (props.admin && props.admin.placeholder) || (fieldPath === 'biography' ? 'Write a professional biography...' : 'Start writing the course or lesson content')

  const { value, setValue } = useField<any>({ path: fieldPath })

  if (!mounted) {
    return (
      <div>
        <FieldLabel htmlFor={fieldPath} label={fieldLabel} />
        <div className="mt-2 h-32 rounded-md border border-gray-200 bg-gray-50" />
      </div>
    )
  }

  return (
    <div>
      <FieldLabel htmlFor={fieldPath} label={fieldLabel} />
      <LexicalCourseEditor
        value={value}
        onChange={(json) => {
          setValue(json)
        }}
        placeholder={placeholder}
        loadMedia={loadCmsMedia}
        uploadMedia={uploadCmsMedia}
      />
    </div>
  )
}
