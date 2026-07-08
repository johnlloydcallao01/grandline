'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Advanced Finance / Fixed Assets</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Depreciation & Reporting</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Review generated depreciation schedules, posted depreciation entries, and asset-register reporting output grounded in the current fixed-asset backend.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => {}} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            Refresh Workspace
          </button>
          <button type="button" onClick={() => {}} className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
            <Download className="h-4 w-4" />
            Export Asset Report
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
