'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import {
  AlertCircle,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
  Key,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  Sun,
  Upload,
  User,
  X,
} from '@/components/ui/IconWrapper';
import type { ProfilePicture, User as AuthUser } from '@/types/auth';
import {
  getAdminProfile,
  removeProfilePicture,
  updateAdminProfile,
  uploadProfilePicture,
  type ProfileUpdateInput,
} from './actions';

type ActiveTab = 'profile' | 'settings';

interface ProfileFormState {
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
  biography: unknown;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

const EMPTY_PROFILE: ProfileFormState = {
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
  biography: null,
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
];

const PASSWORD_REQUIREMENTS = [
  '8 to 40 characters',
  'one uppercase letter',
  'one lowercase letter',
  'one number',
  'one special character',
];

const CMS_SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api')
  .replace(/\/api\/?$/, '');

function getDateInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function plainTextToLexical(text: string): unknown {
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

function normalizeBiography(value: unknown): unknown {
  if (!value) return null;
  if (typeof value === 'object' && value !== null && 'root' in value) return value;
  if (typeof value === 'string') return value.trim() ? plainTextToLexical(value) : null;
  return null;
}

function getProfileForm(user: AuthUser | null): ProfileFormState {
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
    biography: normalizeBiography(user.biography),
  };
}

function getProfilePictureUrl(picture?: ProfilePicture | null): string | null {
  if (!picture) return null;
  if (picture.cloudinaryURL) return picture.cloudinaryURL;
  if (!picture.url) return null;
  if (/^https?:\/\//i.test(picture.url)) return picture.url;
  return `${CMS_SERVER_URL}${picture.url.startsWith('/') ? picture.url : `/${picture.url}`}`;
}

function getProfileSnapshot(form: ProfileFormState): string {
  return JSON.stringify(form);
}

function getDisplayName(user?: AuthUser | null): string {
  if (!user) return 'Administrator';
  const name = [user.firstName, user.middleName, user.lastName, user.nameExtension]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || user.username || user.email || 'Administrator';
}

function getInitials(user?: AuthUser | null): string {
  if (!user) return 'A';
  const first = user.firstName?.trim().charAt(0) || user.email?.charAt(0) || 'A';
  const last = user.lastName?.trim().charAt(0) || '';
  return `${first}${last}`.toUpperCase();
}

function formatLastLogin(value?: string | null): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPasswordError(password: string): string | null {
  if (!password) return 'Enter a new password.';
  if (password.length < 8 || password.length > 40) return 'Password must be between 8 and 40 characters.';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include uppercase, lowercase, number, and special characters.';
  }
  return null;
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
      <div className="flex items-start gap-3 border-b border-[var(--card-border)] px-5 py-4 sm:px-6">
        {Icon ? (
          <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function FieldLabel({ label, htmlFor, required = false }: { label: string; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
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
        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
      />
    </div>
  );
}

function SelectField({
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

function MessageBanner({ message }: { message: Message | null }) {
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
      {success ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{message.text}</span>
    </div>
  );
}

function LoadingProfile() {
  return (
    <div className="space-y-6 p-[10px] animate-pulse">
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

function Toggle({
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

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { user: authenticatedUser, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const requestedTab = searchParams.get('tab');
  const activeTab: ActiveTab = requestedTab === 'settings' ? 'settings' : 'profile';
  const [profile, setProfile] = useState<AuthUser | null>(authenticatedUser);
  const [form, setForm] = useState<ProfileFormState>(getProfileForm(authenticatedUser));
  const [profileSnapshot, setProfileSnapshot] = useState(getProfileSnapshot(getProfileForm(authenticatedUser)));
  const [preferences, setPreferences] = useState({
    pushNotificationsEnabled: authenticatedUser?.pushNotificationsEnabled !== false,
    securityAlertsEmailEnabled: authenticatedUser?.securityAlertsEmailEnabled !== false,
  });
  const [preferencesSnapshot, setPreferencesSnapshot] = useState(JSON.stringify(preferences));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(!authenticatedUser);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<Message | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setPageError(null);

      try {
        const loadedProfile = await getAdminProfile();
        if (cancelled) return;

        const nextForm = getProfileForm(loadedProfile);
        const nextPreferences = {
          pushNotificationsEnabled: loadedProfile.pushNotificationsEnabled !== false,
          securityAlertsEmailEnabled: loadedProfile.securityAlertsEmailEnabled !== false,
        };

        setProfile(loadedProfile);
        setForm(nextForm);
        setProfileSnapshot(getProfileSnapshot(nextForm));
        setPreferences(nextPreferences);
        setPreferencesSnapshot(JSON.stringify(nextPreferences));
        updateUser(loadedProfile);
      } catch (error) {
        if (!cancelled) {
          setPageError(error instanceof Error ? error.message : 'Failed to load your profile.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [updateUser]);

  const profilePictureUrl = getProfilePictureUrl(profile?.profilePicture);
  const displayName = getDisplayName(profile);
  const hasProfileChanges = getProfileSnapshot(form) !== profileSnapshot;
  const hasPreferenceChanges = JSON.stringify(preferences) !== preferencesSnapshot;

  const setField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setProfileMessage(null);
  };

  const navigateToTab = (tab: ActiveTab) => {
    router.push(tab === 'profile' ? '/profile' : '/profile?tab=settings');
  };

  const applyUpdatedProfile = (updatedProfile: AuthUser, resetProfileForm = false) => {
    setProfile(updatedProfile);
    updateUser(updatedProfile);
    if (resetProfileForm) {
      const nextForm = getProfileForm(updatedProfile);
      setForm(nextForm);
      setProfileSnapshot(getProfileSnapshot(nextForm));
    }
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();

    if (!firstName || !lastName) {
      setProfileMessage({ type: 'error', text: 'First name and last name are required.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileMessage({ type: 'error', text: 'Enter a valid email address.' });
      return;
    }
    if (!hasProfileChanges) {
      setProfileMessage({ type: 'success', text: 'There are no profile changes to save.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    const update: ProfileUpdateInput = {
      firstName,
      lastName,
      middleName: form.middleName.trim() || null,
      nameExtension: form.nameExtension.trim() || null,
      username: form.username.trim() || null,
      email,
      gender: form.gender || null,
      civilStatus: form.civilStatus || null,
      nationality: form.nationality.trim() || null,
      birthDate: form.birthDate || null,
      placeOfBirth: form.placeOfBirth.trim() || null,
      phone: form.phone.trim() || null,
      completeAddress: form.completeAddress.trim() || null,
      biography: form.biography || null,
    };

    try {
      const updatedProfile = await updateAdminProfile(update);
      applyUpdatedProfile(updatedProfile, true);
      setProfileMessage({ type: 'success', text: 'Your profile has been updated successfully.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update your profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetProfile = () => {
    if (!profile) return;
    const nextForm = getProfileForm(profile);
    setForm(nextForm);
    setProfileSnapshot(getProfileSnapshot(nextForm));
    setProfileMessage(null);
  };

  const handleSavePreferences = async () => {
    if (!hasPreferenceChanges) {
      setSettingsMessage({ type: 'success', text: 'There are no notification changes to save.' });
      return;
    }

    setIsSavingPreferences(true);
    setSettingsMessage(null);
    try {
      const updatedProfile = await updateAdminProfile(preferences);
      applyUpdatedProfile(updatedProfile);
      const nextPreferences = {
        pushNotificationsEnabled: updatedProfile.pushNotificationsEnabled !== false,
        securityAlertsEmailEnabled: updatedProfile.securityAlertsEmailEnabled !== false,
      };
      setPreferences(nextPreferences);
      setPreferencesSnapshot(JSON.stringify(nextPreferences));
      setSettingsMessage({ type: 'success', text: 'Notification preferences have been saved.' });
    } catch (error) {
      setSettingsMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save notification preferences.' });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordError = getPasswordError(password);
    if (passwordError) {
      setPasswordMessage({ type: 'error', text: passwordError });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      const updatedProfile = await updateAdminProfile({ password });
      applyUpdatedProfile(updatedProfile);
      setPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: 'Your password has been changed. A security alert may be sent to your email.' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change your password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setProfileMessage({ type: 'error', text: 'Choose a JPG, PNG, WEBP, or GIF image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'Profile pictures must be 5 MB or smaller.' });
      return;
    }

    setIsUploadingAvatar(true);
    setProfileMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const updatedProfile = await uploadProfilePicture(formData);
      applyUpdatedProfile(updatedProfile);
      setProfileMessage({ type: 'success', text: 'Your profile picture has been updated.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload your profile picture.' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.profilePicture) return;
    setIsRemovingAvatar(true);
    setProfileMessage(null);
    try {
      const updatedProfile = await removeProfilePicture();
      applyUpdatedProfile(updatedProfile);
      setProfileMessage({ type: 'success', text: 'Your profile picture has been removed.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to remove your profile picture.' });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  if (isLoading && !profile) return <LoadingProfile />;

  if (!profile) {
    return (
      <div className="p-[10px]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <h1 className="font-semibold">Unable to load your profile</h1>
              <p className="mt-1 text-sm">{pageError || 'Please refresh the page or sign in again.'}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
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

  return (
    <div className="space-y-6 py-[10px] pb-12">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Account / {activeTab === 'profile' ? 'Profile' : 'Settings'}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            {activeTab === 'profile' ? 'Your Profile' : 'Account Settings'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            {activeTab === 'profile'
              ? 'Manage the personal information shown across the Grandline Maritime admin workspace.'
              : 'Manage your password, notifications, and workspace appearance.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateToTab(activeTab === 'profile' ? 'settings' : 'profile')}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {activeTab === 'profile' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
          {activeTab === 'profile' ? 'Account Settings' : 'Your Profile'}
        </button>
      </div>

      {pageError ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
                <p className="text-sm font-medium text-blue-100">Administrator account</p>
                <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">{displayName}</h2>
                <p className="mt-1 truncate text-sm text-blue-100">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium capitalize ring-1 ring-white/20">
                <Shield className="h-3.5 w-3.5" /> {profile.role}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 font-medium text-emerald-100 ring-1 ring-emerald-200/20">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> {profile.isActive === false ? 'Inactive' : 'Active'}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex overflow-x-auto border-t border-[var(--card-border)]" aria-label="Profile sections">
          {([
            { value: 'profile', label: 'Your Profile', icon: User },
            { value: 'settings', label: 'Account Settings', icon: Shield },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => navigateToTab(tab.value)}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition sm:px-7 ${isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <SectionCard title="Profile photo" description="Use a clear image so colleagues can recognize you." icon={User}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 text-3xl font-semibold text-gray-400 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
                {profilePictureUrl ? (
                  <Image src={profilePictureUrl} alt={displayName} fill sizes="112px" className="object-cover" unoptimized />
                ) : (
                  getInitials(profile)
                )}
                {isUploadingAvatar || isRemovingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : null}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">JPG, PNG, WEBP, or GIF. Maximum 5 MB.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar || isRemovingAvatar}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
                  </button>
                  {profilePictureUrl ? (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar || isRemovingAvatar}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      {isRemovingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Identity and account" description="These details identify you in the admin workspace." icon={Briefcase}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField id="firstName" label="First name" value={form.firstName} onChange={(value) => setField('firstName', value)} required autoComplete="given-name" />
              <TextField id="middleName" label="Middle name" value={form.middleName} onChange={(value) => setField('middleName', value)} autoComplete="additional-name" />
              <TextField id="lastName" label="Last name" value={form.lastName} onChange={(value) => setField('lastName', value)} required autoComplete="family-name" />
              <TextField id="nameExtension" label="Name extension" value={form.nameExtension} onChange={(value) => setField('nameExtension', value)} placeholder="e.g. Jr., III" />
              <TextField id="username" label="Username" value={form.username} onChange={(value) => setField('username', value)} autoComplete="username" />
              <TextField id="email" label="Email address" type="email" value={form.email} onChange={(value) => setField('email', value)} required autoComplete="email" />
            </div>
            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
              Changing your email changes the address used for future admin sign-ins and security alerts.
            </div>
          </SectionCard>

          <SectionCard title="Personal and contact details" description="Optional personal information used by Grandline Maritime records." icon={Calendar}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SelectField id="gender" label="Gender" value={form.gender} onChange={(value) => setField('gender', value)} options={GENDER_OPTIONS} placeholder="Select gender" />
              <SelectField id="civilStatus" label="Civil status" value={form.civilStatus} onChange={(value) => setField('civilStatus', value)} options={CIVIL_STATUS_OPTIONS} placeholder="Select civil status" />
              <TextField id="nationality" label="Nationality" value={form.nationality} onChange={(value) => setField('nationality', value)} />
              <TextField id="birthDate" label="Birth date" type="date" value={form.birthDate} onChange={(value) => setField('birthDate', value)} />
              <TextField id="placeOfBirth" label="Place of birth" value={form.placeOfBirth} onChange={(value) => setField('placeOfBirth', value)} />
              <TextField id="phone" label="Phone number" value={form.phone} onChange={(value) => setField('phone', value)} autoComplete="tel" />
              <div className="md:col-span-2">
                <FieldLabel label="Complete address" htmlFor="completeAddress" />
                <textarea
                  id="completeAddress"
                  value={form.completeAddress}
                  onChange={(event) => setField('completeAddress', event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Biography" description="Share a short professional background with people who view your profile." icon={Globe}>
            <RichTextEditor
              value={form.biography}
              onChange={(value) => setField('biography', value)}
              placeholder="Write a professional biography..."
            />
          </SectionCard>

          <MessageBanner message={profileMessage} />
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--card-border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleResetProfile}
              disabled={isSavingProfile || !hasProfileChanges}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card-background)] px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Discard changes
            </button>
            <button
              type="submit"
              disabled={isSavingProfile || !hasProfileChanges}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSavingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <SectionCard title="Change password" description="Use a unique password that you do not use for another service." icon={Lock}>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel label="New password" htmlFor="newPassword" required />
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => { setPassword(event.target.value); setPasswordMessage(null); }}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
                    />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <FieldLabel label="Confirm new password" htmlFor="confirmPassword" required />
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => { setConfirmPassword(event.target.value); setPasswordMessage(null); }}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <ul className="grid gap-1 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2">
                {PASSWORD_REQUIREMENTS.map((requirement) => <li key={requirement}>- {requirement}</li>)}
              </ul>
              <MessageBanner message={passwordMessage} />
              <div className="flex justify-end border-t border-[var(--card-border)] pt-5">
                <button
                  type="submit"
                  disabled={isChangingPassword || !password || !confirmPassword}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  {isChangingPassword ? 'Changing password...' : 'Change password'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Notification preferences" description="Choose which account notifications you want to receive." icon={Bell}>
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Browser notifications</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Allow web push notifications for important admin updates when your browser supports them.</p>
                </div>
                <Toggle label="Browser notifications" checked={preferences.pushNotificationsEnabled} onChange={(checked) => { setPreferences((current) => ({ ...current, pushNotificationsEnabled: checked })); setSettingsMessage(null); }} disabled={isSavingPreferences} />
              </div>
              <div className="border-t border-[var(--card-border)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Security alert emails</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Receive email alerts for password changes and meaningful failed login attempts.</p>
                </div>
                <Toggle label="Security alert emails" checked={preferences.securityAlertsEmailEnabled} onChange={(checked) => { setPreferences((current) => ({ ...current, securityAlertsEmailEnabled: checked })); setSettingsMessage(null); }} disabled={isSavingPreferences} />
              </div>
              <MessageBanner message={settingsMessage} />
              <div className="flex justify-end border-t border-[var(--card-border)] pt-5">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={isSavingPreferences || !hasPreferenceChanges}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingPreferences ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSavingPreferences ? 'Saving...' : 'Save preferences'}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Appearance" description="Choose how the admin workspace looks on this device." icon={Sun}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {([
                { value: 'light', label: 'Light', description: 'Bright workspace' },
                { value: 'dark', label: 'Dark', description: 'Low-light workspace' },
                { value: 'system', label: 'System', description: 'Follow device setting' },
              ] as const).map((option) => {
                const selected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`relative rounded-xl border-2 p-4 text-left transition ${selected
                      ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                      : 'border-[var(--card-border)] hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{option.label}</span>
                      {selected ? <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : null}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Account information" description="Some account attributes are managed by system administrators." icon={Shield}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"><Mail className="h-3.5 w-3.5" /> Email</div>
                <p className="mt-2 break-all text-sm font-medium text-gray-900 dark:text-gray-100">{profile.email}</p>
              </div>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"><Briefcase className="h-3.5 w-3.5" /> Role</div>
                <p className="mt-2 text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{profile.role}</p>
              </div>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"><Phone className="h-3.5 w-3.5" /> Last sign-in</div>
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{formatLastLogin(profile.lastLogin)}</p>
              </div>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"><Lock className="h-3.5 w-3.5" /> Access</div>
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Managed by Grandline administrators</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
