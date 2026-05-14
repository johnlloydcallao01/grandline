import { readFile } from "fs/promises";
import path from "path";
import { getSiteSettingsFavicon } from "@/server/siteSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_ICON_PATH = path.join(process.cwd(), "src", "app", "grandline-logo.ico");
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function buildResponse(body: BodyInit | null, contentType: string) {
  return new Response(body, {
    headers: {
      ...NO_CACHE_HEADERS,
      "Content-Type": contentType,
    },
  });
}

async function getFallbackIconResponse() {
  const fallbackIcon = await readFile(FALLBACK_ICON_PATH);
  return buildResponse(fallbackIcon, "image/x-icon");
}

async function getDynamicFaviconResponse() {
  const { faviconUrl } = await getSiteSettingsFavicon();

  if (faviconUrl) {
    try {
      const upstreamResponse = await fetch(faviconUrl, {
        cache: "no-store",
      });

      if (upstreamResponse.ok) {
        const arrayBuffer = await upstreamResponse.arrayBuffer();
        const contentType = upstreamResponse.headers.get("content-type") || "image/x-icon";
        return buildResponse(arrayBuffer, contentType);
      }
    } catch {
      // Fall through to the local fallback icon.
    }
  }

  return getFallbackIconResponse();
}

export async function GET() {
  return getDynamicFaviconResponse();
}

export async function HEAD() {
  const response = await getDynamicFaviconResponse();

  return new Response(null, {
    headers: response.headers,
  });
}
