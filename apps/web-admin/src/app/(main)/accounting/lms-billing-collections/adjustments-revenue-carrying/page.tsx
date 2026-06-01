import { LmsBillingCollectionsPage, type LmsBillingCollectionsTab } from '../_components/LmsBillingCollectionsPage';

const tabs: LmsBillingCollectionsTab[] = [
  {
    id: 'billing-adjustments',
    label: 'Billing Adjustments',
    description:
      'Review manual LMS billing adjustments applied to enrollment billing links, including adjustment type, direction, amount, approver, and applied date.',
    searchPlaceholder: 'Search billing link, adjustment type, direction, amount, approver, or applied date',
    filters: ['Adjustments', 'Increase', 'Decrease', 'Certificate Fee'],
    actions: [
      { label: 'New Adjustment', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Adjustments', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Adjustments', value: '53', change: 'Manual billing adjustments layered on LMS links', trend: 'up' },
      { label: 'Increase Adjustments', value: '36', change: 'Adjustments increasing billed value or charges', trend: 'up' },
      { label: 'Decrease Adjustments', value: '17', change: 'Adjustments reducing billed value', trend: 'neutral' },
      { label: 'Net Adjustment', value: 'PHP 184K', change: 'Net impact of current active LMS adjustments', trend: 'up' },
    ],
    tableTitle: 'Billing Adjustment Register',
    tableDescription:
      'Adjustment records aligned to `accounting-billing-adjustments`, including billing link, type, direction, amount, approver, and applied date.',
    columns: ['Billing Link', 'Adjustment Type', 'Direction', 'Amount', 'Approved By', 'Applied At'],
    rows: [
      {
        id: 'adj-1',
        cells: [
          { text: 'ENR-1184', emphasis: true },
          'certificate_fee',
          { text: 'increase', tone: 'blue' },
          { text: 'PHP 1,500', align: 'right' },
          'finance.admin',
          '2026-05-08',
        ],
      },
      {
        id: 'adj-2',
        cells: [
          { text: 'ENR-1207', emphasis: true },
          'manual_discount',
          { text: 'decrease', tone: 'amber' },
          { text: 'PHP 2,000', align: 'right' },
          'controller',
          '2026-05-19',
        ],
      },
      {
        id: 'adj-3',
        cells: [
          { text: 'ENR-1260', emphasis: true },
          'late_payment_fee',
          { text: 'increase', tone: 'blue' },
          { text: 'PHP 350', align: 'right' },
          'ar.supervisor',
          '2026-05-21',
        ],
      },
      {
        id: 'adj-4',
        cells: [
          { text: 'ENR-1291', emphasis: true },
          'corporate_repricing',
          { text: 'decrease', tone: 'amber' },
          { text: 'PHP 1,250', align: 'right' },
          'finance.admin',
          '2026-05-28',
        ],
      },
    ],
  },
  {
    id: 'refunds-credit-notes',
    label: 'Refunds & Credit Notes',
    description:
      'Review LMS refund records, approved amounts, refund status, and the linked credit notes generated when refunds are processed.',
    searchPlaceholder: 'Search refund number, billing link, invoice, payment, approved amount, refund status, or credit note',
    filters: ['Refunds', 'Draft', 'Processed', 'With Credit Note'],
    actions: [
      { label: 'New Refund', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Refunds', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Refunds', value: '19', change: 'LMS refund workflow records in the register', trend: 'up' },
      { label: 'Processed Refunds', value: '11', change: 'Refunds already converted into posted credit notes', trend: 'up' },
      { label: 'Approved Amount', value: 'PHP 143K', change: 'Refund amount approved across current records', trend: 'neutral' },
      { label: 'With Credit Note', value: '11', change: 'Refunds already linked to generated credit notes', trend: 'up' },
    ],
    tableTitle: 'Refund And Credit Note Register',
    tableDescription:
      'Refund records aligned to `accounting-refunds`, with the refund status and linked credit-note outcome from the LMS refund processing flow.',
    columns: ['Refund Number', 'Billing Link', 'Invoice', 'Approved Amount', 'Credit Note', 'Status'],
    rows: [
      {
        id: 'refund-1',
        cells: [
          { text: 'REF-2026-0012', emphasis: true },
          'ENR-1184',
          'INV-2026-0411',
          { text: 'PHP 1,500', align: 'right' },
          'CN-2026-0008',
          { text: 'processed', tone: 'green' },
        ],
      },
      {
        id: 'refund-2',
        cells: [
          { text: 'REF-2026-0015', emphasis: true },
          'ENR-1234',
          'INV-2026-0448',
          { text: 'PHP 6,000', align: 'right' },
          '-',
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'refund-3',
        cells: [
          { text: 'REF-2026-0017', emphasis: true },
          'ENR-1291',
          'INV-2026-0467',
          { text: 'PHP 3,200', align: 'right' },
          'CN-2026-0011',
          { text: 'processed', tone: 'green' },
        ],
      },
      {
        id: 'refund-4',
        cells: [
          { text: 'REF-2026-0019', emphasis: true },
          'ENR-1260',
          'INV-2026-0455',
          { text: 'PHP 2,400', align: 'right' },
          '-',
          { text: 'approved', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'deferred-revenue-schedules',
    label: 'Deferred Revenue Schedules',
    description:
      'Review deferred-revenue carrying schedules tied to LMS invoices and billing links, including recognition method, deferred amount, recognized amount, and schedule status.',
    searchPlaceholder: 'Search invoice, billing link, recognition method, deferred amount, recognized amount, or schedule status',
    filters: ['Deferred Revenue', 'Draft', 'Recognizing', 'Completed'],
    actions: [
      { label: 'Open Schedule', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Schedules', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Schedules', value: '34', change: 'Deferred revenue schedules carried by LMS billing', trend: 'up' },
      { label: 'Recognizing', value: '18', change: 'Schedules currently in active recognition state', trend: 'up' },
      { label: 'Deferred Balance', value: 'PHP 1.27M', change: 'Revenue still deferred across active LMS schedules', trend: 'neutral' },
      { label: 'Recognized Amount', value: 'PHP 3.41M', change: 'Revenue already recognized from LMS schedules', trend: 'up' },
    ],
    tableTitle: 'Deferred Revenue Schedule Register',
    tableDescription:
      'Schedule records aligned to `accounting-revenue-recognition-schedules`, including the linked invoice, billing link, deferred amount, recognized amount, and status.',
    columns: ['Invoice', 'Billing Link', 'Recognition Method', 'Deferred', 'Recognized', 'Status'],
    rows: [
      {
        id: 'schedule-1',
        cells: [
          { text: 'INV-2026-0411', emphasis: true },
          'ENR-1184',
          'on_activation',
          { text: 'PHP 18,500', align: 'right' },
          { text: 'PHP 12,000', align: 'right' },
          { text: 'recognizing', tone: 'blue' },
        ],
      },
      {
        id: 'schedule-2',
        cells: [
          { text: 'INV-2026-0399', emphasis: true },
          'ENR-1152',
          'on_completion',
          { text: 'PHP 24,000', align: 'right' },
          { text: 'PHP 24,000', align: 'right' },
          { text: 'completed', tone: 'green' },
        ],
      },
      {
        id: 'schedule-3',
        cells: [
          { text: 'INV-2026-0430', emphasis: true },
          'ENR-1207',
          'straight_line',
          { text: 'PHP 32,600', align: 'right' },
          { text: 'PHP 8,150', align: 'right' },
          { text: 'recognizing', tone: 'blue' },
        ],
      },
      {
        id: 'schedule-4',
        cells: [
          { text: 'INV-2026-0448', emphasis: true },
          'ENR-1234',
          'on_activation',
          { text: 'PHP 12,400', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'certificate-charges',
    label: 'Certificate Charges',
    description:
      'Review certificate fee charges created through LMS certificate monetization, represented as certificate-fee billing adjustments on the related enrollment billing link.',
    searchPlaceholder: 'Search billing link, certificate fee, adjustment type, certificate marker, amount, or applied date',
    filters: ['Certificate Charges', 'Certificate Fee', 'Increase', 'Recent'],
    actions: [
      { label: 'Open Charge', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Charges', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Certificate Fee Adjustments', value: '21', change: 'Certificate monetization charges recorded as LMS adjustments', trend: 'up' },
      { label: 'Charged Amount', value: 'PHP 31.5K', change: 'Current certificate charge total in the register', trend: 'up' },
      { label: 'Linked Billing Links', value: '21', change: 'Billing links touched by certificate-charge sync', trend: 'neutral' },
      { label: 'Average Certificate Fee', value: 'PHP 1.5K', change: 'Average certificate fee applied through monetization sync', trend: 'neutral' },
    ],
    tableTitle: 'Certificate Charge Register',
    tableDescription:
      'Certificate-charge view grounded in the certificate monetization service, which writes `certificate_fee` billing adjustments against LMS billing links.',
    columns: ['Billing Link', 'Adjustment Type', 'Reason', 'Amount', 'Approved By', 'Applied At'],
    rows: [
      {
        id: 'cert-1',
        cells: [
          { text: 'ENR-1184', emphasis: true },
          'certificate_fee',
          'Certificate fee for CERT-2026-0118',
          { text: 'PHP 1,500', align: 'right' },
          'finance.admin',
          '2026-05-08',
        ],
      },
      {
        id: 'cert-2',
        cells: [
          { text: 'ENR-1260', emphasis: true },
          'certificate_fee',
          'Certificate fee for CERT-2026-0135',
          { text: 'PHP 1,500', align: 'right' },
          'controller',
          '2026-05-21',
        ],
      },
      {
        id: 'cert-3',
        cells: [
          { text: 'ENR-1291', emphasis: true },
          'certificate_fee',
          'Certificate fee for CERT-2026-0142',
          { text: 'PHP 2,000', align: 'right' },
          'finance.admin',
          '2026-05-28',
        ],
      },
      {
        id: 'cert-4',
        cells: [
          { text: 'ENR-1310', emphasis: true },
          'certificate_fee',
          'Certificate fee for CERT-2026-0151',
          { text: 'PHP 1,800', align: 'right' },
          'ar.supervisor',
          '2026-05-30',
        ],
      },
    ],
  },
];

export default function AdjustmentsRevenueCarryingPage() {
  return (
    <LmsBillingCollectionsPage
      eyebrow="LMS Finance / LMS Billing & Collections"
      title="Adjustments & Revenue Carrying"
      description="Review LMS billing adjustments, refund outcomes, deferred revenue schedules, and certificate-linked billing charges carried into accounting."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Adjustment', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
