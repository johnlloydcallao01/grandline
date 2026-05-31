import { SalesReceivablesPage, type SalesReceivablesTab } from '../_components/SalesReceivablesPage';

const tabs: SalesReceivablesTab[] = [
  {
    id: 'payments-received',
    label: 'Payments Received',
    description: 'Manage incoming customer payments with payment method, deposit routing, applications, and posting status.',
    searchPlaceholder: 'Search receipt no., customer, method, reference no., or deposit account',
    filters: ['Draft', 'Posted', 'With Applications', 'Voided'],
    actions: [
      { label: 'Create Receipt', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Payments', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Receipts', value: '10', change: 'Prepared before posting', trend: 'neutral' },
      { label: 'Posted Receipts', value: '57', change: 'Registered customer collections', trend: 'up' },
      { label: 'Unapplied Value', value: 'PHP 118,500', change: 'Receipts not yet fully allocated', trend: 'down' },
      { label: 'Bank Transfer Volume', value: 'PHP 1.86M', change: 'Primary receipt method this week', trend: 'up' },
    ],
    tableTitle: 'Payments Received Register',
    tableDescription: 'Customer payment records with application coverage, deposit routing, and posting status.',
    columns: ['Receipt No.', 'Payment Date', 'Customer', 'Method', 'Amount', 'Status'],
    rows: [
      {
        id: 'pr-1',
        cells: [
          { text: 'RCT-2026-1184', emphasis: true },
          '2026-05-31',
          'SM Shipping Corp.',
          'Bank Transfer',
          { text: 'PHP 186,500', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'pr-2',
        cells: [
          { text: 'RCT-2026-1180', emphasis: true },
          '2026-05-30',
          'Grandline Corporate',
          'Check',
          { text: 'PHP 144,000', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'pr-3',
        cells: [
          { text: 'RCT-2026-1177', emphasis: true },
          '2026-05-29',
          'Harbor Training Ltd.',
          'Cash',
          { text: 'PHP 28,500', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'pr-4',
        cells: [
          { text: 'RCT-2026-1171', emphasis: true },
          '2026-05-28',
          'Blue Anchor Marine',
          'Bank Transfer',
          { text: 'PHP 96,000', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'official-receipts',
    label: 'Official Receipts',
    description: 'Manage official receipt issuance tied to payments received, customers, receipt dates, and proof documents.',
    searchPlaceholder: 'Search OR no., customer, payment ref, issued by, or receipt date',
    filters: ['Draft', 'Issued', 'Voided', 'With Proof'],
    actions: [
      { label: 'Issue Receipt', icon: 'plus', variant: 'primary' },
      { label: 'Upload Proof', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh Receipts', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft ORs', value: '7', change: 'Prepared before final issuance', trend: 'neutral' },
      { label: 'Issued ORs', value: '41', change: 'Linked to payments received', trend: 'up' },
      { label: 'Voided ORs', value: '3', change: 'Retained for audit visibility', trend: 'down' },
      { label: 'With Proof Documents', value: '32', change: 'Issued receipts with proof attached', trend: 'up' },
    ],
    tableTitle: 'Official Receipt Register',
    tableDescription: 'Receipt register linked to payments received, customers, issue dates, and proof documents.',
    columns: ['OR No.', 'Receipt Date', 'Customer', 'Payment Ref', 'Amount', 'Status'],
    rows: [
      {
        id: 'or-1',
        cells: [
          { text: 'OR-2026-092', emphasis: true },
          '2026-05-31',
          'SM Shipping Corp.',
          'RCT-2026-1184',
          { text: 'PHP 186,500', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'or-2',
        cells: [
          { text: 'OR-2026-089', emphasis: true },
          '2026-05-30',
          'Grandline Corporate',
          'RCT-2026-1180',
          { text: 'PHP 144,000', emphasis: true, align: 'right' },
          { text: 'Issued', tone: 'green' },
        ],
      },
      {
        id: 'or-3',
        cells: [
          { text: 'OR-2026-086', emphasis: true },
          '2026-05-29',
          'Harbor Training Ltd.',
          'RCT-2026-1177',
          { text: 'PHP 28,500', emphasis: true, align: 'right' },
          { text: 'Issued', tone: 'green' },
        ],
      },
      {
        id: 'or-4',
        cells: [
          { text: 'OR-2026-081', emphasis: true },
          '2026-05-27',
          'Blue Anchor Marine',
          'RCT-2026-1168',
          { text: 'PHP 64,000', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'customer-balances',
    label: 'Customer Balances',
    description: 'Monitor customer master records, credit terms, credit limits, and open receivable balances derived from invoices.',
    searchPlaceholder: 'Search customer, customer code, payment terms, credit limit, or balance',
    filters: ['Active Customers', 'Overdue', 'High Balance', 'On Hold'],
    actions: [
      { label: 'Open Customer Record', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Balances', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Customers', value: '102', change: 'Master records usable for AR', trend: 'up' },
      { label: 'Customers With Open AR', value: '34', change: 'Derived from open invoices', trend: 'neutral' },
      { label: 'Total Balance Due', value: 'PHP 3.18M', change: 'Open balances across receivable documents', trend: 'down' },
      { label: 'Over Credit Limit', value: '5', change: 'Customers needing credit review', trend: 'down' },
    ],
    tableTitle: 'Customer Balance View',
    tableDescription: 'Customer-level open balance view aligned with customer master records, payment terms, and credit limits.',
    columns: ['Customer', 'Customer Code', 'Payment Terms', 'Credit Limit', 'Balance Due', 'Status'],
    rows: [
      {
        id: 'cb-1',
        cells: [
          { text: 'Grandline Corporate', emphasis: true },
          'C-00014',
          '30 days',
          { text: 'PHP 500,000', align: 'right' },
          { text: 'PHP 684,200', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cb-2',
        cells: [
          { text: 'Blue Anchor Marine', emphasis: true },
          'C-00108',
          '15 days',
          { text: 'PHP 350,000', align: 'right' },
          { text: 'PHP 428,880', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cb-3',
        cells: [
          { text: 'Harbor Training Ltd.', emphasis: true },
          'C-00057',
          '7 days',
          { text: 'PHP 120,000', align: 'right' },
          { text: 'PHP 96,440', emphasis: true, align: 'right' },
          { text: 'On Hold', tone: 'amber' },
        ],
      },
      {
        id: 'cb-4',
        cells: [
          { text: 'SM Shipping Corp.', emphasis: true },
          'C-00003',
          '30 days',
          { text: 'PHP 750,000', align: 'right' },
          { text: 'PHP 186,500', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
    ],
  },
];

export default function ReceiptsCustomerBalancesPage() {
  return (
    <SalesReceivablesPage
      eyebrow="Operations / Sales & Receivables"
      title="Receipts & Customer Balances"
      description="Manage customer payments received, official receipts, and customer balance visibility in one receivables workspace."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Receipt', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
