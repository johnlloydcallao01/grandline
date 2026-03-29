# Solution: Fixing the "File Not Available" / `.htm` Download Issue

## The Root Cause
The reason the download buttons on the `/downloads` page were failing (downloading as `.htm` or saying "File was not available on this site") was due to a discrepancy in how the file URL was extracted from Payload CMS compared to the working `/training-materials/[id]` view page.

When using the Cloudinary plugin in Payload CMS, the database stores two URL fields for media:
1. `url`: Often just the local relative path (e.g., `/main-uploads/file.pdf`).
2. `cloudinaryURL`: The actual, absolute public URL hosted on Cloudinary.

The working **View Page** (`MaterialViewerClient.tsx`) correctly prioritized the Cloudinary URL:
```typescript
const getMediaUrl = (media: any) => {
  return media?.cloudinaryURL || media?.url || null;
};
```

However, the **Downloads Page** relies on `getEnrolledMaterials` in `actions.ts` to map the CMS data into a simplified `FrontendMaterial` object. The mapping logic was flawed and completely ignored `cloudinaryURL`:
```typescript
// FLAWED LOGIC in actions.ts
if (material.materialSource === 'media' && primaryMedia?.url) {
  href = primaryMedia.url; // <-- This grabs the broken relative path
}
```
Because the `href` passed to the `<a>` tag was a relative path, the browser tried to download from the Next.js server directly. The server didn't have the file, returned a 404 HTML page, and the browser saved that HTML page as a `.htm` file.

## The Exact Solution

To fix this permanently and ensure the records represent the true Cloudinary files, we must update the mapping logic in `apps/web/src/app/(main)/training-materials/actions.ts` to exactly mimic the URL extraction used in the view page.

### 1. Update `actions.ts` (Data Layer)
We must change how `href` and `allFiles` are populated inside the `mapMaterial` function to prioritize `cloudinaryURL`.

**Change this:**
```typescript
if (!hasMultipleFiles) {
  if (material.materialSource === 'external' && material.externalUrl) {
    href = material.externalUrl;
  } else if (material.materialSource === 'media' && primaryMedia?.url) {
    href = primaryMedia.url;
  }
} else {
  if (material.materialSource === 'media' && Array.isArray(material.media)) {
    allFiles = material.media
      .filter((m: any) => m?.url)
      .map((m: any) => ({
        url: m.url,
        filename: m.filename || 'download'
      }));
  }
}
```

**To this:**
```typescript
if (!hasMultipleFiles) {
  if (material.materialSource === 'external' && material.externalUrl) {
    href = material.externalUrl;
  } else if (material.materialSource === 'media' && primaryMedia) {
    // FIX: Prioritize cloudinaryURL
    href = primaryMedia.cloudinaryURL || primaryMedia.url || null;
  }
} else {
  if (material.materialSource === 'media' && Array.isArray(material.media)) {
    allFiles = material.media
      // FIX: Check for either URL type
      .filter((m: any) => m?.cloudinaryURL || m?.url)
      .map((m: any) => ({
        // FIX: Prioritize cloudinaryURL
        url: m.cloudinaryURL || m.url,
        filename: m.filename || 'download'
      }));
  }
}
```

### 2. Update `downloads/page.tsx` (UI Layer)
Once the data layer is fixed, the UI must use the exact, raw `<a>` tag logic found in the view page, without any injected `onClick` overrides or JavaScript tricks. 

**The exact structure to use:**
```tsx
// 1. The exact Cloudinary helper function
const getDownloadUrl = (url: string) => {
  if (!url) return '#';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
};

// 2. The exact anchor tag
<a
  href={getDownloadUrl(item.href)}
  download={item.title}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  <span className="hidden sm:inline">Download</span>
</a>
```

By ensuring `item.href` actually contains the `https://res.cloudinary.com/...` string (Step 1), the `getDownloadUrl` function will successfully inject `fl_attachment` (Step 2), forcing the browser to securely download the actual file.