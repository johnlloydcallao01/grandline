'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import {
  fetchAccountingSettings,
  updateAccountingSettings,
  type AccountingSettingsData,
  type AccountOption,
} from './actions';

type FormState = AccountingSettingsData;

const OPENING_BALANCE_SOURCE_OPTIONS = [
  { label: 'Opening Balance', value: 'opening_balance' },
  { label: 'Manual', value: 'manual' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Reversal', value: 'reversal' },
  { label: 'System', value: 'system' },
];

const TAX_BEHAVIOR_OPTIONS = [
  { label: 'Exclusive', value: 'exclusive' },
  { label: 'Inclusive', value: 'inclusive' },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 h-5 w-48 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: i === 1 ? 12 : 3 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-9 w-full animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FieldLabel({ label, htmlFor }: { label: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}

function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function AccountPicker({
  id,
  value,
  onChange,
  accounts,
}: {
  id: string;
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  accounts: AccountOption[];
}) {
  return (
    <select
      id={id}
      value={value == null ? '' : String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw) { onChange(null); return; }
        const parsed = Number(raw);
        onChange(Number.isFinite(parsed) ? parsed : raw);
      }}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="">-- None --</option>
      {accounts.map((acc) => (
        <option key={String(acc.id)} value={String(acc.id)}>
          {acc.code} &mdash; {acc.name} ({acc.accountType})
        </option>
      ))}
    </select>
  );
}

export function AccountingSettingsClient() {
  const [form, setForm] = useState<FormState | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAccountingSettings();
      setForm(response.settings);
      setAccounts(response.chartOfAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const updatePayload: Record<string, unknown> = {
        baseCurrency: form.baseCurrency,
        timezone: form.timezone,
        journalNumberPrefix: form.journalNumberPrefix,
        customerNumberPrefix: form.customerNumberPrefix,
        vendorNumberPrefix: form.vendorNumberPrefix,
        invoiceNumberPrefix: form.invoiceNumberPrefix,
        billNumberPrefix: form.billNumberPrefix,
        paymentReceivedNumberPrefix: form.paymentReceivedNumberPrefix,
        paymentMadeNumberPrefix: form.paymentMadeNumberPrefix,
        officialReceiptNumberPrefix: form.officialReceiptNumberPrefix,
        creditNoteNumberPrefix: form.creditNoteNumberPrefix,
        vendorCreditNumberPrefix: form.vendorCreditNumberPrefix,
        refundNumberPrefix: form.refundNumberPrefix,
        depositNumberPrefix: form.depositNumberPrefix,
        transferNumberPrefix: form.transferNumberPrefix,
        openingBalanceSourceType: form.openingBalanceSourceType,
        defaultSuspenseAccount: form.defaultSuspenseAccount?.id ?? null,
        defaultReceivableAccount: form.defaultReceivableAccount?.id ?? null,
        defaultPayableAccount: form.defaultPayableAccount?.id ?? null,
        defaultUndepositedFundsAccount: form.defaultUndepositedFundsAccount?.id ?? null,
        defaultOutputTaxAccount: form.defaultOutputTaxAccount?.id ?? null,
        defaultInputTaxAccount: form.defaultInputTaxAccount?.id ?? null,
        retainedEarningsAccount: form.retainedEarningsAccount?.id ?? null,
        allowBackdatedPosting: form.allowBackdatedPosting,
        defaultTaxBehavior: form.defaultTaxBehavior,
      };

      const response = await updateAccountingSettings(updatePayload);
      setForm(response.settings);
      setAccounts(response.chartOfAccounts);
      addToast({ title: 'Settings saved', message: 'Accounting settings have been updated successfully.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Failed to save', message: err instanceof Error ? err.message : 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [form, addToast]);

  const hasChanges = true;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">Core / Setup & Controls</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Accounting Settings</h1>
          <p className="mt-1 text-base text-gray-600">
            Configure accounting-wide defaults for journals, numbering, default accounts, and posting
            behavior.
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Setup & Controls</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Accounting Settings</h1>
          <p className="mt-1 text-base text-gray-600">
            Configure accounting-wide defaults for journals, numbering, default accounts, and posting
            behavior.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {form ? (
        <div className="space-y-6">
          <SectionCard title="General Configuration">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel label="Base Currency" htmlFor="baseCurrency" />
                <TextInput id="baseCurrency" value={form.baseCurrency} onChange={(v) => updateField('baseCurrency', v)} placeholder="PHP" />
              </div>
              <div>
                <FieldLabel label="Timezone" htmlFor="timezone" />
                <TextInput id="timezone" value={form.timezone} onChange={(v) => updateField('timezone', v)} placeholder="Asia/Manila" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Numbering Prefixes">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel label="Journal" htmlFor="journalNumberPrefix" />
                <TextInput id="journalNumberPrefix" value={form.journalNumberPrefix} onChange={(v) => updateField('journalNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Invoice" htmlFor="invoiceNumberPrefix" />
                <TextInput id="invoiceNumberPrefix" value={form.invoiceNumberPrefix} onChange={(v) => updateField('invoiceNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Bill" htmlFor="billNumberPrefix" />
                <TextInput id="billNumberPrefix" value={form.billNumberPrefix} onChange={(v) => updateField('billNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Payment Received" htmlFor="paymentReceivedNumberPrefix" />
                <TextInput id="paymentReceivedNumberPrefix" value={form.paymentReceivedNumberPrefix} onChange={(v) => updateField('paymentReceivedNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Payment Made" htmlFor="paymentMadeNumberPrefix" />
                <TextInput id="paymentMadeNumberPrefix" value={form.paymentMadeNumberPrefix} onChange={(v) => updateField('paymentMadeNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Official Receipt" htmlFor="officialReceiptNumberPrefix" />
                <TextInput id="officialReceiptNumberPrefix" value={form.officialReceiptNumberPrefix} onChange={(v) => updateField('officialReceiptNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Credit Note" htmlFor="creditNoteNumberPrefix" />
                <TextInput id="creditNoteNumberPrefix" value={form.creditNoteNumberPrefix} onChange={(v) => updateField('creditNoteNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Vendor Credit" htmlFor="vendorCreditNumberPrefix" />
                <TextInput id="vendorCreditNumberPrefix" value={form.vendorCreditNumberPrefix} onChange={(v) => updateField('vendorCreditNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Refund" htmlFor="refundNumberPrefix" />
                <TextInput id="refundNumberPrefix" value={form.refundNumberPrefix} onChange={(v) => updateField('refundNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Deposit" htmlFor="depositNumberPrefix" />
                <TextInput id="depositNumberPrefix" value={form.depositNumberPrefix} onChange={(v) => updateField('depositNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Transfer" htmlFor="transferNumberPrefix" />
                <TextInput id="transferNumberPrefix" value={form.transferNumberPrefix} onChange={(v) => updateField('transferNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Customer Number" htmlFor="customerNumberPrefix" />
                <TextInput id="customerNumberPrefix" value={form.customerNumberPrefix} onChange={(v) => updateField('customerNumberPrefix', v)} />
              </div>
              <div>
                <FieldLabel label="Vendor Number" htmlFor="vendorNumberPrefix" />
                <TextInput id="vendorNumberPrefix" value={form.vendorNumberPrefix} onChange={(v) => updateField('vendorNumberPrefix', v)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Default Accounts">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel label="Suspense Account" htmlFor="defaultSuspenseAccount" />
                <AccountPicker id="defaultSuspenseAccount" value={form.defaultSuspenseAccount?.id ?? null} onChange={(v) => updateField('defaultSuspenseAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
              <div>
                <FieldLabel label="Receivable Account" htmlFor="defaultReceivableAccount" />
                <AccountPicker id="defaultReceivableAccount" value={form.defaultReceivableAccount?.id ?? null} onChange={(v) => updateField('defaultReceivableAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
              <div>
                <FieldLabel label="Payable Account" htmlFor="defaultPayableAccount" />
                <AccountPicker id="defaultPayableAccount" value={form.defaultPayableAccount?.id ?? null} onChange={(v) => updateField('defaultPayableAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
              <div>
                <FieldLabel label="Undeposited Funds Account" htmlFor="defaultUndepositedFundsAccount" />
                <AccountPicker id="defaultUndepositedFundsAccount" value={form.defaultUndepositedFundsAccount?.id ?? null} onChange={(v) => updateField('defaultUndepositedFundsAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
              <div>
                <FieldLabel label="Output Tax Account" htmlFor="defaultOutputTaxAccount" />
                <AccountPicker id="defaultOutputTaxAccount" value={form.defaultOutputTaxAccount?.id ?? null} onChange={(v) => updateField('defaultOutputTaxAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
              <div>
                <FieldLabel label="Input Tax Account" htmlFor="defaultInputTaxAccount" />
                <AccountPicker id="defaultInputTaxAccount" value={form.defaultInputTaxAccount?.id ?? null} onChange={(v) => updateField('defaultInputTaxAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
              <div>
                <FieldLabel label="Retained Earnings Account" htmlFor="retainedEarningsAccount" />
                <AccountPicker id="retainedEarningsAccount" value={form.retainedEarningsAccount?.id ?? null} onChange={(v) => updateField('retainedEarningsAccount', v !== null && v !== undefined ? { id: v, code: '', name: '' } : null)} accounts={accounts} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Posting & Tax Behavior">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel label="Default Tax Behavior" htmlFor="defaultTaxBehavior" />
                <SelectInput id="defaultTaxBehavior" value={form.defaultTaxBehavior} onChange={(v) => updateField('defaultTaxBehavior', v)} options={TAX_BEHAVIOR_OPTIONS} />
              </div>
              <div>
                <FieldLabel label="Opening Balance Source Type" htmlFor="openingBalanceSourceType" />
                <SelectInput id="openingBalanceSourceType" value={form.openingBalanceSourceType} onChange={(v) => updateField('openingBalanceSourceType', v)} options={OPENING_BALANCE_SOURCE_OPTIONS} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.allowBackdatedPosting}
                    onChange={(e) => updateField('allowBackdatedPosting', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Backdated Posting</span>
                </label>
              </div>
            </div>
          </SectionCard>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={loadSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
