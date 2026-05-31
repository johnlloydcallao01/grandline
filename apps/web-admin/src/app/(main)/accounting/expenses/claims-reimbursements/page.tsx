import { ExpensesPage, type ExpensesTab } from '../_components/ExpensesPage';

const tabs: ExpensesTab[] = [
  {
    id: 'approval-requests',
    label: 'Approval Requests',
    description: 'Review approval activity tied to expense records and keep the queue moving with clear ownership and decision history.',
    searchPlaceholder: 'Search request id, expense entity id, approver, status, or notes',
    filters: ['Pending', 'Approved', 'Rejected', 'Expense Entity'],
    actions: [
      { label: 'Create Approval Request', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Queue', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Requests', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Pending Requests', value: '14', change: 'Across all active workflows', trend: 'neutral' },
      { label: 'Expense-Linked', value: '6', change: 'Entity type set to expense', trend: 'up' },
      { label: 'Approved Today', value: '3', change: 'Resolution trail updated', trend: 'up' },
      { label: 'Rejected Today', value: '1', change: 'Notes captured on request', trend: 'down' },
    ],
    tableTitle: 'Approval Request Queue',
    tableDescription: 'Approval queue for finance-sensitive requests with current approver, request timing, and decision status.',
    columns: ['Request', 'Entity Type', 'Entity Id', 'Current Approver', 'Requested At', 'Status'],
    rows: [
      {
        id: 'apr-1',
        cells: [
          { text: 'APR-2026-311', emphasis: true },
          'Expense',
          'EXP-2026-1184',
          'Finance Manager',
          '2026-05-31 08:25',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'apr-2',
        cells: [
          { text: 'APR-2026-308', emphasis: true },
          'Expense',
          'EXP-2026-1181',
          'Controller',
          '2026-05-30 16:42',
          { text: 'Pending', tone: 'blue' },
        ],
      },
      {
        id: 'apr-3',
        cells: [
          { text: 'APR-2026-304', emphasis: true },
          'Expense',
          'EXP-2026-1173',
          'Finance Director',
          '2026-05-29 10:18',
          { text: 'Approved', tone: 'green' },
        ],
      },
      {
        id: 'apr-4',
        cells: [
          { text: 'APR-2026-299', emphasis: true },
          'Bill',
          'BILL-2026-0189',
          'Procurement Head',
          '2026-05-28 15:30',
          { text: 'Rejected', tone: 'red' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'supporting-documents',
    label: 'Supporting Documents',
    description: 'Monitor supporting files linked to expense and accounting records, with clear visibility into categories, dates, and primary references.',
    searchPlaceholder: 'Search entity id, category, uploaded by, note, or document date',
    filters: ['Expense Receipt', 'Proof Of Payment', 'Primary', 'Recent'],
    actions: [
      { label: 'Link Document', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Documents', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Document Links', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Linked Documents', value: '41', change: 'Across accounting entities', trend: 'up' },
      { label: 'Expense Documents', value: '17', change: 'Entity type set to expense', trend: 'up' },
      { label: 'Primary Files', value: '9', change: 'Marked as main support', trend: 'neutral' },
      { label: 'Recent Uploads', value: '6', change: 'Added in the last day', trend: 'up' },
    ],
    tableTitle: 'Document Link Register',
    tableDescription: 'Document register showing linked files, entity references, document categories, and recent attachment activity.',
    columns: ['Link Ref', 'Entity Type', 'Entity Id', 'Category', 'Document Date', 'State'],
    rows: [
      {
        id: 'doc-1',
        cells: [
          { text: 'DOC-2026-144', emphasis: true },
          'Expense',
          'EXP-2026-1173',
          'Expense Receipt',
          '2026-05-30',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'doc-2',
        cells: [
          { text: 'DOC-2026-142', emphasis: true },
          'Expense',
          'EXP-2026-1181',
          'Expense Receipt',
          '2026-05-31',
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'doc-3',
        cells: [
          { text: 'DOC-2026-138', emphasis: true },
          'Bill',
          'BILL-2026-0189',
          'Tax',
          '2026-05-28',
          { text: 'Linked', tone: 'green' },
        ],
      },
      {
        id: 'doc-4',
        cells: [
          { text: 'DOC-2026-136', emphasis: true },
          'Expense',
          'EXP-2026-1168',
          'Proof Of Payment',
          '2026-05-28',
          { text: 'Linked', tone: 'green' },
        ],
      },
    ],
    sidePanels: [],
  },
];

export default function ClaimsReimbursementsPage() {
  return (
    <ExpensesPage
      eyebrow="Operations / Expenses"
      title="Expense Approvals & Documents"
      description="Manage finance approval activity and supporting-file review in one focused workspace for expense operations."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Create Approval Request', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
