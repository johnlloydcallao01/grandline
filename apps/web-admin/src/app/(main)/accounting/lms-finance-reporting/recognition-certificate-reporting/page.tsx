import { LmsFinanceReportingPage, type LmsFinanceReportingTab } from '../_components/LmsFinanceReportingPage';

const tabs: LmsFinanceReportingTab[] = [
  {
    id: 'completion-to-revenue',
    label: 'Completion To Revenue Report',
    description:
      'Review completed LMS enrollments against billed revenue, recognized revenue, and remaining deferred revenue using the dedicated completion-to-revenue query.',
    searchPlaceholder: 'Search enrollment, course, completed date, final charge, recognized revenue, or deferred revenue',
    filters: ['Completion To Revenue', 'Completed', 'Recognizing', 'Deferred Balance'],
    actions: [
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Completed Enrollments', value: '58', change: 'Enrollments with completed timestamps contributing to revenue view', trend: 'up' },
      { label: 'Recognized Revenue', value: 'PHP 3.41M', change: 'Recognized LMS revenue carried across completed rows', trend: 'up' },
      { label: 'Remaining Deferred', value: 'PHP 1.27M', change: 'Revenue still deferred after completion-based view', trend: 'neutral' },
      { label: 'Average Final Charge', value: 'PHP 24.8K', change: 'Average billed amount per completed enrollment row', trend: 'neutral' },
    ],
    tableTitle: 'Completion To Revenue Register',
    tableDescription:
      'Recognition view aligned to `getCompletionToRevenue()` and its row output for completed LMS enrollments, billed charge, recognized revenue, and deferred remainder.',
    columns: ['Enrollment', 'Course', 'Completed At', 'Final Charge', 'Recognized Revenue', 'Remaining Deferred'],
    rows: [
      {
        id: 'completion-1',
        cells: [
          { text: 'ENR-1152', emphasis: true },
          'Radar Observer Course',
          '2026-05-03',
          { text: 'PHP 24,000', align: 'right' },
          { text: 'PHP 24,000', align: 'right' },
          { text: 'PHP 0', align: 'right' },
        ],
      },
      {
        id: 'completion-2',
        cells: [
          { text: 'ENR-1184', emphasis: true },
          'Basic Safety Training',
          '2026-05-10',
          { text: 'PHP 18,500', align: 'right' },
          { text: 'PHP 12,000', align: 'right' },
          { text: 'PHP 6,500', align: 'right' },
        ],
      },
      {
        id: 'completion-3',
        cells: [
          { text: 'ENR-1207', emphasis: true },
          'Engine Room Resource Mgmt',
          '2026-05-21',
          { text: 'PHP 32,600', align: 'right' },
          { text: 'PHP 8,150', align: 'right' },
          { text: 'PHP 24,450', align: 'right' },
        ],
      },
      {
        id: 'completion-4',
        cells: [
          { text: 'ENR-1291', emphasis: true },
          'GMDSS General Operator',
          '2026-05-28',
          { text: 'PHP 28,000', align: 'right' },
          { text: 'PHP 14,000', align: 'right' },
          { text: 'PHP 14,000', align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'certificate-revenue',
    label: 'Certificate Revenue Report',
    description:
      'Review certificate-issued revenue rows using the dedicated certificate revenue query, which ties issued certificates to billed certificate-fee amounts.',
    searchPlaceholder: 'Search certificate id, enrollment, course, issue date, or billed amount',
    filters: ['Certificate Revenue', 'Issued', 'With Billed Amount', 'Current Cycle'],
    actions: [
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Issued Certificates', value: '41', change: 'Certificates contributing to current revenue rows', trend: 'up' },
      { label: 'Billed Certificate Revenue', value: 'PHP 63K', change: 'Billed certificate-fee amount in the report', trend: 'up' },
      { label: 'Average Certificate Fee', value: 'PHP 1.5K', change: 'Average billed certificate amount per certificate row', trend: 'neutral' },
      { label: 'With Linked Billing', value: '39', change: 'Certificate rows resolved back to LMS billing links', trend: 'up' },
    ],
    tableTitle: 'Certificate Revenue Register',
    tableDescription:
      'Certificate revenue view aligned to `getCertificateRevenue()` and the `certificate-revenue` report route, including issue date and billed amount.',
    columns: ['Certificate ID', 'Enrollment', 'Course', 'Issue Date', 'Billed Amount', 'Billing State'],
    rows: [
      {
        id: 'certificate-1',
        cells: [
          { text: 'CERT-2026-0118', emphasis: true },
          'ENR-1184',
          'Basic Safety Training',
          '2026-05-08',
          { text: 'PHP 1,500', align: 'right' },
          { text: 'Billed', tone: 'green' },
        ],
      },
      {
        id: 'certificate-2',
        cells: [
          { text: 'CERT-2026-0135', emphasis: true },
          'ENR-1260',
          'Radar Observer Course',
          '2026-05-21',
          { text: 'PHP 1,500', align: 'right' },
          { text: 'Billed', tone: 'green' },
        ],
      },
      {
        id: 'certificate-3',
        cells: [
          { text: 'CERT-2026-0142', emphasis: true },
          'ENR-1291',
          'GMDSS General Operator',
          '2026-05-28',
          { text: 'PHP 2,000', align: 'right' },
          { text: 'Billed', tone: 'green' },
        ],
      },
      {
        id: 'certificate-4',
        cells: [
          { text: 'CERT-2026-0151', emphasis: true },
          'ENR-1310',
          'Engine Room Resource Mgmt',
          '2026-05-30',
          { text: 'PHP 1,800', align: 'right' },
          { text: 'Pending Link', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function RecognitionCertificateReportingPage() {
  return (
    <LmsFinanceReportingPage
      eyebrow="LMS Finance / LMS Finance Reporting"
      title="Recognition & Certificate Reporting"
      description="Review recognition timing and certificate-fee reporting using the dedicated LMS completion-to-revenue and certificate revenue report queries."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Report', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
