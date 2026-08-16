/**
 * @encreasl/course-actions - Shared course CRUD and utilities
 *
 * Provides server-action-level helpers used by both web-admin and web-instructor.
 * Each app wraps these with its own auth/ownership checks and payload construction.
 */

import { cmsFetch, type Course, type CourseListResult, type CategoryOption, type SimpleDocRef } from '@encreasl/cms-types';

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') parts.push(`${key}=${encodeURIComponent(String(val))}`);
  }
  return parts.join('&');
}

export async function getCourse(
  apiKey: string,
  cmsUrl: string,
  id: string,
): Promise<Course> {
  return cmsFetch<Course>(apiKey, cmsUrl, `/courses/${id}?depth=2`);
}

export async function createCourse(
  apiKey: string,
  cmsUrl: string,
  payload: Record<string, unknown>,
): Promise<Course> {
  return cmsFetch<Course>(apiKey, cmsUrl, '/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCourse(
  apiKey: string,
  cmsUrl: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Course> {
  const safeData: Record<string, unknown> = { ...data };

  for (const key of ['modules', 'category', 'coInstructors']) {
    const val = safeData[key];
    if (Array.isArray(val)) {
      safeData[key] = val.map((v) => (typeof v === 'object' ? v : Number(v)));
    }
  }

  if (safeData.description && typeof safeData.description === 'string') {
    safeData.description = toLexical(safeData.description as string);
  }

  return cmsFetch<Course>(apiKey, cmsUrl, `/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(safeData),
  });
}

export async function deleteCourse(
  apiKey: string,
  cmsUrl: string,
  id: string,
): Promise<void> {
  await cmsFetch(apiKey, cmsUrl, `/courses/${id}`, {
    method: 'DELETE',
  });
}

export async function getCategoriesList(
  apiKey: string,
  cmsUrl: string,
): Promise<CategoryOption[]> {
  const query = buildQueryString({ depth: 0, limit: 100, sort: 'name' });
  const data = await cmsFetch<CourseListResult>(apiKey, cmsUrl, `/course-categories?${query}`);
  return (data.docs || []).map((_: any) => ({
    id: String(_.id),
    name: _.name || _.title || '',
  }));
}

export async function searchCollection(
  apiKey: string,
  cmsUrl: string,
  collection: string,
  search: string,
  labelField = 'title',
): Promise<SimpleDocRef[]> {
  if (!search || search.length < 1) return [];
  const limit = search.length <= 2 ? '8' : '20';
  const query = buildQueryString({
    depth: 0,
    limit,
    [`where[or][0][${labelField}][like]`]: search,
  });
  const data = await cmsFetch<CourseListResult>(apiKey, cmsUrl, `/${collection}?${query}`);
  return (data.docs || []).map((d: any) => ({
    id: String(d.id),
    title: d.title || d.name || String(d.id),
    name: d.name || undefined,
  }));
}

export function toLexical(text: string): unknown {
  if (!text) return undefined;
  return {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [{ text }],
        },
      ],
    },
  };
}

export function extractIds(items?: ({ id: string } | string)[]): string[] {
  if (!items) return [];
  return items.map((i) => (typeof i === 'string' ? i : i.id));
}

export function toDatetimeLocal(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function listCollection(
  apiKey: string,
  cmsUrl: string,
  collection: string,
  _labelField = 'title',
): Promise<SimpleDocRef[]> {
  const query = buildQueryString({ depth: 0, limit: 10, sort: '-createdAt' });
  const data = await cmsFetch<CourseListResult>(apiKey, cmsUrl, `/${collection}?${query}`);
  return (data.docs || []).map((d: any) => ({
    id: String(d.id),
    title: d.title || d.name || String(d.id),
    name: d.name || undefined,
  }));
}

export type { Course, CourseListResult, CategoryOption, SimpleDocRef };

export * from './enrollments';
