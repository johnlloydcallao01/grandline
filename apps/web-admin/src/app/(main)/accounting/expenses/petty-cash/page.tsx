import { ExpensesPage, type ExpensesTab } from '../_components/ExpensesPage';

const tabs: ExpensesTab[] = [
  {
    id: 'cash-expenses',
    label: 'Cash Expenses',
    description: 'Review cash-paid expense activity with fast visibility into vendors, categories, funding accounts, and current posting status.',
    searchPlaceholder: 'Search expense no., vendor, cash account, memo, or category',
    filters: ['Cash Payment', 'Draft', 'Posted', 'Cash Account Linked'],
    actions: [
      { label: 'Create Cash Expense', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Cash View', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Cash Expenses', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Cash-Paid Drafts', value: '7', change: 'Expense payment method is cash', trend: 'neutral' },
      { label: 'Cash-Paid Posted', value: '19', change: 'Already reflected in journals', trend: 'up' },
      { label: 'Cash Accounts', value: '3', change: 'Bank accounts with cash-on-hand type', trend: 'up' },
      { label: 'With Documents', value: '11', change: 'Linked using document links', trend: 'neutral' },
    ],
    tableTitle: 'Cash Expense Register',
    tableDescription: 'Cash-funded expense activity organized for daily monitoring, follow-up, and posting review.',
    columns: ['Expense No.', 'Vendor', 'Category', 'Cash Account', 'Amount', 'Status'],
    rows: [
      {
        id: 'cse-1',
        cells: [
          { text: 'EXP-2026-1208', emphasis: true },
          'National Bookstore',
          'Office Supplies',
          'Cash On Hand - HQ',
          { text: 'PHP 980', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'cse-2',
        cells: [
          { text: 'EXP-2026-1205', emphasis: true },
          'Grab',
          'Local Travel',
          'Cash On Hand - HQ',
          { text: 'PHP 420', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'cse-3',
        cells: [
          { text: 'EXP-2026-1201', emphasis: true },
          'Mercury Drug',
          'Medical Supplies',
          'Cash On Hand - Admissions',
          { text: 'PHP 1,350', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'cse-4',
        cells: [
          { text: 'EXP-2026-1198', emphasis: true },
          'Mister Donut',
          'Meeting Snacks',
          'Cash On Hand - Warehouse',
          { text: 'PHP 640', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'cash-accounts',
    label: 'Cash Accounts',
    description: 'Review cash-style accounts used in day-to-day disbursement and receipt handling, including cash on hand and undeposited funds.',
    searchPlaceholder: 'Search account name, bank name, account type, currency, or note',
    filters: ['Cash On Hand', 'Undeposited Funds', 'Active', 'Default Disbursement'],
    actions: [
      { label: 'Create Cash Account', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Accounts', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Accounts', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Cash Accounts', value: '3', change: 'Usable for cash-backed spending', trend: 'up' },
      { label: 'Default Disbursement', value: '1', change: 'Primary cash payment account', trend: 'neutral' },
      { label: 'Undeposited Funds', value: '1', change: 'Available for clearing flows', trend: 'neutral' },
      { label: 'Inactive Accounts', value: '0', change: 'All current cash accounts are active', trend: 'up' },
    ],
    tableTitle: 'Cash Account Directory',
    tableDescription: 'Cash-account directory used by finance teams when selecting source and destination accounts for cash activity.',
    columns: ['Account', 'Type', 'Ledger Account', 'Currency', 'Defaults', 'Status'],
    rows: [
      {
        id: 'acc-1',
        cells: [
          { text: 'Cash On Hand - HQ', emphasis: true },
          'Cash On Hand',
          '1015',
          'PHP',
          'Disbursement',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'acc-2',
        cells: [
          { text: 'Cash On Hand - Admissions', emphasis: true },
          'Cash On Hand',
          '1016',
          'PHP',
          'None',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'acc-3',
        cells: [
          { text: 'Undeposited Funds', emphasis: true },
          'Undeposited Funds',
          '1020',
          'PHP',
          'Receipt',
          { text: 'Active', tone: 'green' },
        ],
      },
    ],
    sidePanels: [],
  },
];

export default function PettyCashPage() {
  return (
    <ExpensesPage
      eyebrow="Operations / Expenses"
      title="Cash Expense Monitoring"
      description="Monitor cash-paid spending and the supporting cash-account directory in one practical workspace for finance operations."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Create Cash Expense', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
