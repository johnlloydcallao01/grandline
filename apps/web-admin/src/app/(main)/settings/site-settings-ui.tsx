'use client';

import React, { useRef, useState } from 'react';
import { Globe, Mail, Share2, Sun, RefreshCw, Upload, X } from 'lucide-react';
import type { SocialLink } from './actions';

export const PLATFORM_OPTIONS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitter / X', value: 'twitter' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
];

export const TABS = [
  { id: 'general', label: 'General', href: '/settings/general', icon: Globe },
  { id: 'contact', label: 'Contact Info', href: '/settings/contact', icon: Mail },
  { id: 'social', label: 'Social Media', href: '/settings/social', icon: Share2 },
  { id: 'preferences', label: 'Preferences', href: '/settings/preferences', icon: Sun },
];

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4 border-b border-[var(--card-border)] pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <div className="h-5 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="space-y-5 px-6 py-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-9 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
      <div className="border-b border-[var(--card-border)] px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export function FieldLabel({ label, htmlFor, required }: { label: string; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
    </label>
  );
}

export function TextInput({
  id, value, onChange, placeholder, type,
}: {
  id: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      id={id}
      type={type || 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100 dark:placeholder:text-gray-400"
    />
  );
}

export function TextAreaInput({
  id, value, onChange, placeholder, rows,
}: {
  id: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows || 3}
      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100 dark:placeholder:text-gray-400"
    />
  );
}

export function SelectInput({
  id, value, onChange, options, placeholder,
}: {
  id: string; value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-[#201a7c] focus:border-transparent dark:text-gray-100"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function ImageUpload({
  currentPreview, isUploading, onUpload, onRemove, label,
}: {
  currentPreview: string | null; isUploading: boolean; onUpload: (file: File) => void; onRemove: () => void; label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewError, setPreviewError] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <FieldLabel label={label} />
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/50">
          {currentPreview && !previewError ? (
            <img
              src={currentPreview}
              alt={label}
              className="h-full w-full object-contain p-1"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
              <Globe className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isUploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          {currentPreview && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SocialLinkRow({
  index, link, onUpdate, onRemove,
}: {
  index: number; link: SocialLink; onUpdate: (index: number, field: 'platform' | 'url', value: string) => void; onRemove: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--card-border)] bg-gray-50 p-4 dark:bg-gray-800/50">
      <div className="min-w-0 flex-1">
        <FieldLabel label="Platform" htmlFor={`platform-${index}`} />
        <SelectInput
          id={`platform-${index}`}
          value={link.platform}
          onChange={(v) => onUpdate(index, 'platform', v as SocialLink['platform'])}
          options={PLATFORM_OPTIONS}
        />
      </div>
      <div className="min-w-0 flex-[2]">
        <FieldLabel label="URL" htmlFor={`url-${index}`} />
        <TextInput id={`url-${index}`} value={link.url} onChange={(v) => onUpdate(index, 'url', v)} placeholder="https://facebook.com/yourpage" />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mb-0.5 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}