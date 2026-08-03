'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { SalesReportsClient } from './SalesReportsClient';
import { PurchaseReportsClient } from './PurchaseReportsClient';
import { ExpenseReportsClient } from './ExpenseReportsClient';
import { CashTaxAgingClient } from './CashTaxAgingClient';

type TabId = 'sales-reports' | 'purchase-reports' | 'expense-reports' | 'cash-tax-aging';

const TABS = [
  { id: 'sales-reports' as TabId, label: 'Sales Reports' },
  { id: 'purchase-reports' as TabId, label: 'Purchase Reports' },
  { id: 'expense-reports' as TabId, label: 'Expense Reports' },
  { id: 'cash-tax-aging' as TabId, label: 'Cash, Tax & Aging' },
];

export default function OperationalReportingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'sales-reports';

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Operational Reporting</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Review commercial, expense, cash, tax, and aging reports backed by the current exposed reporting endpoints and services.
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
        {activeTab === 'sales-reports' ? (
          <SalesReportsClient />
        ) : activeTab === 'purchase-reports' ? (
          <PurchaseReportsClient />
        ) : activeTab === 'expense-reports' ? (
          <ExpenseReportsClient />
        ) : (
          <CashTaxAgingClient />
        )}
      </div>
    </div>
  );
}
