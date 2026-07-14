'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ApprovalQueueClient } from './ApprovalQueueClient';
import { ApprovalRequestsClient } from './ApprovalRequestsClient';
import { ResolutionTrailClient } from './ResolutionTrailClient';

type TabId = 'approval-queue' | 'approval-requests' | 'resolution-trail';
const TABS = [
  { id: 'approval-queue' as TabId, label: 'Approval Queue' },
  { id: 'approval-requests' as TabId, label: 'Approval Requests' },
  { id: 'resolution-trail' as TabId, label: 'Resolution Trail' },
];

export default function ApprovalCenterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'approval-queue';
  const handleTabChange = (tabId: TabId) => { const params = new URLSearchParams(searchParams.toString()); params.set('tab', tabId); router.push(`${pathname}?${params.toString()}`); };

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-sm font-medium text-blue-600">Operations / Approvals</p><div className="mt-2 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-gray-900">Approval Center</h1><p className="mt-1 max-w-3xl text-sm text-gray-600">Review the live approval queue, request register, and resolution trail supported by the accounting approval service.</p></div></div></div>
      </div>
      <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8" aria-label="Tabs">{TABS.map((tab) => (<button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>))}</nav></div>
      <div className="mt-6">
        {activeTab === 'approval-queue' ? <ApprovalQueueClient /> : activeTab === 'approval-requests' ? <ApprovalRequestsClient /> : <ResolutionTrailClient />}
      </div>
    </div>
  );
}
