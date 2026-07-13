'use server'

import { getServerToken } from '@/app/actions/auth'
import { env } from '@/lib/env'

export type PeriodSummary = {
  id: number | string
  periodNumber: number
  label: string
  status: string
  startDate: string
  endDate: string
  lockedFromDate: string | null
  closedAt: string | null
}

export type FiscalYearSummary = {
  id: number | string
  code: string
  name: string
  status: string
  closeMode: string
  lockedFromDate: string | null
  closedAt: string | null
  startDate: string
  endDate: string
  periods: PeriodSummary[]
}

export type CloseApprovalCounts = {
  openPeriods: number
  closedPeriods: number
  softLockedPeriods: number
  draftPeriods: number
  openFiscalYears: number
  closedFiscalYears: number
  draftFiscalYears: number
  lockedDatesSet: number
}

export type CloseApprovalStateResponse = {
  fiscalYears: FiscalYearSummary[]
  counts: CloseApprovalCounts
}

export type WorkflowInfo = {
  workflowCode: string
  name: string
  stepCount: number
}

export type EntityCoverageItem = {
  entityType: string
  entityLabel: string
  hasActiveWorkflow: boolean
  activeWorkflowCount: number
  workflows: WorkflowInfo[]
  needsWorkflow: boolean
}

export type SafeguardInfo = {
  area: string
  protectedAction: string
  condition: string
  behavior: string
  source: string
}

export type ApprovalCoverageCounts = {
  totalEntityTypes: number
  coveredTypes: number
  gapTypes: number
  totalActiveWorkflows: number
  totalStepsConfigured: number
}

export type ApprovalCoverageResponse = {
  entityCoverage: EntityCoverageItem[]
  safeguards: SafeguardInfo[]
  counts: ApprovalCoverageCounts
}

export type CloseReopenResponse = {
  success: boolean
  target: string
  record?: Record<string, unknown>
  error?: string
}

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken()
  if (!token) throw new Error('No admin session available.')

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Request failed.'
    throw new Error(errorMessage)
  }

  return payload as T
}

export async function fetchCloseApprovalState(): Promise<CloseApprovalStateResponse> {
  return fetchAccountingAdmin<CloseApprovalStateResponse>(
    '/accounting/setup-controls/close-approval-state',
  )
}

export async function fetchApprovalCoverage(): Promise<ApprovalCoverageResponse> {
  return fetchAccountingAdmin<ApprovalCoverageResponse>(
    '/accounting/setup-controls/approval-coverage',
  )
}

export async function closePeriod(
  periodId: number | string,
  lockedFromDate?: string,
): Promise<CloseReopenResponse> {
  return fetchAccountingAdmin<CloseReopenResponse>(
    '/accounting/setup-controls/close-approval-controls/close',
    {
      method: 'POST',
      body: JSON.stringify({ target: 'period', periodId, lockedFromDate }),
    },
  )
}

export async function reopenPeriod(
  periodId: number | string,
  clearLockDate?: boolean,
): Promise<CloseReopenResponse> {
  return fetchAccountingAdmin<CloseReopenResponse>(
    '/accounting/setup-controls/close-approval-controls/reopen',
    {
      method: 'POST',
      body: JSON.stringify({ target: 'period', periodId, clearLockDate }),
    },
  )
}

export async function closeFiscalYear(
  fiscalYearId: number | string,
  lockedFromDate?: string,
): Promise<CloseReopenResponse> {
  return fetchAccountingAdmin<CloseReopenResponse>(
    '/accounting/setup-controls/close-approval-controls/close',
    {
      method: 'POST',
      body: JSON.stringify({ target: 'fiscalYear', fiscalYearId, lockedFromDate }),
    },
  )
}

export async function reopenFiscalYear(
  fiscalYearId: number | string,
  clearLockDate?: boolean,
): Promise<CloseReopenResponse> {
  return fetchAccountingAdmin<CloseReopenResponse>(
    '/accounting/setup-controls/close-approval-controls/reopen',
    {
      method: 'POST',
      body: JSON.stringify({ target: 'fiscalYear', fiscalYearId, clearLockDate }),
    },
  )
}
