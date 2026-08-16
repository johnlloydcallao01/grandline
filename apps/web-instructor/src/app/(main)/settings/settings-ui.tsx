'use client';

import React from 'react';
import type { User as AuthUser } from '@/types/auth';
import type { InstructorDetails } from './actions';

export interface ProfileFormState {
  firstName: string;
  middleName: string;
  lastName: string;
  nameExtension: string;
  username: string;
  email: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  birthDate: string;
  placeOfBirth: string;
  phone: string;
  completeAddress: string;
  biography: string;
}

export interface InstructorFormState {
  specialization: string;
  yearsExperience: string;
  officeHours: string;
  contactEmail: string;
}

export interface Message {
  type: 'success' | 'error';
  text: string;
}

export const EMPTY_PROFILE: ProfileFormState = {
  firstName: '',
  middleName: '',
  lastName: '',
  nameExtension: '',
  username: '',
  email: '',
  gender: '',
  civilStatus: '',
  nationality: '',
  birthDate: '',
  placeOfBirth: '',
  phone: '',
  completeAddress: '',
  biography: '',
};

export const EMPTY_INSTRUCTOR: InstructorFormState = {
  specialization: '',
  yearsExperience: '',
  officeHours: '',
  contactEmail: '',
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
];

export const PASSWORD_REQUIREMENTS = [
  '8 to 40 characters',
  'one uppercase letter',
  'one lowercase letter',
  'one number',
  'one special character',
];

const CMS_SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api')
  .replace(/\/api\/?$/, '');

export function getDateInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const root = (value as { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } }).root;
  if (!root || !Array.isArray(root.children)) return '';
  return root.children
    .map((node) => (Array.isArray(node.children) ? node.children.map((child) => child.text || '').join('') : ''))
    .join('\n')
    .trim();
}

export function plainTextToLexical(text: string): unknown {
  const children = text.split('\n').map((line) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [{
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      text: line,
      type: 'text',
      version: 1,
    }],
  }));

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
    },
  };
}

export function getProfileForm(user: AuthUser | null): ProfileFormState {
  if (!user) return { ...EMPTY_PROFILE };

  return {
    firstName: user.firstName || '',
    middleName: user.middleName || '',
    lastName: user.lastName || '',
    nameExtension: user.nameExtension || '',
    username: user.username || '',
    email: user.email || '',
    gender: user.gender || '',
    civilStatus: user.civilStatus || '',
    nationality: user.nationality || '',
    birthDate: getDateInputValue(user.birthDate),
    placeOfBirth: user.placeOfBirth || '',
    phone: user.phone || '',
    completeAddress: user.completeAddress || '',
    biography: lexicalToPlainText(user.biography),
  };
}

export function getInstructorForm(instructor: InstructorDetails | null): InstructorFormState {
  if (!instructor) return { ...EMPTY_INSTRUCTOR };

  return {
    specialization: instructor.specialization || '',
    yearsExperience: instructor.yearsExperience != null ? String(instructor.yearsExperience) : '',
    officeHours: instructor.officeHours || '',
    contactEmail: instructor.contactEmail || '',
  };
}

export function getProfilePictureUrl(picture?: AuthUser['profilePicture']): string | null {
  if (!picture) return null;
  if (picture.cloudinaryURL) return picture.cloudinaryURL;
  if (!picture.url) return null;
  if (/^https?:\/\//i.test(picture.url)) return picture.url;
  return `${CMS_SERVER_URL}${picture.url.startsWith('/') ? picture.url : `/${picture.url}`}`;
}

export function getDisplayName(user?: AuthUser | null): string {
  if (!user) return 'Instructor';
  const name = [user.firstName, user.middleName, user.lastName, user.nameExtension]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || user.username || user.email || 'Instructor';
}

export function getInitials(user?: AuthUser | null): string {
  if (!user) return 'I';
  const first = user.firstName?.trim().charAt(0) || user.email?.charAt(0) || 'I';
  const last = user.lastName?.trim().charAt(0) || '';
  return `${first}${last}`.toUpperCase();
}

export function formatLastLogin(value?: string | null): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getPasswordError(password: string): string | null {
  if (!password) return 'Enter a new password.';
  if (password.length < 8 || password.length > 40) return 'Password must be between 8 and 40 characters.';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include uppercase, lowercase, number, and special characters.';
  }
  return null;
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
      <div className="border-b border-[var(--card-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export function FieldLabel({ label, htmlFor, required = false }: { label: string; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required ? <span className="ml-1 text-red-500 dark:text-red-400">*</span> : null}
    </label>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  autoComplete,
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  min?: string;
}) {
  return (
    <div>
      <FieldLabel label={label} htmlFor={id} required={required} />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        min={min}
        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
      />
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}) {
  return (
    <div>
      <FieldLabel label={label} htmlFor={id} />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

export function MessageBanner({ message }: { message: Message | null }) {
  if (!message) return null;

  const success = message.type === 'success';
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${success
        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${success ? 'bg-green-600' : 'bg-red-600'}`}
      >
        {success ? '✓' : '!'}
      </span>
      <span>{message.text}</span>
    </div>
  );
}

export function LoadingSettings() {
  return (
    <div className="space-y-6 py-[10px] animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-8 w-56 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="h-6 w-11 rounded-full bg-gray-200 transition peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </label>
  );
}

export function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
