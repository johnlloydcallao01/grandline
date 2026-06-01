import { LmsMonetizationSetupPage, type LmsMonetizationTab } from '../_components/LmsMonetizationSetupPage';

const tabs: LmsMonetizationTab[] = [
  {
    id: 'instructor-payout-rules',
    label: 'Instructor Payout Rules',
    description:
      'Review instructor payout-rule configuration by course, payout method, flat amount, revenue share, enrollment pay, completion bonus, and status.',
    searchPlaceholder: 'Search instructor, course, payout method, flat amount, percent of revenue, or status',
    filters: ['Active Rules', 'Flat', 'Revenue Share', 'Hybrid'],
    actions: [
      { label: 'New Payout Rule', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Rules', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Payout Rules', value: '22', change: 'Rule records controlling instructor cost generation', trend: 'up' },
      { label: 'Active Rules', value: '19', change: 'Rules currently eligible for payout calculation', trend: 'up' },
      { label: 'Revenue Share Rules', value: '7', change: 'Rules using revenue-linked payout logic', trend: 'neutral' },
      { label: 'Hybrid Rules', value: '5', change: 'Rules combining multiple payout drivers', trend: 'up' },
    ],
    tableTitle: 'Instructor Payout Rule Register',
    tableDescription:
      'Rule configuration aligned to `accounting-instructor-payout-rules`, including method-specific amount fields and rule status.',
    columns: ['Instructor', 'Course', 'Method', 'Flat Amount', 'Revenue %', 'Status'],
    rows: [
      {
        id: 'rule-1',
        cells: [
          { text: 'Capt. Ramon Cruz', emphasis: true },
          'Basic Safety Training',
          'flat',
          { text: 'PHP 18,000', align: 'right' },
          { text: '0%', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'rule-2',
        cells: [
          { text: 'Engr. Leo Navarro', emphasis: true },
          'Engine Room Resource Mgmt',
          'revenue_share',
          { text: 'PHP 0', align: 'right' },
          { text: '18%', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'rule-3',
        cells: [
          { text: 'Capt. Alicia Reyes', emphasis: true },
          'Radar Observer Course',
          'hybrid',
          { text: 'PHP 8,000', align: 'right' },
          { text: '10%', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'rule-4',
        cells: [
          { text: 'Capt. Jon Delos Santos', emphasis: true },
          'GMDSS General Operator',
          'per_enrollment',
          { text: 'PHP 0', align: 'right' },
          { text: '0%', align: 'right' },
          { text: 'inactive', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'payout-register',
    label: 'Payout Register',
    description:
      'Review generated instructor payout obligations by instructor, course, period, calculated amount, approved amount, and payout status.',
    searchPlaceholder: 'Search instructor, course, source reference, period, calculated amount, or payout status',
    filters: ['Calculated', 'Approved', 'Paid', 'Draft'],
    actions: [
      { label: 'Generate Payout', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Register', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Generated Payouts', value: '31', change: 'Payout records created from course activity', trend: 'up' },
      { label: 'Approved Amount', value: 'PHP 846K', change: 'Approved instructor obligations in current register', trend: 'up' },
      { label: 'Calculated Only', value: '9', change: 'Payouts still awaiting approval or release', trend: 'neutral' },
      { label: 'Paid Payouts', value: '14', change: 'Instructor payout records already settled', trend: 'up' },
    ],
    tableTitle: 'Instructor Payout Register',
    tableDescription:
      'Payout register aligned to `accounting-instructor-payouts`, including calculation period, calculated amount, approved amount, and payout status.',
    columns: ['Instructor', 'Course', 'Period', 'Calculated', 'Approved', 'Status'],
    rows: [
      {
        id: 'payout-1',
        cells: [
          { text: 'Capt. Ramon Cruz', emphasis: true },
          'Basic Safety Training',
          '2026-05-01 to 2026-05-31',
          { text: 'PHP 18,000', align: 'right' },
          { text: 'PHP 18,000', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'payout-2',
        cells: [
          { text: 'Engr. Leo Navarro', emphasis: true },
          'Engine Room Resource Mgmt',
          '2026-05-01 to 2026-05-31',
          { text: 'PHP 46,380', align: 'right' },
          { text: 'PHP 46,380', align: 'right' },
          { text: 'calculated', tone: 'blue' },
        ],
      },
      {
        id: 'payout-3',
        cells: [
          { text: 'Capt. Alicia Reyes', emphasis: true },
          'Radar Observer Course',
          '2026-05-01 to 2026-05-31',
          { text: 'PHP 31,500', align: 'right' },
          { text: 'PHP 29,000', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'payout-4',
        cells: [
          { text: 'Capt. Jon Delos Santos', emphasis: true },
          'GMDSS General Operator',
          '2026-04-01 to 2026-04-30',
          { text: 'PHP 22,000', align: 'right' },
          { text: 'PHP 22,000', align: 'right' },
          { text: 'paid', tone: 'green' },
        ],
      },
    ],
  },
];

export default function InstructorPayoutSetupPage() {
  return (
    <LmsMonetizationSetupPage
      eyebrow="LMS Finance / LMS Monetization Setup"
      title="Instructor Payout Setup"
      description="Review instructor payout rules and generated payout records derived from LMS monetization activity and course-based payout methods."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Payout Rule', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
