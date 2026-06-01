import {
  PayrollContractorFinancePage,
  type PayrollContractorFinanceTab,
} from '../_components/PayrollContractorFinancePage';

const tabs: PayrollContractorFinanceTab[] = [
  {
    id: 'payroll-posting-report',
    label: 'Payroll Posting Report',
    description:
      'Review payroll posting summaries by run using gross amount, deduction amount, net amount, entry count, payment date, status, and posted journal entry.',
    searchPlaceholder: 'Search payroll code, payment date, gross amount, deduction amount, net amount, or posted journal',
    filters: ['Posting Report', 'Posted', 'Approved', 'High Value'],
    actions: [
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Reported Runs', value: '14', change: 'Payroll runs flowing into the posting report service', trend: 'up' },
      { label: 'Gross Amount', value: 'PHP 2.68M', change: 'Total gross amount represented in current posting summaries', trend: 'up' },
      { label: 'Deduction Amount', value: 'PHP 318K', change: 'Deductions rolled up across current report rows', trend: 'neutral' },
      { label: 'Net Amount', value: 'PHP 2.36M', change: 'Net amount carried into payroll posting summaries', trend: 'up' },
    ],
    tableTitle: 'Payroll Posting Report',
    tableDescription:
      'Reporting view aligned to `AccountingPayrollPostingReportService.getPayrollPostingReport()`, including gross, deductions, net, entry count, status, and posted journal entry.',
    columns: ['Payroll Code', 'Payment Date', 'Gross Amount', 'Deduction Amount', 'Net Amount', 'Status'],
    rows: [
      {
        id: 'report-1',
        cells: [
          { text: 'PAYRUN-20260530001', emphasis: true },
          '2026-05-20',
          { text: 'PHP 412,500', align: 'right' },
          { text: 'PHP 46,800', align: 'right' },
          { text: 'PHP 365,700', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'report-2',
        cells: [
          { text: 'PAYRUN-20260530002', emphasis: true },
          '2026-06-05',
          { text: 'PHP 438,200', align: 'right' },
          { text: 'PHP 51,100', align: 'right' },
          { text: 'PHP 387,100', align: 'right' },
          { text: 'approved', tone: 'blue' },
        ],
      },
      {
        id: 'report-3',
        cells: [
          { text: 'PAYRUN-20260530003', emphasis: true },
          '2026-06-20',
          { text: 'PHP 395,000', align: 'right' },
          { text: 'PHP 43,500', align: 'right' },
          { text: 'PHP 351,500', align: 'right' },
          { text: 'review', tone: 'amber' },
        ],
      },
      {
        id: 'report-4',
        cells: [
          { text: 'PAYRUN-20260530004', emphasis: true },
          '2026-07-05',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function PayrollReportingPage() {
  return (
    <PayrollContractorFinancePage
      eyebrow="Advanced Finance / Payroll & Contractor Finance"
      title="Payroll Reporting"
      description="Review payroll posting summaries using the dedicated payroll posting report service already available in the backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Report', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
