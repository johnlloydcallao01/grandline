'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ReportsAnalyticsPage, type ReportsAnalyticsTab } from '../_components/ReportsAnalyticsPage';
import { BudgetVsActualClient } from './BudgetVsActualClient';

const projectProfitabilityTab: ReportsAnalyticsTab[] = [
  {
    id: 'project-profitability',
    label: 'Project Profitability',
    description: 'Review project profitability output using project revenue, expenses, payroll cost, time cost, and gross margin.',
    searchPlaceholder: 'Search project code, project name, status, revenue, cost, or margin',
    filters: ['Project Profitability', 'Active', 'Positive Margin', 'Negative Margin'],
    actions: [
      { label: 'Open Project Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Projects', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Projects In Scope', value: '9', change: 'Projects with profitability data available', trend: 'up' },
      { label: 'Revenue', value: 'PHP 9.86M', change: 'Posted invoice revenue linked to projects', trend: 'up' },
      { label: 'Total Cost', value: 'PHP 6.24M', change: 'Expense, payroll, and time cost combined', trend: 'up' },
      { label: 'Gross Profit', value: 'PHP 3.62M', change: 'Profitability service output', trend: 'neutral' },
    ],
    tableTitle: 'Project Profitability Analysis',
    tableDescription: 'Profitability view aligned to project, invoice, expense, payroll-entry, time-entry, and budget support in apps/cms.',
    columns: ['Project Code', 'Project Name', 'Revenue', 'Total Cost', 'Gross Profit', 'Status'],
    rows: [
      { id: 'pp-1', cells: [{ text: 'PRJ-007', emphasis: true }, 'Maritime Batch 7 Rollout', { text: 'PHP 2,420,000', emphasis: true, align: 'right' }, { text: 'PHP 1,604,400', align: 'right' }, { text: 'PHP 815,600', emphasis: true, align: 'right' }, { text: 'Profitable', tone: 'green' }] },
      { id: 'pp-2', cells: [{ text: 'PRJ-011', emphasis: true }, 'Harbor Expansion Training', { text: 'PHP 1,880,000', emphasis: true, align: 'right' }, { text: 'PHP 1,264,210', align: 'right' }, { text: 'PHP 615,790', emphasis: true, align: 'right' }, { text: 'Profitable', tone: 'green' }] },
      { id: 'pp-3', cells: [{ text: 'PRJ-014', emphasis: true }, 'Simulator Upgrade Support', { text: 'PHP 1,120,000', emphasis: true, align: 'right' }, { text: 'PHP 1,242,330', align: 'right' }, { text: 'PHP -122,330', emphasis: true, align: 'right' }, { text: 'Negative Margin', tone: 'amber' }] },
      { id: 'pp-4', cells: [{ text: 'PRJ-018', emphasis: true }, 'Corporate Cadet Program', { text: 'PHP 3,140,000', emphasis: true, align: 'right' }, { text: 'PHP 2,126,500', align: 'right' }, { text: 'PHP 1,013,500', emphasis: true, align: 'right' }, { text: 'Profitable', tone: 'green' }] },
    ],
  },
];

type TabId = 'budget-vs-actual' | 'project-profitability';
const TABS = [
  { id: 'budget-vs-actual' as TabId, label: 'Budget vs Actual' },
  { id: 'project-profitability' as TabId, label: 'Project Profitability' },
];

export default function PerformancePlanningAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabId = (TABS.find((t) => t.id === rawTab)?.id) || 'budget-vs-actual';

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Operations / Reports & Analytics</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance & Planning Analytics</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Review budget-variance and project-profitability analytics backed by accounting budgets, projects, and profitability services.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => { const isActive = activeTab === tab.id; return (<button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{tab.label}</button>); })}
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === 'budget-vs-actual' ? (
          <BudgetVsActualClient />
        ) : (
          <ReportsAnalyticsPage eyebrow="" title="" description="" tabs={projectProfitabilityTab} />
        )}
      </div>
    </div>
  );
}
