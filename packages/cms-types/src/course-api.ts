/**
 * CMS API client utilities using API-key auth pattern
 * Used by server actions in web-admin, web-instructor, and other apps
 */

// Types inlined to avoid circular dependency with index.ts which re-exports this file
export interface SimpleDocRef {
  id: string;
  title?: string;
  name?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface TagOption {
  id: string;
  name: string;
}

export interface CMSApiResponse<T = any> {
  docs?: T[];
  doc?: T;
  totalDocs?: number;
  limit?: number;
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  errors?: Array<{
    message: string;
    field?: string;
  }>;
}

export function createHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `users API-Key ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export function createApiUrl(baseUrl: string, path: string): string {
  if (!baseUrl) throw new Error('Missing CMS API URL');
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
}

export class CmsApiError extends Error {
  public status?: number;
  public errors?: Array<{ message: string; field?: string }>;

  constructor(message: string, status?: number, errors?: Array<{ message: string; field?: string }>) {
    super(message);
    this.name = 'CmsApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function cmsFetch<T = any>(
  apiKey: string,
  baseUrl: string,
  path: string,
  init?: RequestInit & { params?: Record<string, string> },
): Promise<T> {
  let url = createApiUrl(baseUrl, path);

  if (init?.params) {
    const searchParams = new URLSearchParams(init.params);
    url += `?${searchParams.toString()}`;
  }

  const { params: _unused, ...fetchOpts } = init || {};

  void _unused;

  const res = await fetch(url, {
    headers: createHeaders(apiKey),
    ...fetchOpts,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as any).errors?.[0]?.message || (body as any).error || `Request failed: ${res.statusText}`;
    throw new CmsApiError(msg, res.status, (body as any).errors);
  }

  return res.json();
}

export async function fetchList<T = any>(
  apiKey: string,
  baseUrl: string,
  path: string,
  params?: Record<string, string>,
): Promise<CMSApiResponse<T>> {
  return cmsFetch<CMSApiResponse<T>>(apiKey, baseUrl, path, { params, cache: 'no-store' });
}

export async function fetchById<T = any>(
  apiKey: string,
  baseUrl: string,
  path: string,
): Promise<T> {
  return cmsFetch<T>(apiKey, baseUrl, path, { cache: 'no-store' });
}

export async function searchCollection(
  apiKey: string,
  baseUrl: string,
  collection: string,
  search: string,
  labelField = 'title',
): Promise<SimpleDocRef[]> {
  if (!search || search.length < 1) return [];
  const limit = search.length <= 2 ? '8' : '20';
  const params: Record<string, string> = {
    depth: '0',
    limit,
    [`where[or][0][${labelField}][like]`]: search,
  };
  const data = await fetchList(apiKey, baseUrl, `/${collection}`, params);
  return (data.docs || []).map((d: any) => ({
    id: String(d.id),
    title: d.title || d.name || String(d.id),
    name: d.name || undefined,
  }));
}

export async function listCollection(
  apiKey: string,
  baseUrl: string,
  collection: string,
  _labelField = 'title',
): Promise<SimpleDocRef[]> {
  const params: Record<string, string> = { depth: '0', limit: '10', sort: '-createdAt' };
  const data = await fetchList(apiKey, baseUrl, `/${collection}`, params);
  return (data.docs || []).map((d: any) => ({
    id: String(d.id),
    title: d.title || d.name || String(d.id),
    name: d.name || undefined,
  }));
}

export async function fetchCategories(
  apiKey: string,
  baseUrl: string,
): Promise<CategoryOption[]> {
  const params: Record<string, string> = { depth: '0', limit: '100', sort: 'name' };
  const data = await fetchList(apiKey, baseUrl, '/course-categories', params);
  return (data.docs || []).map((c: any) => ({
    id: String(c.id),
    name: c.name || c.title || '',
  }));
}
