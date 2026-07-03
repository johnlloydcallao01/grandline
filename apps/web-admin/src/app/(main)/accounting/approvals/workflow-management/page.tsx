'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { WorkflowDirectoryClient } from './WorkflowDirectoryClient';
import { WorkflowStepsClient } from './WorkflowStepsClient';
import { MockTabPanel, type MockTab } from './MockTabPanel';

type TabId = 'workflow-directory' | 'workflow-steps' | 'active-workflows';
const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'workflow-directory', label: 'Workflow Directory' },
  { id: 'workflow-steps', label: 'Workflow Steps' },
  { id: 'active-workflows', label: 'Active Workflows' },
];

const activeWorkflowsTab: MockTab = {
  id: 'active-workflows',
  label: 'Active Workflows',
  description: 'Focus on enabled workflow records that can be discovered when a request is submitted without an explicit workflow id.',
  searchPlaceholder: 'Search active workflow code, entity type, first approver, or current step count',
  filters: ['Active Only', 'Transactions', 'Operations', 'Multi-Step'],
  metrics: [
    { label: 'Eligible For Requests', value: '7', change: 'Active workflows discoverable by entity type', trend: 'up' },
    { label: 'Multi-Step Active', value: '4', change: 'Enabled workflows with more than one step', trend: 'up' },
    { label: 'First Approvers Set', value: '7', change: 'Active workflows carrying a first approver user', trend: 'up' },
    { label: 'Inactive Gaps', value: '1', change: 'Entity type currently missing active workflow coverage', trend: 'down' },
  ],
  tableTitle: 'Active Approval Coverage',
  tableDescription: 'Active workflow coverage aligned to the workflow lookup behavior that finds the first active workflow for a requested entity type.',
  columns: ['Entity Type', 'Workflow Code', 'Workflow Name', 'First Approver', 'Step Count', 'Status'],
  rows: [
    { id: 'active-1', cells: ['invoice', { text: 'WF-INV-001', emphasis: true }, 'Invoice Revenue Review', 'finance.manager', { text: '2', align: 'right' }, { text: 'Active', tone: 'green' }] },
    { id: 'active-2', cells: ['expense', { text: 'WF-EXP-001', emphasis: true }, 'Expense Approval Flow', 'controller', { text: '2', align: 'right' }, { text: 'Active', tone: 'green' }] },
    { id: 'active-3', cells: ['timesheet', { text: 'WF-TS-001', emphasis: true }, 'Timesheet Sign-Off', 'ops.director', { text: '1', align: 'right' }, { text: 'Active', tone: 'green' }] },
    { id: 'active-4', cells: ['asset_disposal', { text: 'WF-AD-001', emphasis: true }, 'Asset Disposal Review', 'controller', { text: '2', align: 'right' }, { text: 'Inactive', tone: 'gray' }] },
  ],
};

export default function WorkflowManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'workflow-directory';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Approvals</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Review approval workflow templates, step assignments, and active workflow coverage used by the accounting approval service.</p>
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
        {activeTab === 'workflow-directory' && <WorkflowDirectoryClient />}
        {activeTab === 'workflow-steps' && <WorkflowStepsClient />}
        {activeTab === 'active-workflows' && <MockTabPanel tab={activeWorkflowsTab} />}
      </div>
    </div>
  );
}
