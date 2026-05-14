export interface BlogCategory {
  id: number;
  name: string;
}

export interface BlogPostDoc {
  id: number | string;
  title?: string;
  excerpt?: string | null;
  slug?: string;
  status?: string;
  isFeatured?: boolean;
  featuredImage?: {
    cloudinaryURL?: string | null;
    url?: string | null;
    thumbnailURL?: string | null;
    alt?: string | null;
  } | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  category?: unknown;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
  content?: unknown;
}

export interface PostsResponse {
  docs?: BlogPostDoc[];
  doc?: BlogPostDoc | null;
  hasNextPage?: boolean;
  nextPage?: number | null;
  page?: number;
  totalPages?: number;
}

export interface BlogPostsQueryOptions {
  status?: string;
  limit?: string;
  page?: string;
  categoryId?: string;
  featured?: string;
  sort?: string;
}

function getBlogsApiUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL || "https://cms.grandlinemaritime.com/api"
  ).replace(/\/$/, "");
}

function getBlogsApiHeaders() {
  const apiKey = process.env.PAYLOAD_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `users API-Key ${apiKey}`,
  };
}

export function getImageUrl(post: BlogPostDoc): string | null {
  const img = post.featuredImage;
  if (!img) return null;
  return img.cloudinaryURL || img.thumbnailURL || img.url || null;
}

export function getPrimaryCategoryName(post: BlogPostDoc): string | null {
  const value = post.category as unknown;
  if (!Array.isArray(value) || value.length === 0) return null;
  const first = value[0] as { name?: unknown };
  if (first && typeof first === "object" && typeof first.name === "string") {
    return first.name;
  }
  return null;
}

export function getDateLabel(post: BlogPostDoc): string | null {
  const raw = post.publishedAt || post.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function toSlug(post: BlogPostDoc): string {
  if (post.slug && post.slug.length > 0) return post.slug;
  if (typeof post.title === "string" && post.title.length > 0) {
    return post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  return String(post.id);
}

function isNumericId(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

export async function fetchActiveAssignedPostCategories(): Promise<
  BlogCategory[]
> {
  const headers = getBlogsApiHeaders();
  if (!headers) return [];

  const res = await globalThis.fetch(
    `${getBlogsApiUrl()}/post-categories/active`,
    {
      headers: {
        "Content-Type": "application/json",
        PAYLOAD_API_KEY:
          process.env.PAYLOAD_API_KEY ||
          "db6c3436-72f8-47d0-855a-30112b7e9214",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];

  const json = (await res.json()) as { categories?: unknown };
  const raw = Array.isArray(json.categories)
    ? (json.categories as Array<Record<string, unknown>>)
    : [];

  const mapped: Array<{ id: number; name: string; displayOrder: number }> = [];

  for (const cat of raw) {
    const idValue = cat.id;
    const nameValue = cat.name;
    const orderValue = cat.displayOrder;

    const id = typeof idValue === "number" ? idValue : Number(idValue);
    const name = typeof nameValue === "string" ? nameValue : "";
    const displayOrder = typeof orderValue === "number" ? orderValue : 0;

    if (!Number.isFinite(id) || !name) continue;

    mapped.push({ id, name, displayOrder });
  }

  mapped.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name);
  });

  const seen = new Set<number>();
  const result: BlogCategory[] = [];

  for (const cat of mapped) {
    if (seen.has(cat.id)) continue;
    seen.add(cat.id);
    result.push({ id: cat.id, name: cat.name });
  }

  return result;
}

export async function fetchPostsCollection(options: BlogPostsQueryOptions) {
  const headers = getBlogsApiHeaders();

  if (!headers) {
    return {
      status: 500,
      data: { error: "API configuration error" },
    };
  }

  const params = new globalThis.URLSearchParams({
    status: options.status || "published",
    limit: options.limit || "8",
    page: options.page || "1",
    sort: options.sort || "-updatedAt",
  });

  if (options.categoryId) {
    params.set("where[category][contains]", options.categoryId);
  }

  if (options.featured === "true") {
    params.set("where[isFeatured][equals]", "true");
  }

  const response = await globalThis.fetch(
    `${getBlogsApiUrl()}/posts?${params.toString()}`,
    {
      headers,
      cache: "no-store",
    },
  );

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

export async function fetchPostBySlugOrId(
  slugOrId: string,
): Promise<BlogPostDoc | null> {
  const headers = getBlogsApiHeaders();

  if (!headers) return null;

  if (isNumericId(slugOrId)) {
    const res = await globalThis.fetch(`${getBlogsApiUrl()}/posts/${slugOrId}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as PostsResponse | BlogPostDoc;

    if (json && typeof json === "object" && "id" in json) {
      return json as BlogPostDoc;
    }

    const response = json as PostsResponse;
    if (response.doc) {
      return response.doc;
    }

    return null;
  }

  const params = new globalThis.URLSearchParams();
  params.set("where[slug][equals]", slugOrId);
  params.set("where[status][equals]", "published");
  params.set("limit", "1");

  const res = await globalThis.fetch(
    `${getBlogsApiUrl()}/posts?${params.toString()}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const json = (await res.json()) as PostsResponse;
  if (Array.isArray(json.docs) && json.docs.length > 0) {
    return json.docs[0];
  }

  if (json.doc) return json.doc;

  return null;
}
