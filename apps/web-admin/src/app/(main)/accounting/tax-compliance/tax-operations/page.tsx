import { TaxCompliancePage, type TaxComplianceTab } from '../_components/TaxCompliancePage';

const tabs: TaxComplianceTab[] = [
  {
    id: 'tax-codes',
    label: 'Tax Codes',
    description: 'Manage tax-code master data with scope, rate, calculation method, linked accounts, and active status.',
    searchPlaceholder: 'Search tax code, name, scope, rate, method, or account',
    filters: ['Active', 'Sales', 'Purchase', 'Both'],
    actions: [
      { label: 'Create Tax Code', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Codes', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Tax Codes', value: '12', change: 'Currently available for transaction use', trend: 'up' },
      { label: 'Sales-Side Codes', value: '5', change: 'Configured with sales tax scope or both', trend: 'neutral' },
      { label: 'Purchase-Side Codes', value: '7', change: 'Configured for bill and expense usage', trend: 'neutral' },
      { label: 'Inactive Codes', value: '2', change: 'Retained for historical references', trend: 'down' },
    ],
    tableTitle: 'Tax Code Register',
    tableDescription: 'Tax-code master records using code, scope, rate, calculation method, and active flags from the collection.',
    columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'],
    rows: [
      {
        id: 'tax-code-1',
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
        id: 'tax-code-2',
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
        id: 'tax-code-3',
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
        id: 'tax-code-4',
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
    id: 'tax-usage',
    label: 'Tax Usage',
    description: 'Review where tax codes are used across invoice lines, bill lines, expenses, and journal entry lines.',
    searchPlaceholder: 'Search tax code, source document, entity type, amount, or account',
    filters: ['Invoices', 'Bills', 'Expenses', 'Journal Lines'],
    actions: [
      { label: 'Open Tax Usage', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Usage', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Invoice Line Usage', value: '384', change: 'Invoice lines carrying tax codes', trend: 'up' },
      { label: 'Bill Line Usage', value: '286', change: 'Bill lines carrying tax codes', trend: 'up' },
      { label: 'Posted Expense Usage', value: '27', change: 'Posted expenses with tax totals', trend: 'neutral' },
      { label: 'Journal Tax Lines', value: '61', change: 'Journal entry lines linked to tax codes', trend: 'up' },
    ],
    tableTitle: 'Tax Code Usage View',
    tableDescription: 'Representative tax-code usage across supported source records that store tax relationships today.',
    columns: ['Source Type', 'Document', 'Tax Code', 'Tax Scope', 'Taxable Amount', 'Tax Amount'],
    rows: [
      {
        id: 'usage-1',
        cells: [
          'Invoice Line',
          { text: 'INV-2026-1452 / Line 2', emphasis: true },
          'VAT12',
          'both',
          { text: 'PHP 166,518', emphasis: true, align: 'right' },
          { text: 'PHP 19,982', align: 'right' },
        ],
      },
      {
        id: 'usage-2',
        cells: [
          'Bill Line',
          { text: 'BILL-2026-1184 / Line 1', emphasis: true },
          'EWTP2',
          'purchase',
          { text: 'PHP 48,200', emphasis: true, align: 'right' },
          { text: 'PHP 964', align: 'right' },
        ],
      },
      {
        id: 'usage-3',
        cells: [
          'Expense',
          { text: 'EXP-2026-1173', emphasis: true },
          'VAT12',
          'both',
          { text: 'PHP 16,446', emphasis: true, align: 'right' },
          { text: 'PHP 1,974', align: 'right' },
        ],
      },
      {
        id: 'usage-4',
        cells: [
          'Journal Line',
          { text: 'JE-2026-0904 / Line 3', emphasis: true },
          'VAT12',
          'both',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          { text: 'PHP 25,752', align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'tax-summary',
    label: 'Tax Summary',
    description: 'Review the aggregated tax summary built from posted invoices, posted bills, and posted expenses.',
    searchPlaceholder: 'Search tax code, tax name, scope, method, or tax amount',
    filters: ['Posted Sources', 'Sales Scope', 'Purchase Scope', 'Both'],
    actions: [
      { label: 'Refresh Summary', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Tax Codes In Summary', value: '9', change: 'Distinct codes found in posted source records', trend: 'up' },
      { label: 'Taxable Base', value: 'PHP 6.84M', change: 'Across posted invoice, bill, and expense data', trend: 'up' },
      { label: 'Tax Total', value: 'PHP 712,440', change: 'Aggregated from supported tax-bearing records', trend: 'up' },
      { label: 'Source Documents', value: '118', change: 'Documents contributing to tax summary rows', trend: 'neutral' },
    ],
    tableTitle: 'Aggregated Tax Summary',
    tableDescription: 'Tax summary rows grouped by tax code and scope using the backend tax-summary query.',
    columns: ['Tax Code', 'Tax Name', 'Scope', 'Method', 'Taxable Amount', 'Tax Amount'],
    rows: [
      {
        id: 'summary-1',
        cells: [
          { text: 'VAT12', emphasis: true },
          'Standard VAT 12%',
          'both',
          'exclusive',
          { text: 'PHP 5,936,999', emphasis: true, align: 'right' },
          { text: 'PHP 712,440', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'summary-2',
        cells: [
          { text: 'NONVAT', emphasis: true },
          'Non-VAT Sale',
          'sales',
          'exclusive',
          { text: 'PHP 584,000', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
        ],
      },
      {
        id: 'summary-3',
        cells: [
          { text: 'EWTP2', emphasis: true },
          'Expanded Withholding 2%',
          'purchase',
          'exclusive',
          { text: 'PHP 322,000', emphasis: true, align: 'right' },
          { text: 'PHP 6,440', align: 'right' },
        ],
      },
      {
        id: 'summary-4',
        cells: [
          { text: 'ZRATED', emphasis: true },
          'Zero Rated',
          'both',
          'exclusive',
          { text: 'PHP 118,500', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
        ],
      },
    ],
  },
];

export default function TaxOperationsPage() {
  return (
    <TaxCompliancePage
      eyebrow="Core / Tax & Compliance"
      title="Tax Operations"
      description="Manage tax codes, review tax usage across accounting records, and monitor tax summary output from supported backend sources."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Tax Code', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
