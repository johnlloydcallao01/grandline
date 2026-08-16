'use client';

import React from 'react';
import { Plus, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSiteSettings } from './site-settings-context';
import {
  SectionCard,
  FieldLabel,
  TextInput,
  TextAreaInput,
  ImageUpload,
  SocialLinkRow,
} from './site-settings-ui';

export function GeneralSection() {
  const { form, updateField, handleFileUpload, handleRemoveImage, uploadingFor } = useSiteSettings();
  if (!form) return null;

  return (
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
  );
}

export function ContactSection() {
  const { form, updateField } = useSiteSettings();
  if (!form) return null;

  return (
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
  );
}

export function SocialSection() {
  const { form, updateSocialLink, removeSocialLink, addSocialLink } = useSiteSettings();
  if (!form) return null;

  return (
    <SectionCard title="Social Media Links">
      <div className="space-y-4">
        {form.socialLinks.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No social links added yet. Click "Add Link" to get started.</p>
        )}
        {form.socialLinks.map((link, index) => (
          <div key={index}>
            <SocialLinkRow
              index={index}
              link={link}
              onUpdate={updateSocialLink}
              onRemove={removeSocialLink}
            />
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
  );
}

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun, preview: 'bg-white border border-gray-200', iconColor: 'text-yellow-500' },
    { id: 'dark' as const, label: 'Dark', icon: Moon, preview: 'bg-gray-900 border border-gray-700', iconColor: 'text-gray-300' },
    { id: 'system' as const, label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-gray-900 border border-gray-200 dark:border-gray-700', iconColor: 'text-gray-600 dark:text-gray-300' },
  ];

  return (
    <SectionCard title="Appearance">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme. System option will follow your device settings.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-16 h-16 rounded-lg shadow-sm mb-3 flex items-center justify-center ${option.preview}`}>
                  <Icon className={`h-7 w-7 ${option.iconColor}`} />
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <i className="fa fa-check text-white text-xs"></i>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}