'use server'

import { cookies } from 'next/headers'
import type { User } from '@/types/auth'
import { sanitizeUser } from '@/lib/sanitizeUser'

const CMS_API = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/+$/, '')
const API_KEY = process.env.PAYLOAD_API_KEY

const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'] as const
const CIVIL_STATUS_VALUES = ['single', 'married', 'divorced', 'widowed', 'separated'] as const
const MAX_TEXT_LENGTH = 200
const MAX_BIOGRAPHY_LENGTH = 100000
const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface InstructorProfileUpdateInput {
  firstName?: string
  lastName?: string
  middleName?: string | null
  nameExtension?: string | null
  username?: string | null
  email?: string
  gender?: string | null
  civilStatus?: string | null
  nationality?: string | null
  birthDate?: string | null
  placeOfBirth?: string | null
  phone?: string | null
  completeAddress?: string | null
  biography?: unknown
  pushNotificationsEnabled?: boolean
  securityAlertsEmailEnabled?: boolean
  password?: string
}

export interface InstructorDetailsUpdateInput {
  specialization?: string | null
  yearsExperience?: number | null
  officeHours?: string | null
  contactEmail?: string | null
}

export interface InstructorDetails {
  id: number
  specialization?: string | null
  yearsExperience?: number | null
  officeHours?: string | null
  contactEmail?: string | null
}

interface PayloadError {
  errors?: Array<{ message?: string }>
  message?: string
  error?: string
}

function adminHeaders(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function getInstructorToken(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')
  return token
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function getPayloadErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const body = payload as PayloadError
  return body.errors?.[0]?.message || body.message || body.error || fallback
}

function hasOwn(source: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key)
}

