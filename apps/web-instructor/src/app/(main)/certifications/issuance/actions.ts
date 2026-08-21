'use server'

import { cookies } from 'next/headers'
import { createCertificationService } from '@encreasl/course-actions'
import type { EligibleEnrollment, EligibleEnrollmentFilters } from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const certificationService = createCertificationService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

async function getUserId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')

  const meRes = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!meRes.ok) throw new Error('Failed to get current user')
  const meData = await meRes.json()
  const userId = meData?.user?.id || meData?.id
  if (!userId) throw new Error('Could not determine user ID')

  return String(userId)
}

export async function getEligibleEnrollments(
  filters: EligibleEnrollmentFilters = {},
): Promise<EligibleEnrollment[]> {
  const userId = await getUserId()
  return certificationService.getEligibleEnrollments(filters, userId)
}