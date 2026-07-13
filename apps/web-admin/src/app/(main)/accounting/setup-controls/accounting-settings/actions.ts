'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type AccountRef = { id: number | string; code: string; name: string } | null;

export type AccountOption = {
  id: number | string;
  code: string;
  name: string;
  accountType: string;
};

export type AccountingSettingsData = {
  baseCurrency: string;
  timezone: string;
  journalNumberPrefix: string;
  customerNumberPrefix: string;
  vendorNumberPrefix: string;
  invoiceNumberPrefix: string;
  billNumberPrefix: string;
  paymentReceivedNumberPrefix: string;
  paymentMadeNumberPrefix: string;
  officialReceiptNumberPrefix: string;
  creditNoteNumberPrefix: string;
  vendorCreditNumberPrefix: string;
  refundNumberPrefix: string;
  depositNumberPrefix: string;
  transferNumberPrefix: string;
  openingBalanceSourceType: string;
  defaultSuspenseAccount: AccountRef;
  defaultReceivableAccount: AccountRef;
  defaultPayableAccount: AccountRef;
  defaultUndepositedFundsAccount: AccountRef;
  defaultOutputTaxAccount: AccountRef;
  defaultInputTaxAccount: AccountRef;
  retainedEarningsAccount: AccountRef;
  allowBackdatedPosting: boolean;
  defaultTaxBehavior: string;
};

export type AccountingSettingsResponse = {
  settings: AccountingSettingsData;
  chartOfAccounts: AccountOption[];
};

export type AccountingSettingsUpdate = {
  baseCurrency?: string;
  timezone?: string;
  journalNumberPrefix?: string;
  customerNumberPrefix?: string;
  vendorNumberPrefix?: string;
  invoiceNumberPrefix?: string;
  billNumberPrefix?: string;
  paymentReceivedNumberPrefix?: string;
  paymentMadeNumberPrefix?: string;
  officialReceiptNumberPrefix?: string;
  creditNoteNumberPrefix?: string;
  vendorCreditNumberPrefix?: string;
  refundNumberPrefix?: string;
  depositNumberPrefix?: string;
  transferNumberPrefix?: string;
  openingBalanceSourceType?: string;
  defaultSuspenseAccount?: number | string | null;
  defaultReceivableAccount?: number | string | null;
  defaultPayableAccount?: number | string | null;
  defaultUndepositedFundsAccount?: number | string | null;
  defaultOutputTaxAccount?: number | string | null;
  defaultInputTaxAccount?: number | string | null;
  retainedEarningsAccount?: number | string | null;
  allowBackdatedPosting?: boolean;
  defaultTaxBehavior?: string;
};

async function fetchAccountingAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('No admin session available.');
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load accounting settings.';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function fetchAccountingSettings(): Promise<AccountingSettingsResponse> {
  return fetchAccountingAdmin<AccountingSettingsResponse>(
    '/accounting/setup-controls/accounting-settings',
  );
}

export async function updateAccountingSettings(
  data: AccountingSettingsUpdate,
): Promise<AccountingSettingsResponse> {
  return fetchAccountingAdmin<AccountingSettingsResponse>(
    '/accounting/setup-controls/accounting-settings',
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
}
