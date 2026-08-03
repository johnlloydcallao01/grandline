'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import DepreciationSchedulesClient from './DepreciationSchedulesClient';
import DepreciationEntriesClient from './DepreciationEntriesClient';
import AssetRegisterReportClient from './AssetRegisterReportClient';

type TabId = 'depreciation-schedules' | 'depreciation-entries' | 'asset-register-report';

const TABS: { id: TabId; label: string }[] = [
  { id: 'depreciation-schedules', label: 'Depreciation Schedules' },
  { id: 'depreciation-entries', label: 'Depreciation Entries' },
  { id: 'asset-register-report', label: 'Asset Register Report' },
];

export default function DepreciationReportingClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: TabId = TABS.find((tab) => tab.id === searchParams.get('tab'))?.id || 'depreciation-schedules';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Advanced Finance / Fixed Assets</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-blue-700 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Depreciation & Reporting</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Review generated depreciation schedules, posted depreciation entries, and asset-register reporting output grounded in the current fixed-asset backend.
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'depreciation-schedules' ? (
        <DepreciationSchedulesClient />
      ) : activeTab === 'depreciation-entries' ? (
        <DepreciationEntriesClient />
      ) : (
        <AssetRegisterReportClient />
      )}
    </div>
  );
}
