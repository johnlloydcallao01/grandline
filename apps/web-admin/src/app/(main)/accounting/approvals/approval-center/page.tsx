'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ApprovalsPage, type ApprovalTab } from '../_components/ApprovalsPage';
import { ApprovalQueueClient } from './ApprovalQueueClient';

const otherTabs: ApprovalTab[] = [
  {
    id: 'approval-requests',
    label: 'Approval Requests',
    description: 'Review approval-request records across pending, approved, and rejected states including workflow link, requester, current approver, and request timestamp.',
    searchPlaceholder: 'Search entity type, entity id, workflow, requested by, current approver, or status',
    filters: ['All Requests', 'Pending', 'Approved', 'Rejected'],
    actions: [
      { label: 'Request Approval', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Requests', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open Requests', value: '12', change: 'Requests still awaiting resolution', trend: 'neutral' },
      { label: 'Approved', value: '28', change: 'Resolved approval requests with approval outcome', trend: 'up' },
      { label: 'Rejected', value: '6', change: 'Requests declined or returned', trend: 'down' },
      { label: 'Workflow Linked', value: '46', change: 'Requests carrying an approval workflow relation', trend: 'up' },
    ],
    tableTitle: 'Approval Request Register',
    tableDescription: 'Approval-request register aligned to `approvalRequests`, including workflow relationship, request state, requester, and current approver.',
    columns: ['Workflow', 'Entity Type', 'Entity ID', 'Requested By', 'Current Approver', 'Status'],
    rows: [
      { id: 'req-1', cells: [{ text: 'WF-INV-001', emphasis: true }, 'invoice', { text: 'INV-2026-0418', emphasis: true }, 'ops.manager', 'finance.manager', { text: 'Pending', tone: 'amber' }] },
      { id: 'req-2', cells: [{ text: 'WF-EXP-001', emphasis: true }, 'expense', { text: 'EXP-2026-0194', emphasis: true }, 'expense.ops', 'controller', { text: 'Pending', tone: 'amber' }] },
      { id: 'req-3', cells: [{ text: 'WF-JRN-001', emphasis: true }, 'journal', { text: 'JE-2026-0904', emphasis: true }, 'senior.acct', 'finance.manager', { text: 'Approved', tone: 'green' }] },
      { id: 'req-4', cells: [{ text: 'WF-BGT-001', emphasis: true }, 'budget', { text: 'BUD-2026-001', emphasis: true }, 'budget.owner', 'finance.director', { text: 'Rejected', tone: 'red' }] },
    ],
  },
  {
    id: 'resolution-trail',
    label: 'Resolution Trail',
    description: 'Trace approval-trail decisions by step number, approver, decision, notes, and action timestamp.',
    searchPlaceholder: 'Search request id, step number, approver, decision, notes, or acted date',
    filters: ['Latest Trail', 'Approved Steps', 'Rejected Steps', 'With Notes'],
    actions: [
      { label: 'Refresh Trail', icon: 'refresh', variant: 'secondary' },
      { label: 'Download Trail', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Trail Entries', value: '94', change: 'Recorded workflow decisions across requests', trend: 'up' },
      { label: 'Approved Steps', value: '76', change: 'Trail rows with approved decisions', trend: 'up' },
      { label: 'Rejected Steps', value: '8', change: 'Trail rows with rejected decisions', trend: 'down' },
      { label: 'Notes Captured', value: '41', change: 'Decision rows carrying written notes', trend: 'neutral' },
    ],
    tableTitle: 'Approval Resolution Trail',
    tableDescription: 'Decision-level history aligned to the `approvalTrail` array stored on approval requests.',
    columns: ['Request ID', 'Step', 'Approver', 'Decision', 'Acted At', 'Notes'],
    rows: [
      { id: 'trail-1', cells: [{ text: 'AREQ-2026-0418', emphasis: true }, '1', 'finance.manager', { text: 'Approved', tone: 'green' }, '2026-06-01 09:45', 'Amount and supporting documents verified.' ] },
      { id: 'trail-2', cells: [{ text: 'AREQ-2026-0419', emphasis: true }, '2', 'controller', { text: 'Rejected', tone: 'red' }, '2026-06-01 10:12', 'Missing receipt attachment. Please resubmit.' ] },
      { id: 'trail-3', cells: [{ text: 'AREQ-2026-0420', emphasis: true }, '1', 'ops.director', { text: 'Approved', tone: 'green' }, '2026-06-01 11:30', '' ] },
      { id: 'trail-4', cells: [{ text: 'AREQ-2026-0421', emphasis: true }, '1', 'hr.finance.lead', { text: 'Approved', tone: 'green' }, '2026-06-01 14:05', 'Payroll verified against attendance records.' ] },
    ],
  },
];

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
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-sm font-medium text-blue-600">Operations / Approvals</p><div className="mt-2 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-gray-900">Approval Center</h1><p className="mt-1 max-w-3xl text-sm text-gray-600">Review the live approval queue, request register, and resolution trail supported by the accounting approval service and approval-request records.</p></div></div></div>
      </div>
      <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8" aria-label="Tabs">{TABS.map((tab) => { const isActive = activeTab === tab.id; return (<button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>); })}</nav></div>
      <div className="mt-6">{activeTab === 'approval-queue' ? <ApprovalQueueClient /> : <ApprovalsPage eyebrow="" title="" description="" tabs={otherTabs} />}</div>
    </div>
  );
}
