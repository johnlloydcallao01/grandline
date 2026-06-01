import { LmsMonetizationSetupPage, type LmsMonetizationTab } from '../_components/LmsMonetizationSetupPage';

const tabs: LmsMonetizationTab[] = [
  {
    id: 'revenue-account-mapping',
    label: 'Revenue Account Mapping',
    description:
      'Review LMS revenue-account mapping fields stored on course fee profiles, including course revenue, deferred revenue, certificate revenue, discount contra, and instructor expense accounts.',
    searchPlaceholder: 'Search course, revenue account, deferred account, certificate account, or instructor expense account',
    filters: ['Revenue Mapping', 'Deferred Revenue', 'Certificate Revenue', 'Instructor Expense'],
    actions: [
      { label: 'Open Mapping', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Mappings', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Mapped Courses', value: '18', change: 'Course fee profiles with accounting mappings', trend: 'up' },
      { label: 'Certificate Revenue Maps', value: '12', change: 'Profiles with certificate revenue account set', trend: 'up' },
      { label: 'Deferred Revenue Maps', value: '14', change: 'Profiles using deferred revenue handling', trend: 'up' },
      { label: 'Contra Revenue Maps', value: '18', change: 'Profiles with discount contra setup', trend: 'neutral' },
    ],
    tableTitle: 'LMS Revenue Mapping Register',
    tableDescription:
      'Revenue mapping view aligned to account-relationship fields stored on `accounting-course-fee-profiles`.',
    columns: ['Course', 'Course Revenue', 'Deferred Revenue', 'Certificate Revenue', 'Discount Contra', 'Instructor Expense'],
    rows: [
      {
        id: 'mapping-1',
        cells: [
          { text: 'Basic Safety Training', emphasis: true },
          '4100 Course Revenue',
          '2200 Deferred Revenue',
          '4140 Certificate Revenue',
          '4190 Discount Contra Revenue',
          '5305 Instructor Delivery Expense',
        ],
      },
      {
        id: 'mapping-2',
        cells: [
          { text: 'Radar Observer Course', emphasis: true },
          '4115 Advanced Course Revenue',
          '2200 Deferred Revenue',
          '4140 Certificate Revenue',
          '4190 Discount Contra Revenue',
          '5305 Instructor Delivery Expense',
        ],
      },
      {
        id: 'mapping-3',
        cells: [
          { text: 'Engine Room Resource Mgmt', emphasis: true },
          '4125 Technical Training Revenue',
          '2210 Deferred LMS Revenue',
          '4145 Assessment Revenue',
          '4190 Discount Contra Revenue',
          '5310 Technical Instructor Expense',
        ],
      },
      {
        id: 'mapping-4',
        cells: [
          { text: 'GMDSS General Operator', emphasis: true },
          '4130 Certification Revenue',
          '2200 Deferred Revenue',
          '4140 Certificate Revenue',
          '4190 Discount Contra Revenue',
          '5315 Certification Instructor Expense',
        ],
      },
    ],
  },
  {
    id: 'coupon-discount-mapping',
    label: 'Coupon & Discount Mapping',
    description:
      'Review coupon-code definitions and the discount impact they create through enrollment billing link snapshots used in LMS finance reporting.',
    searchPlaceholder: 'Search coupon code, status, scope, discount type, amount, or revenue impact',
    filters: ['Active Coupons', 'Percent', 'Fixed Course', 'Revenue Impact'],
    actions: [
      { label: 'New Coupon', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Coupons', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Coupon Codes', value: '27', change: 'Coupon master records available in LMS', trend: 'up' },
      { label: 'Active Coupons', value: '11', change: 'Coupons currently valid for enrollment checkout', trend: 'neutral' },
      { label: 'Discounted Enrollments', value: '63', change: 'Billing links carrying coupon discount snapshots', trend: 'up' },
      { label: 'Net Revenue After Coupons', value: 'PHP 1.84M', change: 'Revenue remaining after coupon reductions', trend: 'up' },
    ],
    tableTitle: 'Coupon And Discount Register',
    tableDescription:
      'Coupon and discount view aligned to `coupon-codes` plus discount values carried into LMS enrollment billing link snapshots.',
    columns: ['Coupon Code', 'Status', 'Discount Type', 'Amount', 'Scope', 'Usage Count'],
    rows: [
      {
        id: 'coupon-1',
        cells: [
          { text: 'MARITIME10', emphasis: true },
          { text: 'active', tone: 'green' },
          'percent',
          { text: '10', align: 'right' },
          'all_courses',
          { text: '128', align: 'right' },
        ],
      },
      {
        id: 'coupon-2',
        cells: [
          { text: 'RENEWAL500', emphasis: true },
          { text: 'active', tone: 'green' },
          'fixed_course',
          { text: '500', align: 'right' },
          'specific_courses',
          { text: '42', align: 'right' },
        ],
      },
      {
        id: 'coupon-3',
        cells: [
          { text: 'BATCHINTAKE', emphasis: true },
          { text: 'paused', tone: 'amber' },
          'fixed_cart',
          { text: '1000', align: 'right' },
          'specific_categories',
          { text: '17', align: 'right' },
        ],
      },
      {
        id: 'coupon-4',
        cells: [
          { text: 'SAFETYWEEK', emphasis: true },
          { text: 'expired', tone: 'gray' },
          'percent',
          { text: '15', align: 'right' },
          'all_courses',
          { text: '203', align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'recognition-schedules',
    label: 'Recognition Schedules',
    description:
      'Review deferred revenue and recognition schedule records created from enrollment billing and invoice linkage for LMS monetization flows.',
    searchPlaceholder: 'Search invoice, billing link, recognition method, status, deferred amount, or recognized amount',
    filters: ['Draft Schedules', 'Recognizing', 'Completed', 'Deferred Revenue'],
    actions: [
      { label: 'Open Schedule', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Schedules', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Recognition Schedules', value: '34', change: 'Deferred revenue schedules tied to LMS billing links', trend: 'up' },
      { label: 'Draft Schedules', value: '9', change: 'Schedules pending recognition run or posting', trend: 'neutral' },
      { label: 'Recognized Amount', value: 'PHP 3.41M', change: 'Amount already recognized from deferred schedules', trend: 'up' },
      { label: 'Remaining Deferred', value: 'PHP 1.27M', change: 'Revenue still deferred across active schedules', trend: 'neutral' },
    ],
    tableTitle: 'Revenue Recognition Schedule Register',
    tableDescription:
      'Schedule view aligned to `accounting-revenue-recognition-schedules`, including invoice link, billing link, recognition method, and deferred balances.',
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
];

export default function RevenueDiscountMappingPage() {
  return (
    <LmsMonetizationSetupPage
      eyebrow="LMS Finance / LMS Monetization Setup"
      title="Revenue & Discount Mapping"
      description="Review LMS revenue account mappings, coupon and discount definitions, and deferred recognition schedules tied to enrollment monetization."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Mapping', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
