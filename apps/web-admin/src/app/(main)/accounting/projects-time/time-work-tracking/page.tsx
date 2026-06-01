import { ProjectsTimePage, type ProjectsTimeTab } from '../_components/ProjectsTimePage';

const tabs: ProjectsTimeTab[] = [
  {
    id: 'time-entries',
    label: 'Time Entries',
    description:
      'Review project and work-linked time entries using entry date, user, project, task, hours, minutes, billable flag, rates, and approval status.',
    searchPlaceholder: 'Search entry date, user, project, task, hours, billable flag, or status',
    filters: ['Time Entries', 'Billable', 'Submitted', 'Approved'],
    actions: [
      { label: 'New Entry', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Entries', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Time Entries', value: '318', change: 'Tracked time records across projects and support work', trend: 'up' },
      { label: 'Approved Entries', value: '204', change: 'Entries already approved for payroll or costing use', trend: 'up' },
      { label: 'Billable Hours', value: '1,142h', change: 'Billable time recorded on current approved and submitted rows', trend: 'up' },
      { label: 'Time Cost', value: 'PHP 684K', change: 'Estimated cost derived from current time-entry rates', trend: 'neutral' },
    ],
    tableTitle: 'Time Entry Register',
    tableDescription:
      'Time-entry records aligned to `accounting-time-entries`, including project, task, hours, billable flag, rates, and approval status.',
    columns: ['Entry Date', 'User', 'Project', 'Task', 'Hours', 'Status'],
    rows: [
      {
        id: 'time-entry-1',
        cells: [
          '2026-05-28',
          { text: 'ops.coordinator', emphasis: true },
          'BlueWave Cadet Cohort 1',
          'Coordinate trainee intake pack',
          { text: '7.5', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'time-entry-2',
        cells: [
          '2026-05-28',
          { text: 'training.lead', emphasis: true },
          'BST Internal Refresh',
          'Refresh simulator lesson plan',
          { text: '4.0', align: 'right' },
          { text: 'submitted', tone: 'blue' },
        ],
      },
      {
        id: 'time-entry-3',
        cells: [
          '2026-05-29',
          { text: 'finance.pm.2', emphasis: true },
          'Oceanic Fleet Upskilling',
          'Prepare cohort billing handoff',
          { text: '6.5', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'time-entry-4',
        cells: [
          '2026-05-30',
          { text: 'ops.director', emphasis: true },
          'Simulator Lab Rollout',
          'Vendor fit-out coordination',
          { text: '3.0', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'timer-based-entries',
    label: 'Timer-Based Entries',
    description:
      'Review timer-sourced time entries using source type plus `startedAt` and `endedAt` timestamps, without inventing a separate timer workflow beyond what the backend stores.',
    searchPlaceholder: 'Search user, project, source type, started time, ended time, or tracked duration',
    filters: ['Timer-Based', 'Source Type Timer', 'Approved', 'Recent'],
    actions: [
      { label: 'Open Timed Entry', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Timers', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Timer Entries', value: '49', change: 'Entries carrying source type `timer` in the time-entry model', trend: 'up' },
      { label: 'Tracked Duration', value: '286h', change: 'Total duration recorded from timer-based entries', trend: 'up' },
      { label: 'Approved Timer Hours', value: '211h', change: 'Timer-based time already approved', trend: 'up' },
      { label: 'Open Timer Review', value: '8', change: 'Timer-based rows still awaiting review or approval', trend: 'neutral' },
    ],
    tableTitle: 'Timer-Based Entry Register',
    tableDescription:
      'Timer-oriented view grounded in `sourceType`, `startedAt`, and `endedAt` fields stored on `accounting-time-entries`.',
    columns: ['User', 'Project', 'Started At', 'Ended At', 'Tracked Hours', 'Status'],
    rows: [
      {
        id: 'timer-1',
        cells: [
          { text: 'ops.coordinator', emphasis: true },
          'BlueWave Cadet Cohort 1',
          '2026-05-28 08:00',
          '2026-05-28 15:30',
          { text: '7.5', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'timer-2',
        cells: [
          { text: 'training.lead', emphasis: true },
          'BST Internal Refresh',
          '2026-05-28 09:00',
          '2026-05-28 13:00',
          { text: '4.0', align: 'right' },
          { text: 'submitted', tone: 'blue' },
        ],
      },
      {
        id: 'timer-3',
        cells: [
          { text: 'finance.pm.2', emphasis: true },
          'Oceanic Fleet Upskilling',
          '2026-05-29 10:00',
          '2026-05-29 16:30',
          { text: '6.5', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'timer-4',
        cells: [
          { text: 'ops.director', emphasis: true },
          'Simulator Lab Rollout',
          '2026-05-30 14:00',
          '2026-05-30 17:00',
          { text: '3.0', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    description:
      'Review approval-ready timesheets using period dates, user, total hours, timesheet status, and approval metadata tied to the time-tracking service.',
    searchPlaceholder: 'Search user, period start, period end, total hours, status, or approved by',
    filters: ['Timesheets', 'Draft', 'Submitted', 'Approved'],
    actions: [
      { label: 'New Timesheet', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Sheets', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Timesheets', value: '62', change: 'Approval-ready time containers available in the register', trend: 'up' },
      { label: 'Submitted Sheets', value: '14', change: 'Timesheets currently awaiting approval action', trend: 'neutral' },
      { label: 'Approved Sheets', value: '31', change: 'Timesheets already approved and stamped', trend: 'up' },
      { label: 'Tracked Total Hours', value: '1,486h', change: 'Total hours synced back to timesheet headers', trend: 'up' },
    ],
    tableTitle: 'Timesheet Register',
    tableDescription:
      'Timesheet records aligned to `accounting-timesheets` and the `AccountingTimeTrackingService` submit, approve, reject, and total-hours sync behavior.',
    columns: ['User', 'Period Start', 'Period End', 'Total Hours', 'Approved By', 'Status'],
    rows: [
      {
        id: 'timesheet-1',
        cells: [
          { text: 'ops.coordinator', emphasis: true },
          '2026-05-25',
          '2026-05-31',
          { text: '42.0', align: 'right' },
          'finance.pm.1',
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'timesheet-2',
        cells: [
          { text: 'training.lead', emphasis: true },
          '2026-05-25',
          '2026-05-31',
          { text: '36.0', align: 'right' },
          '-',
          { text: 'submitted', tone: 'blue' },
        ],
      },
      {
        id: 'timesheet-3',
        cells: [
          { text: 'finance.pm.2', emphasis: true },
          '2026-05-25',
          '2026-05-31',
          { text: '40.5', align: 'right' },
          'controller',
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'timesheet-4',
        cells: [
          { text: 'ops.director', emphasis: true },
          '2026-05-25',
          '2026-05-31',
          { text: '18.0', align: 'right' },
          '-',
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function TimeWorkTrackingPage() {
  return (
    <ProjectsTimePage
      eyebrow="Advanced Finance / Projects & Time"
      title="Time & Work Tracking"
      description="Review time entries, timer-based entry rows, and approval-ready timesheets used for project costing, payroll support, and profitability tracking."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Time Entry', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
