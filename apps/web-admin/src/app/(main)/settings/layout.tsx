'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, RefreshCw, Save } from 'lucide-react';
import { SiteSettingsProvider, useSiteSettings } from './site-settings-context';
import { TABS, LoadingSkeleton } from './site-settings-ui';

function SiteSettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { form, isLoading, isSaving, error, hasChanges, loadSettings, handleSave } = useSiteSettings();

  if (isLoading && !form) {
    return (
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Site Settings</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Manage your site name, branding, contact info, and social links.</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">System / Configuration</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Site Settings</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Manage your site name, branding, contact info, and social links.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => void loadSettings()}
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
          <button type="button" onClick={() => void loadSettings()} className="ml-auto text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Retry</button>
        </div>
      ) : null}

      {form ? (
        <div className="space-y-6">
          <div className="border-b border-[var(--card-border)]">
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname?.startsWith(tab.href);
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {children}

          <div className="flex items-center justify-end gap-3 border-t border-[var(--card-border)] pt-6">
            <button
              type="button"
              onClick={() => void loadSettings()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
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

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSecurity = pathname?.startsWith('/settings/security');

  if (isSecurity) return <>{children}</>;

  return (
    <SiteSettingsProvider>
      <SiteSettingsShell>{children}</SiteSettingsShell>
    </SiteSettingsProvider>
  );
}