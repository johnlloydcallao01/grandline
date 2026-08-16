'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  fetchSiteSettings,
  updateSiteSettings,
  type SiteSettingsData,
  type SocialLink,
} from './actions';

export type FormState = {
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

interface SiteSettingsContextValue {
  form: FormState | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  uploadingFor: 'logo' | 'favicon' | null;
  hasChanges: boolean;
  loadSettings: () => Promise<void>;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  handleFileUpload: (target: 'logo' | 'favicon', file: File) => Promise<void>;
  handleRemoveImage: (target: 'logo' | 'favicon') => void;
  addSocialLink: () => void;
  updateSocialLink: (index: number, field: 'platform' | 'url', value: string) => void;
  removeSocialLink: (index: number) => void;
  handleSave: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

function getMediaUrl(media: SiteSettingsData['logo']): string | null {
  if (!media || typeof media !== 'object') return null;
  const m = media as Record<string, unknown>;
  return (m.cloudinaryURL as string) || (m.url as string) || null;
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState<FormState | null>(null);
  const [originalJson, setOriginalJson] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<'logo' | 'favicon' | null>(null);
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

  const value: SiteSettingsContextValue = {
    form,
    isLoading,
    isSaving,
    error,
    uploadingFor,
    hasChanges,
    loadSettings,
    updateField,
    handleFileUpload,
    handleRemoveImage,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    handleSave,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  return context;
}