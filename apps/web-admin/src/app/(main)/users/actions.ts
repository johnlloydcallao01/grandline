'use server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

function apiUrl(path: string): string {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL')
  return `${CMS_API}${path}`
}

export interface ProfilePicture {
  id: number
  url?: string
  cloudinaryURL?: string
  filename?: string
  alt?: string
}

export interface UserDoc {
  id: number
  email: string
  firstName: string
  lastName: string
  middleName?: string | null
  nameExtension?: string | null
  username?: string | null
  role: 'admin' | 'instructor' | 'trainee' | 'service'
  isActive: boolean
  gender?: string | null
  civilStatus?: string | null
  nationality?: string | null
  birthDate?: string | null
  placeOfBirth?: string | null
  phone?: string | null
  completeAddress?: string | null
  lastLogin?: string | null
  pushNotificationsEnabled?: boolean
  securityAlertsEmailEnabled?: boolean
  profilePicture?: ProfilePicture | number | null
  createdAt: string
  updatedAt: string
}

export interface UserListResult {
  docs: UserDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function toNumber(val: unknown): number | undefined {
  if (val == null) return undefined
  const n = Number(val)
  return Number.isFinite(n) ? n : undefined
}

export async function getUsers(params: {
  search?: string
  role?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<UserListResult> {
  const queryParts: string[] = ['depth=1']

  if (params.search) {
    queryParts.push(`where[or][0][email][like]=${encodeURIComponent(params.search)}`)
    queryParts.push(`where[or][1][firstName][like]=${encodeURIComponent(params.search)}`)
    queryParts.push(`where[or][2][lastName][like]=${encodeURIComponent(params.search)}`)
    queryParts.push(`where[or][3][username][like]=${encodeURIComponent(params.search)}`)
  }

  if (params.role && params.role !== 'all') {
    queryParts.push(`where[role][equals]=${encodeURIComponent(params.role)}`)
  }

  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-createdAt'}`)

  const res = await fetch(apiUrl(`/users?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch users: ${res.statusText}`)
  }

  return res.json()
}

export async function getUser(id: number): Promise<UserDoc> {
  const res = await fetch(apiUrl(`/users/${id}?depth=1`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch user: ${res.statusText}`)
  }

  return res.json()
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  middleName?: string
  nameExtension?: string
  username?: string
  role: 'admin' | 'instructor' | 'trainee' | 'service'
  isActive?: boolean
  gender?: string
  civilStatus?: string
  nationality?: string
  birthDate?: string
  placeOfBirth?: string
  phone?: string
  completeAddress?: string
  pushNotificationsEnabled?: boolean
  securityAlertsEmailEnabled?: boolean
}

export async function createUser(data: CreateUserData): Promise<UserDoc> {
  const res = await fetch(apiUrl('/users'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to create user: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  middleName?: string | null
  nameExtension?: string | null
  username?: string | null
  role?: 'admin' | 'instructor' | 'trainee' | 'service'
  isActive?: boolean
  gender?: string | null
  civilStatus?: string | null
  nationality?: string | null
  birthDate?: string | null
  placeOfBirth?: string | null
  phone?: string | null
  completeAddress?: string | null
  pushNotificationsEnabled?: boolean
  securityAlertsEmailEnabled?: boolean
  password?: string
  profilePicture?: number | null
}

export async function updateUser(id: number, data: UpdateUserData): Promise<UserDoc> {
  const safeData: Record<string, unknown> = { ...data }
  if (safeData.profilePicture != null) safeData.profilePicture = toNumber(safeData.profilePicture)

  if (safeData.password === '' || safeData.password === undefined) {
    delete safeData.password
  }

  const res = await fetch(apiUrl(`/users/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update user: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(apiUrl(`/users/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete user: ${res.statusText}`)
  }
}
