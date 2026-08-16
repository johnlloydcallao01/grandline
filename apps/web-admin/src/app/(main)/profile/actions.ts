'use server';

import type { User } from '@/types/auth';
import { getServerToken, getServerUser } from '@/app/actions/auth';
import { env } from '@/lib/env';
import { sanitizeUser } from '@/lib/sanitizeUser';

const CMS_API_URL = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
const CIVIL_STATUS_VALUES = ['single', 'married', 'divorced', 'widowed', 'separated'] as const;
const MAX_TEXT_LENGTH = 200;
const MAX_BIOGRAPHY_LENGTH = 100000;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  nameExtension?: string | null;
  username?: string | null;
  email?: string;
  gender?: string | null;
  civilStatus?: string | null;
  nationality?: string | null;
  birthDate?: string | null;
  placeOfBirth?: string | null;
  phone?: string | null;
  completeAddress?: string | null;
  biography?: unknown;
  pushNotificationsEnabled?: boolean;
  securityAlertsEmailEnabled?: boolean;
  password?: string;
}

interface PayloadError {
  errors?: Array<{ message?: string }>;
  message?: string;
  error?: string;
}

function getPayloadErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const body = payload as PayloadError;
  return body.errors?.[0]?.message || body.message || body.error || fallback;
}

