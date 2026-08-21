'use server'

import { createCertificationService } from '@encreasl/course-actions'
import type { CertificateVerificationResult } from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const certificationService = createCertificationService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

export async function verifyCertificate(code: string): Promise<CertificateVerificationResult> {
  return certificationService.verifyCertificate(code)
}