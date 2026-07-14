'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import PayrollRunsClient from './PayrollRunsClient';
import PayrollEntriesClient from './PayrollEntriesClient';
import PayrollPostingClient from './PayrollPostingClient';

type TabId = 'payroll-runs' | 'payroll-entries' | 'payroll-posting';

const TABS: { id: TabId; label: string }[] = [
  { id: 'payroll-runs', label: 'Payroll Runs' },
  { id: 'payroll-entries', label: 'Payroll Entries' },
  { id: 'payroll-posting', label: 'Payroll Posting' },
];

export default function PayrollOperationsClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: TabId = TABS.find((tab) => tab.id === searchParams.get('tab'))?.id || 'payroll-runs';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Advanced Finance / Payroll & Contractor Finance</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Operations</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Post approved payroll runs to the General Ledger, review posting readiness by run status and entry count, and manage the posting lifecycle from approval through journal creation.
              </p>
            </div>
          </div>
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

      {activeTab === 'payroll-runs' ? (
        <PayrollRunsClient />
      ) : activeTab === 'payroll-entries' ? (
        <PayrollEntriesClient />
      ) : (
        <PayrollPostingClient />
      )}
    </div>
  );
}
