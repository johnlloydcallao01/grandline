import { TaxCompliancePage, type TaxComplianceTab } from '../_components/TaxCompliancePage';

const tabs: TaxComplianceTab[] = [
  {
    id: 'tax-summary-report',
    label: 'Tax Summary Report',
    description: 'Review backend-generated tax summary rows aggregated from posted invoices, posted bills, and posted expenses.',
    searchPlaceholder: 'Search tax code, tax scope, method, taxable amount, or tax amount',
    filters: ['All Codes', 'Sales', 'Purchase', 'Both'],
    actions: [
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Summary Rows', value: '9', change: 'Distinct tax code and scope combinations', trend: 'neutral' },
      { label: 'Taxable Base', value: 'PHP 6.84M', change: 'Posted sources included in the report', trend: 'up' },
      { label: 'Tax Amount', value: 'PHP 712,440', change: 'Total tax from supported records', trend: 'up' },
      { label: 'Source Documents', value: '118', change: 'Documents contributing to the summary', trend: 'neutral' },
    ],
    tableTitle: 'Backend Tax Summary Report',
    tableDescription: 'Report rows from the tax-summary API grouped by tax code, scope, and calculation method.',
    columns: ['Tax Code', 'Tax Name', 'Scope', 'Method', 'Taxable Amount', 'Tax Amount'],
    rows: [
      {
        id: 'report-1',
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
        id: 'report-2',
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
        id: 'report-3',
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
        id: 'report-4',
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
  {
    id: 'tax-export-history',
    label: 'Tax Export History',
    description: 'Review export actions in audit history for tax summary downloads and tax-related outbound report activity.',
    searchPlaceholder: 'Search exported action, tax summary, report type, user, or timestamp',
    filters: ['Exported', 'Tax Summary', 'Recent', 'Reports'],
    actions: [
      { label: 'Refresh Exports', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Tax Exports Today', value: '4', change: 'Audit events tied to tax-related exports', trend: 'up' },
      { label: 'Summary Downloads', value: '3', change: 'Tax summary report exports recorded', trend: 'up' },
      { label: 'Export Actors', value: '2', change: 'Users generating tax report outputs', trend: 'neutral' },
      { label: 'Recent Exports', value: '8', change: 'Exports in the current close window', trend: 'neutral' },
    ],
    tableTitle: 'Tax Export Audit History',
    tableDescription: 'Tax-related export history backed by exported actions visible in finance audit logs.',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata'],
    rows: [
      {
        id: 'tax-export-1',
        cells: [
          '2026-05-31 10:18',
          'tax_summary',
          { text: 'tax-summary-report', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'tax.lead',
          'CSV export',
        ],
      },
      {
        id: 'tax-export-2',
        cells: [
          '2026-05-31 09:10',
          'tax_summary',
          { text: 'tax-summary-report', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'finance.controller',
          'PDF export',
        ],
      },
      {
        id: 'tax-export-3',
        cells: [
          '2026-05-30 05:06',
          'invoice',
          { text: 'invoice-tax-detail', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'ar.lead',
          'Detailed tax line export',
        ],
      },
      {
        id: 'tax-export-4',
        cells: [
          '2026-05-30 04:22',
          'bill',
          { text: 'bill-tax-detail', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'ap.manager',
          'Purchase-side tax export',
        ],
      },
    ],
  },
];

export default function TaxReportingFilingPage() {
  return (
    <TaxCompliancePage
      eyebrow="Core / Tax & Compliance"
      title="Tax Reporting & Filing"
      description="Review backend tax summary reporting and tax-related export activity supported by current apps/cms tax capabilities."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download Report View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
