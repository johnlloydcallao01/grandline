'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ProjectExpensesClient } from './ProjectExpensesClient';
import { MockTabPanel, type MockTab } from '../../approvals/workflow-management/MockTabPanel';

type TabId = 'project-expenses' | 'project-billing' | 'project-profitability';
const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'project-expenses', label: 'Project Expenses' },
  { id: 'project-billing', label: 'Project Billing' },
  { id: 'project-profitability', label: 'Project Profitability' },
];

const billingTab: MockTab = { id: 'proj-billing', label: 'Project Billing', description: 'Review posted and collectible project-linked invoices used as the revenue side of project profitability.', searchPlaceholder: 'Search project, invoice number, customer, total, or status', filters: ['Project Billing', 'Posted', 'Partially Paid', 'Paid'],
  metrics: [{ label: 'Project Invoices', value: '31', change: 'Posted project-linked invoices', trend: 'up' }, { label: 'Total Revenue', value: 'PHP 5.4M', change: 'Combined revenue from project invoices', trend: 'up' }, { label: 'Outstanding Balance', value: 'PHP 1.2M', change: 'Unpaid portion of project invoices', trend: 'down' }, { label: 'Projects With Revenue', value: '12', change: 'Projects generating invoice revenue', trend: 'up' }],
  tableTitle: 'Project Billing Register', tableDescription: 'Invoice rows aligned to project-linked records in accounting-invoices.', columns: ['Invoice Number', 'Project', 'Customer', 'Total', 'Balance Due', 'Status'],
  rows: [{ id: 'pb1', cells: [{ text: 'INV-2026-0151', emphasis: true }, 'BlueWave Cadet Cohort 1', 'BlueWave Manning Services', { text: 'PHP 320,000', align: 'right' }, { text: 'PHP 80,000', align: 'right' }, { text: 'partially_paid', tone: 'amber' }] }, { id: 'pb2', cells: [{ text: 'INV-2026-0167', emphasis: true }, 'Oceanic Fleet Upskilling', 'Oceanic Fleet Management', { text: 'PHP 450,000', align: 'right' }, { text: 'PHP 0', align: 'right' }, { text: 'paid', tone: 'green' }] }, { id: 'pb3', cells: [{ text: 'INV-2026-0182', emphasis: true }, 'Simulator Lab Rollout', 'Grandline Capital Program', { text: 'PHP 168,000', align: 'right' }, { text: 'PHP 168,000', align: 'right' }, { text: 'posted', tone: 'blue' }] }, { id: 'pb4', cells: [{ text: 'INV-2026-0191', emphasis: true }, 'Corporate Cadet Program', 'BlueWave Manning Services', { text: 'PHP 280,000', align: 'right' }, { text: 'PHP 120,000', align: 'right' }, { text: 'partially_paid', tone: 'amber' }] }],
};

const profitabilityTab: MockTab = { id: 'proj-profit', label: 'Project Profitability', description: 'Review computed project profitability using revenue from invoices and costs from expenses, payroll, and time entries.', searchPlaceholder: 'Search project, revenue, cost, margin, or status', filters: ['Profitability', 'Positive Margin', 'Negative Margin', 'Budget Over'],
  metrics: [{ label: 'Profitable Projects', value: '9', change: 'Projects with positive gross margin', trend: 'up' }, { label: 'Total Revenue', value: 'PHP 5.4M', change: 'Combined revenue from all active projects', trend: 'up' }, { label: 'Total Cost', value: 'PHP 3.8M', change: 'Expenses + payroll + time costs', trend: 'neutral' }, { label: 'Avg Margin %', value: '29.6%', change: 'Average gross margin across active projects', trend: 'up' }],
  tableTitle: 'Project Profitability', tableDescription: 'Computed project profitability data from the AccountingProjectProfitabilityService.', columns: ['Project', 'Revenue', 'Total Cost', 'Gross Profit', 'Margin %', 'Budget'],
  rows: [{ id: 'pp1', cells: ['BlueWave Cadet Cohort 1', { text: 'PHP 1.2M', align: 'right' }, { text: 'PHP 840K', align: 'right' }, { text: 'PHP 360K', align: 'right' }, { text: '30%', align: 'right' }, { text: 'PHP 2.5M', align: 'right' }] }, { id: 'pp2', cells: ['Oceanic Fleet Upskilling', { text: 'PHP 450K', align: 'right' }, { text: 'PHP 335K', align: 'right' }, { text: 'PHP 115K', align: 'right' }, { text: '25.6%', align: 'right' }, { text: '–', align: 'right' }] }, { id: 'pp3', cells: ['Corporate Cadet Program', { text: 'PHP 840K', align: 'right' }, { text: 'PHP 560K', align: 'right' }, { text: 'PHP 280K', align: 'right' }, { text: '33.3%', align: 'right' }, { text: 'PHP 3.5M', align: 'right' }] }, { id: 'pp4', cells: ['Simulator Lab Rollout', { text: 'PHP 168K', align: 'right' }, { text: 'PHP 195K', align: 'right' }, { text: '-PHP 27K', align: 'right' }, { text: '-16.1%', align: 'right' }, { text: 'PHP 1.5M', align: 'right' }] }],
};

export default function ProjectFinancePage() {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab'); const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'project-expenses';
  const handleTabChange = (tabId: TabId) => { const p = new URLSearchParams(searchParams.toString()); p.set('tab', tabId); router.push(`${pathname}?${p.toString()}`); };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-sm font-medium text-blue-600">Advanced Finance / Projects &#38; Time</p><div className="mt-2 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-gray-900">Project Finance</h1><p className="mt-1 max-w-3xl text-sm text-gray-600">Review project-linked expenses, billing, and profitability calculations for project costing and margin analysis.</p></div></div></div>
      </div>
      <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8" aria-label="Tabs">{TABS.map((tab) => (<button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>))}</nav></div>
      <div className="mt-6">
        {activeTab === 'project-expenses' && <ProjectExpensesClient />}
        {activeTab === 'project-billing' && <MockTabPanel tab={billingTab} />}
        {activeTab === 'project-profitability' && <MockTabPanel tab={profitabilityTab} />}
      </div>
    </div>
  );
}
