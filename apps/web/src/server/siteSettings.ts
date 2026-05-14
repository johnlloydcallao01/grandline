const CMS_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cms.grandlinemaritime.com/api";
const CMS_BASE_URL = CMS_API_BASE_URL.replace(/\/api$/, "");

export type SiteSettingsMedia = {
  cloudinaryURL?: string | null;
  url?: string | null;
} | null;

export type SiteSettingsResponse = {
  favicon?: SiteSettingsMedia;
  updatedAt?: string | null;
} | null;

export function resolveCmsMediaUrl(media?: SiteSettingsMedia) {
  if (!media) return null;

  const cloudinaryUrl = media.cloudinaryURL?.replace(/[`'"]/g, "").trim();
  if (cloudinaryUrl) return cloudinaryUrl;

  const mediaUrl = media.url?.trim();
  if (!mediaUrl) return null;

  return mediaUrl.startsWith("http") ? mediaUrl : `${CMS_BASE_URL}${mediaUrl}`;
}

export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  try {
    const response = await fetch(`${CMS_API_BASE_URL}/globals/site-settings?depth=1`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as SiteSettingsResponse;
  } catch {
    return null;
  }
}

export async function getSiteSettingsFavicon() {
  const siteSettings = await getSiteSettings();

  return {
    siteSettings,
    faviconUrl: resolveCmsMediaUrl(siteSettings?.favicon),
  };
}
