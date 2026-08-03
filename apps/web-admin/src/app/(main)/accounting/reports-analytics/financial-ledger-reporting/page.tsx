'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { TrialBalanceClient } from './TrialBalanceClient';
import { GeneralLedgerClient } from './GeneralLedgerClient';
import { AssetRegisterClient } from './AssetRegisterClient';

type TabId = 'trial-balance' | 'general-ledger' | 'asset-register';

const TABS = [
  { id: 'trial-balance' as TabId, label: 'Trial Balance' },
  { id: 'general-ledger' as TabId, label: 'General Ledger' },
  { id: 'asset-register' as TabId, label: 'Asset Register' },
];

export default function FinancialLedgerReportingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'trial-balance';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Operations / Reports & Analytics</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial & Ledger Reporting</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Review ledger-oriented accounting reports supported by trial-balance, general-ledger, and asset-register backend capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'trial-balance' ? (
          <TrialBalanceClient />
        ) : activeTab === 'general-ledger' ? (
          <GeneralLedgerClient />
        ) : (
          <AssetRegisterClient />
        )}
      </div>
    </div>
  );
}