function hasOwn(source: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function optionalText(value: unknown, field: string, maxLength = MAX_TEXT_LENGTH): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new Error(`${field} must be text.`);

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer.`);
  }

  return normalized || null;
}

function requiredText(value: unknown, field: string): string {
  const normalized = optionalText(value, field);
  if (!normalized) throw new Error(`${field} is required.`);
  return normalized;
}

function optionalEnum(value: unknown, field: string, values: readonly string[]): string | null {
  const normalized = optionalText(value, field);
  if (normalized === null) return null;
  if (!values.includes(normalized)) throw new Error(`Invalid ${field.toLowerCase()}.`);
  return normalized;
}

function normalizeBirthDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Birth date must use the YYYY-MM-DD format.');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Birth date is invalid.');
  }

  return date.toISOString();
}

function normalizeBiography(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') throw new Error('Biography has an invalid format.');

  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_BIOGRAPHY_LENGTH) {
    throw new Error('Biography is too large.');
  }

  const root = (value as { root?: unknown }).root;
  if (!root || typeof root !== 'object') throw new Error('Biography has an invalid format.');

  return value;
}

function normalizePassword(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error('Password must be text.');
  if (value.length < 8 || value.length > 40) {
    throw new Error('Password must be between 8 and 40 characters.');
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    throw new Error('Password must include uppercase, lowercase, number, and special characters.');
  }

  return value;
}

function normalizeProfileUpdate(input: ProfileUpdateInput): Record<string, unknown> {
  if (!input || typeof input !== 'object') throw new Error('Invalid profile update.');

  const source = input as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (hasOwn(source, 'firstName')) data.firstName = requiredText(source.firstName, 'First name');
  if (hasOwn(source, 'lastName')) data.lastName = requiredText(source.lastName, 'Last name');
  if (hasOwn(source, 'middleName')) data.middleName = optionalText(source.middleName, 'Middle name');
  if (hasOwn(source, 'nameExtension')) data.nameExtension = optionalText(source.nameExtension, 'Name extension');
  if (hasOwn(source, 'username')) data.username = optionalText(source.username, 'Username');

  if (hasOwn(source, 'email')) {
    const email = requiredText(source.email, 'Email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    data.email = email;
  }

  if (hasOwn(source, 'gender')) data.gender = optionalEnum(source.gender, 'Gender', GENDER_VALUES);
  if (hasOwn(source, 'civilStatus')) data.civilStatus = optionalEnum(source.civilStatus, 'Civil status', CIVIL_STATUS_VALUES);
  if (hasOwn(source, 'nationality')) data.nationality = optionalText(source.nationality, 'Nationality');
  if (hasOwn(source, 'birthDate')) data.birthDate = normalizeBirthDate(source.birthDate);
  if (hasOwn(source, 'placeOfBirth')) data.placeOfBirth = optionalText(source.placeOfBirth, 'Place of birth');
  if (hasOwn(source, 'phone')) data.phone = optionalText(source.phone, 'Phone number');
  if (hasOwn(source, 'completeAddress')) data.completeAddress = optionalText(source.completeAddress, 'Complete address', 1000);
  if (hasOwn(source, 'biography')) data.biography = normalizeBiography(source.biography);

  if (hasOwn(source, 'pushNotificationsEnabled')) {
    if (typeof source.pushNotificationsEnabled !== 'boolean') throw new Error('Push notification preference is invalid.');
    data.pushNotificationsEnabled = source.pushNotificationsEnabled;
  }

  if (hasOwn(source, 'securityAlertsEmailEnabled')) {
    if (typeof source.securityAlertsEmailEnabled !== 'boolean') throw new Error('Security alert preference is invalid.');
    data.securityAlertsEmailEnabled = source.securityAlertsEmailEnabled;
  }

  const password = normalizePassword(source.password);
  if (password) data.password = password;

  if (Object.keys(data).length === 0) throw new Error('There are no changes to save.');
  return data;
}

async function getAdminSession(): Promise<{ token: string; user: User }> {
  const token = await getServerToken();
  const user = await getServerUser();

  if (!token || !user || user.role !== 'admin') {
    throw new Error('Your admin session has expired. Please sign in again.');
  }

  return { token, user };
}

async function readPayloadResponse(response: Response, fallback: string): Promise<unknown> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getPayloadErrorMessage(payload, fallback));
  return payload;
}

function unwrapDocument(payload: unknown): User {
  const document = payload && typeof payload === 'object' && 'doc' in payload
    ? (payload as { doc?: unknown }).doc
    : payload;

  if (!document || typeof document !== 'object' || !('id' in document)) {
    throw new Error('The CMS returned an invalid user profile.');
  }

  const user = sanitizeUser(document);
  if (!user) throw new Error('The CMS returned an invalid user profile.');
  return user;
}

async function updateCurrentUser(token: string, userId: number, data: Record<string, unknown>): Promise<User> {
  const response = await fetch(`${CMS_API_URL}/users/${encodeURIComponent(String(userId))}?depth=2`, {
    method: 'PATCH',
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const payload = await readPayloadResponse(response, 'Failed to update your profile.');
  return unwrapDocument(payload);
}

export async function getAdminProfile(): Promise<User> {
  const { user } = await getAdminSession();
  return user;
}

export async function updateAdminProfile(input: ProfileUpdateInput): Promise<User> {
  const { token, user } = await getAdminSession();
  const data = normalizeProfileUpdate(input);
  return updateCurrentUser(token, user.id, data);
}

export async function uploadProfilePicture(formData: FormData): Promise<User> {
  const { token, user } = await getAdminSession();
  const file = formData?.get('file');

  if (!(file instanceof File)) throw new Error('Choose an image to upload.');
  if (!AVATAR_MIME_TYPES.includes(file.type)) throw new Error('Profile pictures must be JPG, PNG, WEBP, or GIF images.');
  if (file.size > MAX_AVATAR_SIZE) throw new Error('Profile pictures must be 5 MB or smaller.');

  const uploadData = new FormData();
  uploadData.append('file', file, file.name);
  uploadData.append('_payload', JSON.stringify({
    alt: `${user.firstName} ${user.lastName}`.trim() || 'Admin profile picture',
  }));

  const uploadResponse = await fetch(`${CMS_API_URL}/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: uploadData,
    cache: 'no-store',
  });
  const uploadPayload = await readPayloadResponse(uploadResponse, 'Failed to upload profile picture.');
  const media = uploadPayload && typeof uploadPayload === 'object' && 'doc' in uploadPayload
    ? (uploadPayload as { doc?: unknown }).doc
    : uploadPayload;
  const mediaId = media && typeof media === 'object' ? Number((media as { id?: unknown }).id) : NaN;

  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    throw new Error('The upload did not return a valid media record.');
  }

  try {
    return await updateCurrentUser(token, user.id, { profilePicture: mediaId });
  } catch (error) {
    await fetch(`${CMS_API_URL}/media/${mediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    }).catch(() => undefined);
    throw error;
  }
}

export async function removeProfilePicture(): Promise<User> {
  const { token, user } = await getAdminSession();
  return updateCurrentUser(token, user.id, { profilePicture: null });
}
