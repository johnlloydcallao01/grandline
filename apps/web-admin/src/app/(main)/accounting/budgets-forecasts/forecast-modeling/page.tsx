import { BudgetsForecastsPage, type BudgetsForecastsTab } from '../_components/BudgetsForecastsPage';

const tabs: BudgetsForecastsTab[] = [
  {
    id: 'forecast-scenarios',
    label: 'Forecast Scenarios',
    description:
      'Review forecast scenario headers using scenario name, type, fiscal year, status, and scenario notes used for finance planning and variance analysis.',
    searchPlaceholder: 'Search scenario name, type, fiscal year, status, or notes',
    filters: ['Forecast Scenarios', 'Base Case', 'Conservative', 'Approved'],
    actions: [
      { label: 'New Scenario', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Scenarios', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Scenarios', value: '12', change: 'Forecast scenario records available for planning', trend: 'up' },
      { label: 'Approved Scenarios', value: '5', change: 'Scenarios already ready for planning reference', trend: 'up' },
      { label: 'Draft Scenarios', value: '4', change: 'Scenarios still under preparation', trend: 'neutral' },
      { label: 'Scenario Types', value: '4', change: 'Distinct scenario-type templates in active use', trend: 'neutral' },
    ],
    tableTitle: 'Forecast Scenario Register',
    tableDescription:
      'Scenario records aligned to `accounting-forecast-scenarios`, including scenario type, fiscal year, status, assumptions, and notes.',
    columns: ['Scenario Name', 'Scenario Type', 'Fiscal Year', 'Status', 'Assumptions', 'Notes'],
    rows: [
      {
        id: 'scenario-1',
        cells: [
          { text: 'Base Case FY 2026', emphasis: true },
          'base_case',
          'FY 2026',
          { text: 'approved', tone: 'green' },
          'JSON assumptions loaded',
          'Primary planning baseline',
        ],
      },
      {
        id: 'scenario-2',
        cells: [
          { text: 'Conservative Case FY 2026', emphasis: true },
          'conservative',
          'FY 2026',
          { text: 'draft', tone: 'amber' },
          'JSON assumptions loaded',
          'Reduced enrollment assumptions',
        ],
      },
      {
        id: 'scenario-3',
        cells: [
          { text: 'Aggressive Case FY 2026', emphasis: true },
          'aggressive',
          'FY 2026',
          { text: 'submitted', tone: 'blue' },
          'JSON assumptions loaded',
          'Growth-led top line plan',
        ],
      },
      {
        id: 'scenario-4',
        cells: [
          { text: 'Project Recovery FY 2026', emphasis: true },
          'reforecast',
          'FY 2026',
          { text: 'draft', tone: 'amber' },
          'JSON assumptions loaded',
          'Recovery scenario for delayed projects',
        ],
      },
    ],
  },
  {
    id: 'scenario-assumptions',
    label: 'Scenario Assumptions',
    description:
      'Review scenario-planning content through the JSON assumptions stored on forecast scenarios rather than inventing a separate planning collection.',
    searchPlaceholder: 'Search scenario, assumption key, growth rate, utilization, margin target, or demand driver',
    filters: ['Scenario Assumptions', 'Growth', 'Pricing', 'Cost', 'Demand'],
    actions: [
      { label: 'Open Assumptions', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Assumptions', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Scenarios With Assumptions', value: '12', change: 'Scenario records carrying JSON assumptions payloads', trend: 'up' },
      { label: 'Pricing Drivers', value: '9', change: 'Scenarios carrying pricing or rate assumptions', trend: 'up' },
      { label: 'Volume Drivers', value: '10', change: 'Scenarios carrying demand or utilization assumptions', trend: 'up' },
      { label: 'Cost Drivers', value: '8', change: 'Scenarios carrying margin or cost pressure assumptions', trend: 'neutral' },
    ],
    tableTitle: 'Scenario Assumption Register',
    tableDescription:
      'Assumption view grounded in the `assumptions` JSON field on `accounting-forecast-scenarios`.',
    columns: ['Scenario', 'Assumption Key', 'Category', 'Sample Value', 'Fiscal Year', 'Status'],
    rows: [
      {
        id: 'assumption-1',
        cells: [
          { text: 'Base Case FY 2026', emphasis: true },
          'enrollmentGrowthRate',
          'demand',
          '8%',
          'FY 2026',
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'assumption-2',
        cells: [
          { text: 'Conservative Case FY 2026', emphasis: true },
          'averageDiscountRate',
          'pricing',
          '6%',
          'FY 2026',
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'assumption-3',
        cells: [
          { text: 'Aggressive Case FY 2026', emphasis: true },
          'instructorCostInflation',
          'cost',
          '5%',
          'FY 2026',
          { text: 'submitted', tone: 'blue' },
        ],
      },
      {
        id: 'assumption-4',
        cells: [
          { text: 'Project Recovery FY 2026', emphasis: true },
          'utilizationTarget',
          'operations',
          '74%',
          'FY 2026',
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function ForecastModelingPage() {
  return (
    <BudgetsForecastsPage
      eyebrow="Advanced Finance / Budgets & Forecasts"
      title="Forecast Modeling"
      description="Review forecast scenarios and scenario assumptions stored in the backend for planning, reforecasting, and variance analysis."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Scenario', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
