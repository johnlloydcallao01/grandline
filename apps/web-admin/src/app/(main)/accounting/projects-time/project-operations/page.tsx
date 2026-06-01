import { ProjectsTimePage, type ProjectsTimeTab } from '../_components/ProjectsTimePage';

const tabs: ProjectsTimeTab[] = [
  {
    id: 'projects',
    label: 'Projects',
    description:
      'Review project finance overlays using project code, status, customer, manager, project type, linked course, dimensions, and budget amount.',
    searchPlaceholder: 'Search project code, name, customer, manager, project type, course, or status',
    filters: ['Projects', 'Active', 'Customer Projects', 'Internal'],
    actions: [
      { label: 'New Project', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Projects', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Projects', value: '26', change: 'Project overlay records available for costing and reporting', trend: 'up' },
      { label: 'Active Projects', value: '18', change: 'Projects currently in active or delivery state', trend: 'up' },
      { label: 'Customer Projects', value: '15', change: 'Projects linked to external customers', trend: 'up' },
      { label: 'Budget Amount', value: 'PHP 6.2M', change: 'Combined budget set directly on project headers', trend: 'neutral' },
    ],
    tableTitle: 'Project Register',
    tableDescription:
      'Project records aligned to `accounting-projects`, including customer, manager, project type, course relationship, and budget amount.',
    columns: ['Project Code', 'Name', 'Customer', 'Manager', 'Type', 'Status'],
    rows: [
      {
        id: 'project-1',
        cells: [
          { text: 'PRJ-20260601001', emphasis: true },
          'BlueWave Cadet Cohort 1',
          'BlueWave Manning Services',
          'finance.pm.1',
          'customer_delivery',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'project-2',
        cells: [
          { text: 'PRJ-20260601002', emphasis: true },
          'BST Internal Refresh',
          'Grandline Training Ops',
          'training.manager',
          'internal',
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'project-3',
        cells: [
          { text: 'PRJ-20260601003', emphasis: true },
          'Oceanic Fleet Upskilling',
          'Oceanic Fleet Management',
          'finance.pm.2',
          'customer_delivery',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'project-4',
        cells: [
          { text: 'PRJ-20260601004', emphasis: true },
          'Simulator Lab Rollout',
          'Grandline Capital Program',
          'ops.director',
          'capital_support',
          { text: 'on_hold', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'project-tasks',
    label: 'Project Tasks',
    description:
      'Review project work units using task code, project, assigned user, billable flag, task status, and due-date tracking.',
    searchPlaceholder: 'Search task code, task name, project, assigned user, billable flag, or task status',
    filters: ['Tasks', 'Assigned', 'Billable', 'Due Soon'],
    actions: [
      { label: 'New Task', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Tasks', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Project Tasks', value: '84', change: 'Tracked project work units across active projects', trend: 'up' },
      { label: 'Billable Tasks', value: '52', change: 'Tasks marked billable for project revenue support', trend: 'up' },
      { label: 'Assigned Tasks', value: '71', change: 'Tasks already assigned to a responsible user', trend: 'up' },
      { label: 'Open Tasks', value: '39', change: 'Draft or in-progress task workload still active', trend: 'neutral' },
    ],
    tableTitle: 'Project Task Register',
    tableDescription:
      'Task records aligned to `accounting-project-tasks`, including the project link, assignee, billable flag, and task status.',
    columns: ['Task Code', 'Task Name', 'Project', 'Assigned To', 'Billable', 'Status'],
    rows: [
      {
        id: 'task-1',
        cells: [
          { text: 'TASK-BW-001', emphasis: true },
          'Coordinate trainee intake pack',
          'BlueWave Cadet Cohort 1',
          'ops.coordinator',
          { text: 'Yes', tone: 'green' },
          { text: 'in_progress', tone: 'blue' },
        ],
      },
      {
        id: 'task-2',
        cells: [
          { text: 'TASK-BST-003', emphasis: true },
          'Refresh simulator lesson plan',
          'BST Internal Refresh',
          'training.lead',
          { text: 'No', tone: 'gray' },
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'task-3',
        cells: [
          { text: 'TASK-OF-007', emphasis: true },
          'Prepare cohort billing handoff',
          'Oceanic Fleet Upskilling',
          'finance.pm.2',
          { text: 'Yes', tone: 'green' },
          { text: 'ready_for_review', tone: 'blue' },
        ],
      },
      {
        id: 'task-4',
        cells: [
          { text: 'TASK-SIM-002', emphasis: true },
          'Vendor fit-out coordination',
          'Simulator Lab Rollout',
          'ops.director',
          { text: 'No', tone: 'gray' },
          { text: 'blocked', tone: 'red' },
        ],
      },
    ],
  },
];

export default function ProjectOperationsPage() {
  return (
    <ProjectsTimePage
      eyebrow="Advanced Finance / Projects & Time"
      title="Project Operations"
      description="Review project headers and project tasks that support operational tracking, costing context, and downstream profitability reporting."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Project', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
