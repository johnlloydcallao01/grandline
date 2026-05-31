import { MasterRecordsPage, type MasterRecordsTab } from '../_components/MasterRecordsPage';

const tabs: MasterRecordsTab[] = [
  {
    id: 'customers',
    label: 'Customers',
    description: 'Manage customer master records with codes, type, contacts, tax profile, currency, terms, and credit limit.',
    searchPlaceholder: 'Search customer code, display name, type, email, or status',
    filters: ['Active', 'Individual', 'Corporate', 'With Credit Limit'],
    actions: [
      { label: 'Create Customer', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Customers', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Customers', value: '102', change: 'Customers available for receivables workflows', trend: 'up' },
      { label: 'Corporate Customers', value: '38', change: 'Customers flagged as company payers', trend: 'neutral' },
      { label: 'With Credit Limits', value: '29', change: 'Profiles carrying a defined credit limit', trend: 'up' },
      { label: 'Inactive Customers', value: '4', change: 'Retained for historical transactions', trend: 'down' },
    ],
    tableTitle: 'Customer Master Register',
    tableDescription: 'Customer records using customer code, type, currency, payment terms, and status.',
    columns: ['Customer Code', 'Display Name', 'Type', 'Currency', 'Payment Terms', 'Status'],
    rows: [
      {
        id: 'cust-1',
        cells: [
          { text: 'C-00014', emphasis: true },
          'Grandline Corporate',
          'corporate',
          'PHP',
          '30 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cust-2',
        cells: [
          { text: 'C-00108', emphasis: true },
          'Blue Anchor Marine',
          'corporate',
          'PHP',
          '15 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cust-3',
        cells: [
          { text: 'C-00057', emphasis: true },
          'Harbor Training Ltd.',
          'corporate',
          'PHP',
          '7 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cust-4',
        cells: [
          { text: 'C-00003', emphasis: true },
          'SM Shipping Corp.',
          'corporate',
          'PHP',
          '30 days',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'vendors',
    label: 'Vendors',
    description: 'Maintain vendor master records with vendor codes, type, contacts, tax profile, currency, and payment terms.',
    searchPlaceholder: 'Search vendor code, display name, type, email, or status',
    filters: ['Active', 'Supplier', 'Service Provider', 'Inactive'],
    actions: [
      { label: 'Create Vendor', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Vendors', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Vendors', value: '86', change: 'Vendors available for AP and expense use', trend: 'up' },
      { label: 'Suppliers', value: '54', change: 'Vendors classified as suppliers', trend: 'neutral' },
      { label: 'Service Providers', value: '22', change: 'Vendors used for services and utilities', trend: 'neutral' },
      { label: 'Inactive Vendors', value: '6', change: 'Retained for historical payables', trend: 'down' },
    ],
    tableTitle: 'Vendor Master Register',
    tableDescription: 'Vendor records using vendor code, type, currency, payment terms, and activity status.',
    columns: ['Vendor Code', 'Display Name', 'Type', 'Currency', 'Payment Terms', 'Status'],
    rows: [
      {
        id: 'vendor-1',
        cells: [
          { text: 'V-00182', emphasis: true },
          'Blue Anchor Marine',
          'supplier',
          'PHP',
          '30 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'vendor-2',
        cells: [
          { text: 'V-00044', emphasis: true },
          'Office Depot',
          'supplier',
          'PHP',
          '15 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'vendor-3',
        cells: [
          { text: 'V-00008', emphasis: true },
          'City Water',
          'service_provider',
          'PHP',
          '30 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'vendor-4',
        cells: [
          { text: 'V-00111', emphasis: true },
          'Harbor Training Ltd.',
          'service_provider',
          'PHP',
          '7 days',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'bank-accounts',
    label: 'Bank Accounts',
    description: 'Maintain bank, cash-on-hand, and undeposited-funds master accounts with ledger mapping and default flags.',
    searchPlaceholder: 'Search account name, bank name, type, currency, or ledger account',
    filters: ['Active', 'Bank', 'Cash', 'Default Receipt'],
    actions: [
      { label: 'Create Bank Account', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Accounts', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Accounts', value: '14', change: 'Cash and bank accounts available for use', trend: 'up' },
      { label: 'Default Receipt Accounts', value: '3', change: 'Accounts flagged for incoming receipts', trend: 'neutral' },
      { label: 'Default Disbursement', value: '2', change: 'Accounts flagged for outgoing payments', trend: 'neutral' },
      { label: 'Ledger Mapped', value: '14', change: 'Accounts linked to a controlling ledger account', trend: 'up' },
    ],
    tableTitle: 'Bank Account Register',
    tableDescription: 'Bank-account records using type, bank name, currency, ledger account link, and default flags.',
    columns: ['Account Name', 'Bank Name', 'Type', 'Currency', 'Ledger Account', 'Status'],
    rows: [
      {
        id: 'bank-1',
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
        id: 'bank-2',
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
        id: 'bank-3',
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
        id: 'bank-4',
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
];

export default function BusinessPartiesPage() {
  return (
    <MasterRecordsPage
      eyebrow="Core / Master Records"
      title="Business Parties"
      description="Maintain customer, vendor, and bank account reference records used across commercial, treasury, and accounting workflows."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Party Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
