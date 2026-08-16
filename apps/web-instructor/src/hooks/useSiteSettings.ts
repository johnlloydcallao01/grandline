'use client'

import { useState, useEffect } from 'react'

const CMS_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
const CMS_BASE_URL = CMS_API_BASE_URL.replace(/\/api$/, '')

interface MediaRef {
  cloudinaryURL?: string | null
  url?: string | null
  [key: string]: unknown
}

export interface SiteSettings {
  siteName?: string | null
  description?: string | null
  logo?: MediaRef | string | null
  favicon?: MediaRef | string | null
}

function resolveMediaUrl(media?: MediaRef | string | null): string | null {
  if (!media) return null
  if (typeof media === 'string') return media.startsWith('http') ? media : `${CMS_BASE_URL}${media}`
  const cloudinaryUrl = media.cloudinaryURL?.replace(/[`'"]/g, '').trim()
  if (cloudinaryUrl) return cloudinaryUrl
  const mediaUrl = media.url?.trim()
  if (!mediaUrl) return null
  return mediaUrl.startsWith('http') ? mediaUrl : `${CMS_BASE_URL}${mediaUrl}`
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchSettings() {
      try {
        const response = await fetch(`${CMS_API_BASE_URL}/globals/site-settings?depth=1`)
        if (!response.ok) throw new Error('Failed to fetch site settings')
        const data = await response.json()
        if (!cancelled) setSettings(data as SiteSettings)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchSettings()
    return () => { cancelled = true }
  }, [])

  const logo = settings?.logo
  const logoUrl = (logo && typeof logo === 'object' ? resolveMediaUrl(logo as MediaRef) : null) || '/grandline-logo.png'
  const siteName = settings?.siteName || 'Grandline Maritime'

  return { settings, isLoading, error, logoUrl, siteName }
}