const LOCAL_CMS_ORIGIN = 'http://localhost:3001'

const normalizeUrl = (value?: string | null): string | null => {
  const normalized = value?.trim().replace(/\/+$/, '')
  return normalized ? normalized : null
}

const getOriginFromUrl = (value?: string | null): string | null => {
  if (!value) {
    return null
  }

  try {
    return normalizeUrl(new URL(value).origin)
  } catch {
    return null
  }
}

export const getCmsServerUrl = (requestUrl?: string | null): string => {
  return (
    normalizeUrl(process.env.PAYLOAD_PUBLIC_SERVER_URL) ||
    normalizeUrl(process.env.CMS_PROD_URL) ||
    getOriginFromUrl(requestUrl) ||
    normalizeUrl(process.env.CMS_LOCAL_URL) ||
    LOCAL_CMS_ORIGIN
  )
}

export const getCmsApiBaseUrl = (requestUrl?: string | null): string => {
  return normalizeUrl(process.env.PAYLOAD_API_URL) || `${getCmsServerUrl(requestUrl)}/api`
}
