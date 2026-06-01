import { LmsFinanceReportingPage, type LmsFinanceReportingTab } from '../_components/LmsFinanceReportingPage';

const tabs: LmsFinanceReportingTab[] = [
  {
    id: 'coupon-revenue-impact',
    label: 'Coupon Revenue Impact',
    description:
      'Review coupon-level revenue impact using the dedicated LMS coupon reporting query for enrollment count, gross revenue, coupon discount amount, and net revenue.',
    searchPlaceholder: 'Search coupon code, enrollment count, gross revenue, discount amount, or net revenue',
    filters: ['Coupon Impact', 'High Discount', 'Top Net Revenue', 'Active Campaigns'],
    actions: [
      { label: 'Refresh Impact', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Coupon Campaigns', value: '11', change: 'Coupon groupings contributing to current LMS impact rows', trend: 'up' },
      { label: 'Discount Amount', value: 'PHP 184K', change: 'Total coupon discount impact across LMS links', trend: 'up' },
      { label: 'Net Revenue', value: 'PHP 1.84M', change: 'Net revenue after coupon reductions', trend: 'up' },
      { label: 'Coupon Enrollments', value: '63', change: 'Enrollments carrying coupon discounts', trend: 'neutral' },
    ],
    tableTitle: 'Coupon Revenue Impact Register',
    tableDescription:
      'Coupon impact view aligned to `AccountingCouponReportingService.getCouponRevenueImpact()` and the `coupon-impact` report route.',
    columns: ['Coupon Code', 'Enrollments', 'Gross Revenue', 'Discount Amount', 'Net Revenue', 'Impact Ratio'],
    rows: [
      {
        id: 'coupon-impact-1',
        cells: [
          { text: 'MARITIME10', emphasis: true },
          { text: '28', align: 'right' },
          { text: 'PHP 618,000', align: 'right' },
          { text: 'PHP 61,800', align: 'right' },
          { text: 'PHP 556,200', align: 'right' },
          { text: '10%', tone: 'blue' },
        ],
      },
      {
        id: 'coupon-impact-2',
        cells: [
          { text: 'RENEWAL500', emphasis: true },
          { text: '14', align: 'right' },
          { text: 'PHP 286,000', align: 'right' },
          { text: 'PHP 7,000', align: 'right' },
          { text: 'PHP 279,000', align: 'right' },
          { text: '2.4%', tone: 'green' },
        ],
      },
      {
        id: 'coupon-impact-3',
        cells: [
          { text: 'BATCHINTAKE', emphasis: true },
          { text: '9', align: 'right' },
          { text: 'PHP 214,000', align: 'right' },
          { text: 'PHP 9,000', align: 'right' },
          { text: 'PHP 205,000', align: 'right' },
          { text: '4.2%', tone: 'blue' },
        ],
      },
      {
        id: 'coupon-impact-4',
        cells: [
          { text: 'SAFETYWEEK', emphasis: true },
          { text: '12', align: 'right' },
          { text: 'PHP 336,000', align: 'right' },
          { text: 'PHP 50,400', align: 'right' },
          { text: 'PHP 285,600', align: 'right' },
          { text: '15%', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'scholarship-utilization',
    label: 'Scholarship Utilization',
    description:
      'Review sponsor-level scholarship utilization using the dedicated LMS scholarship report for award count, awarded amount, trainee share, and billed sponsor amount.',
    searchPlaceholder: 'Search sponsor code, sponsor name, award count, awarded amount, or billed sponsor amount',
    filters: ['Scholarship Utilization', 'Active Sponsors', 'High Awarded Amount', 'Third-Party Billed'],
    actions: [
      { label: 'Refresh Utilization', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Sponsors', value: '12', change: 'Sponsors contributing to the current utilization report', trend: 'up' },
      { label: 'Awarded Amount', value: 'PHP 486K', change: 'Total scholarship value across active awards', trend: 'up' },
      { label: 'Billed Sponsor Amount', value: 'PHP 295K', change: 'Value tagged as third-party billed to sponsors', trend: 'up' },
      { label: 'Trainee Share', value: 'PHP 219K', change: 'Residual trainee share after sponsor support', trend: 'neutral' },
    ],
    tableTitle: 'Scholarship Utilization Register',
    tableDescription:
      'Scholarship utilization view aligned to the `getScholarshipUtilization()` query and the `scholarship-utilization` report route.',
    columns: ['Sponsor Code', 'Sponsor Name', 'Award Count', 'Awarded Amount', 'Billed Sponsor Amount', 'Trainee Share'],
    rows: [
      {
        id: 'scholarship-1',
        cells: [
          { text: 'SPN-TESDA-04', emphasis: true },
          'TESDA Regional Training Grant',
          { text: '11', align: 'right' },
          { text: 'PHP 124,000', align: 'right' },
          { text: 'PHP 96,000', align: 'right' },
          { text: 'PHP 28,000', align: 'right' },
        ],
      },
      {
        id: 'scholarship-2',
        cells: [
          { text: 'SPN-CHED-01', emphasis: true },
          'CHED Maritime Scholars',
          { text: '9', align: 'right' },
          { text: 'PHP 118,500', align: 'right' },
          { text: 'PHP 44,000', align: 'right' },
          { text: 'PHP 74,500', align: 'right' },
        ],
      },
      {
        id: 'scholarship-3',
        cells: [
          { text: 'SPN-LGU-09', emphasis: true },
          'Batangas Maritime Grant',
          { text: '7', align: 'right' },
          { text: 'PHP 89,700', align: 'right' },
          { text: 'PHP 65,000', align: 'right' },
          { text: 'PHP 24,700', align: 'right' },
        ],
      },
      {
        id: 'scholarship-4',
        cells: [
          { text: 'SPN-ALUMNI-02', emphasis: true },
          'Alumni Support Pool',
          { text: '4', align: 'right' },
          { text: 'PHP 31,800', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 31,800', align: 'right' },
        ],
      },
    ],
  },
];

export default function DiscountScholarshipAnalyticsPage() {
  return (
    <LmsFinanceReportingPage
      eyebrow="LMS Finance / LMS Finance Reporting"
      title="Discount & Scholarship Analytics"
      description="Review coupon revenue impact and scholarship utilization using the dedicated LMS report queries already exposed in the backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Report', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
