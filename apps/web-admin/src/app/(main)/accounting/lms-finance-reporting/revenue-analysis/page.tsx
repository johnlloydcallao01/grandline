import { LmsFinanceReportingPage, type LmsFinanceReportingTab } from '../_components/LmsFinanceReportingPage';

const tabs: LmsFinanceReportingTab[] = [
  {
    id: 'revenue-by-course',
    label: 'Revenue By Course',
    description:
      'Review LMS billed revenue aggregated by course using enrollment billing-link final charge snapshots from the LMS dashboard service.',
    searchPlaceholder: 'Search course, billed revenue, linked enrollments, or billing-link count',
    filters: ['By Course', 'Top Revenue', 'Maritime Courses', 'Active Billing'],
    actions: [
      { label: 'Refresh Revenue', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Analysis', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Billed Revenue', value: 'PHP 4.28M', change: 'Current LMS final-charge total across billing links', trend: 'up' },
      { label: 'Linked Courses', value: '18', change: 'Courses contributing to current revenue rows', trend: 'up' },
      { label: 'Top Course Share', value: '22%', change: 'Largest course share of LMS billed revenue', trend: 'neutral' },
      { label: 'Billing Links', value: '142', change: 'Enrollment billing links counted in the dashboard', trend: 'up' },
    ],
    tableTitle: 'Revenue By Course Register',
    tableDescription:
      'Course-level revenue view aligned to `AccountingLmsDashboardService.getDashboard()` and its `revenueByCourse` aggregation.',
    columns: ['Course', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Rank'],
    rows: [
      {
        id: 'course-1',
        cells: [
          { text: 'Basic Safety Training', emphasis: true },
          { text: '31', align: 'right' },
          { text: 'PHP 18,400', align: 'right' },
          { text: 'PHP 570,400', align: 'right' },
          { text: '1', tone: 'green' },
        ],
      },
      {
        id: 'course-2',
        cells: [
          { text: 'Radar Observer Course', emphasis: true },
          { text: '22', align: 'right' },
          { text: 'PHP 23,600', align: 'right' },
          { text: 'PHP 519,200', align: 'right' },
          { text: '2', tone: 'blue' },
        ],
      },
      {
        id: 'course-3',
        cells: [
          { text: 'Engine Room Resource Mgmt', emphasis: true },
          { text: '17', align: 'right' },
          { text: 'PHP 32,600', align: 'right' },
          { text: 'PHP 554,200', align: 'right' },
          { text: '3', tone: 'blue' },
        ],
      },
      {
        id: 'course-4',
        cells: [
          { text: 'GMDSS General Operator', emphasis: true },
          { text: '14', align: 'right' },
          { text: 'PHP 21,900', align: 'right' },
          { text: 'PHP 306,600', align: 'right' },
          { text: '4', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'revenue-by-instructor',
    label: 'Revenue By Instructor',
    description:
      'Review LMS billed revenue aggregated by course instructor using the instructor-level revenue grouping returned by the LMS dashboard service.',
    searchPlaceholder: 'Search instructor, linked courses, billed revenue, or revenue share',
    filters: ['By Instructor', 'Top Earners', 'With Active Courses', 'Current Cycle'],
    actions: [
      { label: 'Refresh Revenue', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Analysis', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Instructors In View', value: '12', change: 'Instructor rows contributing to LMS billed revenue', trend: 'up' },
      { label: 'Top Instructor Revenue', value: 'PHP 821K', change: 'Largest billed total under one instructor bucket', trend: 'up' },
      { label: 'Average Instructor Revenue', value: 'PHP 357K', change: 'Average billed revenue per instructor row', trend: 'neutral' },
      { label: 'Mapped Instructor Buckets', value: '12', change: 'Instructor groupings derived from course relationships', trend: 'neutral' },
    ],
    tableTitle: 'Revenue By Instructor Register',
    tableDescription:
      'Instructor-level revenue view aligned to the `revenueByInstructor` output of `AccountingLmsDashboardService.getDashboard()`.',
    columns: ['Instructor', 'Linked Courses', 'Linked Enrollments', 'Billed Revenue', 'Revenue Share'],
    rows: [
      {
        id: 'inst-1',
        cells: [
          { text: 'Instructor 14', emphasis: true },
          { text: '4', align: 'right' },
          { text: '36', align: 'right' },
          { text: 'PHP 821,000', align: 'right' },
          { text: '19.2%', tone: 'green' },
        ],
      },
      {
        id: 'inst-2',
        cells: [
          { text: 'Instructor 11', emphasis: true },
          { text: '3', align: 'right' },
          { text: '27', align: 'right' },
          { text: 'PHP 612,500', align: 'right' },
          { text: '14.3%', tone: 'blue' },
        ],
      },
      {
        id: 'inst-3',
        cells: [
          { text: 'Instructor 9', emphasis: true },
          { text: '2', align: 'right' },
          { text: '19', align: 'right' },
          { text: 'PHP 444,200', align: 'right' },
          { text: '10.4%', tone: 'blue' },
        ],
      },
      {
        id: 'inst-4',
        cells: [
          { text: 'Instructor 6', emphasis: true },
          { text: '2', align: 'right' },
          { text: '14', align: 'right' },
          { text: 'PHP 306,600', align: 'right' },
          { text: '7.2%', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'revenue-by-enrollment-type',
    label: 'Revenue By Enrollment Type',
    description:
      'Review LMS billed revenue by enrollment type using the billing-link aggregation returned by the LMS dashboard service.',
    searchPlaceholder: 'Search enrollment type, billed revenue, share, or bucket total',
    filters: ['Enrollment Type', 'Paid', 'Corporate', 'Free'],
    actions: [
      { label: 'Refresh Revenue', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Analysis', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Enrollment Types', value: '4', change: 'Distinct enrollment-type buckets in the LMS dashboard', trend: 'neutral' },
      { label: 'Paid Enrollments', value: '106', change: 'Enrollments already carrying payment value', trend: 'up' },
      { label: 'Free Enrollments', value: '12', change: 'Free-type enrollments tracked in the dashboard summary', trend: 'neutral' },
      { label: 'Largest Type Bucket', value: 'PHP 2.76M', change: 'Top billed revenue bucket by enrollment type', trend: 'up' },
    ],
    tableTitle: 'Revenue By Enrollment Type Register',
    tableDescription:
      'Enrollment-type revenue view aligned to the `revenueByEnrollmentType` output of `AccountingLmsDashboardService.getDashboard()`.',
    columns: ['Enrollment Type', 'Linked Enrollments', 'Average Charge', 'Billed Revenue', 'Share'],
    rows: [
      {
        id: 'type-1',
        cells: [
          { text: 'standard', emphasis: true },
          { text: '79', align: 'right' },
          { text: 'PHP 34,900', align: 'right' },
          { text: 'PHP 2,757,100', align: 'right' },
          { text: '64.4%', tone: 'green' },
        ],
      },
      {
        id: 'type-2',
        cells: [
          { text: 'corporate', emphasis: true },
          { text: '29', align: 'right' },
          { text: 'PHP 28,500', align: 'right' },
          { text: 'PHP 826,500', align: 'right' },
          { text: '19.3%', tone: 'blue' },
        ],
      },
      {
        id: 'type-3',
        cells: [
          { text: 'scholarship', emphasis: true },
          { text: '22', align: 'right' },
          { text: 'PHP 19,900', align: 'right' },
          { text: 'PHP 437,800', align: 'right' },
          { text: '10.2%', tone: 'blue' },
        ],
      },
      {
        id: 'type-4',
        cells: [
          { text: 'free', emphasis: true },
          { text: '12', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: '0%', tone: 'gray' },
        ],
      },
    ],
  },
];

export default function RevenueAnalysisPage() {
  return (
    <LmsFinanceReportingPage
      eyebrow="LMS Finance / LMS Finance Reporting"
      title="Revenue Analysis"
      description="Review LMS billed revenue by course, instructor, and enrollment type using the reporting outputs already exposed by the LMS dashboard service."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Analysis', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
