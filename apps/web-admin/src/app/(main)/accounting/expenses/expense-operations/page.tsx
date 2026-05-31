import { ExpensesPage, type ExpensesTab } from '../_components/ExpensesPage';

const tabs: ExpensesTab[] = [
  {
    id: 'expenses',
    label: 'Expenses',
    description: 'Manage direct expense records from initial entry through posting with clear register visibility and document follow-up.',
    searchPlaceholder: 'Search expense no., vendor, memo, category, or payment method',
    filters: ['Draft', 'Posted', 'Cash', 'With Tax Code'],
    actions: [
      { label: 'Create Expense', icon: 'plus', variant: 'primary' },
      { label: 'Link Supporting File', icon: 'upload', variant: 'secondary' },
      { label: 'Export Expense Register', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Expenses', value: '28', change: 'Ready for review or posting', trend: 'neutral' },
      { label: 'Posted Expenses', value: '55', change: 'Included in the register', trend: 'up' },
      { label: 'Cash-Funded Entries', value: '12', change: 'Payment method set to cash', trend: 'neutral' },
      { label: 'With Tax Code', value: '34', change: 'Linked to accounting tax codes', trend: 'up' },
    ],
    tableTitle: 'Expense Register',
    tableDescription: 'Live operating list of direct expense records prioritized for review, posting, and documentation follow-up.',
    columns: ['Expense No.', 'Date', 'Vendor', 'Category', 'Amount', 'Status'],
    rows: [
      {
        id: 'exp-1',
        cells: [
          { text: 'EXP-2026-1184', emphasis: true },
          '2026-05-31',
          'Grab',
          'Travel',
          { text: 'PHP 1,450', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'exp-2',
        cells: [
          { text: 'EXP-2026-1181', emphasis: true },
          '2026-05-31',
          'Office Depot',
          'Supplies',
          { text: 'PHP 12,880', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'amber' },
        ],
      },
      {
        id: 'exp-3',
        cells: [
          { text: 'EXP-2026-1173', emphasis: true },
          '2026-05-30',
          'Cebu Pacific',
          'Training Travel',
          { text: 'PHP 18,420', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'exp-4',
        cells: [
          { text: 'EXP-2026-1168', emphasis: true },
          '2026-05-30',
          'City Water',
          'Utilities',
          { text: 'PHP 6,240', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'expense-detail',
    label: 'Expense Detail',
    description: 'Inspect one expense record together with its linked payee, tax treatment, supporting files, and posting references.',
    searchPlaceholder: 'Search expense no., vendor, tax code, document note, or journal ref',
    filters: ['With Vendor', 'With Tax Code', 'With Documents', 'Posted'],
    actions: [
      { label: 'Edit Expense', icon: 'plus', variant: 'secondary' },
      { label: 'Link Document', icon: 'upload', variant: 'primary' },
      { label: 'Export Detail', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Expense Amount', value: 'PHP 18,420', change: 'Stored on the expense record', trend: 'neutral' },
      { label: 'Linked Documents', value: '3 files', change: 'Via accounting document links', trend: 'up' },
      { label: 'Tax Total', value: 'PHP 1,973', change: 'Derived from the selected tax code', trend: 'up' },
      { label: 'Posted Journal', value: 'JE-2026-00411', change: 'Available after posting', trend: 'up' },
    ],
    tableTitle: 'Expense Detail Sections',
    tableDescription: 'Detailed operating view of the selected expense packet, including documents, coding, and posting references.',
    columns: ['Section', 'Current Value', 'Reference', 'Last Updated', 'State', 'Priority'],
    rows: [
      {
        id: 'det-1',
        cells: [
          { text: 'Header', emphasis: true },
          'Training travel for Iloilo site visit',
          'Expense Record',
          '09:02 AM',
          { text: 'Draft', tone: 'blue' },
          { text: 'Normal', tone: 'blue' },
        ],
      },
      {
        id: 'det-2',
        cells: [
          { text: 'Documents', emphasis: true },
          'Airfare invoice, hotel invoice, taxi receipt',
          'Supporting Files',
          '09:10 AM',
          { text: 'Linked', tone: 'green' },
          { text: 'Medium', tone: 'amber' },
        ],
      },
      {
        id: 'det-3',
        cells: [
          { text: 'Tax Breakdown', emphasis: true },
          'VAT split across airfare and hotel',
          'Tax Mapping',
          '09:14 AM',
          { text: 'Mapped', tone: 'green' },
          { text: 'Medium', tone: 'amber' },
        ],
      },
      {
        id: 'det-4',
        cells: [
          { text: 'Journal Link', emphasis: true },
          'Posted journal entry reference',
          'Journal Reference',
          '09:12 AM',
          { text: 'Available After Post', tone: 'blue' },
          { text: 'Normal', tone: 'blue' },
        ],
      },
    ],
    sidePanels: [],
  },
];

export default function ExpenseOperationsPage() {
  return (
    <ExpensesPage
      eyebrow="Operations / Expenses"
      title="Expense Operations"
      description="Manage direct expenses with clear control over register activity, document coverage, tax handling, and posting follow-up."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Create Expense', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
