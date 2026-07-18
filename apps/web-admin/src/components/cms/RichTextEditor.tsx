'use client';

import React from 'react';
import {
  LexicalCourseEditor,
  type SharedMediaItem,
  mapPayloadMediaDocsToSharedMediaItems,
} from '@encreasl/ui/lexical-course-editor';

interface RichTextEditorProps {
  value?: unknown;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  className?: string;
}

async function loadWebAdminMedia(): Promise<SharedMediaItem[]> {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = base ? `${base}/media?limit=60` : '/api/media?limit=60';

  const getPayloadToken = () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('grandline_auth_token_admin');
    }
    return null;
  };

  const payloadToken = getPayloadToken();

  const headers: Record<string, string> = {};
  if (payloadToken) {
    headers.Authorization = `JWT ${payloadToken}`;
  }

  const res = await fetch(url, {
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to load media: ${res.status}`);
  }

  const json = await res.json();
  return mapPayloadMediaDocsToSharedMediaItems(json?.docs);
}

async function uploadWebAdminMedia(file: File): Promise<SharedMediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt', file.name);

  const getPayloadToken = () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('grandline_auth_token_admin');
    }
    return null;
  };

  const payloadToken = getPayloadToken();
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = base ? `${base}/media` : '/api/media';

  const headers: Record<string, string> = {};
  if (payloadToken) {
    headers.Authorization = `JWT ${payloadToken}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload media: ${res.status}`);
  }

  const json = await res.json();
  const doc = json.doc || json;
  return {
    id: String(doc.id),
    url: doc.cloudinaryURL || doc.url,
    alt: doc.alt || doc.filename,
    mimeType: doc.mimeType,
    filename: doc.filename,
  };
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type /image to insert an image',
  className = '',
}: RichTextEditorProps) {
  return (
    <LexicalCourseEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      loadMedia={loadWebAdminMedia}
      uploadMedia={uploadWebAdminMedia}
    />
  );
}
