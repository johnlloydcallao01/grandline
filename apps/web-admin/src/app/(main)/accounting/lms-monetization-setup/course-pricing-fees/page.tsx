import { LmsMonetizationSetupPage, type LmsMonetizationTab } from '../_components/LmsMonetizationSetupPage';

const tabs: LmsMonetizationTab[] = [
  {
    id: 'course-fee-profiles',
    label: 'Course Fee Profiles',
    description:
      'Review course-level fee profiles that hold LMS monetization overlays, default recognition method, and the main accounting account mappings.',
    searchPlaceholder: 'Search course, recognition method, manual adjustments, revenue account, or deferred account',
    filters: ['Fee Profiles', 'On Activation', 'Manual Adjustments Allowed', 'Mapped Accounts'],
    actions: [
      { label: 'New Fee Profile', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Profiles', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Fee Profiles', value: '18', change: 'Courses with LMS monetization overlay records', trend: 'up' },
      { label: 'Mapped Revenue Accounts', value: '18', change: 'Profiles with course revenue mapping set', trend: 'up' },
      { label: 'Deferred Revenue Profiles', value: '14', change: 'Profiles configured for deferred recognition handling', trend: 'up' },
      { label: 'Manual Adjustments Allowed', value: '11', change: 'Profiles permitting finance-side adjustments', trend: 'neutral' },
    ],
    tableTitle: 'Course Fee Profile Register',
    tableDescription:
      'Profile records aligned to `accounting-course-fee-profiles`, including course relationship, recognition method, and account-mapping fields.',
    columns: ['Course', 'Recognition Method', 'Manual Adjustment', 'Course Revenue', 'Deferred Revenue', 'Discount Contra'],
    rows: [
      {
        id: 'fee-profile-1',
        cells: [
          { text: 'Basic Safety Training', emphasis: true },
          'on_activation',
          { text: 'Allowed', tone: 'green' },
          '4100 Course Revenue',
          '2200 Deferred Revenue',
          '4190 Discount Contra Revenue',
        ],
      },
      {
        id: 'fee-profile-2',
        cells: [
          { text: 'Radar Observer Course', emphasis: true },
          'on_completion',
          { text: 'Allowed', tone: 'green' },
          '4115 Advanced Course Revenue',
          '2200 Deferred Revenue',
          '4190 Discount Contra Revenue',
        ],
      },
      {
        id: 'fee-profile-3',
        cells: [
          { text: 'Engine Room Resource Mgmt', emphasis: true },
          'straight_line',
          { text: 'Blocked', tone: 'amber' },
          '4125 Technical Training Revenue',
          '2210 Deferred LMS Revenue',
          '4190 Discount Contra Revenue',
        ],
      },
      {
        id: 'fee-profile-4',
        cells: [
          { text: 'GMDSS General Operator', emphasis: true },
          'on_activation',
          { text: 'Allowed', tone: 'green' },
          '4130 Certification Revenue',
          '2200 Deferred Revenue',
          '4190 Discount Contra Revenue',
        ],
      },
    ],
  },
  {
    id: 'fee-components-recognition',
    label: 'Fee Components & Recognition',
    description:
      'Review monetizable fee components and recognition-related fields stored on fee profiles, including certificate, retake, renewal, and instructor expense mapping.',
    searchPlaceholder: 'Search course, certificate fee, retake fee, renewal fee, instructor expense, or recognition method',
    filters: ['Certificate Fee', 'Renewal Fee', 'Retake Fee', 'Instructor Expense'],
    actions: [
      { label: 'Open Fee Component', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Components', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Certificate Fees', value: '12', change: 'Profiles with non-zero certificate monetization', trend: 'up' },
      { label: 'Renewal Fees', value: '9', change: 'Profiles with non-zero renewal monetization', trend: 'up' },
      { label: 'Retake / Reassessment', value: '15', change: 'Profiles carrying retry-related charges', trend: 'up' },
      { label: 'Instructor Expense Mapping', value: '18', change: 'Profiles with instructor expense account mapping', trend: 'neutral' },
    ],
    tableTitle: 'Fee Component Register',
    tableDescription:
      'Fee component view aligned to certificate, retake, reassessment, renewal, late-payment, and instructor-expense fields on course fee profiles.',
    columns: ['Course', 'Certificate Fee', 'Retake Fee', 'Renewal Fee', 'Late Fee', 'Instructor Expense'],
    rows: [
      {
        id: 'fee-component-1',
        cells: [
          { text: 'Basic Safety Training', emphasis: true },
          { text: 'PHP 1,500', align: 'right' },
          { text: 'PHP 2,200', align: 'right' },
          { text: 'PHP 900', align: 'right' },
          { text: 'PHP 350', align: 'right' },
          '5305 Instructor Delivery Expense',
        ],
      },
      {
        id: 'fee-component-2',
        cells: [
          { text: 'Radar Observer Course', emphasis: true },
          { text: 'PHP 2,000', align: 'right' },
          { text: 'PHP 2,800', align: 'right' },
          { text: 'PHP 1,200', align: 'right' },
          { text: 'PHP 500', align: 'right' },
          '5305 Instructor Delivery Expense',
        ],
      },
      {
        id: 'fee-component-3',
        cells: [
          { text: 'Engine Room Resource Mgmt', emphasis: true },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 1,900', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 400', align: 'right' },
          '5310 Technical Instructor Expense',
        ],
      },
      {
        id: 'fee-component-4',
        cells: [
          { text: 'GMDSS General Operator', emphasis: true },
          { text: 'PHP 1,800', align: 'right' },
          { text: 'PHP 2,600', align: 'right' },
          { text: 'PHP 1,100', align: 'right' },
          { text: 'PHP 500', align: 'right' },
          '5315 Certification Instructor Expense',
        ],
      },
    ],
  },
];

export default function CoursePricingFeesPage() {
  return (
    <LmsMonetizationSetupPage
      eyebrow="LMS Finance / LMS Monetization Setup"
      title="Course Pricing & Fees"
      description="Review course fee profiles and monetization component settings that drive LMS pricing overlays, recognition defaults, and accounting mappings."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Fee Profile', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