function optionalText(value: unknown, field: string, maxLength = MAX_TEXT_LENGTH): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') throw new Error(`${field} must be text.`)

  const normalized = value.trim()
  if (normalized.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer.`)
  }

  return normalized || null
}

function requiredText(value: unknown, field: string): string {
  const normalized = optionalText(value, field)
  if (!normalized) throw new Error(`${field} is required.`)
  return normalized
}

function optionalEnum(value: unknown, field: string, values: readonly string[]): string | null {
  const normalized = optionalText(value, field)
  if (normalized === null) return null
  if (!values.includes(normalized)) throw new Error(`Invalid ${field.toLowerCase()}.`)
  return normalized
}

function normalizeBirthDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Birth date must use the YYYY-MM-DD format.')
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Birth date is invalid.')
  }

  return date.toISOString()
}

function normalizeBiography(value: unknown): unknown {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object') throw new Error('Biography has an invalid format.')

  const serialized = JSON.stringify(value)
  if (serialized.length > MAX_BIOGRAPHY_LENGTH) {
    throw new Error('Biography is too large.')
  }

  const root = (value as { root?: unknown }).root
  if (!root || typeof root !== 'object') throw new Error('Biography has an invalid format.')

  return value
}

function normalizePassword(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error('Password must be text.')
  if (value.length < 8 || value.length > 40) {
    throw new Error('Password must be between 8 and 40 characters.')
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    throw new Error('Password must include uppercase, lowercase, number, and special characters.')
  }

  return value
}

function normalizeProfileUpdate(input: InstructorProfileUpdateInput): Record<string, unknown> {
  if (!input || typeof input !== 'object') throw new Error('Invalid profile update.')

  const source = input as Record<string, unknown>
  const data: Record<string, unknown> = {}

  if (hasOwn(source, 'firstName')) data.firstName = requiredText(source.firstName, 'First name')
  if (hasOwn(source, 'lastName')) data.lastName = requiredText(source.lastName, 'Last name')
  if (hasOwn(source, 'middleName')) data.middleName = optionalText(source.middleName, 'Middle name')
  if (hasOwn(source, 'nameExtension')) data.nameExtension = optionalText(source.nameExtension, 'Name extension')
  if (hasOwn(source, 'username')) data.username = optionalText(source.username, 'Username')

  if (hasOwn(source, 'email')) {
    const email = requiredText(source.email, 'Email').toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
    data.email = email
  }

  if (hasOwn(source, 'gender')) data.gender = optionalEnum(source.gender, 'Gender', GENDER_VALUES)
  if (hasOwn(source, 'civilStatus')) data.civilStatus = optionalEnum(source.civilStatus, 'Civil status', CIVIL_STATUS_VALUES)
  if (hasOwn(source, 'nationality')) data.nationality = optionalText(source.nationality, 'Nationality')
  if (hasOwn(source, 'birthDate')) data.birthDate = normalizeBirthDate(source.birthDate)
  if (hasOwn(source, 'placeOfBirth')) data.placeOfBirth = optionalText(source.placeOfBirth, 'Place of birth')
  if (hasOwn(source, 'phone')) data.phone = optionalText(source.phone, 'Phone number')
  if (hasOwn(source, 'completeAddress')) data.completeAddress = optionalText(source.completeAddress, 'Complete address', 1000)
  if (hasOwn(source, 'biography')) data.biography = normalizeBiography(source.biography)

  if (hasOwn(source, 'pushNotificationsEnabled')) {
    if (typeof source.pushNotificationsEnabled !== 'boolean') throw new Error('Push notification preference is invalid.')
    data.pushNotificationsEnabled = source.pushNotificationsEnabled
  }

  if (hasOwn(source, 'securityAlertsEmailEnabled')) {
    if (typeof source.securityAlertsEmailEnabled !== 'boolean') throw new Error('Security alert preference is invalid.')
    data.securityAlertsEmailEnabled = source.securityAlertsEmailEnabled
  }

  const password = normalizePassword(source.password)
  if (password) data.password = password

  if (Object.keys(data).length === 0) throw new Error('There are no changes to save.')
  return data
}

async function getInstructorSession(): Promise<{ token: string; user: User }> {
  const token = await getInstructorToken()
  const meRes = await fetch(`${CMS_API}/users/me?depth=2`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })
  if (!meRes.ok) throw new Error('Your session has expired. Please sign in again.')
  const meData = (await readJson(meRes)) as { user?: unknown; [key: string]: unknown }
  const user = sanitizeUser(meData?.user || meData)

  if (!user || user.role !== 'instructor') {
    throw new Error('Your session has expired. Please sign in again.')
  }

  return { token, user }
}

async function updateCurrentUser(token: string, userId: number, data: Record<string, unknown>): Promise<User> {
  const response = await fetch(`${CMS_API}/users/${encodeURIComponent(String(userId))}?depth=2`, {
    method: 'PATCH',
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  })

  const payload = await readJson(response)
  if (!response.ok) throw new Error(getPayloadErrorMessage(payload, 'Failed to update your profile.'))
  const document = payload && typeof payload === 'object' && 'doc' in payload
    ? (payload as { doc?: unknown }).doc
    : payload
  const user = sanitizeUser(document)
  if (!user) throw new Error('The CMS returned an invalid user profile.')
  return user
}

async function getInstructorRecord(token: string, userId: number): Promise<InstructorDetails> {
  const params = new URLSearchParams({ depth: '0', limit: '1' })
  params.set('where[user][equals]', String(userId))

  const res = await fetch(`${CMS_API}/instructors?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to load instructor profile.')
  const data = (await readJson(res)) as { docs?: Array<Record<string, unknown>> }
  const doc = data?.docs?.[0]

  if (!doc) {
    return {
      id: 0,
      specialization: null,
      yearsExperience: null,
      officeHours: null,
      contactEmail: null,
    }
  }

  return {
    id: Number(doc.id),
    specialization: typeof doc.specialization === 'string' ? doc.specialization : null,
    yearsExperience: typeof doc.yearsExperience === 'number' ? doc.yearsExperience : null,
    officeHours: typeof doc.officeHours === 'string' ? doc.officeHours : null,
    contactEmail: typeof doc.contactEmail === 'string' ? doc.contactEmail : null,
  }
}

export interface InstructorSettingsResult {
  user: User
  instructor: InstructorDetails
}

export async function getInstructorSettings(): Promise<InstructorSettingsResult> {
  const { token, user } = await getInstructorSession()
  const instructor = await getInstructorRecord(token, user.id)
  return { user, instructor }
}

