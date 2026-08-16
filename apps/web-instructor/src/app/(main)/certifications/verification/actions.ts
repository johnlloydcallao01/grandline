'use server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL

export interface VerificationResult {
  verified: boolean
  certificate?: {
    id: number
    certificateCode: string
    status: 'active' | 'revoked' | 'expired'
    issueDate: string
    expiryDate: string | null
  }
  trainee?: {
    fullName: string | null
    srn: string | null
  }
  course?: {
    title: string | null
    code: string | null
  }
  error?: string
}

export async function verifyCertificate(code: string): Promise<VerificationResult> {
  if (!code || !code.trim()) {
    return { verified: false, error: 'Certificate code is required' }
  }

  if (!CMS_API) {
    return { verified: false, error: 'Server configuration error' }
  }

  try {
    const url = new URL(`${CMS_API}/lms/certificate-verification`)
    url.searchParams.set('code', code.trim())

    const res = await fetch(url.toString(), { cache: 'no-store' })
    const data = await res.json()

    if (!res.ok) {
      if (res.status === 404) {
        return { verified: false, error: data.error || 'Certificate not found' }
      }
      return { verified: false, error: data.error || 'Verification failed' }
    }

    return data as VerificationResult
  } catch (error) {
    console.error('Certificate verification error:', error)
    return { verified: false, error: 'Unable to verify certificate. Please try again.' }
  }
}