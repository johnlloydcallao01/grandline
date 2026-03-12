import { useState, useEffect } from 'react';
import { cmsConfig, getCMSImageUrl } from '@/lib/cms';

export interface SiteSettings {
  siteName: string;
  description?: string;
  logo?: {
    url?: string;
    alt?: string;
    [key: string]: any;
  } | string;
  favicon?: {
    url?: string;
    [key: string]: any;
  } | string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch(`${cmsConfig.apiUrl}/globals/site-settings?depth=1`);
        if (!response.ok) {
          throw new Error('Failed to fetch site settings');
        }
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const logoUrl = settings?.logo && typeof settings.logo === 'object'
    ? (settings.logo.cloudinaryURL || getCMSImageUrl(settings.logo.url as string))
    : '/calsiter-inc-logo.png'; // Fallback to default

  const faviconUrl = settings?.favicon && typeof settings.favicon === 'object'
    ? (settings.favicon.cloudinaryURL || getCMSImageUrl(settings.favicon.url as string))
    : '/favicon.ico'; // Fallback to default

  const siteName = settings?.siteName || 'Grandline';

  return {
    settings,
    isLoading,
    error,
    logoUrl,
    faviconUrl,
    siteName
  };
}
