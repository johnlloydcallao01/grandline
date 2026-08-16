import { Suspense } from 'react'
import { CertificateVerificationClient } from '../CertificateVerificationClient'

interface CertificateCodePageProps {
  params: Promise<{ code: string }>
}

export default async function CertificateCodePage({ params }: CertificateCodePageProps) {
  const { code } = await params
  return (
    <Suspense fallback={null}>
      <CertificateVerificationClient initialCode={code} />
    </Suspense>
  )
}