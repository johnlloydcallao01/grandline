'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Landmark } from 'lucide-react';
import { CashFlowPanel } from './CashFlowPanel';
import { ReconciliationsPanel } from './ReconciliationsPanel';

type TabId = 'reconciliations' | 'cash-flow';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'reconciliations', label: 'Reconciliations' },
  { id: 'cash-flow', label: 'Cash Flow' },
];

export function ReconciliationCashPositionClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = rawTab === 'cash-flow' ? 'cash-flow' : 'reconciliations';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Operations / Banking & Cash</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-400">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reconciliation & Cash Position</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Monitor bank reconciliations and overall cash position so finance teams can keep balances aligned and liquidity visible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-[var(--card-border)] px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6 p-[10px]">
          {activeTab === 'reconciliations' ? <ReconciliationsPanel /> : <CashFlowPanel />}
        </div>
      </div>
    </div>
  );
}
