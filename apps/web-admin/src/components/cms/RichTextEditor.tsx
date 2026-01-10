'use client';

import React from 'react';
import { LexicalCourseEditor, type SharedMediaItem } from '@encreasl/ui/lexical-course-editor';

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
  const docs = Array.isArray(json?.docs) ? json.docs : [];

  return docs
    .filter((d: any) =>
      typeof d?.mimeType === 'string' ? d.mimeType.startsWith('image/') : true,
    )
    .map((d: any) => ({
      id: String(d.id ?? d._id ?? d.filename ?? Math.random().toString(36)),
      url: d.cloudinaryURL ?? d.thumbnailURL ?? d.url ?? '',
      alt: d.alt ?? '',
      mimeType: d.mimeType ?? '',
    }));
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
