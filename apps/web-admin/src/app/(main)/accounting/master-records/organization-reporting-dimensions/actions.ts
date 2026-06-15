'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type OrgDimensionMetric = {
  id: string;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
};

export type OrgDimensionFilterOption = {
  label: string;
  value: string;
};

export type BranchRegisterRow = {
  id: number | string;
  branchCode: string | null;
  name: string | null;
  status: string | null;
  statusLabel: string | null;
  address: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type BranchesRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: { statuses: OrgDimensionFilterOption[]; quickFilters: OrgDimensionFilterOption[] };
    metrics: OrgDimensionMetric[];
    table: { title: string; description: string; columns: string[]; rows: BranchRegisterRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; addressFilter: string; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalBranches: number; filteredBranches: number; activeBranches: number; inactiveBranches: number; withAddress: number };
};

export type UserRef = {
  id: number | string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  nameExtension?: string | null;
};

export type BranchDetail = {
  id: number | string;
  branchCode?: string | null;
  name?: string | null;
  status?: string | null;
  address?: string | null;
  notes?: string | null;
  createdBy?: UserRef | number | string | null;
  updatedBy?: UserRef | number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateBranchInput = {
  branchCode: string;
  name: string;
  status?: string;
  address?: string | null;
  notes?: string | null;
};

export type UpdateBranchInput = CreateBranchInput;

export type DepartmentRegisterRow = {
  id: number | string;
  departmentCode: string | null;
  name: string | null;
  status: string | null;
  statusLabel: string | null;
  branchId: number | string | null;
  branchCode: string | null;
  branchName: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type DepartmentsRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: { statuses: OrgDimensionFilterOption[]; branches: OrgDimensionFilterOption[]; quickFilters: OrgDimensionFilterOption[] };
    metrics: OrgDimensionMetric[];
    table: { title: string; description: string; columns: string[]; rows: DepartmentRegisterRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; branchIds: (number | string)[]; branchFilters: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalDepartments: number; filteredDepartments: number; activeDepartments: number; inactiveDepartments: number; branchLinked: number };
};

export type DepartmentDetail = {
  id: number | string;
  departmentCode?: string | null;
  name?: string | null;
  status?: string | null;
  branch?: { id: number | string; branchCode?: string | null; name?: string | null } | number | string | null;
  notes?: string | null;
  createdBy?: UserRef | number | string | null;
  updatedBy?: UserRef | number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateDepartmentInput = {
  departmentCode: string;
  name: string;
  status?: string;
  branch?: number | string | null;
  notes?: string | null;
};

export type UpdateDepartmentInput = CreateDepartmentInput;

export type LocationRegisterRow = {
  id: number | string;
  locationCode: string | null;
  name: string | null;
  status: string | null;
  statusLabel: string | null;
  branchId: number | string | null;
  branchCode: string | null;
  branchName: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>;
};

export type LocationsRegisterResponse = {
  section: {
    id: string;
    label: string;
    description: string;
    searchPlaceholder: string;
    filters: { statuses: OrgDimensionFilterOption[]; branches: OrgDimensionFilterOption[]; quickFilters: OrgDimensionFilterOption[] };
    metrics: OrgDimensionMetric[];
    table: { title: string; description: string; columns: string[]; rows: LocationRegisterRow[] };
  };
  appliedFilters: { search: string; statuses: string[]; branchIds: (number | string)[]; branchFilters: string[]; quickFilters: string[] };
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
  totals: { totalLocations: number; filteredLocations: number; activeLocations: number; inactiveLocations: number; branchLinked: number };
};

export type LocationDetail = {
  id: number | string;
  locationCode?: string | null;
  name?: string | null;
  status?: string | null;
  branch?: { id: number | string; branchCode?: string | null; name?: string | null } | number | string | null;
  notes?: string | null;
  createdBy?: UserRef | number | string | null;
  updatedBy?: UserRef | number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateLocationInput = {
  locationCode: string;
  name: string;
  status?: string;
  branch?: number | string | null;
  notes?: string | null;
};

export type UpdateLocationInput = CreateLocationInput;

async function getAuthHeaders(contentType = false) {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');
  return {
    Authorization: `JWT ${token}`,
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      ...(await getAuthHeaders(init?.body ? true : false)),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const rawBody = await response.text().catch(() => '');
  let payload: T | { error?: string } | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as T | { error?: string };
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const textFallback = rawBody.trim();
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : textFallback && !textFallback.startsWith('<')
          ? textFallback
          : `Failed to load accounting data (${response.status}).`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function getBranchesRegister(query: { search?: string; statuses?: string[]; addressFilter?: string; quickFilters?: string[]; page?: number; limit?: number } = {}): Promise<BranchesRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  if (query.addressFilter) params.set('addressFilter', query.addressFilter);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<BranchesRegisterResponse>(`/accounting/master-records/organization-reporting-dimensions/branches?${params.toString()}`);
}

export async function getBranchDetail(branchId: number | string): Promise<BranchDetail> {
  return fetchAccountingAdmin<BranchDetail>(`/accounting/branches/${branchId}`);
}

export async function createBranch(input: CreateBranchInput): Promise<BranchDetail> {
  return fetchAccountingAdmin<BranchDetail>('/accounting/branches', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      branchCode: input.branchCode.trim().toUpperCase(),
      name: input.name.trim(),
      address: typeof input.address === 'string' ? input.address.trim() || null : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    }),
  });
}

export async function updateBranch(branchId: number | string, input: UpdateBranchInput): Promise<BranchDetail> {
  return fetchAccountingAdmin<BranchDetail>(`/accounting/branches/${branchId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...input,
      branchCode: input.branchCode.trim().toUpperCase(),
      name: input.name.trim(),
      address: typeof input.address === 'string' ? input.address.trim() || null : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    }),
  });
}

export async function deleteBranch(branchId: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/branches/${branchId}`, { method: 'DELETE' });
}

export async function getDepartmentsRegister(query: { search?: string; statuses?: string[]; branchIds?: (number | string)[]; branchFilters?: string[]; quickFilters?: string[]; page?: number; limit?: number } = {}): Promise<DepartmentsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const b of query.branchIds || []) params.append('branchId', String(b));
  for (const bf of query.branchFilters || []) params.append('branchFilter', bf);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<DepartmentsRegisterResponse>(`/accounting/master-records/organization-reporting-dimensions/departments?${params.toString()}`);
}

