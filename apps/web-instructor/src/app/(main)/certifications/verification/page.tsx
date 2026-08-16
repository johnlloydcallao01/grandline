import { Suspense } from 'react'
import { CertificateVerificationClient } from './CertificateVerificationClient'

interface VerificationPageProps {
  searchParams: Promise<{ code?: string }>
}

export default async function VerificationPage({ searchParams }: VerificationPageProps) {
  const { code } = await searchParams
  return (
    <Suspense fallback={null}>
      <CertificateVerificationClient initialCode={code} />
    </Suspense>
  )
}