'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { AlertCircle, RefreshCw, Save, Upload, X, Plus, Globe, Mail, Share2, Sun, Moon, Monitor } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/contexts/ThemeContext';
import {
  fetchSiteSettings,
  updateSiteSettings,
  type SiteSettingsData,
  type SocialLink,
} from './actions';

type FormState = {
  siteName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  logoId: number | null;
  logoPreview: string | null;
  faviconId: number | null;
  faviconPreview: string | null;
  socialLinks: SocialLink[];
};

const PLATFORM_OPTIONS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitter / X', value: 'twitter' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
];

const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'contact', label: 'Contact Info', icon: Mail },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'preferences', label: 'Preferences', icon: Sun },
];

function getMediaUrl(media: SiteSettingsData['logo']): string | null {
  if (!media || typeof media !== 'object') return null;
  const m = media as Record<string, unknown>;
  return (m.cloudinaryURL as string) || (m.url as string) || null;
}

function LoadingSkeleton() {
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
      <div className="border-b border-[var(--card-border)] px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FieldLabel({ label, htmlFor, required }: { label: string; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
    </label>
  );
}

function TextInput({
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

function TextAreaInput({
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

function SelectInput({
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

function ImageUpload({
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

export function SettingsClient() {
  const [form, setForm] = useState<FormState | null>(null);
  const [originalJson, setOriginalJson] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingFor, setUploadingFor] = useState<'logo' | 'favicon' | null>(null);
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSiteSettings();
      setOriginalJson(JSON.stringify(data));
      setForm({
        siteName: data.siteName || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        logoId: data.logo && typeof data.logo === 'object' ? (data.logo as { id: number }).id : (typeof data.logo === 'number' ? data.logo : null),
        logoPreview: getMediaUrl(data.logo),
        faviconId: data.favicon && typeof data.favicon === 'object' ? (data.favicon as { id: number }).id : (typeof data.favicon === 'number' ? data.favicon : null),
        faviconPreview: getMediaUrl(data.favicon),
        socialLinks: data.socialLinks || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load site settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const handleFileUpload = useCallback(async (target: 'logo' | 'favicon', file: File) => {
    setUploadingFor(target);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', target === 'logo' ? 'Site Logo' : 'Favicon');

      const res = await fetch('/api/upload-media', { method: 'POST', body: formData });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error((errBody as { error?: string })?.error || 'Upload failed');
      }
      const media = await res.json() as { doc: { id: number; url?: string; cloudinaryURL?: string } };
      const doc = media.doc || media;

      if (target === 'logo') {
        updateField('logoId', doc.id);
        updateField('logoPreview', doc.cloudinaryURL || doc.url || null);
      } else {
        updateField('faviconId', doc.id);
        updateField('faviconPreview', doc.cloudinaryURL || doc.url || null);
      }
      addToast({ title: 'Upload complete', message: 'File uploaded successfully.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Upload failed', message: err instanceof Error ? err.message : 'An error occurred.', type: 'error' });
    } finally {
      setUploadingFor(null);
    }
  }, [updateField, addToast]);

  const handleRemoveImage = useCallback((target: 'logo' | 'favicon') => {
    if (target === 'logo') {
      updateField('logoId', null);
      updateField('logoPreview', null);
    } else {
      updateField('faviconId', null);
      updateField('faviconPreview', null);
    }
  }, [updateField]);

  const addSocialLink = useCallback(() => {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, socialLinks: [...prev.socialLinks, { platform: 'facebook', url: '' }] };
    });
  }, []);

  const updateSocialLink = useCallback((index: number, field: 'platform' | 'url', value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const updated = [...prev.socialLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialLinks: updated };
    });
  }, []);

  const removeSocialLink = useCallback((index: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) };
    });
  }, []);

  const hasChanges = form ? JSON.stringify({
    siteName: form.siteName,
    description: form.description,
    email: form.email,
    phone: form.phone,
    address: form.address,
    logoId: form.logoId,
    faviconId: form.faviconId,
    socialLinks: form.socialLinks,
  }) !== originalJson : false;

  const handleSave = useCallback(async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        siteName: form.siteName,
        description: form.description || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        logo: form.logoId,
        favicon: form.faviconId,
        socialLinks: form.socialLinks.length > 0 ? form.socialLinks : [],
      };

      const result = await updateSiteSettings(payload);
      setOriginalJson(JSON.stringify({
        siteName: form.siteName,
        description: form.description,
        email: form.email,
        phone: form.phone,
        address: form.address,
        logoId: form.logoId,
        faviconId: form.faviconId,
        socialLinks: form.socialLinks,
      }));
      setForm((prev) => prev ? {
        ...prev,
        logoPreview: getMediaUrl(result.logo) || prev.logoPreview,
        faviconPreview: getMediaUrl(result.favicon) || prev.faviconPreview,
      } : prev);
      addToast({ title: 'Settings saved', message: 'Site settings have been updated successfully.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Failed to save', message: err instanceof Error ? err.message : 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [form, addToast]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Site Settings</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Manage your site name, branding, contact info, and social links.</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">System / Configuration</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Site Settings</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Manage your site name, branding, contact info, and social links.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button type="button" onClick={loadSettings} className="ml-auto text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Retry</button>
        </div>
      ) : null}

      {form ? (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-[var(--card-border)]">
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <SectionCard title="General Information">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <FieldLabel label="Site Name" htmlFor="siteName" required />
                    <TextInput id="siteName" value={form.siteName} onChange={(v) => updateField('siteName', v)} placeholder="Grandline Maritime" />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Site Description (SEO)" htmlFor="description" />
                  <TextAreaInput id="description" value={form.description} onChange={(v) => updateField('description', v)} placeholder="Brief description of your site for search engines" rows={3} />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ImageUpload
                    label="Logo"
                    currentPreview={form.logoPreview}
                    isUploading={uploadingFor === 'logo'}
                    onUpload={(file) => handleFileUpload('logo', file)}
                    onRemove={() => handleRemoveImage('logo')}
                  />
                  <ImageUpload
                    label="Favicon"
                    currentPreview={form.faviconPreview}
                    isUploading={uploadingFor === 'favicon'}
                    onUpload={(file) => handleFileUpload('favicon', file)}
                    onRemove={() => handleRemoveImage('favicon')}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <SectionCard title="Contact Information">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel label="Contact Email" htmlFor="email" />
                  <TextInput id="email" type="email" value={form.email} onChange={(v) => updateField('email', v)} placeholder="admin@example.com" />
                </div>
                <div>
                  <FieldLabel label="Phone Number" htmlFor="phone" />
                  <TextInput id="phone" value={form.phone} onChange={(v) => updateField('phone', v)} placeholder="+1 (555) 123-4567" />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel label="Physical Address" htmlFor="address" />
                  <TextAreaInput id="address" value={form.address} onChange={(v) => updateField('address', v)} placeholder="123 Main St, City, Country" rows={2} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <SectionCard title="Social Media Links">
              <div className="space-y-4">
                {form.socialLinks.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No social links added yet. Click "Add Link" to get started.</p>
                )}
                {form.socialLinks.map((link, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--card-border)] bg-gray-50 p-4 dark:bg-gray-800/50">
                    <div className="min-w-0 flex-1">
                      <FieldLabel label="Platform" htmlFor={`platform-${index}`} />
                      <SelectInput
                        id={`platform-${index}`}
                        value={link.platform}
                        onChange={(v) => updateSocialLink(index, 'platform', v as SocialLink['platform'])}
                        options={PLATFORM_OPTIONS}
                      />
                    </div>
                    <div className="min-w-0 flex-[2]">
                      <FieldLabel label="URL" htmlFor={`url-${index}`} />
                      <TextInput id={`url-${index}`} value={link.url} onChange={(v) => updateSocialLink(index, 'url', v)} placeholder="https://facebook.com/yourpage" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="mb-0.5 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </button>
              </div>
            </SectionCard>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <SectionCard title="Appearance">
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme. System option will follow your device settings.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 flex items-center justify-center">
                      <Sun className="h-7 w-7 text-yellow-500" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Light</span>
                    {theme === 'light' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fa fa-check text-white text-xs"></i>
                      </div>
                    )}
                  </button>

                  {/* Dark */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 shadow-sm mb-3 flex items-center justify-center">
                      <Moon className="h-7 w-7 text-gray-300" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Dark</span>
                    {theme === 'dark' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fa fa-check text-white text-xs"></i>
                      </div>
                    )}
                  </button>

                  {/* System */}
                  <button
                    onClick={() => setTheme('system')}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm mb-3 flex items-center justify-center overflow-hidden">
                      <Monitor className="h-7 w-7 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">System</span>
                    {theme === 'system' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fa fa-check text-white text-xs"></i>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--card-border)] pt-6">
            <button
              type="button"
              onClick={loadSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500 dark:hover:border-blue-400"
            >
              {isSaving ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Settings</>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