export async function getDepartmentDetail(departmentId: number | string): Promise<DepartmentDetail> {
  return fetchAccountingAdmin<DepartmentDetail>(`/accounting/departments/${departmentId}`);
}

export async function createDepartment(input: CreateDepartmentInput): Promise<DepartmentDetail> {
  return fetchAccountingAdmin<DepartmentDetail>('/accounting/departments', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      departmentCode: input.departmentCode.trim().toUpperCase(),
      name: input.name.trim(),
      branch: input.branch !== undefined && input.branch !== '' ? Number(input.branch) : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    }),
  });
}

export async function updateDepartment(departmentId: number | string, input: UpdateDepartmentInput): Promise<DepartmentDetail> {
  return fetchAccountingAdmin<DepartmentDetail>(`/accounting/departments/${departmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...input,
      departmentCode: input.departmentCode.trim().toUpperCase(),
      name: input.name.trim(),
      branch: input.branch !== undefined && input.branch !== '' ? Number(input.branch) : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    }),
  });
}

export async function deleteDepartment(departmentId: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/departments/${departmentId}`, { method: 'DELETE' });
}

export async function getLocationsRegister(query: { search?: string; statuses?: string[]; branchIds?: (number | string)[]; branchFilters?: string[]; quickFilters?: string[]; page?: number; limit?: number } = {}): Promise<LocationsRegisterResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const s of query.statuses || []) params.append('status', s);
  for (const b of query.branchIds || []) params.append('branchId', String(b));
  for (const bf of query.branchFilters || []) params.append('branchFilter', bf);
  for (const q of query.quickFilters || []) params.append('quickFilter', q);
  params.set('page', String(query.page || 1));
  params.set('limit', '10');
  return fetchAccountingAdmin<LocationsRegisterResponse>(`/accounting/master-records/organization-reporting-dimensions/locations?${params.toString()}`);
}

export async function getLocationDetail(locationId: number | string): Promise<LocationDetail> {
  return fetchAccountingAdmin<LocationDetail>(`/accounting/locations/${locationId}`);
}

export async function createLocation(input: CreateLocationInput): Promise<LocationDetail> {
  return fetchAccountingAdmin<LocationDetail>('/accounting/locations', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      locationCode: input.locationCode.trim().toUpperCase(),
      name: input.name.trim(),
      branch: input.branch !== undefined && input.branch !== '' ? Number(input.branch) : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    }),
  });
}

export async function updateLocation(locationId: number | string, input: UpdateLocationInput): Promise<LocationDetail> {
  return fetchAccountingAdmin<LocationDetail>(`/accounting/locations/${locationId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...input,
      locationCode: input.locationCode.trim().toUpperCase(),
      name: input.name.trim(),
      branch: input.branch !== undefined && input.branch !== '' ? Number(input.branch) : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
    }),
  });
}

export async function deleteLocation(locationId: number | string): Promise<{ success: boolean }> {
  return fetchAccountingAdmin<{ success: boolean }>(`/accounting/locations/${locationId}`, { method: 'DELETE' });
}
