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

export interface CouponDoc {
  id: number
  code: string
  name?: string | null
  description?: string | null
  status: 'draft' | 'active' | 'paused' | 'expired' | 'archived'
  discountType: 'percent' | 'fixed_course' | 'fixed_cart'
  amount: number
  maxDiscountAmount?: number | null
  scopeType: 'all_courses' | 'specific_courses' | 'specific_categories'
  includedCourses?: { id: number; title: string }[] | number[] | null
  excludedCourses?: { id: number; title: string }[] | number[] | null
  includedCategories?: { id: number; name: string }[] | number[] | null
  excludedCategories?: { id: number; name: string }[] | number[] | null
  excludeSaleCourses?: boolean
  minimumAmount?: number | null
  maximumAmount?: number | null
  usageLimitTotal?: number | null
  usageLimitPerUser?: number | null
  maxItemsAffected?: number | null
  stackable?: boolean
  priority?: number
  allowedEmails?: { id: string; email: string }[] | null
  startsAt?: string | null
  expiresAt?: string | null
  usageCount?: number
  lastUsedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CouponListResult {
  docs: CouponDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export interface RedemptionDoc {
  id: number
  coupon: number | { id: number }
  trainee?: { id: number; user?: { firstName: string; lastName: string; email: string }; srn?: string } | number | null
  user?: { id: number; firstName: string; lastName: string; email: string } | number | null
  course?: { id: number; title: string; courseCode: string } | number | null
  status: 'applied' | 'voided' | 'reversed'
  codeSnapshot: string
  discountTypeSnapshot: string
  discountAmountSnapshot: number
  subtotalSnapshot: number
  finalTotalSnapshot: number
  currencySnapshot: string
  appliedAt: string
}

export async function getCoupons(params: {
  search?: string
  status?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<CouponListResult> {
  const queryParts: string[] = ['depth=1']

  if (params.search) {
    queryParts.push(`where[or][0][code][like]=${encodeURIComponent(params.search)}`)
    queryParts.push(`where[or][1][name][like]=${encodeURIComponent(params.search)}`)
  }

  if (params.status && params.status !== 'all') {
    queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
  }

  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-createdAt'}`)

  const res = await fetch(apiUrl(`/coupon-codes?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch coupons: ${res.statusText}`)
  }

  return res.json()
}

export async function getCoupon(id: number): Promise<CouponDoc> {
  const res = await fetch(apiUrl(`/coupon-codes/${id}?depth=2`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch coupon: ${res.statusText}`)
  }

  return res.json()
}

export interface CreateCouponData {
  code: string
  name?: string
  description?: string
  status?: 'draft' | 'active' | 'paused' | 'expired' | 'archived'
  discountType: 'percent' | 'fixed_course' | 'fixed_cart'
  amount: number
  maxDiscountAmount?: number
  scopeType?: 'all_courses' | 'specific_courses' | 'specific_categories'
  includedCourses?: number[]
  excludedCourses?: number[]
  includedCategories?: number[]
  excludedCategories?: number[]
  excludeSaleCourses?: boolean
  minimumAmount?: number
  maximumAmount?: number
  usageLimitTotal?: number
  usageLimitPerUser?: number
  maxItemsAffected?: number
  stackable?: boolean
  priority?: number
  startsAt?: string
  expiresAt?: string
}

export async function createCoupon(data: CreateCouponData): Promise<CouponDoc> {
  const res = await fetch(apiUrl('/coupon-codes'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to create coupon: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export interface UpdateCouponData {
  code?: string
  name?: string | null
  description?: string | null
  status?: 'draft' | 'active' | 'paused' | 'expired' | 'archived'
  discountType?: 'percent' | 'fixed_course' | 'fixed_cart'
  amount?: number
  maxDiscountAmount?: number | null
  scopeType?: 'all_courses' | 'specific_courses' | 'specific_categories'
  includedCourses?: number[]
  excludedCourses?: number[]
  includedCategories?: number[]
  excludedCategories?: number[]
  excludeSaleCourses?: boolean
  minimumAmount?: number | null
  maximumAmount?: number | null
  usageLimitTotal?: number | null
  usageLimitPerUser?: number | null
  maxItemsAffected?: number | null
  stackable?: boolean
  priority?: number
  allowedEmails?: { email: string }[]
  startsAt?: string | null
  expiresAt?: string | null
}

export async function updateCoupon(id: number, data: UpdateCouponData): Promise<CouponDoc> {
  const res = await fetch(apiUrl(`/coupon-codes/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update coupon: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteCoupon(id: number): Promise<void> {
  const res = await fetch(apiUrl(`/coupon-codes/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete coupon: ${res.statusText}`)
  }
}

export async function getRedemptions(couponId: number): Promise<RedemptionDoc[]> {
  const res = await fetch(apiUrl(`/coupon-redemptions?depth=1&limit=50&sort=-appliedAt&where[coupon][equals]=${couponId}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch redemptions: ${res.statusText}`)
  }

  const data = await res.json()
  return data.docs || []
}

export interface SimpleCourseOption {
  id: number
  title: string
  courseCode: string
}

export async function searchCourses(search: string): Promise<SimpleCourseOption[]> {
  if (!search || search.length < 1) return []
  const res = await fetch(apiUrl(`/courses?depth=0&limit=20&where[or][0][title][like]=${encodeURIComponent(search)}&where[or][1][courseCode][like]=${encodeURIComponent(search)}`), {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((c: any) => ({ id: c.id, title: c.title || '', courseCode: c.courseCode || '' }))
}

export interface SimpleCategoryOption {
  id: number
  name: string
}

export async function searchCategories(search: string): Promise<SimpleCategoryOption[]> {
  if (!search || search.length < 1) return []
  const res = await fetch(apiUrl(`/course-categories?depth=0&limit=20&where[name][like]=${encodeURIComponent(search)}`), {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((c: any) => ({ id: c.id, name: c.name || c.title || '' }))
}
