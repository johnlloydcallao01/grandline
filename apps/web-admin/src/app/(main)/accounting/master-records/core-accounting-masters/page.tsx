import {
  getChartOfAccountsRegister,
  getFiscalYearsRegister,
  getPeriodsRegister,
  getTaxCodesRegister,
} from './actions';
import {
  CoreAccountingMastersClient,
  type StaticCoreAccountingTab,
} from './CoreAccountingMastersClient';

const tabs: StaticCoreAccountingTab[] = [
  {
    id: 'chart-of-accounts',
    label: 'Chart of Accounts',
    description: 'Manage ledger accounts using code, type, subtype, hierarchy, control flags, and activity status.',
    searchPlaceholder: 'Search account code, name, type, parent, or control flag',
    filters: ['Active', 'Control Accounts', 'Manual Entries', 'Retained Earnings'],
    actions: [
      { label: 'Create Account', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Accounts', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Accounts', value: '128', change: 'Chart accounts currently available for use', trend: 'up' },
      { label: 'Control Accounts', value: '11', change: 'System-controlled ledger accounts', trend: 'neutral' },
      { label: 'Manual Entry Allowed', value: '103', change: 'Accounts open to direct manual journals', trend: 'up' },
      { label: 'Parent Accounts', value: '19', change: 'Hierarchy roots and grouping parents', trend: 'neutral' },
    ],
    tableTitle: 'Chart Of Accounts Register',
    tableDescription: 'Account master records using code, type, hierarchy, normal balance, and control flags.',
    columns: ['Code', 'Name', 'Type', 'Parent', 'Normal Balance', 'Status'],
    rows: [
      {
        id: 'coa-1',
        cells: [
          { text: '1100', emphasis: true },
          'Accounts Receivable',
          'asset',
          'Current Assets',
          'debit',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'coa-2',
        cells: [
          { text: '2100', emphasis: true },
          'Accrued Liabilities',
          'liability',
          'Current Liabilities',
          'credit',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'coa-3',
        cells: [
          { text: '3200', emphasis: true },
          'Retained Earnings',
          'equity',
          'Equity',
          'credit',
          { text: 'Control', tone: 'blue' },
        ],
      },
      {
        id: 'coa-4',
        cells: [
          { text: '9999', emphasis: true },
          'Suspense Account',
          'asset',
          'Current Assets',
          'debit',
          { text: 'Active', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'fiscal-years',
    label: 'Fiscal Years',
    description: 'Maintain fiscal-year codes, date ranges, close mode, lock date, close status, and responsible users.',
    searchPlaceholder: 'Search fiscal year code, name, status, close mode, or date range',
    filters: ['Draft', 'Open', 'Closed', 'Manual Close'],
    actions: [
      { label: 'Create Fiscal Year', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Years', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Configured Years', value: '4', change: 'Fiscal years on record', trend: 'neutral' },
      { label: 'Closed Years', value: '1', change: 'Years with close date captured', trend: 'neutral' },
      { label: 'Open Years', value: '2', change: 'Years available for active posting windows', trend: 'up' },
      { label: 'Locked From Dates', value: '3', change: 'Years enforcing posting lock dates', trend: 'up' },
    ],
    tableTitle: 'Fiscal Year Register',
    tableDescription: 'Fiscal-year records showing code, range, status, close mode, and close information.',
    columns: ['Code', 'Name', 'Date Range', 'Close Mode', 'Locked From', 'Status'],
    rows: [
      {
        id: 'fy-1',
        cells: [
          { text: 'FY2025', emphasis: true },
          'Fiscal Year 2025',
          '2025-01-01 to 2025-12-31',
          'manual',
          '2025-12-31',
          { text: 'Closed', tone: 'green' },
        ],
      },
      {
        id: 'fy-2',
        cells: [
          { text: 'FY2026', emphasis: true },
          'Fiscal Year 2026',
          '2026-01-01 to 2026-12-31',
          'manual',
          '2026-05-25',
          { text: 'Open', tone: 'blue' },
        ],
      },
      {
        id: 'fy-3',
        cells: [
          { text: 'FY2027', emphasis: true },
          'Fiscal Year 2027',
          '2027-01-01 to 2027-12-31',
          'manual',
          '-',
          { text: 'Draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'accounting-periods',
    label: 'Accounting Periods',
    description: 'Maintain accounting periods under a fiscal year with labels, numbering, date ranges, status, and lock dates.',
    searchPlaceholder: 'Search period label, fiscal year, period number, status, or date range',
    filters: ['Draft', 'Open', 'Closed', 'Locked'],
    actions: [
      { label: 'Create Period', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Periods', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Configured Periods', value: '18', change: 'Periods stored under fiscal years', trend: 'up' },
      { label: 'Closed Periods', value: '14', change: 'Periods already closed', trend: 'neutral' },
      { label: 'Open Periods', value: '2', change: 'Periods available for posting', trend: 'neutral' },
      { label: 'Locked Periods', value: '6', change: 'Periods with lock dates enforced', trend: 'up' },
    ],
    tableTitle: 'Accounting Period Register',
    tableDescription: 'Period records using fiscal-year linkage, numbering, range, status, and close fields.',
    columns: ['Label', 'Fiscal Year', 'Period No.', 'Date Range', 'Locked From', 'Status'],
    rows: [
      {
        id: 'period-1',
        cells: [
          { text: '2026 P04', emphasis: true },
          'FY2026',
          '4',
          '2026-04-01 to 2026-04-30',
          '2026-04-30',
          { text: 'Closed', tone: 'green' },
        ],
      },
      {
        id: 'period-2',
        cells: [
          { text: '2026 P05', emphasis: true },
          'FY2026',
          '5',
          '2026-05-01 to 2026-05-31',
          '2026-05-25',
          { text: 'Open', tone: 'blue' },
        ],
      },
      {
        id: 'period-3',
        cells: [
          { text: '2026 P06', emphasis: true },
          'FY2026',
          '6',
          '2026-06-01 to 2026-06-30',
          '-',
          { text: 'Draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'tax-codes',
    label: 'Tax Codes',
    description: 'Maintain tax-code metadata with code, scope, rate, calculation method, linked accounts, and active state.',
    searchPlaceholder: 'Search tax code, name, scope, rate, method, or active state',
    filters: ['Active', 'Sales', 'Purchase', 'Both'],
    actions: [
      { label: 'Create Tax Code', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Tax Codes', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Tax Codes', value: '12', change: 'Codes available for transaction use', trend: 'up' },
      { label: 'Sales Scope', value: '5', change: 'Codes usable on sales-side transactions', trend: 'neutral' },
      { label: 'Purchase Scope', value: '7', change: 'Codes usable on purchase-side transactions', trend: 'neutral' },
      { label: 'Inactive Codes', value: '2', change: 'Retained for historical usage', trend: 'down' },
    ],
    tableTitle: 'Tax Code Register',
    tableDescription: 'Tax-code records using code, scope, rate, method, and activity fields from the collection.',
    columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'],
    rows: [
      {
        id: 'tax-1',
        cells: [
          { text: 'VAT12', emphasis: true },
          'Standard VAT 12%',
          'both',
          { text: '12%', align: 'right' },
          'exclusive',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'tax-2',
        cells: [
          { text: 'NONVAT', emphasis: true },
          'Non-VAT Sale',
          'sales',
          { text: '0%', align: 'right' },
          'exclusive',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'tax-3',
        cells: [
          { text: 'EWTP2', emphasis: true },
          'Expanded Withholding 2%',
          'purchase',
          { text: '2%', align: 'right' },
          'exclusive',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'tax-4',
        cells: [
          { text: 'LEGACY0', emphasis: true },
          'Legacy Zero Rated',
          'both',
          { text: '0%', align: 'right' },
          'exclusive',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
];

type CoreAccountingMastersPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
  }>;
};

function normalizeCoreAccountingTab(value?: string | string[]) {
  const tabValue = Array.isArray(value) ? value[0] : value;
  return tabValue === 'fiscal-years' || tabValue === 'accounting-periods' || tabValue === 'tax-codes'
    ? tabValue
    : 'chart-of-accounts';
}

export default async function CoreAccountingMastersPage({
  searchParams,
}: CoreAccountingMastersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab = normalizeCoreAccountingTab(resolvedSearchParams?.tab);
  const [initialChartData, initialFiscalYearsData, initialPeriodsData, initialTaxCodesData] =
    await Promise.all([
      getChartOfAccountsRegister().catch(() => null),
      getFiscalYearsRegister().catch(() => null),
      getPeriodsRegister().catch(() => null),
      getTaxCodesRegister().catch(() => null),
    ]);

  return (
    <CoreAccountingMastersClient
      staticTabs={tabs}
      initialChartData={initialChartData}
      initialFiscalYearsData={initialFiscalYearsData}
      initialPeriodsData={initialPeriodsData}
      initialTaxCodesData={initialTaxCodesData}
      initialTab={initialTab}
    />
  );
}
