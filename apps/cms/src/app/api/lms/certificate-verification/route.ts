import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { CertificateVerificationResult } from '@encreasl/cms-types'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code || !code.trim()) {
      return NextResponse.json(
        { verified: false, error: 'Certificate code is required' } satisfies CertificateVerificationResult,
        { status: 400 },
      )
    }

    const certs = await payload.find({
      collection: 'certificates',
      where: {
        certificateCode: { equals: code.trim() },
      },
      depth: 2,
      limit: 1,
      overrideAccess: true,
    })

    if (!certs.docs || certs.docs.length === 0) {
      return NextResponse.json(
        { verified: false, error: 'Certificate not found' } satisfies CertificateVerificationResult,
        { status: 404 },
      )
    }

    const cert = certs.docs[0]

    const trainee = cert.trainee as any
    const course = cert.course as any
    const user = trainee?.user as any

    const result: CertificateVerificationResult = {
      verified: true,
      certificate: {
        id: cert.id,
        certificateCode: cert.certificateCode,
        status: cert.status,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate || null,
      },
      trainee: {
        fullName: user
          ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')
          : null,
        srn: trainee?.srn || null,
      },
      course: {
        title: course?.title || null,
        code: course?.code || null,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
