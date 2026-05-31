import { TaxCompliancePage, type TaxComplianceTab } from '../_components/TaxCompliancePage';

const tabs: TaxComplianceTab[] = [
  {
    id: 'tax-code-governance',
    label: 'Tax Code Governance',
    description: 'Review control fields on tax-code records including scope, rate, method, account mapping, and active state.',
    searchPlaceholder: 'Search tax code, scope, rate, method, sales account, or purchase account',
    filters: ['Active', 'Inactive', 'Mapped Accounts', 'Unmapped Accounts'],
    actions: [
      { label: 'Open Tax Code', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Controls', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Codes With Sales Account', value: '9', change: 'Configured with sales-side posting account', trend: 'up' },
      { label: 'Codes With Purchase Account', value: '10', change: 'Configured with purchase-side posting account', trend: 'up' },
      { label: 'Both Accounts Mapped', value: '7', change: 'Fully configured for both transaction sides', trend: 'neutral' },
      { label: 'Inactive Codes', value: '2', change: 'Retained for historical usage only', trend: 'down' },
    ],
    tableTitle: 'Tax Code Control Matrix',
    tableDescription: 'Control-focused view of tax-code settings and posting-account relationships from the tax-code collection.',
    columns: ['Code', 'Scope', 'Rate', 'Method', 'Account Mapping', 'Status'],
    rows: [
      {
        id: 'gov-1',
        cells: [
          { text: 'VAT12', emphasis: true },
          'both',
          { text: '12%', align: 'right' },
          'exclusive',
          'Sales + Purchase',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'gov-2',
        cells: [
          { text: 'NONVAT', emphasis: true },
          'sales',
          { text: '0%', align: 'right' },
          'exclusive',
          'Sales Only',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'gov-3',
        cells: [
          { text: 'EWTP2', emphasis: true },
          'purchase',
          { text: '2%', align: 'right' },
          'exclusive',
          'Purchase Only',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'gov-4',
        cells: [
          { text: 'LEGACY0', emphasis: true },
          'both',
          { text: '0%', align: 'right' },
          'exclusive',
          'No Active Mapping',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'tax-audit-history',
    label: 'Tax Audit History',
    description: 'Review audit history for tax-code changes, tax-summary exports, and tax-related finance actions.',
    searchPlaceholder: 'Search tax code, action, user, reason, or exported report',
    filters: ['Updated', 'Created', 'Exported', 'Recent'],
    actions: [
      { label: 'Refresh Audit View', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Tax Audit Events', value: '17', change: 'Tax-related actions visible in audit history', trend: 'up' },
      { label: 'Tax Code Updates', value: '6', change: 'Recent master-data changes affecting tax behavior', trend: 'neutral' },
      { label: 'Summary Exports', value: '4', change: 'Tax report exports recorded in audit logs', trend: 'up' },
      { label: 'Actors Logged', value: '3', change: 'Users represented in recent tax activity', trend: 'neutral' },
    ],
    tableTitle: 'Tax Audit Trail',
    tableDescription: 'Tax-related audit events using finance audit logs and exported actions already supported in apps/cms.',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason'],
    rows: [
      {
        id: 'tax-audit-1',
        cells: [
          '2026-05-31 09:54',
          'tax_code',
          { text: 'VAT12', emphasis: true },
          { text: 'updated', tone: 'blue' },
          'tax.lead',
          'Updated purchase account mapping',
        ],
      },
      {
        id: 'tax-audit-2',
        cells: [
          '2026-05-31 09:10',
          'tax_summary',
          { text: 'tax-summary-report', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'finance.controller',
          'Month-end review export',
        ],
      },
      {
        id: 'tax-audit-3',
        cells: [
          '2026-05-30 04:44',
          'tax_code',
          { text: 'EWTP2', emphasis: true },
          { text: 'created', tone: 'green' },
          'ap.manager',
          'Created new purchase-side withholding code',
        ],
      },
      {
        id: 'tax-audit-4',
        cells: [
          '2026-05-30 03:28',
          'tax_code',
          { text: 'LEGACY0', emphasis: true },
          { text: 'updated', tone: 'amber' },
          'finance.controller',
          'Marked inactive for future use',
        ],
      },
    ],
  },
];

export default function ComplianceControlsPage() {
  return (
    <TaxCompliancePage
      eyebrow="Core / Tax & Compliance"
      title="Compliance Controls"
      description="Review tax-code governance and tax-related audit visibility using the control data and audit support currently available in apps/cms."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download Control View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
