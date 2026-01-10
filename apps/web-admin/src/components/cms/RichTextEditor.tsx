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
    const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'payload-token') {
        return value;
      }
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
    />
  );
}
