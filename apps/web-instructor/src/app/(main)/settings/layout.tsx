'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SettingsProvider, useSettings } from './settings-context';
import { LoadingSettings, getDisplayName, getInitials, getProfilePictureUrl } from './settings-ui';

const TABS = [
  { id: 'profile', label: 'Your Profile', href: '/settings/profile' },
  { id: 'instructor', label: 'Instructor Details', href: '/settings/instructor' },
  { id: 'security', label: 'Security', href: '/settings/security' },
  { id: 'preferences', label: 'Preferences', href: '/settings/preferences' },
] as const;

function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isLoading, pageError, reload } = useSettings();

  if (isLoading && !profile) return <LoadingSettings />;

  if (!profile) {
    return (
      <div className="py-[10px]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">!</span>
            <div className="flex-1">
              <h1 className="font-semibold">Unable to load your settings</h1>
              <p className="mt-1 text-sm">{pageError || 'Please refresh the page or sign in again.'}</p>
              <button
                type="button"
                onClick={() => void reload()}
                className="mt-4 rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profilePictureUrl = getProfilePictureUrl(profile.profilePicture);
  const displayName = getDisplayName(profile);

  return (
    <div className="space-y-6 py-[10px] pb-12">
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Settings</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">General Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Manage your personal information, instructor details, password, notifications, and workspace appearance.
        </p>
      </div>

      {pageError ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <span className="mt-0.5">!</span>
          <span>{pageError}</span>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#201a7c] via-[#3028a3] to-[#4f46c7] px-5 py-6 text-white sm:px-8 sm:py-7">
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-36 right-24 h-72 w-72 rounded-full border-[32px] border-white/5" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/30 bg-white/15 text-2xl font-bold shadow-lg sm:h-24 sm:w-24">
                {profilePictureUrl ? (
                  <Image src={profilePictureUrl} alt={displayName} fill sizes="96px" className="object-cover" unoptimized />
                ) : (
                  getInitials(profile)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-100">Instructor account</p>
                <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">{displayName}</h2>
                <p className="mt-1 truncate text-sm text-blue-100">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium capitalize ring-1 ring-white/20">
                {profile.role}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 font-medium text-emerald-100 ring-1 ring-emerald-200/20">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> {profile.isActive === false ? 'Inactive' : 'Active'}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex overflow-x-auto border-t border-[var(--card-border)]" aria-label="Settings sections">
          {TABS.map((tab) => {
            const isActive = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition sm:px-7 ${isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
                  }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <SettingsShell>{children}</SettingsShell>
    </SettingsProvider>
  );
}
