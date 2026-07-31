'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return <i className="fa fa-check text-white text-xs"></i>;
}

export function SettingsClient() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 p-[10px]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your preferences and settings.</p>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose your preferred theme. System option will follow your device settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 shadow-sm mb-3 flex items-center justify-center">
                <SunIcon className="h-7 w-7 text-yellow-500" />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Light</span>
              {theme === 'light' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckIcon />
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 shadow-sm mb-3 flex items-center justify-center">
                <MoonIcon className="h-7 w-7 text-gray-300" />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Dark</span>
              {theme === 'dark' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckIcon />
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                theme === 'system'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm mb-3 flex items-center justify-center overflow-hidden">
                <MonitorIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">System</span>
              {theme === 'system' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckIcon />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
