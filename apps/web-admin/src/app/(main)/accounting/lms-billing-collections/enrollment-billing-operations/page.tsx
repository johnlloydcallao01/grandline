import { LmsBillingCollectionsPage, type LmsBillingCollectionsTab } from '../_components/LmsBillingCollectionsPage';

const tabs: LmsBillingCollectionsTab[] = [
  {
    id: 'enrollment-billing-links',
    label: 'Enrollment Billing Links',
    description:
      'Review bridge records that connect LMS enrollments to customers, invoices, billing status, and the final finance snapshots carried into accounting.',
    searchPlaceholder: 'Search enrollment, source reference, customer, invoice, billing status, or final charge',
    filters: ['Billing Links', 'Pending', 'Invoiced', 'Refunded'],
    actions: [
      { label: 'Open Billing Link', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Links', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Billing Links', value: '142', change: 'Enrollment bridge records synced into accounting', trend: 'up' },
      { label: 'Invoiced Links', value: '118', change: 'Enrollments already carrying invoice relationships', trend: 'up' },
      { label: 'Pending Billing', value: '17', change: 'Enrollments not yet fully invoiced or settled', trend: 'neutral' },
      { label: 'Final Charge Value', value: 'PHP 4.28M', change: 'Current final charge snapshot across LMS enrollments', trend: 'up' },
    ],
    tableTitle: 'Enrollment Billing Link Register',
    tableDescription:
      'Bridge records aligned to `accounting-enrollment-billing-links`, including invoice, customer, billing status, and final charge snapshot.',
    columns: ['Source Ref', 'Course', 'Customer', 'Invoice', 'Billing Status', 'Final Charge'],
    rows: [
      {
        id: 'link-1',
        cells: [
          { text: 'ENR-1184', emphasis: true },
          'Basic Safety Training',
          'CUST-0148 John Dela Cruz',
          'INV-2026-0411',
          { text: 'invoiced', tone: 'blue' },
          { text: 'PHP 18,500', align: 'right' },
        ],
      },
      {
        id: 'link-2',
        cells: [
          { text: 'ENR-1207', emphasis: true },
          'Engine Room Resource Mgmt',
          'CUST-0155 Ana Reyes',
          'INV-2026-0430',
          { text: 'partially_paid', tone: 'amber' },
          { text: 'PHP 32,600', align: 'right' },
        ],
      },
      {
        id: 'link-3',
        cells: [
          { text: 'ENR-1234', emphasis: true },
          'GMDSS General Operator',
          'CUST-0162 BlueWave Manning',
          'INV-2026-0448',
          { text: 'pending_payment', tone: 'amber' },
          { text: 'PHP 12,400', align: 'right' },
        ],
      },
      {
        id: 'link-4',
        cells: [
          { text: 'ENR-1152', emphasis: true },
          'Radar Observer Course',
          'CUST-0139 TESDA Region IV',
          'INV-2026-0399',
          { text: 'paid', tone: 'green' },
          { text: 'PHP 24,000', align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'enrollment-finance-summary',
    label: 'Enrollment Finance Summary',
    description:
      'Review LMS billing summaries built from list price, sale price, coupon discount, scholarship discount, corporate coverage, adjustments, paid amount, and balance due.',
    searchPlaceholder: 'Search enrollment, customer, sale price, discounts, corporate coverage, paid amount, or balance due',
    filters: ['Finance Summary', 'With Discounts', 'With Corporate Coverage', 'Outstanding Balance'],
    actions: [
      { label: 'Open Summary', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Summary', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Gross Sale Price', value: 'PHP 4.91M', change: 'Sale-price total before billing adjustments and settlement', trend: 'up' },
      { label: 'Discount Coverage', value: 'PHP 812K', change: 'Coupons, scholarships, and corporate coverage applied', trend: 'up' },
      { label: 'Allocated Payments', value: 'PHP 2.97M', change: 'Amount already allocated back to LMS billing links', trend: 'up' },
      { label: 'Open Balance', value: 'PHP 1.31M', change: 'Current remaining balance due across active links', trend: 'neutral' },
    ],
    tableTitle: 'Enrollment Finance Summary Register',
    tableDescription:
      'Summary view aligned to the finance calculation in `AccountingEnrollmentBillingService`, using the charge breakdown and balance logic derived from linked records.',
    columns: ['Enrollment', 'Sale Price', 'Discounts', 'Corporate', 'Paid', 'Balance Due'],
    rows: [
      {
        id: 'summary-1',
        cells: [
          { text: 'ENR-1184', emphasis: true },
          { text: 'PHP 22,000', align: 'right' },
          { text: 'PHP 3,500', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 12,000', align: 'right' },
          { text: 'PHP 6,500', align: 'right' },
        ],
      },
      {
        id: 'summary-2',
        cells: [
          { text: 'ENR-1207', emphasis: true },
          { text: 'PHP 34,600', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 2,000', align: 'right' },
          { text: 'PHP 8,150', align: 'right' },
          { text: 'PHP 24,450', align: 'right' },
        ],
      },
      {
        id: 'summary-3',
        cells: [
          { text: 'ENR-1234', emphasis: true },
          { text: 'PHP 12,400', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 12,400', align: 'right' },
        ],
      },
      {
        id: 'summary-4',
        cells: [
          { text: 'ENR-1152', emphasis: true },
          { text: 'PHP 24,000', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 24,000', align: 'right' },
          { text: 'PHP 24,000', align: 'right' },
          { text: 'PHP 0', align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'payment-allocations',
    label: 'Payment Allocations',
    description:
      'Review LMS payment allocations created from payment applications, including invoice settlement and installment-payment allocation types.',
    searchPlaceholder: 'Search payment, invoice, billing link, allocation type, allocation date, or allocated amount',
    filters: ['Allocations', 'Invoice Settlement', 'Installment Payment', 'This Month'],
    actions: [
      { label: 'Allocate Payment', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Allocations', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Allocations', value: '205', change: 'Normalized LMS payment-allocation records', trend: 'up' },
      { label: 'Installment Allocations', value: '44', change: 'Allocations created as installment payment flows', trend: 'up' },
      { label: 'Allocated Amount', value: 'PHP 2.97M', change: 'Amount tied back to invoices and billing links', trend: 'up' },
      { label: 'Average Allocation', value: 'PHP 14.5K', change: 'Average allocation size in the current register', trend: 'neutral' },
    ],
    tableTitle: 'Payment Allocation Register',
    tableDescription:
      'Allocation records aligned to `accounting-payment-allocations`, including the payment, invoice, billing link, amount, and allocation type.',
    columns: ['Payment', 'Invoice', 'Billing Link', 'Allocation Date', 'Allocated Amount', 'Type'],
    rows: [
      {
        id: 'alloc-1',
        cells: [
          { text: 'PR-2026-0201', emphasis: true },
          'INV-2026-0411',
          'ENR-1184',
          '2026-05-08',
          { text: 'PHP 12,000', align: 'right' },
          { text: 'invoice_settlement', tone: 'green' },
        ],
      },
      {
        id: 'alloc-2',
        cells: [
          { text: 'PR-2026-0217', emphasis: true },
          'INV-2026-0430',
          'ENR-1207',
          '2026-05-19',
          { text: 'PHP 8,150', align: 'right' },
          { text: 'installment_payment', tone: 'blue' },
        ],
      },
      {
        id: 'alloc-3',
        cells: [
          { text: 'PR-2026-0188', emphasis: true },
          'INV-2026-0399',
          'ENR-1152',
          '2026-05-02',
          { text: 'PHP 24,000', align: 'right' },
          { text: 'invoice_settlement', tone: 'green' },
        ],
      },
      {
        id: 'alloc-4',
        cells: [
          { text: 'PR-2026-0224', emphasis: true },
          'INV-2026-0448',
          'ENR-1234',
          '2026-05-27',
          { text: 'PHP 6,000', align: 'right' },
          { text: 'installment_payment', tone: 'blue' },
        ],
      },
    ],
  },
];

export default function EnrollmentBillingOperationsPage() {
  return (
    <LmsBillingCollectionsPage
      eyebrow="LMS Finance / LMS Billing & Collections"
      title="Enrollment Billing Operations"
      description="Review LMS enrollment billing links, finance summaries, and payment allocations that connect course enrollments to accounting invoices and settlement."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Billing Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
