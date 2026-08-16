'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import {
  removeProfilePicture,
  updateInstructorDetails,
  updateInstructorProfile,
  uploadProfilePicture,
  type InstructorProfileUpdateInput,
} from './actions';
import { useSettings } from './settings-context';
import {
  CIVIL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  PASSWORD_REQUIREMENTS,
  SectionCard,
  SelectField,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  TextField,
  Toggle,
  FieldLabel,
  MessageBanner,
  formatLastLogin,
  getDisplayName,
  getInitials,
  getPasswordError,
  getProfileForm,
  getInstructorForm,
  getProfilePictureUrl,
  plainTextToLexical,
  type InstructorFormState,
  type Message,
  type ProfileFormState,
} from './settings-ui';

function ProfileSection() {
  const { profile, applyUpdatedProfile } = useSettings();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileFormState>(getProfileForm(profile));
  const [profileSnapshot, setProfileSnapshot] = useState(JSON.stringify(getProfileForm(profile)));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const nextForm = getProfileForm(profile);
    setForm(nextForm);
    setProfileSnapshot(JSON.stringify(nextForm));
    setMessage(null);
  }, [profile]);

  if (!profile) return null;

  const profilePictureUrl = getProfilePictureUrl(profile.profilePicture);
  const displayName = getDisplayName(profile);
  const hasChanges = JSON.stringify(form) !== profileSnapshot;

  const setField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();

    if (!firstName || !lastName) {
      setMessage({ type: 'error', text: 'First name and last name are required.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Enter a valid email address.' });
      return;
    }
    if (!hasChanges) {
      setMessage({ type: 'success', text: 'There are no profile changes to save.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const update: InstructorProfileUpdateInput = {
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
      biography: form.biography.trim() ? plainTextToLexical(form.biography) : null,
    };

    try {
      const updatedProfile = await updateInstructorProfile(update);
      applyUpdatedProfile(updatedProfile);
      const nextForm = getProfileForm(updatedProfile);
      setForm(nextForm);
      setProfileSnapshot(JSON.stringify(nextForm));
      setMessage({ type: 'success', text: 'Your profile has been updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update your profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const nextForm = getProfileForm(profile);
    setForm(nextForm);
    setProfileSnapshot(JSON.stringify(nextForm));
    setMessage(null);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Choose a JPG, PNG, WEBP, or GIF image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Profile pictures must be 5 MB or smaller.' });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const updatedProfile = await uploadProfilePicture(formData);
      applyUpdatedProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Your profile picture has been updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload your profile picture.' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile.profilePicture) return;
    setIsRemovingAvatar(true);
    setMessage(null);
    try {
      const updatedProfile = await removeProfilePicture();
      applyUpdatedProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Your profile picture has been removed.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to remove your profile picture.' });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SectionCard title="Profile photo" description="Use a clear image so colleagues can recognize you.">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 text-3xl font-semibold text-gray-400 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
            {profilePictureUrl ? (
              <Image src={profilePictureUrl} alt={displayName} fill sizes="112px" className="object-cover" unoptimized />
            ) : (
              getInitials(profile)
            )}
            {isUploadingAvatar || isRemovingAvatar ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                {isUploadingAvatar ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
                {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
              </button>
              {profilePictureUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {isRemovingAvatar ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" /> : null}
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Identity and account" description="These details identify you in the instructor workspace.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField id="firstName" label="First name" value={form.firstName} onChange={(value) => setField('firstName', value)} required autoComplete="given-name" />
          <TextField id="middleName" label="Middle name" value={form.middleName} onChange={(value) => setField('middleName', value)} autoComplete="additional-name" />
          <TextField id="lastName" label="Last name" value={form.lastName} onChange={(value) => setField('lastName', value)} required autoComplete="family-name" />
          <TextField id="nameExtension" label="Name extension" value={form.nameExtension} onChange={(value) => setField('nameExtension', value)} placeholder="e.g. Jr., III" />
          <TextField id="username" label="Username" value={form.username} onChange={(value) => setField('username', value)} autoComplete="username" />
          <TextField id="email" label="Email address" type="email" value={form.email} onChange={(value) => setField('email', value)} required autoComplete="email" />
        </div>
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
          Changing your email changes the address used for future instructor sign-ins and security alerts.
        </div>
      </SectionCard>

      <SectionCard title="Personal and contact details" description="Optional personal information used by Grandline Maritime records.">
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

      <SectionCard title="Biography" description="Share a short professional background with people who view your profile.">
        <FieldLabel label="Biography" htmlFor="biography" />
        <textarea
          id="biography"
          value={form.biography}
          onChange={(event) => setField('biography', event.target.value)}
          rows={5}
          placeholder="Write a professional biography..."
          className="w-full resize-y rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
        />
      </SectionCard>

      <MessageBanner message={message} />
      <div className="flex flex-col-reverse gap-3 border-t border-[var(--card-border)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving || !hasChanges}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-background)] px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Discard changes
        </button>
        <button
          type="submit"
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
          {isSaving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}

function InstructorSection() {
  const { instructor, applyUpdatedInstructor } = useSettings();

  const [form, setForm] = useState<InstructorFormState>(getInstructorForm(instructor));
  const [snapshot, setSnapshot] = useState(JSON.stringify(getInstructorForm(instructor)));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const nextForm = getInstructorForm(instructor);
    setForm(nextForm);
    setSnapshot(JSON.stringify(nextForm));
    setMessage(null);
  }, [instructor]);

  const hasChanges = JSON.stringify(form) !== snapshot;

  const setField = <K extends keyof InstructorFormState>(field: K, value: InstructorFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setMessage({ type: 'success', text: 'There are no instructor changes to save.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const updatedInstructor = await updateInstructorDetails({
        specialization: form.specialization.trim() || null,
        yearsExperience: form.yearsExperience.trim() ? Number(form.yearsExperience) : null,
        officeHours: form.officeHours.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
      });
      applyUpdatedInstructor(updatedInstructor);
      const nextForm = getInstructorForm(updatedInstructor);
      setForm(nextForm);
      setSnapshot(JSON.stringify(nextForm));
      setMessage({ type: 'success', text: 'Instructor details have been saved.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save instructor details.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Teaching details" description="Information shown on your instructor profile.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <TextField id="specialization" label="Specialization" value={form.specialization} onChange={(value) => setField('specialization', value)} placeholder="e.g. Marine Navigation" required />
          </div>
          <TextField id="yearsExperience" label="Years of experience" type="number" min="0" value={form.yearsExperience} onChange={(value) => setField('yearsExperience', value)} placeholder="e.g. 10" />
          <TextField id="officeHours" label="Office hours" value={form.officeHours} onChange={(value) => setField('officeHours', value)} placeholder="e.g. Mon–Fri, 9:00 AM – 5:00 PM" />
          <div className="md:col-span-2">
            <TextField id="contactEmail" label="Professional contact email" type="email" value={form.contactEmail} onChange={(value) => setField('contactEmail', value)} placeholder="instructor@grandlinemaritime.com" />
          </div>
        </div>
      </SectionCard>

      <MessageBanner message={message} />
      <div className="flex justify-end border-t border-[var(--card-border)] pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
          {isSaving ? 'Saving...' : 'Save instructor details'}
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const { profile, applyUpdatedProfile } = useSettings();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  if (!profile) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordError = getPasswordError(password);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChanging(true);
    setMessage(null);
    try {
      const updatedProfile = await updateInstructorProfile({ password });
      applyUpdatedProfile(updatedProfile);
      setPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Your password has been changed. A security alert may be sent to your email.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change your password.' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Change password" description="Use a unique password that you do not use for another service.">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <FieldLabel label="New password" htmlFor="newPassword" required />
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setMessage(null); }}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? '🙈' : '👁'}
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
                  onChange={(event) => { setConfirmPassword(event.target.value); setMessage(null); }}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-gray-100"
                />
                <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}>
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
          <ul className="grid gap-1 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2">
            {PASSWORD_REQUIREMENTS.map((requirement) => <li key={requirement}>- {requirement}</li>)}
          </ul>
          <MessageBanner message={message} />
          <div className="flex justify-end border-t border-[var(--card-border)] pt-5">
            <button
              type="submit"
              disabled={isChanging || !password || !confirmPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChanging ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
              {isChanging ? 'Changing password...' : 'Change password'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Account information" description="Some account attributes are managed by system administrators.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</div>
            <p className="mt-2 break-all text-sm font-medium text-gray-900 dark:text-gray-100">{profile.email}</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Role</div>
            <p className="mt-2 text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{profile.role}</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Last sign-in</div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{formatLastLogin(profile.lastLogin)}</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Access</div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Managed by Grandline administrators</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function PreferencesSection() {
  const { profile, applyUpdatedProfile } = useSettings();
  const { theme, setTheme } = useTheme();

  const [preferences, setPreferences] = useState({
    pushNotificationsEnabled: profile?.pushNotificationsEnabled !== false,
    securityAlertsEmailEnabled: profile?.securityAlertsEmailEnabled !== false,
  });
  const [snapshot, setSnapshot] = useState(JSON.stringify(preferences));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const next = {
      pushNotificationsEnabled: profile?.pushNotificationsEnabled !== false,
      securityAlertsEmailEnabled: profile?.securityAlertsEmailEnabled !== false,
    };
    setPreferences(next);
    setSnapshot(JSON.stringify(next));
    setMessage(null);
  }, [profile]);

  if (!profile) return null;

  const hasChanges = JSON.stringify(preferences) !== snapshot;

  const handleSave = async () => {
    if (!hasChanges) {
      setMessage({ type: 'success', text: 'There are no notification changes to save.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const updatedProfile = await updateInstructorProfile(preferences);
      applyUpdatedProfile(updatedProfile);
      const next = {
        pushNotificationsEnabled: updatedProfile.pushNotificationsEnabled !== false,
        securityAlertsEmailEnabled: updatedProfile.securityAlertsEmailEnabled !== false,
      };
      setPreferences(next);
      setSnapshot(JSON.stringify(next));
      setMessage({ type: 'success', text: 'Notification preferences have been saved.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save notification preferences.' });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: 'pushNotificationsEnabled' | 'securityAlertsEmailEnabled', value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Notification preferences" description="Choose which account notifications you want to receive.">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Browser notifications</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Allow web push notifications for important instructor updates when your browser supports them.</p>
            </div>
            <Toggle label="Browser notifications" checked={preferences.pushNotificationsEnabled} onChange={(checked) => updatePreference('pushNotificationsEnabled', checked)} disabled={isSaving} />
          </div>
          <div className="border-t border-[var(--card-border)]" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Security alert emails</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Receive email alerts for password changes and meaningful failed login attempts.</p>
            </div>
            <Toggle label="Security alert emails" checked={preferences.securityAlertsEmailEnabled} onChange={(checked) => updatePreference('securityAlertsEmailEnabled', checked)} disabled={isSaving} />
          </div>
          <MessageBanner message={message} />
          <div className="flex justify-end border-t border-[var(--card-border)] pt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
              {isSaving ? 'Saving...' : 'Save preferences'}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Appearance" description="Choose how the instructor workspace looks on this device.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
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
                <i className="fa fa-check text-white text-xs"></i>
              </div>
            )}
          </button>

          <button
            type="button"
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
                <i className="fa fa-check text-white text-xs"></i>
              </div>
            )}
          </button>

          <button
            type="button"
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
                <i className="fa fa-check text-white text-xs"></i>
              </div>
            )}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

export { ProfileSection, InstructorSection, SecuritySection, PreferencesSection };