export async function updateInstructorProfile(input: InstructorProfileUpdateInput): Promise<User> {
  const { token, user } = await getInstructorSession()
  const data = normalizeProfileUpdate(input)
  return updateCurrentUser(token, user.id, data)
}

export async function updateInstructorDetails(input: InstructorDetailsUpdateInput): Promise<InstructorDetails> {
  const { token, user } = await getInstructorSession()

  const source = input as Record<string, unknown>
  const body: Record<string, unknown> = {}

  if (hasOwn(source, 'specialization')) {
    const specialization = optionalText(source.specialization, 'Specialization')
    if (!specialization) throw new Error('Specialization is required.')
    body.specialization = specialization
  }
  if (hasOwn(source, 'yearsExperience')) {
    const value = source.yearsExperience
    if (value === null || value === undefined || value === '') {
      body.yearsExperience = null
    } else {
      const numeric = Number(value)
      if (!Number.isFinite(numeric) || numeric < 0) throw new Error('Years of experience must be a positive number.')
      body.yearsExperience = Math.floor(numeric)
    }
  }
  if (hasOwn(source, 'officeHours')) body.officeHours = optionalText(source.officeHours, 'Office hours', 500)
  if (hasOwn(source, 'contactEmail')) {
    const email = optionalText(source.contactEmail, 'Contact email')
    if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid contact email.')
    body.contactEmail = email
  }

  if (Object.keys(body).length === 0) throw new Error('There are no changes to save.')

  const existing = await getInstructorRecord(token, user.id)
  if (!existing.id) throw new Error('Instructor profile not found.')

  const res = await fetch(`${CMS_API}/instructors/${encodeURIComponent(String(existing.id))}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const payload = await readJson(res)
  if (!res.ok) throw new Error(getPayloadErrorMessage(payload, 'Failed to update instructor details.'))
  const doc = payload && typeof payload === 'object' && 'doc' in payload
    ? (payload as { doc?: unknown }).doc
    : payload

  const raw = (doc || {}) as Record<string, unknown>
  return {
    id: Number(raw.id ?? existing.id),
    specialization: typeof raw.specialization === 'string' ? raw.specialization : null,
    yearsExperience: typeof raw.yearsExperience === 'number' ? raw.yearsExperience : null,
    officeHours: typeof raw.officeHours === 'string' ? raw.officeHours : null,
    contactEmail: typeof raw.contactEmail === 'string' ? raw.contactEmail : null,
  }
}

export async function uploadProfilePicture(formData: FormData): Promise<User> {
  const { token, user } = await getInstructorSession()
  const file = formData?.get('file')

  if (!(file instanceof File)) throw new Error('Choose an image to upload.')
  if (!AVATAR_MIME_TYPES.includes(file.type)) throw new Error('Profile pictures must be JPG, PNG, WEBP, or GIF images.')
  if (file.size > MAX_AVATAR_SIZE) throw new Error('Profile pictures must be 5 MB or smaller.')

  const uploadData = new FormData()
  uploadData.append('file', file, file.name)
  uploadData.append('_payload', JSON.stringify({
    alt: `${user.firstName} ${user.lastName}`.trim() || 'Instructor profile picture',
  }))

  const uploadResponse = await fetch(`${CMS_API}/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: uploadData,
    cache: 'no-store',
  })
  const uploadPayload = await readJson(uploadResponse)
  if (!uploadResponse.ok) throw new Error(getPayloadErrorMessage(uploadPayload, 'Failed to upload profile picture.'))
  const media = uploadPayload && typeof uploadPayload === 'object' && 'doc' in uploadPayload
    ? (uploadPayload as { doc?: unknown }).doc
    : uploadPayload
  const mediaId = media && typeof media === 'object' ? Number((media as { id?: unknown }).id) : NaN

  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    throw new Error('The upload did not return a valid media record.')
  }

  try {
    return await updateCurrentUser(token, user.id, { profilePicture: mediaId })
  } catch (error) {
    await fetch(`${CMS_API}/media/${mediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    }).catch(() => undefined)
    throw error
  }
}

export async function removeProfilePicture(): Promise<User> {
  const { token, user } = await getInstructorSession()
  return updateCurrentUser(token, user.id, { profilePicture: null })
}