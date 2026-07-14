'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { TransactionsClient } from './TransactionsClient';
import { OperationalCoverageClient } from './OperationalCoverageClient';

type TabId = 'transactions' | 'operations';
const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'transactions', label: 'Transaction Coverage' },
  { id: 'operations', label: 'Operational Coverage' },
];

export default function EntityApprovalCoveragePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'transactions';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Administration / Approval Configuration</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entity Approval Coverage</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Review the entity types and their associated approval workflows configured in the accounting system.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'transactions' && <TransactionsClient />}
        {activeTab === 'operations' && <OperationalCoverageClient />}
      </div>
    </div>
  );
}
