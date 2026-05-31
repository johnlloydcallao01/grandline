import { SetupControlsPage, type SetupControlsTab } from '../_components/SetupControlsPage';

const tabs: SetupControlsTab[] = [
  {
    id: 'bank-accounts',
    label: 'Bank Accounts',
    description: 'Maintain bank-account reference records used for receipts, disbursements, cash accounts, and ledger mapping.',
    searchPlaceholder: 'Search account name, bank name, type, currency, or ledger account',
    filters: ['Active', 'Bank', 'Cash', 'Default Receipt'],
    actions: [
      { label: 'Create Bank Account', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Accounts', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Accounts', value: '14', change: 'Bank and cash accounts available for use', trend: 'up' },
      { label: 'Default Receipt', value: '3', change: 'Accounts flagged for incoming receipts', trend: 'neutral' },
      { label: 'Default Disbursement', value: '2', change: 'Accounts flagged for outgoing payments', trend: 'neutral' },
      { label: 'Ledger Linked', value: '14', change: 'Accounts mapped to a chart-of-account record', trend: 'up' },
    ],
    tableTitle: 'Bank Account Reference Register',
    tableDescription: 'Bank-account records using account type, currency, ledger mapping, and default receipt/disbursement flags.',
    columns: ['Account Name', 'Bank Name', 'Type', 'Currency', 'Ledger Account', 'Status'],
    rows: [
      {
        id: 'ref-bank-1',
        cells: [
          { text: 'BDO Operations', emphasis: true },
          'BDO',
          'bank',
          'PHP',
          '1010 BDO Operations',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'ref-bank-2',
        cells: [
          { text: 'Metrobank Main', emphasis: true },
          'Metrobank',
          'bank',
          'PHP',
          '1020 Metrobank Main',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'ref-bank-3',
        cells: [
          { text: 'Petty Cash Drawer', emphasis: true },
          '-',
          'cash',
          'PHP',
          '1030 Petty Cash',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'ref-bank-4',
        cells: [
          { text: 'Legacy Reserve', emphasis: true },
          'RCBC',
          'bank',
          'PHP',
          '1040 Legacy Reserve',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'tax-codes',
    label: 'Tax Codes',
    description: 'Maintain tax-code reference records used by invoices, bills, expenses, journals, and tax summary reporting.',
    searchPlaceholder: 'Search tax code, name, scope, rate, method, or status',
    filters: ['Active', 'Sales', 'Purchase', 'Both'],
    actions: [
      { label: 'Create Tax Code', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Tax Codes', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Tax Codes', value: '12', change: 'Codes available for accounting use', trend: 'up' },
      { label: 'Sales Scope', value: '5', change: 'Codes usable on sales transactions', trend: 'neutral' },
      { label: 'Purchase Scope', value: '7', change: 'Codes usable on purchase transactions', trend: 'neutral' },
      { label: 'Inactive Codes', value: '2', change: 'Retained for historical transactions', trend: 'down' },
    ],
    tableTitle: 'Tax Code Reference Register',
    tableDescription: 'Tax-code records using scope, rate, calculation method, and active state.',
    columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'],
    rows: [
      {
        id: 'ref-tax-1',
        cells: [
          { text: 'VAT12', emphasis: true },
          'Standard VAT 12%',
          'both',
          { text: '12%', align: 'right' },
          'exclusive',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'ref-tax-2',
        cells: [
          { text: 'NONVAT', emphasis: true },
          'Non-VAT Sale',
          'sales',
          { text: '0%', align: 'right' },
          'exclusive',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'ref-tax-3',
        cells: [
          { text: 'EWTP2', emphasis: true },
          'Expanded Withholding 2%',
          'purchase',
          { text: '2%', align: 'right' },
          'exclusive',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'ref-tax-4',
        cells: [
          { text: 'LEGACY0', emphasis: true },
          'Legacy Zero Rated',
          'both',
          { text: '0%', align: 'right' },
          'exclusive',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'reporting-dimensions',
    label: 'Reporting Dimensions',
    description: 'Review branch, department, and location reference records used as finance-safe reporting dimensions.',
    searchPlaceholder: 'Search code, dimension name, branch, type, or status',
    filters: ['Branches', 'Departments', 'Locations', 'Active'],
    actions: [
      { label: 'Open Dimension', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Dimensions', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Branches', value: '8', change: 'Branch records available as dimensions', trend: 'neutral' },
      { label: 'Departments', value: '16', change: 'Department records configured', trend: 'up' },
      { label: 'Locations', value: '19', change: 'Location records configured', trend: 'up' },
      { label: 'Active Dimensions', value: '40', change: 'Dimension records with active status', trend: 'up' },
    ],
    tableTitle: 'Finance Dimension Register',
    tableDescription: 'Reference dimensions drawn from branch, department, and location master-data collections.',
    columns: ['Type', 'Code', 'Name', 'Branch', 'Created By', 'Status'],
    rows: [
      {
        id: 'dim-1',
        cells: [
          'Branch',
          { text: 'BR-MNL', emphasis: true },
          'Manila Main',
          '-',
          'finance.admin',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'dim-2',
        cells: [
          'Department',
          { text: 'DEP-FIN', emphasis: true },
          'Finance',
          'BR-MNL',
          'finance.admin',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'dim-3',
        cells: [
          'Location',
          { text: 'LOC-MNL-01', emphasis: true },
          'Manila Training Center',
          'BR-MNL',
          'finance.admin',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'dim-4',
        cells: [
          'Location',
          { text: 'LOC-DVO-01', emphasis: true },
          'Davao Satellite Office',
          'BR-DVO',
          'finance.admin',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function FinancialReferenceSetupPage() {
  return (
    <SetupControlsPage
      eyebrow="Core / Setup & Controls"
      title="Financial Reference Setup"
      description="Maintain the financial reference records that actually exist today in apps/cms: bank accounts, tax codes, and finance reporting dimensions."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Reference Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
