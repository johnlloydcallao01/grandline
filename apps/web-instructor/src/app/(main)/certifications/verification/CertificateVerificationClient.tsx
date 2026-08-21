'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CertificateVerificationResult } from '@encreasl/cms-types'
import { verifyCertificate } from './actions'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const FileCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)
const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
)
const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" /></svg>
)
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
)
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)
const LinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
)

export function CertificateVerificationClient({ initialCode }: { initialCode?: string }) {
  const router = useRouter()
  const { siteName, logoUrl } = useSiteSettings()

  const [searchQuery, setSearchQuery] = useState(initialCode || '')
  const [result, setResult] = useState<CertificateVerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const verifyCode = useCallback(async (code: string) => {
    if (!code.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await verifyCertificate(code)
      setResult(data)
    } catch {
      setResult({ verified: false, error: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      verifyCode(initialCode)
    }
  }, [initialCode, verifyCode])

  useEffect(() => {
    const code = initialCode?.trim() || result?.certificate?.certificateCode
    if (code) {
      setShareUrl(`${window.location.origin}/certifications/verification/${encodeURIComponent(code)}`)
    } else {
      setShareUrl('')
    }
  }, [initialCode, result])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || loading) return
    router.replace(`/certifications/verification/${encodeURIComponent(searchQuery.trim())}` as any)
    await verifyCode(searchQuery.trim())
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Active
          </span>
        )
      case 'revoked':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircleIcon className="mr-1 h-3 w-3" />
            Revoked
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <ClockIcon className="mr-1 h-3 w-3" />
            Expired
          </span>
        )
      default:
        return null
    }
  }

  const status = result?.certificate?.status
  const isActive = status === 'active'
  const isRevoked = status === 'revoked'

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 md:py-10">
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <img
            src={logoUrl}
            alt={`${siteName} Logo`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Certificate Verification</h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-600 dark:text-gray-400">
          Verify the authenticity of any certificate issued by {siteName}.
          Enter the unique certificate ID or scan the QR code on the document.
        </p>
      </div>

      {!result?.verified && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <label htmlFor="cert-id" className="sr-only">Certificate ID</label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FileCheckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                id="cert-id"
                className="block w-full rounded-xl border border-gray-300 bg-white py-4 pl-10 pr-4 text-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100 dark:placeholder:text-gray-400"
                placeholder="e.g. CERT-2026-ABCD-1234"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Now
                  <SearchIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {result && result.verified && result.certificate && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <div className={`flex items-center border-b px-6 py-4 ${isActive ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30' : isRevoked ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30'}`}>
            {isActive ? (
              <CheckCircleIcon className="mr-3 h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
            ) : isRevoked ? (
              <XCircleIcon className="mr-3 h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
            ) : (
              <ClockIcon className="mr-3 h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-400" />
            )}
            <h3 className={`text-lg font-bold ${isActive ? 'text-green-800 dark:text-green-300' : isRevoked ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
              {isActive && 'Valid Certificate Found'}
              {isRevoked && 'Certificate Revoked'}
              {status === 'expired' && 'Certificate Expired'}
            </h3>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Supplied To</p>
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.trainee?.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Student ID: {result.trainee?.srn || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{result.course?.title || 'N/A'}</p>
                  {result.course?.code && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Course Code: {result.course.code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Issue Date</p>
                  <div className="flex items-center text-gray-900 dark:text-gray-100">
                    <CalendarIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-lg font-medium">{formatDate(result.certificate.issueDate)}</span>
                  </div>
                </div>
                {result.certificate.expiryDate && (
                  <div>
                    <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Expiry Date</p>
                    <div className="flex items-center text-gray-900 dark:text-gray-100">
                      <CalendarIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <span className="text-lg font-medium">{formatDate(result.certificate.expiryDate)}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</p>
                  {getStatusBadge(result.certificate.status)}
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Certificate ID</p>
                  <p className="inline-block rounded border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {result.certificate.certificateCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
              <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Share Verification</p>
              {shareUrl && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <LinkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent font-mono text-sm text-gray-700 outline-none dark:text-gray-300"
                    aria-label="Verification URL"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="rounded px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result && !result.verified && (
        <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/30">
          <AlertCircleIcon className="mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
          <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Certificate Not Found</h3>
          <p className="mt-2 max-w-md text-red-600 dark:text-red-400">
            {result.error || `We could not find a valid certificate with the ID "${searchQuery}".`}
          </p>
          <p className="mt-4 text-sm text-red-500 dark:text-red-500">
            Please double-check the ID and try again, or contact support if you believe this is an error.
          </p>
        </div>
      )}
    </div>
  )
}