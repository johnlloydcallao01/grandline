'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from '@/components/ui/IconWrapper';
import {
  createChartOfAccount,
  createFiscalYear,
  createPeriod,
  createTaxCode,
  deleteChartOfAccount,
  deleteFiscalYear,
  deletePeriod,
  deleteTaxCode,
  getChartOfAccountDetail,
  getChartOfAccountsRegister,
  getFiscalYearDetail,
  getFiscalYearsRegister,
  getPeriodDetail,
  getPeriodsRegister,
  getTaxCodeDetail,
  getTaxCodesRegister,
  updateChartOfAccount,
  updateFiscalYear,
  updatePeriod,
  updateTaxCode,
  type ChartOfAccountDetail,
  type ChartOfAccountsRegisterResponse,
  type CoreAccountingMetric,
  type FiscalYearDetail,
  type FiscalYearsRegisterResponse,
  type PeriodDetail,
  type PeriodsRegisterResponse,
  type TaxCodeDetail,
  type TaxCodesRegisterResponse,
} from './actions';

type StaticMetric = {
  label: string;
  value: string;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
};

type StaticBadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red';

type StaticTableCell =
  | string
  | {
      text: string;
      tone?: StaticBadgeTone;
      emphasis?: boolean;
      align?: 'left' | 'right' | 'center';
    };

type StaticTableRow = {
  id: string;
  cells: StaticTableCell[];
};

export type StaticCoreAccountingTab = {
  id: string;
  label: string;
  description: string;
  searchPlaceholder: string;
  filters: string[];
  metrics: StaticMetric[];
  actions: Array<{
    label: string;
    icon?: 'plus' | 'download' | 'refresh';
    variant?: 'primary' | 'secondary' | 'ghost';
  }>;
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: StaticTableRow[];
};

type CoreAccountingTab = 'chart-of-accounts' | 'fiscal-years' | 'accounting-periods' | 'tax-codes';

type ChartFilterState = {
  statuses: string[];
  accountTypes: string[];
  accountSubTypes: string[];
  controlAccountsOnly: boolean;
  manualEntriesOnly: boolean;
  retainedEarningsOnly: boolean;
  parentAccountsOnly: boolean;
};

type FiscalYearFilterState = {
  statuses: string[];
  closeModes: string[];
};

type PeriodFilterState = {
  statuses: string[];
  fiscalYearId: string;
};

type TaxCodeFilterState = {
  scopes: string[];
  calculationMethods: string[];
  isActive: boolean | null;
};

type CreateFormState = {
  code: string;
  name: string;
  accountType: string;
  accountSubType: string;
  normalBalance: 'debit' | 'credit';
  parentAccount: string;
  isActive: boolean;
  allowManualEntries: boolean;
  isControlAccount: boolean;
  isRetainedEarnings: boolean;
  isSuspenseAccount: boolean;
  description: string;
  sortOrder: string;
};

type FiscalYearCreateFormState = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  closeMode: string;
  lockedFromDate: string;
  notes: string;
};

type PeriodCreateFormState = {
  label: string;
  periodNumber: string;
  fiscalYear: string;
  startDate: string;
  endDate: string;
  status: string;
  lockedFromDate: string;
  notes: string;
};

type TaxCodeCreateFormState = {
  code: string;
  name: string;
  scope: string;
  rate: string;
  calculationMethod: string;
  purchaseAccount: string;
  salesAccount: string;
  isActive: boolean;
  description: string;
};

type CoreAccountingMastersClientProps = {
  staticTabs: StaticCoreAccountingTab[];
  initialChartData: ChartOfAccountsRegisterResponse | null;
  initialFiscalYearsData: FiscalYearsRegisterResponse | null;
  initialPeriodsData: PeriodsRegisterResponse | null;
  initialTaxCodesData: TaxCodesRegisterResponse | null;
  initialTab: CoreAccountingTab;
};

const PAGE_TITLE = 'Core Accounting Masters';
const PAGE_DESCRIPTION =
  'Maintain the foundational accounting reference records that control the ledger, fiscal calendar, posting windows, and tax setup.';

const chartQuickFilterConfig = {
  active: { label: 'Active', type: 'status', value: 'active' },
  control: { label: 'Control Accounts', type: 'controlAccountsOnly' },
  manual: { label: 'Manual Entries', type: 'manualEntriesOnly' },
  retained: { label: 'Retained Earnings', type: 'retainedEarningsOnly' },
} as const;

function normalizeCoreAccountingTab(value?: string | null): CoreAccountingTab {
  if (value === 'fiscal-years' || value === 'accounting-periods' || value === 'tax-codes') {
    return value;
  }

  return 'chart-of-accounts';
}

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') {
    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  }
  if (variant === 'ghost') {
    return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: CoreAccountingMetric['trend']) {
  if (trend === 'down') {
    return 'text-red-600 bg-red-50';
  }

  if (trend === 'neutral') {
    return 'text-gray-600 bg-gray-100';
  }

  return 'text-green-600 bg-green-50';
}

function getStatusBadgeClasses(status?: string | null) {
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return 'bg-green-50 text-green-700 ring-green-200';
    case 'inactive':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-200';
  }
}

function getFyStatusBadgeClasses(status?: string | null) {
  switch (String(status || '').toLowerCase()) {
    case 'open':
      return 'bg-blue-50 text-blue-700 ring-blue-200';
    case 'closed':
      return 'bg-green-50 text-green-700 ring-green-200';
    case 'draft':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-200';
  }
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = String(value ?? '');
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function haveSameEntries(left: string[], right: string[]) {
  return left.length === right.length && left.every((entry) => right.includes(entry));
}

function areChartFilterStatesEqual(left: ChartFilterState, right: ChartFilterState) {
  return (
    haveSameEntries(left.statuses, right.statuses) &&
    haveSameEntries(left.accountTypes, right.accountTypes) &&
    haveSameEntries(left.accountSubTypes, right.accountSubTypes) &&
    left.controlAccountsOnly === right.controlAccountsOnly &&
    left.manualEntriesOnly === right.manualEntriesOnly &&
    left.retainedEarningsOnly === right.retainedEarningsOnly &&
    left.parentAccountsOnly === right.parentAccountsOnly
  );
}

function getChartFilterCount(filters: ChartFilterState) {
  return (
    filters.statuses.length +
    filters.accountTypes.length +
    filters.accountSubTypes.length +
    (filters.controlAccountsOnly ? 1 : 0) +
    (filters.manualEntriesOnly ? 1 : 0) +
    (filters.retainedEarningsOnly ? 1 : 0) +
    (filters.parentAccountsOnly ? 1 : 0)
  );
}

function isQuickFilterActive(
  filterKey: keyof typeof chartQuickFilterConfig,
  filters: ChartFilterState,
) {
  const config = chartQuickFilterConfig[filterKey];

  if (config.type === 'status') {
    return filters.statuses.includes(config.value);
  }

  return filters[config.type];
}

function getChartFallbackTab(staticTabs: StaticCoreAccountingTab[]) {
  return staticTabs.find((tab) => tab.id === 'chart-of-accounts') ?? staticTabs[0];
}

function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
}: {
  label: string;
  value: string | number;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${trend ? getMetricTone(trend) : 'text-gray-600 bg-gray-100'}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-10 w-full max-w-xl animate-pulse rounded-lg bg-gray-200" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

const initialCreateFormState: CreateFormState = {
  code: '',
  name: '',
  accountType: 'asset',
  accountSubType: '',
  normalBalance: 'debit',
  parentAccount: '',
  isActive: true,
  allowManualEntries: true,
  isControlAccount: false,
  isRetainedEarnings: false,
  isSuspenseAccount: false,
  description: '',
  sortOrder: '0',
};

function normalizeRelationshipValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const numericValue = Number(trimmedValue);
  return Number.isFinite(numericValue) ? numericValue : trimmedValue;
}

function mapAccountDetailToFormState(account: ChartOfAccountDetail): CreateFormState {
  return {
    code: account.code || '',
    name: account.name || '',
    accountType: account.accountType || 'asset',
    accountSubType: account.accountSubType || '',
    normalBalance: account.normalBalance === 'credit' ? 'credit' : 'debit',
    parentAccount: account.parentAccount?.id ? String(account.parentAccount.id) : '',
    isActive: account.isActive !== false,
    allowManualEntries: account.allowManualEntries !== false,
    isControlAccount: account.isControlAccount === true,
    isRetainedEarnings: account.isRetainedEarnings === true,
    isSuspenseAccount: account.isSuspenseAccount === true,
    description: account.description || '',
    sortOrder: String(account.sortOrder ?? 0),
  };
}

const initialFiscalYearCreateFormState: FiscalYearCreateFormState = {
  code: '',
  name: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  closeMode: 'manual',
  lockedFromDate: '',
  notes: '',
};

function mapFiscalYearDetailToFormState(fiscalYear: FiscalYearDetail): FiscalYearCreateFormState {
  return {
    code: fiscalYear.code || '',
    name: fiscalYear.name || '',
    startDate: fiscalYear.startDate ? new Date(fiscalYear.startDate).toISOString().slice(0, 10) : '',
    endDate: fiscalYear.endDate ? new Date(fiscalYear.endDate).toISOString().slice(0, 10) : '',
    status: fiscalYear.status || 'draft',
    closeMode: fiscalYear.closeMode || 'manual',
    lockedFromDate: fiscalYear.lockedFromDate ? new Date(fiscalYear.lockedFromDate).toISOString().slice(0, 10) : '',
    notes: fiscalYear.notes || '',
  };
}

export function CoreAccountingMastersClient({
  staticTabs,
  initialChartData,
  initialFiscalYearsData,
  initialPeriodsData,
  initialTaxCodesData,
  initialTab,
}: CoreAccountingMastersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<CoreAccountingTab>(initialTab);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [chartData, setChartData] = useState<ChartOfAccountsRegisterResponse | null>(initialChartData);
  const [chartError, setChartError] = useState<string | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartSearchInput, setChartSearchInput] = useState(initialChartData?.appliedFilters.search || '');
  const [chartSubmittedSearch, setChartSubmittedSearch] = useState(
    initialChartData?.appliedFilters.search || '',
  );
  const [chartCurrentPage, setChartCurrentPage] = useState(initialChartData?.pagination.page || 1);
  const [draftChartFilters, setDraftChartFilters] = useState<ChartFilterState>({
    statuses: initialChartData?.appliedFilters.statuses || [],
    accountTypes: initialChartData?.appliedFilters.accountTypes || [],
    accountSubTypes: initialChartData?.appliedFilters.accountSubTypes || [],
    controlAccountsOnly: initialChartData?.appliedFilters.controlAccountsOnly || false,
    manualEntriesOnly: initialChartData?.appliedFilters.manualEntriesOnly || false,
    retainedEarningsOnly: initialChartData?.appliedFilters.retainedEarningsOnly || false,
    parentAccountsOnly: initialChartData?.appliedFilters.parentAccountsOnly || false,
  });
  const [appliedChartFilters, setAppliedChartFilters] = useState<ChartFilterState>({
    statuses: initialChartData?.appliedFilters.statuses || [],
    accountTypes: initialChartData?.appliedFilters.accountTypes || [],
    accountSubTypes: initialChartData?.appliedFilters.accountSubTypes || [],
    controlAccountsOnly: initialChartData?.appliedFilters.controlAccountsOnly || false,
    manualEntriesOnly: initialChartData?.appliedFilters.manualEntriesOnly || false,
    retainedEarningsOnly: initialChartData?.appliedFilters.retainedEarningsOnly || false,
    parentAccountsOnly: initialChartData?.appliedFilters.parentAccountsOnly || false,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateFormState);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<number | string | null>(null);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccountDetail | null>(null);
  const [editForm, setEditForm] = useState<CreateFormState>(initialCreateFormState);

  const [selectedAccountId, setSelectedAccountId] = useState<number | string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccountDetail | null>(null);
  const [isAccountDetailLoading, setIsAccountDetailLoading] = useState(false);
  const [accountDetailError, setAccountDetailError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<number | string | null>(null);
  const [deletingAccountName, setDeletingAccountName] = useState<string>('');
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBlockers, setDeleteBlockers] = useState<string[]>([]);

  const [fyData, setFyData] = useState<FiscalYearsRegisterResponse | null>(initialFiscalYearsData);
  const [fyError, setFyError] = useState<string | null>(null);
  const [isFyLoading, setIsFyLoading] = useState(false);
  const [fySearchInput, setFySearchInput] = useState(initialFiscalYearsData?.appliedFilters.search || '');
  const [fySubmittedSearch, setFySubmittedSearch] = useState(
    initialFiscalYearsData?.appliedFilters.search || '',
  );
  const [fyCurrentPage, setFyCurrentPage] = useState(initialFiscalYearsData?.pagination.page || 1);
  const [draftFyFilters, setDraftFyFilters] = useState<FiscalYearFilterState>({
    statuses: initialFiscalYearsData?.appliedFilters.statuses || [],
    closeModes: initialFiscalYearsData?.appliedFilters.closeModes || [],
  });
  const [appliedFyFilters, setAppliedFyFilters] = useState<FiscalYearFilterState>({
    statuses: initialFiscalYearsData?.appliedFilters.statuses || [],
    closeModes: initialFiscalYearsData?.appliedFilters.closeModes || [],
  });

  const [isFyCreateModalOpen, setIsFyCreateModalOpen] = useState(false);
  const [isFyCreateSubmitting, setIsFyCreateSubmitting] = useState(false);
  const [fyCreateError, setFyCreateError] = useState<string | null>(null);
  const [fyCreateForm, setFyCreateForm] = useState<FiscalYearCreateFormState>(initialFiscalYearCreateFormState);

  const [isFyEditModalOpen, setIsFyEditModalOpen] = useState(false);
  const [isFyEditLoading, setIsFyEditLoading] = useState(false);
  const [isFyEditSubmitting, setIsFyEditSubmitting] = useState(false);
  const [fyEditError, setFyEditError] = useState<string | null>(null);
  const [editingFyId, setEditingFyId] = useState<number | string | null>(null);
  const [editingFy, setEditingFy] = useState<FiscalYearDetail | null>(null);
  const [fyEditForm, setFyEditForm] = useState<FiscalYearCreateFormState>(initialFiscalYearCreateFormState);

  const [selectedFyId, setSelectedFyId] = useState<number | string | null>(null);
  const [selectedFy, setSelectedFy] = useState<FiscalYearDetail | null>(null);
  const [isFyDetailLoading, setIsFyDetailLoading] = useState(false);
  const [fyDetailError, setFyDetailError] = useState<string | null>(null);

  const [isFyDeleteModalOpen, setIsFyDeleteModalOpen] = useState(false);
  const [deletingFyId, setDeletingFyId] = useState<number | string | null>(null);
  const [deletingFyName, setDeletingFyName] = useState<string>('');
  const [isFyDeleteSubmitting, setIsFyDeleteSubmitting] = useState(false);
  const [fyDeleteError, setFyDeleteError] = useState<string | null>(null);
  const [fyDeleteBlockers, setFyDeleteBlockers] = useState<string[]>([]);

  const [periodData, setPeriodData] = useState<PeriodsRegisterResponse | null>(initialPeriodsData);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const [periodSearchInput, setPeriodSearchInput] = useState(initialPeriodsData?.appliedFilters.search || '');
  const [periodSubmittedSearch, setPeriodSubmittedSearch] = useState(
    initialPeriodsData?.appliedFilters.search || '',
  );
  const [periodCurrentPage, setPeriodCurrentPage] = useState(initialPeriodsData?.pagination.page || 1);
  const [draftPeriodFilters, setDraftPeriodFilters] = useState<PeriodFilterState>({
    statuses: initialPeriodsData?.appliedFilters.statuses || [],
    fiscalYearId: initialPeriodsData?.appliedFilters.fiscalYearId || '',
  });
  const [appliedPeriodFilters, setAppliedPeriodFilters] = useState<PeriodFilterState>({
    statuses: initialPeriodsData?.appliedFilters.statuses || [],
    fiscalYearId: initialPeriodsData?.appliedFilters.fiscalYearId || '',
  });

  const [isPeriodCreateModalOpen, setIsPeriodCreateModalOpen] = useState(false);
  const [isPeriodCreateSubmitting, setIsPeriodCreateSubmitting] = useState(false);
  const [periodCreateError, setPeriodCreateError] = useState<string | null>(null);
  const [periodCreateForm, setPeriodCreateForm] = useState<PeriodCreateFormState>({
    label: '',
    periodNumber: '',
    fiscalYear: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    lockedFromDate: '',
    notes: '',
  });

  const [isPeriodEditModalOpen, setIsPeriodEditModalOpen] = useState(false);
  const [isPeriodEditLoading, setIsPeriodEditLoading] = useState(false);
  const [isPeriodEditSubmitting, setIsPeriodEditSubmitting] = useState(false);
  const [periodEditError, setPeriodEditError] = useState<string | null>(null);
  const [editingPeriodId, setEditingPeriodId] = useState<number | string | null>(null);
  const [periodEditForm, setPeriodEditForm] = useState<PeriodCreateFormState>({
    label: '',
    periodNumber: '',
    fiscalYear: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    lockedFromDate: '',
    notes: '',
  });

  const [selectedPeriodId, setSelectedPeriodId] = useState<number | string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetail | null>(null);
  const [isPeriodDetailLoading, setIsPeriodDetailLoading] = useState(false);
  const [periodDetailError, setPeriodDetailError] = useState<string | null>(null);

  const [isPeriodDeleteModalOpen, setIsPeriodDeleteModalOpen] = useState(false);
  const [deletingPeriodId, setDeletingPeriodId] = useState<number | string | null>(null);
  const [deletingPeriodName, setDeletingPeriodName] = useState<string>('');
  const [isPeriodDeleteSubmitting, setIsPeriodDeleteSubmitting] = useState(false);
  const [periodDeleteError, setPeriodDeleteError] = useState<string | null>(null);
  const [periodDeleteBlockers, setPeriodDeleteBlockers] = useState<string[]>([]);

  const initialChartFetchSkippedRef = useRef(false);
  const initialFyFetchSkippedRef = useRef(false);
  const [tcData, setTcData] = useState<TaxCodesRegisterResponse | null>(initialTaxCodesData);
  const [tcError, setTcError] = useState<string | null>(null);
  const [isTcLoading, setIsTcLoading] = useState(false);
  const [tcSearchInput, setTcSearchInput] = useState(initialTaxCodesData?.appliedFilters.search || '');
  const [tcSubmittedSearch, setTcSubmittedSearch] = useState(
    initialTaxCodesData?.appliedFilters.search || '',
  );
  const [tcCurrentPage, setTcCurrentPage] = useState(initialTaxCodesData?.pagination.page || 1);
  const [draftTcFilters, setDraftTcFilters] = useState<TaxCodeFilterState>({
    scopes: initialTaxCodesData?.appliedFilters.scopes || [],
    calculationMethods: initialTaxCodesData?.appliedFilters.calculationMethods || [],
    isActive: initialTaxCodesData?.appliedFilters.isActive ?? null,
  });
  const [appliedTcFilters, setAppliedTcFilters] = useState<TaxCodeFilterState>({
    scopes: initialTaxCodesData?.appliedFilters.scopes || [],
    calculationMethods: initialTaxCodesData?.appliedFilters.calculationMethods || [],
    isActive: initialTaxCodesData?.appliedFilters.isActive ?? null,
  });

  const [isTcCreateModalOpen, setIsTcCreateModalOpen] = useState(false);
  const [isTcCreateSubmitting, setIsTcCreateSubmitting] = useState(false);
  const [tcCreateError, setTcCreateError] = useState<string | null>(null);
  const [tcCreateForm, setTcCreateForm] = useState<TaxCodeCreateFormState>({
    code: '',
    name: '',
    scope: 'both',
    rate: '0',
    calculationMethod: 'exclusive',
    purchaseAccount: '',
    salesAccount: '',
    isActive: true,
    description: '',
  });

  const [isTcEditModalOpen, setIsTcEditModalOpen] = useState(false);
  const [isTcEditLoading, setIsTcEditLoading] = useState(false);
  const [isTcEditSubmitting, setIsTcEditSubmitting] = useState(false);
  const [tcEditError, setTcEditError] = useState<string | null>(null);
  const [editingTcId, setEditingTcId] = useState<number | string | null>(null);
  const [tcEditForm, setTcEditForm] = useState<TaxCodeCreateFormState>({
    code: '',
    name: '',
    scope: 'both',
    rate: '0',
    calculationMethod: 'exclusive',
    purchaseAccount: '',
    salesAccount: '',
    isActive: true,
    description: '',
  });

  const [selectedTcId, setSelectedTcId] = useState<number | string | null>(null);
  const [selectedTc, setSelectedTc] = useState<TaxCodeDetail | null>(null);
  const [isTcDetailLoading, setIsTcDetailLoading] = useState(false);
  const [tcDetailError, setTcDetailError] = useState<string | null>(null);

  const [isTcDeleteModalOpen, setIsTcDeleteModalOpen] = useState(false);
  const [deletingTcId, setDeletingTcId] = useState<number | string | null>(null);
  const [deletingTcName, setDeletingTcName] = useState<string>('');
  const [isTcDeleteSubmitting, setIsTcDeleteSubmitting] = useState(false);
  const [tcDeleteError, setTcDeleteError] = useState<string | null>(null);
  const [tcDeleteBlockers, setTcDeleteBlockers] = useState<string[]>([]);

  const initialPeriodFetchSkippedRef = useRef(false);
  const initialTcFetchSkippedRef = useRef(false);

  const chartFallbackTab = useMemo(() => getChartFallbackTab(staticTabs), [staticTabs]);

  useEffect(() => {
    const nextTab = normalizeCoreAccountingTab(searchParams.get('tab'));
    setActiveTab((previous) => (previous === nextTab ? previous : nextTab));
  }, [searchParams]);

  const fetchChartRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
    }: {
      search: string;
      page: number;
      activeFilters: ChartFilterState;
    }) => {
      setIsChartLoading(true);
      setChartError(null);

      try {
        const payload = await getChartOfAccountsRegister({
          search,
          page,
          statuses: activeFilters.statuses,
          accountTypes: activeFilters.accountTypes,
          accountSubTypes: activeFilters.accountSubTypes,
          controlAccountsOnly: activeFilters.controlAccountsOnly,
          manualEntriesOnly: activeFilters.manualEntriesOnly,
          retainedEarningsOnly: activeFilters.retainedEarningsOnly,
          parentAccountsOnly: activeFilters.parentAccountsOnly,
        });

        setChartData(payload);
      } catch (error) {
        setChartError(error instanceof Error ? error.message : 'Unable to load chart of accounts.');
      } finally {
        setIsChartLoading(false);
      }
    },
    [],
  );

  const fetchFiscalYearsRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
    }: {
      search: string;
      page: number;
      activeFilters: FiscalYearFilterState;
    }) => {
      setIsFyLoading(true);
      setFyError(null);

      try {
        const payload = await getFiscalYearsRegister({
          search,
          page,
          statuses: activeFilters.statuses,
          closeModes: activeFilters.closeModes,
        });

        setFyData(payload);
      } catch (error) {
        setFyError(error instanceof Error ? error.message : 'Unable to load fiscal years.');
      } finally {
        setIsFyLoading(false);
      }
    },
    [],
  );

  const fetchPeriodsRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
    }: {
      search: string;
      page: number;
      activeFilters: PeriodFilterState;
    }) => {
      setIsPeriodLoading(true);
      setPeriodError(null);

      try {
        const payload = await getPeriodsRegister({
          search,
          page,
          statuses: activeFilters.statuses,
          fiscalYearId: activeFilters.fiscalYearId,
        });

        setPeriodData(payload);
      } catch (error) {
        setPeriodError(error instanceof Error ? error.message : 'Unable to load accounting periods.');
      } finally {
        setIsPeriodLoading(false);
      }
    },
    [],
  );

  const fetchTaxCodesRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
    }: {
      search: string;
      page: number;
      activeFilters: TaxCodeFilterState;
    }) => {
      setIsTcLoading(true);
      setTcError(null);

      try {
        const payload = await getTaxCodesRegister({
          search,
          page,
          scopes: activeFilters.scopes,
          calculationMethods: activeFilters.calculationMethods,
          isActive: activeFilters.isActive ?? undefined,
        });

        setTcData(payload);
      } catch (error) {
        setTcError(error instanceof Error ? error.message : 'Unable to load tax codes.');
      } finally {
        setIsTcLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeTab !== 'chart-of-accounts') {
      return;
    }

    if (!initialChartFetchSkippedRef.current && initialChartData) {
      initialChartFetchSkippedRef.current = true;
      return;
    }

    void fetchChartRegister({
      search: chartSubmittedSearch,
      page: chartCurrentPage,
      activeFilters: appliedChartFilters,
    });
  }, [
    activeTab,
    appliedChartFilters,
    chartCurrentPage,
    chartSubmittedSearch,
    fetchChartRegister,
    initialChartData,
  ]);

  useEffect(() => {
    if (activeTab !== 'fiscal-years') {
      return;
    }

    if (!initialFyFetchSkippedRef.current && initialFiscalYearsData) {
      initialFyFetchSkippedRef.current = true;
      return;
    }

    void fetchFiscalYearsRegister({
      search: fySubmittedSearch,
      page: fyCurrentPage,
      activeFilters: appliedFyFilters,
    });
  }, [
    activeTab,
    appliedFyFilters,
    fyCurrentPage,
    fySubmittedSearch,
    fetchFiscalYearsRegister,
    initialFiscalYearsData,
  ]);

  useEffect(() => {
    if (activeTab !== 'accounting-periods') {
      return;
    }

    if (!initialPeriodFetchSkippedRef.current && initialPeriodsData) {
      initialPeriodFetchSkippedRef.current = true;
      return;
    }

    void fetchPeriodsRegister({
      search: periodSubmittedSearch,
      page: periodCurrentPage,
      activeFilters: appliedPeriodFilters,
    });
  }, [
    activeTab,
    appliedPeriodFilters,
    periodCurrentPage,
    periodSubmittedSearch,
    fetchPeriodsRegister,
    initialPeriodsData,
  ]);

  useEffect(() => {
    if (activeTab !== 'tax-codes') {
      return;
    }

    if (!initialTcFetchSkippedRef.current && initialTaxCodesData) {
      initialTcFetchSkippedRef.current = true;
      return;
    }

    void fetchTaxCodesRegister({
      search: tcSubmittedSearch,
      page: tcCurrentPage,
      activeFilters: appliedTcFilters,
    });
  }, [
    activeTab,
    appliedTcFilters,
    tcCurrentPage,
    tcSubmittedSearch,
    fetchTaxCodesRegister,
    initialTaxCodesData,
  ]);

  const handleTabChange = (tabId: CoreAccountingTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleChartSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChartCurrentPage(1);
    setChartSubmittedSearch(chartSearchInput.trim());
  };

  const handleApplyFilters = () => {
    if (!areChartFilterStatesEqual(draftChartFilters, appliedChartFilters)) {
      setChartCurrentPage(1);
      setAppliedChartFilters(draftChartFilters);
    }
    setIsFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const resetState: ChartFilterState = {
      statuses: [],
      accountTypes: [],
      accountSubTypes: [],
      controlAccountsOnly: false,
      manualEntriesOnly: false,
      retainedEarningsOnly: false,
      parentAccountsOnly: false,
    };

    setDraftChartFilters(resetState);
    setAppliedChartFilters(resetState);
    setChartCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleRefreshChart = () => {
    void fetchChartRegister({
      search: chartSubmittedSearch,
      page: chartCurrentPage,
      activeFilters: appliedChartFilters,
    });
  };

  const tcFilterCount = appliedTcFilters.scopes.length + appliedTcFilters.calculationMethods.length + (appliedTcFilters.isActive !== null ? 1 : 0);

  const tcSection = tcData?.section ?? {
    id: 'tax-codes',
    label: 'Tax Codes',
    description: 'Maintain tax-code metadata with code, scope, rate, calculation method, linked accounts, and active state.',
    searchPlaceholder: 'Search tax code, name, scope, rate, method, or active state',
    filters: { scopes: [], calculationMethods: [], quickFilters: [] },
    metrics: [],
    table: { title: 'Tax Code Register', description: 'Tax-code records using code, scope, rate, method, and activity fields from the collection.', columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'], rows: [] },
  };

  const handleTcSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTcCurrentPage(1);
    setTcSubmittedSearch(tcSearchInput.trim());
  };

  const handleTcApplyFilters = () => {
    if (
      draftTcFilters.scopes.length !== appliedTcFilters.scopes.length ||
      !draftTcFilters.scopes.every((entry) => appliedTcFilters.scopes.includes(entry)) ||
      draftTcFilters.calculationMethods.length !== appliedTcFilters.calculationMethods.length ||
      !draftTcFilters.calculationMethods.every((entry) => appliedTcFilters.calculationMethods.includes(entry)) ||
      draftTcFilters.isActive !== appliedTcFilters.isActive
    ) {
      setTcCurrentPage(1);
      setAppliedTcFilters(draftTcFilters);
    }
    setIsFilterPanelOpen(false);
  };

  const handleTcResetFilters = () => {
    const resetState: TaxCodeFilterState = { scopes: [], calculationMethods: [], isActive: null };
    setDraftTcFilters(resetState);
    setAppliedTcFilters(resetState);
    setTcCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleTcRefresh = () => {
    void fetchTaxCodesRegister({
      search: tcSubmittedSearch,
      page: tcCurrentPage,
      activeFilters: appliedTcFilters,
    });
  };

  const handleTcExport = () => {
    if (!tcData?.section.table.rows.length) {
      return;
    }

    const csvRows = [
      ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'],
      ...tcData.section.table.rows.map((row) => [
        row.code,
        row.name,
        row.scopeLabel,
        row.rateDisplay,
        row.calculationMethodLabel,
        row.isActiveLabel,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'tax-code-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleViewTaxCode = async (taxCodeId: number | string) => {
    setSelectedTcId(taxCodeId);
    setSelectedTc(null);
    setTcDetailError(null);
    setIsTcDetailLoading(true);

    try {
      const payload = await getTaxCodeDetail(taxCodeId);
      setSelectedTc(payload);
    } catch (error) {
      setTcDetailError(error instanceof Error ? error.message : 'Unable to load tax code details.');
    } finally {
      setIsTcDetailLoading(false);
    }
  };

  const handleCloseTaxCodeDetail = () => {
    setSelectedTcId(null);
    setSelectedTc(null);
    setTcDetailError(null);
    setIsTcDetailLoading(false);
  };

  const handleOpenTcDeleteModal = async (taxCodeId: number | string, taxCodeName: string) => {
    setTcDeleteError(null);
    setTcDeleteBlockers([]);
    setDeletingTcId(taxCodeId);
    setDeletingTcName(taxCodeName);
    setIsTcDeleteSubmitting(false);
    setIsTcDeleteModalOpen(true);

    try {
      const detail = await getTaxCodeDetail(taxCodeId);
      const blockers: string[] = [];

      if (detail?.usageSummary?.expenseCount && detail.usageSummary.expenseCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.expenseCount} expense(s)`);
      }

      if (detail?.usageSummary?.billLineItemCount && detail.usageSummary.billLineItemCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.billLineItemCount} bill line item(s)`);
      }

      if (detail?.usageSummary?.invoiceLineItemCount && detail.usageSummary.invoiceLineItemCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.invoiceLineItemCount} invoice line item(s)`);
      }

      if (detail?.usageSummary?.journalEntryLineCount && detail.usageSummary.journalEntryLineCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.journalEntryLineCount} journal entry line(s)`);
      }

      setTcDeleteBlockers(blockers);
    } catch {
      setTcDeleteBlockers([]);
    }
  };

  const handleCloseTcDeleteModal = () => {
    setIsTcDeleteModalOpen(false);
    setDeletingTcId(null);
    setDeletingTcName('');
    setIsTcDeleteSubmitting(false);
    setTcDeleteError(null);
    setTcDeleteBlockers([]);
  };

  const handleConfirmTcDelete = async () => {
    if (deletingTcId === null) return;

    setIsTcDeleteSubmitting(true);
    setTcDeleteError(null);

    try {
      await deleteTaxCode(deletingTcId);
      handleCloseTcDeleteModal();
      await fetchTaxCodesRegister({
        search: tcSubmittedSearch,
        page: tcCurrentPage,
        activeFilters: appliedTcFilters,
      });
    } catch (error) {
      setTcDeleteError(error instanceof Error ? error.message : 'Unable to delete tax code.');
      setIsTcDeleteSubmitting(false);
    }
  };

  const handleOpenTcCreateModal = () => {
    setTcCreateError(null);
    setTcCreateForm({
      code: '',
      name: '',
      scope: 'both',
      rate: '0',
      calculationMethod: 'exclusive',
      purchaseAccount: '',
      salesAccount: '',
      isActive: true,
      description: '',
    });
    setIsTcCreateModalOpen(true);
  };

  const handleCloseTcCreateModal = () => {
    setIsTcCreateModalOpen(false);
    setTcCreateError(null);
    setTcCreateForm({
      code: '',
      name: '',
      scope: 'both',
      rate: '0',
      calculationMethod: 'exclusive',
      purchaseAccount: '',
      salesAccount: '',
      isActive: true,
      description: '',
    });
    setIsTcCreateSubmitting(false);
  };

  const handleOpenTcEditModal = async (taxCodeId: number | string) => {
    handleCloseTaxCodeDetail();
    setEditingTcId(taxCodeId);
    setTcEditForm({
      code: '',
      name: '',
      scope: 'both',
      rate: '0',
      calculationMethod: 'exclusive',
      purchaseAccount: '',
      salesAccount: '',
      isActive: true,
      description: '',
    });
    setTcEditError(null);
    setIsTcEditSubmitting(false);
    setIsTcEditLoading(true);
    setIsTcEditModalOpen(true);

    try {
      const payload = await getTaxCodeDetail(taxCodeId);
      setTcEditForm({
        code: payload.code || '',
        name: payload.name || '',
        scope: payload.scope || 'both',
        rate: String(payload.rate ?? 0),
        calculationMethod: payload.calculationMethod || 'exclusive',
        purchaseAccount: typeof payload.purchaseAccount === 'object' && payload.purchaseAccount ? String(payload.purchaseAccount.id) : String(payload.purchaseAccount ?? ''),
        salesAccount: typeof payload.salesAccount === 'object' && payload.salesAccount ? String(payload.salesAccount.id) : String(payload.salesAccount ?? ''),
        isActive: payload.isActive !== false,
        description: payload.description || '',
      });
    } catch (error) {
      setTcEditError(error instanceof Error ? error.message : 'Unable to load tax code for editing.');
    } finally {
      setIsTcEditLoading(false);
    }
  };

  const handleCloseTcEditModal = () => {
    setIsTcEditModalOpen(false);
    setIsTcEditLoading(false);
    setIsTcEditSubmitting(false);
    setTcEditError(null);
    setEditingTcId(null);
    setTcEditForm({
      code: '',
      name: '',
      scope: 'both',
      rate: '0',
      calculationMethod: 'exclusive',
      purchaseAccount: '',
      salesAccount: '',
      isActive: true,
      description: '',
    });
  };

  const handleCreateTaxCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTcCreateError(null);
    setIsTcCreateSubmitting(true);

    try {
      const created = await createTaxCode({
        code: tcCreateForm.code.trim(),
        name: tcCreateForm.name.trim(),
        scope: tcCreateForm.scope,
        rate: Number(tcCreateForm.rate),
        calculationMethod: tcCreateForm.calculationMethod,
        purchaseAccount: tcCreateForm.purchaseAccount.trim() ? Number(tcCreateForm.purchaseAccount) : null,
        salesAccount: tcCreateForm.salesAccount.trim() ? Number(tcCreateForm.salesAccount) : null,
        isActive: tcCreateForm.isActive,
        description: tcCreateForm.description.trim() || null,
      });

      handleCloseTcCreateModal();
      setTcCurrentPage(1);
      await fetchTaxCodesRegister({
        search: tcSubmittedSearch,
        page: 1,
        activeFilters: appliedTcFilters,
      });
      await handleViewTaxCode(created.id);
    } catch (error) {
      setTcCreateError(error instanceof Error ? error.message : 'Unable to create tax code.');
      setIsTcCreateSubmitting(false);
    }
  };

  const handleEditTaxCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingTcId === null) {
      setTcEditError('No tax code selected for editing.');
      return;
    }

    setTcEditError(null);
    setIsTcEditSubmitting(true);

    try {
      const updated = await updateTaxCode(editingTcId, {
        code: tcEditForm.code.trim(),
        name: tcEditForm.name.trim(),
        scope: tcEditForm.scope,
        rate: Number(tcEditForm.rate),
        calculationMethod: tcEditForm.calculationMethod,
        purchaseAccount: tcEditForm.purchaseAccount.trim() ? Number(tcEditForm.purchaseAccount) : null,
        salesAccount: tcEditForm.salesAccount.trim() ? Number(tcEditForm.salesAccount) : null,
        isActive: tcEditForm.isActive,
        description: tcEditForm.description.trim() || null,
      });

      handleCloseTcEditModal();
      await fetchTaxCodesRegister({
        search: tcSubmittedSearch,
        page: tcCurrentPage,
        activeFilters: appliedTcFilters,
      });
      await handleViewTaxCode(updated.id);
    } catch (error) {
      setTcEditError(error instanceof Error ? error.message : 'Unable to update tax code.');
      setIsTcEditSubmitting(false);
    }
  };

  const handleToggleTcQuickFilter = (value: string) => {
    if (value.startsWith('isActive:')) {
      const newIsActive = appliedTcFilters.isActive === true ? null : true;
      setAppliedTcFilters((previous) => ({ ...previous, isActive: newIsActive }));
      setDraftTcFilters((previous) => ({ ...previous, isActive: newIsActive }));
      setTcCurrentPage(1);
      return;
    }

    if (value.startsWith('scope:')) {
      const scopeValue = value.replace('scope:', '');
      setAppliedTcFilters((previous) => {
        const scopes = previous.scopes.includes(scopeValue)
          ? previous.scopes.filter((entry) => entry !== scopeValue)
          : [...previous.scopes, scopeValue];
        return { ...previous, scopes };
      });
      setDraftTcFilters((previous) => {
        const scopes = previous.scopes.includes(scopeValue)
          ? previous.scopes.filter((entry) => entry !== scopeValue)
          : [...previous.scopes, scopeValue];
        return { ...previous, scopes };
      });
      setTcCurrentPage(1);
    }
  };

  const fyFilterCount = appliedFyFilters.statuses.length + appliedFyFilters.closeModes.length;

  const fySection = fyData?.section ?? {
    id: 'fiscal-years',
    label: 'Fiscal Years',
    description: 'Maintain fiscal-year codes, date ranges, close mode, lock date, close status, and responsible users.',
    searchPlaceholder: 'Search fiscal year code, name, status, close mode, or date range',
    filters: { statuses: [], closeModes: [], quickFilters: [] },
    metrics: [],
    table: { title: 'Fiscal Year Register', description: 'Fiscal-year records showing code, range, status, close mode, and close information.', columns: ['Code', 'Name', 'Date Range', 'Close Mode', 'Locked From', 'Status'], rows: [] },
  };

  const handleFySearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFyCurrentPage(1);
    setFySubmittedSearch(fySearchInput.trim());
  };

  const handleFyApplyFilters = () => {
    if (
      draftFyFilters.statuses.length !== appliedFyFilters.statuses.length ||
      !draftFyFilters.statuses.every((entry) => appliedFyFilters.statuses.includes(entry)) ||
      draftFyFilters.closeModes.length !== appliedFyFilters.closeModes.length ||
      !draftFyFilters.closeModes.every((entry) => appliedFyFilters.closeModes.includes(entry))
    ) {
      setFyCurrentPage(1);
      setAppliedFyFilters(draftFyFilters);
    }
    setIsFilterPanelOpen(false);
  };

  const handleFyResetFilters = () => {
    const resetState: FiscalYearFilterState = { statuses: [], closeModes: [] };
    setDraftFyFilters(resetState);
    setAppliedFyFilters(resetState);
    setFyCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleFyRefresh = () => {
    void fetchFiscalYearsRegister({
      search: fySubmittedSearch,
      page: fyCurrentPage,
      activeFilters: appliedFyFilters,
    });
  };

  const handleFyExport = () => {
    if (!fyData?.section.table.rows.length) {
      return;
    }

    const csvRows = [
      ['Code', 'Name', 'Start Date', 'End Date', 'Close Mode', 'Status'],
      ...fyData.section.table.rows.map((row) => [
        row.code,
        row.name,
        row.startDate,
        row.endDate,
        row.closeModeLabel,
        row.statusLabel,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'fiscal-year-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleViewFiscalYear = async (fiscalYearId: number | string) => {
    setSelectedFyId(fiscalYearId);
    setSelectedFy(null);
    setFyDetailError(null);
    setIsFyDetailLoading(true);

    try {
      const payload = await getFiscalYearDetail(fiscalYearId);
      setSelectedFy(payload);
    } catch (error) {
      setFyDetailError(error instanceof Error ? error.message : 'Unable to load fiscal year details.');
    } finally {
      setIsFyDetailLoading(false);
    }
  };

  const handleCloseFiscalYearDetail = () => {
    setSelectedFyId(null);
    setSelectedFy(null);
    setFyDetailError(null);
    setIsFyDetailLoading(false);
  };

  const handleOpenFyDeleteModal = async (fiscalYearId: number | string, fiscalYearName: string) => {
    setFyDeleteError(null);
    setFyDeleteBlockers([]);
    setDeletingFyId(fiscalYearId);
    setDeletingFyName(fiscalYearName);
    setIsFyDeleteSubmitting(false);
    setIsFyDeleteModalOpen(true);

    try {
      const detail = await getFiscalYearDetail(fiscalYearId);
      const blockers: string[] = [];

      if (detail?.usageSummary?.periodCount && detail.usageSummary.periodCount > 0) {
        blockers.push(`Has ${detail.usageSummary.periodCount} associated period(s)`);
      }

      if (detail?.usageSummary?.budgetCount && detail.usageSummary.budgetCount > 0) {
        blockers.push(`Has ${detail.usageSummary.budgetCount} budget reference(s)`);
      }

      if (detail?.usageSummary?.journalEntryCount && detail.usageSummary.journalEntryCount > 0) {
        blockers.push(`Has ${detail.usageSummary.journalEntryCount} journal entry reference(s)`);
      }

      setFyDeleteBlockers(blockers);
    } catch {
      setFyDeleteBlockers([]);
    }
  };

  const handleCloseFyDeleteModal = () => {
    setIsFyDeleteModalOpen(false);
    setDeletingFyId(null);
    setDeletingFyName('');
    setIsFyDeleteSubmitting(false);
    setFyDeleteError(null);
    setFyDeleteBlockers([]);
  };

  const handleConfirmFyDelete = async () => {
    if (deletingFyId === null) return;

    setIsFyDeleteSubmitting(true);
    setFyDeleteError(null);

    try {
      await deleteFiscalYear(deletingFyId);
      handleCloseFyDeleteModal();
      await fetchFiscalYearsRegister({
        search: fySubmittedSearch,
        page: fyCurrentPage,
        activeFilters: appliedFyFilters,
      });
    } catch (error) {
      setFyDeleteError(error instanceof Error ? error.message : 'Unable to delete fiscal year.');
      setIsFyDeleteSubmitting(false);
    }
  };

  const handleOpenFyCreateModal = () => {
    setFyCreateError(null);
    setFyCreateForm(initialFiscalYearCreateFormState);
    setIsFyCreateModalOpen(true);
  };

  const handleCloseFyCreateModal = () => {
    setIsFyCreateModalOpen(false);
    setFyCreateError(null);
    setFyCreateForm(initialFiscalYearCreateFormState);
    setIsFyCreateSubmitting(false);
  };

  const handleOpenFyEditModal = async (fiscalYearId: number | string) => {
    handleCloseFiscalYearDetail();
    setEditingFyId(fiscalYearId);
    setEditingFy(null);
    setFyEditForm(initialFiscalYearCreateFormState);
    setFyEditError(null);
    setIsFyEditSubmitting(false);
    setIsFyEditLoading(true);
    setIsFyEditModalOpen(true);

    try {
      const payload = await getFiscalYearDetail(fiscalYearId);
      setEditingFy(payload);
      setFyEditForm(mapFiscalYearDetailToFormState(payload));
    } catch (error) {
      setFyEditError(error instanceof Error ? error.message : 'Unable to load fiscal year for editing.');
    } finally {
      setIsFyEditLoading(false);
    }
  };

  const handleCloseFyEditModal = () => {
    setIsFyEditModalOpen(false);
    setIsFyEditLoading(false);
    setIsFyEditSubmitting(false);
    setFyEditError(null);
    setEditingFyId(null);
    setEditingFy(null);
    setFyEditForm(initialFiscalYearCreateFormState);
  };

  const handleCreateFiscalYear = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFyCreateError(null);
    setIsFyCreateSubmitting(true);

    try {
      const created = await createFiscalYear({
        code: fyCreateForm.code.trim(),
        name: fyCreateForm.name.trim(),
        startDate: fyCreateForm.startDate,
        endDate: fyCreateForm.endDate,
        status: fyCreateForm.status,
        closeMode: fyCreateForm.closeMode,
        lockedFromDate: fyCreateForm.lockedFromDate.trim() || null,
        notes: fyCreateForm.notes.trim() || null,
      });

      handleCloseFyCreateModal();
      setFyCurrentPage(1);
      await fetchFiscalYearsRegister({
        search: fySubmittedSearch,
        page: 1,
        activeFilters: appliedFyFilters,
      });
      await handleViewFiscalYear(created.id);
    } catch (error) {
      setFyCreateError(error instanceof Error ? error.message : 'Unable to create fiscal year.');
      setIsFyCreateSubmitting(false);
    }
  };

  const handleEditFiscalYear = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingFyId === null) {
      setFyEditError('No fiscal year selected for editing.');
      return;
    }

    setFyEditError(null);
    setIsFyEditSubmitting(true);

    try {
      const updated = await updateFiscalYear(editingFyId, {
        code: fyEditForm.code.trim(),
        name: fyEditForm.name.trim(),
        startDate: fyEditForm.startDate,
        endDate: fyEditForm.endDate,
        status: fyEditForm.status,
        closeMode: fyEditForm.closeMode,
        lockedFromDate: fyEditForm.lockedFromDate.trim() || null,
        notes: fyEditForm.notes.trim() || null,
      });

      handleCloseFyEditModal();
      await fetchFiscalYearsRegister({
        search: fySubmittedSearch,
        page: fyCurrentPage,
        activeFilters: appliedFyFilters,
      });
      await handleViewFiscalYear(updated.id);
    } catch (error) {
      setFyEditError(error instanceof Error ? error.message : 'Unable to update fiscal year.');
      setIsFyEditSubmitting(false);
    }
  };

  const fyEditPermissions = editingFy?.editPermissions;
  const isFyStartDateEditDisabled = fyEditPermissions?.canEditStartDate === false;
  const isFyEndDateEditDisabled = fyEditPermissions?.canEditEndDate === false;

  const periodFilterCount = appliedPeriodFilters.statuses.length + (appliedPeriodFilters.fiscalYearId ? 1 : 0);

  const periodSection = periodData?.section ?? {
    id: 'accounting-periods',
    label: 'Accounting Periods',
    description: 'Maintain accounting periods under each fiscal year, including date ranges, status, lock dates, and close information.',
    searchPlaceholder: 'Search period label, fiscal year, status, or date range',
    filters: { statuses: [], fiscalYears: [], quickFilters: [] },
    metrics: [],
    table: { title: 'Period Register', description: 'Period records showing label, fiscal year, date range, status, and lock information.', columns: ['Label', 'Period #', 'Fiscal Year', 'Date Range', 'Status', 'Locked From'], rows: [] },
  };

  const handlePeriodSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPeriodCurrentPage(1);
    setPeriodSubmittedSearch(periodSearchInput.trim());
  };

  const handlePeriodApplyFilters = () => {
    if (
      draftPeriodFilters.statuses.length !== appliedPeriodFilters.statuses.length ||
      !draftPeriodFilters.statuses.every((entry) => appliedPeriodFilters.statuses.includes(entry)) ||
      draftPeriodFilters.fiscalYearId !== appliedPeriodFilters.fiscalYearId
    ) {
      setPeriodCurrentPage(1);
      setAppliedPeriodFilters(draftPeriodFilters);
    }
    setIsFilterPanelOpen(false);
  };

  const handlePeriodResetFilters = () => {
    const resetState: PeriodFilterState = { statuses: [], fiscalYearId: '' };
    setDraftPeriodFilters(resetState);
    setAppliedPeriodFilters(resetState);
    setPeriodCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handlePeriodRefresh = () => {
    void fetchPeriodsRegister({
      search: periodSubmittedSearch,
      page: periodCurrentPage,
      activeFilters: appliedPeriodFilters,
    });
  };

  const handlePeriodExport = () => {
    if (!periodData?.section.table.rows.length) {
      return;
    }

    const csvRows = [
      ['Label', 'Period #', 'Fiscal Year', 'Start Date', 'End Date', 'Status'],
      ...periodData.section.table.rows.map((row) => [
        row.label,
        String(row.periodNumber ?? ''),
        row.fiscalYearCode,
        row.startDate,
        row.endDate,
        row.statusLabel,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'accounting-periods-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleViewPeriod = async (periodId: number | string) => {
    setSelectedPeriodId(periodId);
    setSelectedPeriod(null);
    setPeriodDetailError(null);
    setIsPeriodDetailLoading(true);

    try {
      const payload = await getPeriodDetail(periodId);
      setSelectedPeriod(payload);
    } catch (error) {
      setPeriodDetailError(error instanceof Error ? error.message : 'Unable to load period details.');
    } finally {
      setIsPeriodDetailLoading(false);
    }
  };

  const handleClosePeriodDetail = () => {
    setSelectedPeriodId(null);
    setSelectedPeriod(null);
    setPeriodDetailError(null);
    setIsPeriodDetailLoading(false);
  };

  const handleOpenPeriodDeleteModal = async (periodId: number | string, periodName: string) => {
    setPeriodDeleteError(null);
    setPeriodDeleteBlockers([]);
    setDeletingPeriodId(periodId);
    setDeletingPeriodName(periodName);
    setIsPeriodDeleteSubmitting(false);
    setIsPeriodDeleteModalOpen(true);

    try {
      const detail = await getPeriodDetail(periodId);
      const blockers: string[] = [];

      if (detail?.usageSummary?.journalEntryCount && detail.usageSummary.journalEntryCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.journalEntryCount} journal entry(ies)`);
      }

      if (detail?.usageSummary?.depreciationEntryCount && detail.usageSummary.depreciationEntryCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.depreciationEntryCount} depreciation entry(ies)`);
      }

      if (detail?.usageSummary?.budgetLineCount && detail.usageSummary.budgetLineCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.budgetLineCount} budget line(s)`);
      }

      setPeriodDeleteBlockers(blockers);
    } catch {
      setPeriodDeleteBlockers([]);
    }
  };

  const handleClosePeriodDeleteModal = () => {
    setIsPeriodDeleteModalOpen(false);
    setDeletingPeriodId(null);
    setDeletingPeriodName('');
    setIsPeriodDeleteSubmitting(false);
    setPeriodDeleteError(null);
    setPeriodDeleteBlockers([]);
  };

  const handleConfirmPeriodDelete = async () => {
    if (deletingPeriodId === null) return;

    setIsPeriodDeleteSubmitting(true);
    setPeriodDeleteError(null);

    try {
      await deletePeriod(deletingPeriodId);
      handleClosePeriodDeleteModal();
      await fetchPeriodsRegister({
        search: periodSubmittedSearch,
        page: periodCurrentPage,
        activeFilters: appliedPeriodFilters,
      });
    } catch (error) {
      setPeriodDeleteError(error instanceof Error ? error.message : 'Unable to delete period.');
      setIsPeriodDeleteSubmitting(false);
    }
  };

  const handleOpenPeriodCreateModal = () => {
    setPeriodCreateError(null);
    setPeriodCreateForm({
      label: '',
      periodNumber: '',
      fiscalYear: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      lockedFromDate: '',
      notes: '',
    });
    setIsPeriodCreateModalOpen(true);
  };

  const handleClosePeriodCreateModal = () => {
    setIsPeriodCreateModalOpen(false);
    setPeriodCreateError(null);
    setPeriodCreateForm({
      label: '',
      periodNumber: '',
      fiscalYear: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      lockedFromDate: '',
      notes: '',
    });
    setIsPeriodCreateSubmitting(false);
  };

  const handleOpenPeriodEditModal = async (periodId: number | string) => {
    handleClosePeriodDetail();
    setEditingPeriodId(periodId);
    setPeriodEditForm({
      label: '',
      periodNumber: '',
      fiscalYear: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      lockedFromDate: '',
      notes: '',
    });
    setPeriodEditError(null);
    setIsPeriodEditSubmitting(false);
    setIsPeriodEditLoading(true);
    setIsPeriodEditModalOpen(true);

    try {
      const payload = await getPeriodDetail(periodId);
      const fyId = typeof payload.fiscalYear === 'object' && payload.fiscalYear ? String(payload.fiscalYear.id) : String(payload.fiscalYear ?? '');
      setPeriodEditForm({
        label: payload.label || '',
        periodNumber: String(payload.periodNumber ?? ''),
        fiscalYear: fyId,
        startDate: payload.startDate ? new Date(payload.startDate).toISOString().slice(0, 10) : '',
        endDate: payload.endDate ? new Date(payload.endDate).toISOString().slice(0, 10) : '',
        status: payload.status || 'draft',
        lockedFromDate: payload.lockedFromDate ? new Date(payload.lockedFromDate).toISOString().slice(0, 10) : '',
        notes: payload.notes || '',
      });
    } catch (error) {
      setPeriodEditError(error instanceof Error ? error.message : 'Unable to load period for editing.');
    } finally {
      setIsPeriodEditLoading(false);
    }
  };

  const handleClosePeriodEditModal = () => {
    setIsPeriodEditModalOpen(false);
    setIsPeriodEditLoading(false);
    setIsPeriodEditSubmitting(false);
    setPeriodEditError(null);
    setEditingPeriodId(null);
    setPeriodEditForm({
      label: '',
      periodNumber: '',
      fiscalYear: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      lockedFromDate: '',
      notes: '',
    });
  };

  const handleCreatePeriod = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPeriodCreateError(null);
    setIsPeriodCreateSubmitting(true);

    try {
      const created = await createPeriod({
        label: periodCreateForm.label.trim(),
        periodNumber: Number(periodCreateForm.periodNumber),
        fiscalYear: Number(periodCreateForm.fiscalYear),
        startDate: periodCreateForm.startDate,
        endDate: periodCreateForm.endDate,
        status: periodCreateForm.status,
        lockedFromDate: periodCreateForm.lockedFromDate.trim() || null,
        notes: periodCreateForm.notes.trim() || null,
      });

      handleClosePeriodCreateModal();
      setPeriodCurrentPage(1);
      await fetchPeriodsRegister({
        search: periodSubmittedSearch,
        page: 1,
        activeFilters: appliedPeriodFilters,
      });
      await handleViewPeriod(created.id);
    } catch (error) {
      setPeriodCreateError(error instanceof Error ? error.message : 'Unable to create period.');
      setIsPeriodCreateSubmitting(false);
    }
  };

  const handleEditPeriod = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingPeriodId === null) {
      setPeriodEditError('No period selected for editing.');
      return;
    }

    setPeriodEditError(null);
    setIsPeriodEditSubmitting(true);

    try {
      const updated = await updatePeriod(editingPeriodId, {
        label: periodEditForm.label.trim(),
        periodNumber: Number(periodEditForm.periodNumber),
        fiscalYear: periodEditForm.fiscalYear ? Number(periodEditForm.fiscalYear) : undefined,
        startDate: periodEditForm.startDate,
        endDate: periodEditForm.endDate,
        status: periodEditForm.status,
        lockedFromDate: periodEditForm.lockedFromDate.trim() || null,
        notes: periodEditForm.notes.trim() || null,
      });

      handleClosePeriodEditModal();
      await fetchPeriodsRegister({
        search: periodSubmittedSearch,
        page: periodCurrentPage,
        activeFilters: appliedPeriodFilters,
      });
      await handleViewPeriod(updated.id);
    } catch (error) {
      setPeriodEditError(error instanceof Error ? error.message : 'Unable to update period.');
      setIsPeriodEditSubmitting(false);
    }
  };

  const handleTogglePeriodQuickFilter = (value: string) => {
    const statusValue = value.replace('status:', '');
    setAppliedPeriodFilters((previous) => {
      const statuses = previous.statuses.includes(statusValue)
        ? previous.statuses.filter((entry) => entry !== statusValue)
        : [...previous.statuses, statusValue];
      return { ...previous, statuses };
    });
    setDraftPeriodFilters((previous) => {
      const statuses = previous.statuses.includes(statusValue)
        ? previous.statuses.filter((entry) => entry !== statusValue)
        : [...previous.statuses, statusValue];
      return { ...previous, statuses };
    });
    setPeriodCurrentPage(1);
  };

  const handleToggleQuickFilter = (filterKey: keyof typeof chartQuickFilterConfig) => {
    const config = chartQuickFilterConfig[filterKey];

    setDraftChartFilters((previous) => {
      if (config.type === 'status') {
        return {
          ...previous,
          statuses: toggleFilterValue(previous.statuses, config.value),
        };
      }

      return {
        ...previous,
        [config.type]: !previous[config.type],
      };
    });

    setAppliedChartFilters((previous) => {
      if (config.type === 'status') {
        return {
          ...previous,
          statuses: toggleFilterValue(previous.statuses, config.value),
        };
      }

      return {
        ...previous,
        [config.type]: !previous[config.type],
      };
    });

    setChartCurrentPage(1);
  };

  const handleExportChart = () => {
    if (!chartData?.section.table.rows.length) {
      return;
    }

    const csvRows = [
      [
        'Code',
        'Name',
        'Type',
        'Subtype',
        'Parent',
        'Normal Balance',
        'Status',
        'Control Account',
        'Manual Entries',
        'Retained Earnings',
      ],
      ...chartData.section.table.rows.map((row) => [
        row.code,
        row.name,
        row.accountTypeLabel,
        row.accountSubTypeLabel,
        row.parentAccountDisplay,
        row.normalBalanceLabel,
        row.statusLabel,
        row.isControlAccount ? 'Yes' : 'No',
        row.allowManualEntries ? 'Yes' : 'No',
        row.isRetainedEarnings ? 'Yes' : 'No',
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'chart-of-accounts-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleViewAccount = async (accountId: number | string) => {
    setSelectedAccountId(accountId);
    setSelectedAccount(null);
    setAccountDetailError(null);
    setIsAccountDetailLoading(true);

    try {
      const payload = await getChartOfAccountDetail(accountId);
      setSelectedAccount(payload);
    } catch (error) {
      setAccountDetailError(error instanceof Error ? error.message : 'Unable to load account details.');
    } finally {
      setIsAccountDetailLoading(false);
    }
  };

  const handleCloseAccountDetail = () => {
    setSelectedAccountId(null);
    setSelectedAccount(null);
    setAccountDetailError(null);
    setIsAccountDetailLoading(false);
  };

  const handleOpenDeleteModal = async (accountId: number | string, accountName: string) => {
    setDeleteError(null);
    setDeleteBlockers([]);
    setDeletingAccountId(accountId);
    setDeletingAccountName(accountName);
    setIsDeleteSubmitting(false);
    setIsDeleteModalOpen(true);

    try {
      const detail = await getChartOfAccountDetail(accountId);
      const blockers: string[] = [];

      if (detail?.usageSummary?.journalLineCount && detail.usageSummary.journalLineCount > 0) {
        blockers.push(`Used in ${detail.usageSummary.journalLineCount} journal entry line(s)`);
      }

      if (detail?.usageSummary?.childAccountCount && detail.usageSummary.childAccountCount > 0) {
        blockers.push(`Has ${detail.usageSummary.childAccountCount} child account(s)`);
      }

      if (detail?.usageSummary?.taxCodeCount && detail.usageSummary.taxCodeCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.taxCodeCount} tax code(s)`);
      }

      setDeleteBlockers(blockers);
    } catch {
      setDeleteBlockers([]);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAccountId(null);
    setDeletingAccountName('');
    setIsDeleteSubmitting(false);
    setDeleteError(null);
    setDeleteBlockers([]);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deletingAccountId === null) return;

    setIsDeleteSubmitting(true);
    setDeleteError(null);

    try {
      await deleteChartOfAccount(deletingAccountId);
      handleCloseDeleteModal();
      await fetchChartRegister({
        search: chartSubmittedSearch,
        page: chartCurrentPage,
        activeFilters: appliedChartFilters,
      });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete account.');
      setIsDeleteSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateError(null);
    setCreateForm(initialCreateFormState);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
    setCreateForm(initialCreateFormState);
    setIsCreateSubmitting(false);
  };

  const handleOpenEditModal = async (accountId: number | string) => {
    handleCloseAccountDetail();
    setEditingAccountId(accountId);
    setEditingAccount(null);
    setEditForm(initialCreateFormState);
    setEditError(null);
    setIsEditSubmitting(false);
    setIsEditLoading(true);
    setIsEditModalOpen(true);

    try {
      const payload = await getChartOfAccountDetail(accountId);
      setEditingAccount(payload);
      setEditForm(mapAccountDetailToFormState(payload));
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Unable to load account for editing.');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setIsEditLoading(false);
    setIsEditSubmitting(false);
    setEditError(null);
    setEditingAccountId(null);
    setEditingAccount(null);
    setEditForm(initialCreateFormState);
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setIsCreateSubmitting(true);

    try {
      const created = await createChartOfAccount({
        code: createForm.code.trim(),
        name: createForm.name.trim(),
        accountType: createForm.accountType,
        accountSubType: createForm.accountSubType || null,
        normalBalance: createForm.normalBalance,
        parentAccount: normalizeRelationshipValue(createForm.parentAccount),
        isActive: createForm.isActive,
        allowManualEntries: createForm.allowManualEntries,
        isControlAccount: createForm.isControlAccount,
        isRetainedEarnings: createForm.isRetainedEarnings,
        isSuspenseAccount: createForm.isSuspenseAccount,
        description: createForm.description.trim() || null,
        sortOrder: Number.isFinite(Number(createForm.sortOrder)) ? Number(createForm.sortOrder) : 0,
      });

      handleCloseCreateModal();
      setChartCurrentPage(1);
      await fetchChartRegister({
        search: chartSubmittedSearch,
        page: 1,
        activeFilters: appliedChartFilters,
      });
      await handleViewAccount(created.id);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create account.');
      setIsCreateSubmitting(false);
    }
  };

  const handleEditAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingAccountId === null) {
      setEditError('No account selected for editing.');
      return;
    }

    setEditError(null);
    setIsEditSubmitting(true);

    try {
      const updated = await updateChartOfAccount(editingAccountId, {
        code: editForm.code.trim(),
        name: editForm.name.trim(),
        accountType: editForm.accountType,
        accountSubType: editForm.accountSubType || null,
        normalBalance: editForm.normalBalance,
        parentAccount: normalizeRelationshipValue(editForm.parentAccount),
        isActive: editForm.isActive,
        allowManualEntries: editForm.allowManualEntries,
        isControlAccount: editForm.isControlAccount,
        isRetainedEarnings: editForm.isRetainedEarnings,
        isSuspenseAccount: editForm.isSuspenseAccount,
        description: editForm.description.trim() || null,
        sortOrder: Number.isFinite(Number(editForm.sortOrder)) ? Number(editForm.sortOrder) : 0,
      });

      handleCloseEditModal();
      await fetchChartRegister({
        search: chartSubmittedSearch,
        page: chartCurrentPage,
        activeFilters: appliedChartFilters,
      });
      await handleViewAccount(updated.id);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Unable to update account.');
      setIsEditSubmitting(false);
    }
  };

  const chartFilterCount = getChartFilterCount(appliedChartFilters);
  const chartSection = chartData?.section ?? {
    id: chartFallbackTab.id,
    label: chartFallbackTab.label,
    description: chartFallbackTab.description,
    searchPlaceholder: chartFallbackTab.searchPlaceholder,
    filters: {
      statuses: [],
      accountTypes: [],
      accountSubTypes: [],
      quickFilters: [],
    },
    metrics: [],
    table: {
      title: chartFallbackTab.tableTitle,
      description: chartFallbackTab.tableDescription,
      columns: chartFallbackTab.columns,
      rows: [],
    },
  };
  const editPermissions = editingAccount?.editPermissions;
  const editRestrictionReason = editPermissions?.restrictionReason;
  const isAccountTypeEditDisabled = editPermissions?.canEditAccountType === false;
  const isNormalBalanceEditDisabled = editPermissions?.canEditNormalBalance === false;
  const isParentAccountEditDisabled = editPermissions?.canEditParentAccount === false;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Master Records</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{PAGE_TITLE}</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">{PAGE_DESCRIPTION}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={activeTab === 'chart-of-accounts' ? handleRefreshChart : activeTab === 'fiscal-years' ? handleFyRefresh : activeTab === 'accounting-periods' ? handlePeriodRefresh : activeTab === 'tax-codes' ? handleTcRefresh : undefined}
            disabled={activeTab !== 'chart-of-accounts' && activeTab !== 'fiscal-years' && activeTab !== 'accounting-periods' && activeTab !== 'tax-codes'}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getActionClasses('secondary')}`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Workspace
          </button>
          <button
            type="button"
            onClick={activeTab === 'chart-of-accounts' ? handleOpenCreateModal : activeTab === 'fiscal-years' ? handleOpenFyCreateModal : activeTab === 'accounting-periods' ? handleOpenPeriodCreateModal : activeTab === 'tax-codes' ? handleOpenTcCreateModal : undefined}
            disabled={activeTab !== 'chart-of-accounts' && activeTab !== 'fiscal-years' && activeTab !== 'accounting-periods' && activeTab !== 'tax-codes'}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getActionClasses('primary')}`}
          >
            <Plus className="h-4 w-4" />
            New Master Record
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {staticTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as CoreAccountingTab)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6 p-6">
          {activeTab === 'chart-of-accounts' ? (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{chartSection.label}</h2>
                  <p className="mt-1 text-sm text-gray-600">{chartSection.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
                  >
                    <Plus className="h-4 w-4" />
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshChart}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Accounts
                  </button>
                  <button
                    type="button"
                    onClick={handleExportChart}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                  >
                    <Download className="h-4 w-4" />
                    Download View
                  </button>
                </div>
              </div>

              {chartError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                    <div>
                      <p className="font-medium">Unable to load Chart of Accounts.</p>
                      <p className="mt-1">{chartError}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isChartLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {chartSection.metrics.map((metric) => (
                      <div key={metric.id}>
                        <MetricCard
                          label={metric.label}
                          value={metric.value}
                          change={metric.change}
                          trend={metric.trend}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <form
                          onSubmit={handleChartSearchSubmit}
                          className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center"
                        >
                          <div className="relative min-w-0 flex-1 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={chartSearchInput}
                              onChange={(event) => setChartSearchInput(event.target.value)}
                              placeholder={chartSection.searchPlaceholder}
                              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Search
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFilterPanelOpen((previous) => !previous)}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Filter className="h-4 w-4" />
                              Filters
                              {chartFilterCount ? (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                  {chartFilterCount}
                                </span>
                              ) : null}
                            </button>
                          </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                          {(chartSection.filters.quickFilters.length
                            ? chartSection.filters.quickFilters
                            : [
                                { label: 'Active', value: 'status:active' },
                                { label: 'Control Accounts', value: 'controlAccountsOnly:true' },
                                { label: 'Manual Entries', value: 'manualEntriesOnly:true' },
                                { label: 'Retained Earnings', value: 'retainedEarningsOnly:true' },
                              ]
                          ).map((filter) => {
                            const quickFilterKey =
                              filter.value === 'status:active'
                                ? 'active'
                                : filter.value === 'controlAccountsOnly:true'
                                  ? 'control'
                                  : filter.value === 'manualEntriesOnly:true'
                                    ? 'manual'
                                    : 'retained';
                            const isActive = isQuickFilterActive(quickFilterKey, appliedChartFilters);

                            return (
                              <button
                                key={filter.value}
                                type="button"
                                onClick={() => handleToggleQuickFilter(quickFilterKey)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {filter.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {isFilterPanelOpen ? (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Status
                              </p>
                              {chartSection.filters.statuses.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftChartFilters.statuses.includes(option.value)}
                                    onChange={() =>
                                      setDraftChartFilters((previous) => ({
                                        ...previous,
                                        statuses: toggleFilterValue(previous.statuses, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Account Type
                              </p>
                              {chartSection.filters.accountTypes.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftChartFilters.accountTypes.includes(option.value)}
                                    onChange={() =>
                                      setDraftChartFilters((previous) => ({
                                        ...previous,
                                        accountTypes: toggleFilterValue(previous.accountTypes, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Account Subtype
                            </p>
                            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                              {chartSection.filters.accountSubTypes.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftChartFilters.accountSubTypes.includes(option.value)}
                                    onChange={() =>
                                      setDraftChartFilters((previous) => ({
                                        ...previous,
                                        accountSubTypes: toggleFilterValue(previous.accountSubTypes, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={draftChartFilters.controlAccountsOnly}
                                onChange={() =>
                                  setDraftChartFilters((previous) => ({
                                    ...previous,
                                    controlAccountsOnly: !previous.controlAccountsOnly,
                                  }))
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Control Accounts Only
                            </label>
                            <label className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={draftChartFilters.manualEntriesOnly}
                                onChange={() =>
                                  setDraftChartFilters((previous) => ({
                                    ...previous,
                                    manualEntriesOnly: !previous.manualEntriesOnly,
                                  }))
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Manual Entries Only
                            </label>
                            <label className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={draftChartFilters.retainedEarningsOnly}
                                onChange={() =>
                                  setDraftChartFilters((previous) => ({
                                    ...previous,
                                    retainedEarningsOnly: !previous.retainedEarningsOnly,
                                  }))
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Retained Earnings Only
                            </label>
                            <label className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={draftChartFilters.parentAccountsOnly}
                                onChange={() =>
                                  setDraftChartFilters((previous) => ({
                                    ...previous,
                                    parentAccountsOnly: !previous.parentAccountsOnly,
                                  }))
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Parent Accounts Only
                            </label>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={handleApplyFilters}
                              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Apply Filters
                            </button>
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{chartSection.table.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{chartSection.table.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span>{chartData?.totals.filteredAccounts ?? 0} matching accounts</span>
                          <button
                            type="button"
                            onClick={handleExportChart}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4" />
                            Export View
                          </button>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {chartSection.table.columns.map((column) => (
                                  <th
                                    key={column}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                  >
                                    {column}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {chartSection.table.rows.length ? (
                                chartSection.table.rows.map((row) => (
                                  <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                      {row.code || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      <div className="flex flex-col">
                                        <span>{row.name || '-'}</span>
                                        {row.accountSubTypeLabel ? (
                                          <span className="text-xs text-gray-400">{row.accountSubTypeLabel}</span>
                                        ) : null}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.accountTypeLabel || row.accountType || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.parentAccountName || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm uppercase text-gray-600">
                                      {row.normalBalanceLabel || row.normalBalance || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(row.status)}`}
                                      >
                                        {row.statusLabel}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditModal(row.accountId)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenDeleteModal(row.accountId, row.name || `Account #${row.accountId}`)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                      <button
                                        type="button"
                                        onClick={() => handleViewAccount(row.accountId)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                      >
                                        <Eye className="h-4 w-4" />
                                        View
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={chartSection.table.columns.length + 1}
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                  >
                                    No accounts matched the current filters.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {chartData?.pagination.totalPages && chartData.pagination.totalPages > 1 ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-gray-500">
                            Page {chartData.pagination.page} of {chartData.pagination.totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!chartData.pagination.hasPrevPage}
                              onClick={() => setChartCurrentPage((previous) => Math.max(1, previous - 1))}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              disabled={!chartData.pagination.hasNextPage}
                              onClick={() => setChartCurrentPage((previous) => previous + 1)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : activeTab === 'fiscal-years' ? (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{fySection.label}</h2>
                  <p className="mt-1 text-sm text-gray-600">{fySection.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenFyCreateModal}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
                  >
                    <Plus className="h-4 w-4" />
                    Create Fiscal Year
                  </button>
                  <button
                    type="button"
                    onClick={handleFyRefresh}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Years
                  </button>
                  <button
                    type="button"
                    onClick={handleFyExport}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                  >
                    <Download className="h-4 w-4" />
                    Download View
                  </button>
                </div>
              </div>

              {fyError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                    <div>
                      <p className="font-medium">Unable to load Fiscal Years.</p>
                      <p className="mt-1">{fyError}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isFyLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {fySection.metrics.map((metric) => (
                      <div key={metric.id}>
                        <MetricCard
                          label={metric.label}
                          value={metric.value}
                          change={metric.change}
                          trend={metric.trend}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <form
                          onSubmit={handleFySearchSubmit}
                          className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center"
                        >
                          <div className="relative min-w-0 flex-1 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={fySearchInput}
                              onChange={(event) => setFySearchInput(event.target.value)}
                              placeholder={fySection.searchPlaceholder}
                              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Search
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFilterPanelOpen((previous) => !previous)}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Filter className="h-4 w-4" />
                              Filters
                              {fyFilterCount ? (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                  {fyFilterCount}
                                </span>
                              ) : null}
                            </button>
                          </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                          {(fySection.filters.quickFilters.length
                            ? fySection.filters.quickFilters
                            : [
                                { label: 'Draft', value: 'status:draft' },
                                { label: 'Open', value: 'status:open' },
                                { label: 'Closed', value: 'status:closed' },
                                { label: 'Manual Close', value: 'closeMode:manual' },
                              ]
                          ).map((filter) => {
                            const isActive = filter.value.startsWith('status:')
                              ? appliedFyFilters.statuses.includes(filter.value.replace('status:', ''))
                              : filter.value.startsWith('closeMode:')
                                ? appliedFyFilters.closeModes.includes(filter.value.replace('closeMode:', ''))
                                : false;

                            return (
                              <button
                                key={filter.value}
                                type="button"
                                onClick={() => {
                                  setDraftFyFilters((previous) => {
                                    if (filter.value.startsWith('status:')) {
                                      const statusValue = filter.value.replace('status:', '');
                                      return {
                                        ...previous,
                                        statuses: previous.statuses.includes(statusValue)
                                          ? previous.statuses.filter((entry) => entry !== statusValue)
                                          : [...previous.statuses, statusValue],
                                      };
                                    }
                                    if (filter.value.startsWith('closeMode:')) {
                                      const closeModeValue = filter.value.replace('closeMode:', '');
                                      return {
                                        ...previous,
                                        closeModes: previous.closeModes.includes(closeModeValue)
                                          ? previous.closeModes.filter((entry) => entry !== closeModeValue)
                                          : [...previous.closeModes, closeModeValue],
                                      };
                                    }
                                    return previous;
                                  });
                                  setAppliedFyFilters((previous) => {
                                    if (filter.value.startsWith('status:')) {
                                      const statusValue = filter.value.replace('status:', '');
                                      return {
                                        ...previous,
                                        statuses: previous.statuses.includes(statusValue)
                                          ? previous.statuses.filter((entry) => entry !== statusValue)
                                          : [...previous.statuses, statusValue],
                                      };
                                    }
                                    if (filter.value.startsWith('closeMode:')) {
                                      const closeModeValue = filter.value.replace('closeMode:', '');
                                      return {
                                        ...previous,
                                        closeModes: previous.closeModes.includes(closeModeValue)
                                          ? previous.closeModes.filter((entry) => entry !== closeModeValue)
                                          : [...previous.closeModes, closeModeValue],
                                      };
                                    }
                                    return previous;
                                  });
                                  setFyCurrentPage(1);
                                }}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {filter.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {isFilterPanelOpen ? (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Status
                              </p>
                              {fySection.filters.statuses.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftFyFilters.statuses.includes(option.value)}
                                    onChange={() =>
                                      setDraftFyFilters((previous) => ({
                                        ...previous,
                                        statuses: toggleFilterValue(previous.statuses, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Close Mode
                              </p>
                              {fySection.filters.closeModes.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftFyFilters.closeModes.includes(option.value)}
                                    onChange={() =>
                                      setDraftFyFilters((previous) => ({
                                        ...previous,
                                        closeModes: toggleFilterValue(previous.closeModes, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={handleFyApplyFilters}
                              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Apply Filters
                            </button>
                            <button
                              type="button"
                              onClick={handleFyResetFilters}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{fySection.table.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{fySection.table.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span>{fyData?.totals.filteredYears ?? 0} matching fiscal years</span>
                          <button
                            type="button"
                            onClick={handleFyExport}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4" />
                            Export View
                          </button>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {fySection.table.columns.map((column) => (
                                  <th
                                    key={column}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                  >
                                    {column}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {fySection.table.rows.length ? (
                                fySection.table.rows.map((row) => (
                                  <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                      {row.code || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.name || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.dateRange || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.closeModeLabel || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.lockedFromDate || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getFyStatusBadgeClasses(row.status)}`}
                                      >
                                        {row.statusLabel}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenFyEditModal(row.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenFyDeleteModal(row.id, row.name || `FY #${row.id}`)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleViewFiscalYear(row.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                          <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={fySection.table.columns.length + 1}
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                  >
                                    No fiscal years matched the current filters.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {fyData?.pagination.totalPages && fyData.pagination.totalPages > 1 ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-gray-500">
                            Page {fyData.pagination.page} of {fyData.pagination.totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!fyData.pagination.hasPrevPage}
                              onClick={() => setFyCurrentPage((previous) => Math.max(1, previous - 1))}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              disabled={!fyData.pagination.hasNextPage}
                              onClick={() => setFyCurrentPage((previous) => previous + 1)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : activeTab === 'accounting-periods' ? (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{periodSection.label}</h2>
                  <p className="mt-1 text-sm text-gray-600">{periodSection.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPeriodCreateModal}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
                  >
                    <Plus className="h-4 w-4" />
                    Create Period
                  </button>
                  <button
                    type="button"
                    onClick={handlePeriodRefresh}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Periods
                  </button>
                  <button
                    type="button"
                    onClick={handlePeriodExport}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                  >
                    <Download className="h-4 w-4" />
                    Download View
                  </button>
                </div>
              </div>

              {periodError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                    <div>
                      <p className="font-medium">Unable to load Accounting Periods.</p>
                      <p className="mt-1">{periodError}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isPeriodLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {periodSection.metrics.map((metric) => (
                      <div key={metric.id}>
                        <MetricCard
                          label={metric.label}
                          value={metric.value}
                          change={metric.change}
                          trend={metric.trend}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <form
                          onSubmit={handlePeriodSearchSubmit}
                          className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center"
                        >
                          <div className="relative min-w-0 flex-1 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={periodSearchInput}
                              onChange={(event) => setPeriodSearchInput(event.target.value)}
                              placeholder={periodSection.searchPlaceholder}
                              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Search
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFilterPanelOpen((previous) => !previous)}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Filter className="h-4 w-4" />
                              Filters
                              {periodFilterCount ? (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                  {periodFilterCount}
                                </span>
                              ) : null}
                            </button>
                          </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                          {(periodSection.filters.quickFilters.length
                            ? periodSection.filters.quickFilters
                            : [
                                { label: 'Draft', value: 'status:draft' },
                                { label: 'Open', value: 'status:open' },
                                { label: 'Soft Locked', value: 'status:soft_locked' },
                                { label: 'Closed', value: 'status:closed' },
                              ]
                          ).map((filter) => {
                            const isActive = filter.value.startsWith('status:')
                              ? appliedPeriodFilters.statuses.includes(filter.value.replace('status:', ''))
                              : false;

                            return (
                              <button
                                key={filter.value}
                                type="button"
                                onClick={() => handleTogglePeriodQuickFilter(filter.value)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {filter.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {isFilterPanelOpen ? (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Status
                              </p>
                              {periodSection.filters.statuses.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftPeriodFilters.statuses.includes(option.value)}
                                    onChange={() =>
                                      setDraftPeriodFilters((previous) => ({
                                        ...previous,
                                        statuses: toggleFilterValue(previous.statuses, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Fiscal Year
                              </p>
                              {periodSection.filters.fiscalYears.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="radio"
                                    name="period-fiscal-year"
                                    checked={draftPeriodFilters.fiscalYearId === option.value}
                                    onChange={() =>
                                      setDraftPeriodFilters((previous) => ({
                                        ...previous,
                                        fiscalYearId: option.value,
                                      }))
                                    }
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                              {draftPeriodFilters.fiscalYearId ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraftPeriodFilters((previous) => ({
                                      ...previous,
                                      fiscalYearId: '',
                                    }))
                                  }
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Clear filter
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={handlePeriodApplyFilters}
                              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Apply Filters
                            </button>
                            <button
                              type="button"
                              onClick={handlePeriodResetFilters}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{periodSection.table.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{periodSection.table.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span>{periodData?.totals.filteredPeriods ?? 0} matching periods</span>
                          <button
                            type="button"
                            onClick={handlePeriodExport}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4" />
                            Export View
                          </button>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {periodSection.table.columns.map((column) => (
                                  <th
                                    key={column}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                  >
                                    {column}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {periodSection.table.rows.length ? (
                                periodSection.table.rows.map((row) => (
                                  <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                      {row.label || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.periodNumber ?? '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.fiscalYearCode || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.dateRange || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getFyStatusBadgeClasses(row.status)}`}
                                      >
                                        {row.statusLabel}
                                      </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.lockedFromDate || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPeriodEditModal(row.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPeriodDeleteModal(row.id, row.label || `Period #${row.id}`)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleViewPeriod(row.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                          <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={periodSection.table.columns.length + 1}
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                  >
                                    No periods matched the current filters.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {periodData?.pagination.totalPages && periodData.pagination.totalPages > 1 ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-gray-500">
                            Page {periodData.pagination.page} of {periodData.pagination.totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!periodData.pagination.hasPrevPage}
                              onClick={() => setPeriodCurrentPage((previous) => Math.max(1, previous - 1))}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              disabled={!periodData.pagination.hasNextPage}
                              onClick={() => setPeriodCurrentPage((previous) => previous + 1)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : activeTab === 'tax-codes' ? (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{tcSection.label}</h2>
                  <p className="mt-1 text-sm text-gray-600">{tcSection.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenTcCreateModal}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}
                  >
                    <Plus className="h-4 w-4" />
                    Create Tax Code
                  </button>
                  <button
                    type="button"
                    onClick={handleTcRefresh}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Tax Codes
                  </button>
                  <button
                    type="button"
                    onClick={handleTcExport}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('ghost')}`}
                  >
                    <Download className="h-4 w-4" />
                    Download View
                  </button>
                </div>
              </div>

              {tcError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                    <div>
                      <p className="font-medium">Unable to load Tax Codes.</p>
                      <p className="mt-1">{tcError}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isTcLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {tcSection.metrics.map((metric) => (
                      <div key={metric.id}>
                        <MetricCard
                          label={metric.label}
                          value={metric.value}
                          change={metric.change}
                          trend={metric.trend}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <form
                          onSubmit={handleTcSearchSubmit}
                          className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center"
                        >
                          <div className="relative min-w-0 flex-1 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={tcSearchInput}
                              onChange={(event) => setTcSearchInput(event.target.value)}
                              placeholder={tcSection.searchPlaceholder}
                              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Search
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFilterPanelOpen((previous) => !previous)}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Filter className="h-4 w-4" />
                              Filters
                              {tcFilterCount ? (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                  {tcFilterCount}
                                </span>
                              ) : null}
                            </button>
                          </div>
                        </form>
                        <div className="flex flex-wrap gap-2">
                          {(tcSection.filters.quickFilters.length
                            ? tcSection.filters.quickFilters
                            : [
                                { label: 'Active', value: 'isActive:true' },
                                { label: 'Sales', value: 'scope:sales' },
                                { label: 'Purchase', value: 'scope:purchase' },
                                { label: 'Both', value: 'scope:both' },
                              ]
                          ).map((filter) => {
                            const isActive = filter.value.startsWith('isActive:')
                              ? appliedTcFilters.isActive === true
                              : filter.value.startsWith('scope:')
                                ? appliedTcFilters.scopes.includes(filter.value.replace('scope:', ''))
                                : false;

                            return (
                              <button
                                key={filter.value}
                                type="button"
                                onClick={() => handleToggleTcQuickFilter(filter.value)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {filter.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {isFilterPanelOpen ? (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Scope
                              </p>
                              {tcSection.filters.scopes.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftTcFilters.scopes.includes(option.value)}
                                    onChange={() =>
                                      setDraftTcFilters((previous) => ({
                                        ...previous,
                                        scopes: toggleFilterValue(previous.scopes, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Calculation Method
                              </p>
                              {tcSection.filters.calculationMethods.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftTcFilters.calculationMethods.includes(option.value)}
                                    onChange={() =>
                                      setDraftTcFilters((previous) => ({
                                        ...previous,
                                        calculationMethods: toggleFilterValue(previous.calculationMethods, option.value),
                                      }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={handleTcApplyFilters}
                              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                            >
                              Apply Filters
                            </button>
                            <button
                              type="button"
                              onClick={handleTcResetFilters}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{tcSection.table.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{tcSection.table.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span>{tcData?.totals.filteredCodes ?? 0} matching tax codes</span>
                          <button
                            type="button"
                            onClick={handleTcExport}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4" />
                            Export View
                          </button>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {tcSection.table.columns.map((column) => (
                                  <th
                                    key={column}
                                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Rate' ? 'text-right' : 'text-left'}`}
                                  >
                                    {column}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {tcSection.table.rows.length ? (
                                tcSection.table.rows.map((row) => (
                                  <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                      {row.code || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.name || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.scopeLabel || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-600">
                                      {row.rateDisplay || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                      {row.calculationMethodLabel || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(row.isActive ? 'active' : 'inactive')}`}
                                      >
                                        {row.isActiveLabel}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenTcEditModal(row.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenTcDeleteModal(row.id, row.name || `Tax Code #${row.id}`)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleViewTaxCode(row.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                          <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={tcSection.table.columns.length + 1}
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                  >
                                    No tax codes matched the current filters.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {tcData?.pagination.totalPages && tcData.pagination.totalPages > 1 ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-gray-500">
                            Page {tcData.pagination.page} of {tcData.pagination.totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!tcData.pagination.hasPrevPage}
                              onClick={() => setTcCurrentPage((previous) => Math.max(1, previous - 1))}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              disabled={!tcData.pagination.hasNextPage}
                              onClick={() => setTcCurrentPage((previous) => previous + 1)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>

      {isFyCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Fiscal Year</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Add a new fiscal year to the fiscal calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseFyCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFiscalYear} className="space-y-6 px-6 py-5">
              {fyCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {fyCreateError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Code</span>
                  <input
                    required
                    value={fyCreateForm.code}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Name</span>
                  <input
                    required
                    value={fyCreateForm.name}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Start Date</span>
                  <input
                    required
                    type="date"
                    value={fyCreateForm.startDate}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, startDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">End Date</span>
                  <input
                    required
                    type="date"
                    value={fyCreateForm.endDate}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, endDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Status</span>
                  <select
                    value={fyCreateForm.status}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, status: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Close Mode</span>
                  <select
                    value={fyCreateForm.closeMode}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, closeMode: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="manual">Manual</option>
                    <option value="hard_lock">Hard Lock</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Locked From Date</span>
                  <input
                    type="date"
                    value={fyCreateForm.lockedFromDate}
                    onChange={(event) =>
                      setFyCreateForm((previous) => ({ ...previous, lockedFromDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Notes</span>
                <textarea
                  rows={4}
                  value={fyCreateForm.notes}
                  onChange={(event) =>
                    setFyCreateForm((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseFyCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFyCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFyCreateSubmitting ? 'Creating...' : 'Create Fiscal Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Add a ledger account to the Chart of Accounts collection.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-6 px-6 py-5">
              {createError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {createError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Code</span>
                  <input
                    required
                    value={createForm.code}
                    onChange={(event) =>
                      setCreateForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Name</span>
                  <input
                    required
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Account Type</span>
                  <select
                    value={createForm.accountType}
                    onChange={(event) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        accountType: event.target.value,
                        accountSubType: '',
                        normalBalance:
                          event.target.value === 'liability' ||
                          event.target.value === 'equity' ||
                          event.target.value === 'revenue'
                            ? 'credit'
                            : 'debit',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {(chartData?.section.filters.accountTypes || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Account Subtype</span>
                  <select
                    value={createForm.accountSubType}
                    onChange={(event) =>
                      setCreateForm((previous) => ({ ...previous, accountSubType: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select subtype</option>
                    {(chartData?.section.filters.accountSubTypes || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Parent Account</span>
                  <select
                    value={createForm.parentAccount}
                    onChange={(event) =>
                      setCreateForm((previous) => ({ ...previous, parentAccount: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">No parent</option>
                    {(chartData?.referenceData.parentAccounts || []).map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {account.code ? `${account.code} ` : ''}
                        {account.name || 'Unnamed account'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Normal Balance</span>
                  <select
                    value={createForm.normalBalance}
                    onChange={(event) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        normalBalance: event.target.value as 'debit' | 'credit',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Sort Order</span>
                  <input
                    type="number"
                    value={createForm.sortOrder}
                    onChange={(event) =>
                      setCreateForm((previous) => ({ ...previous, sortOrder: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Description</span>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((previous) => ({ ...previous, description: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={() =>
                      setCreateForm((previous) => ({ ...previous, isActive: !previous.isActive }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active Account
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={createForm.allowManualEntries}
                    onChange={() =>
                      setCreateForm((previous) => ({
                        ...previous,
                        allowManualEntries: !previous.allowManualEntries,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Allow Manual Entries
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={createForm.isControlAccount}
                    onChange={() =>
                      setCreateForm((previous) => ({
                        ...previous,
                        isControlAccount: !previous.isControlAccount,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Control Account
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={createForm.isRetainedEarnings}
                    onChange={() =>
                      setCreateForm((previous) => ({
                        ...previous,
                        isRetainedEarnings: !previous.isRetainedEarnings,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Retained Earnings
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={createForm.isSuspenseAccount}
                    onChange={() =>
                      setCreateForm((previous) => ({
                        ...previous,
                        isSuspenseAccount: !previous.isSuspenseAccount,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Suspense Account
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreateSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isFyEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Fiscal Year</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Update the selected fiscal year with safeguards applied.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseFyEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isFyEditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleEditFiscalYear} className="space-y-6">
                  {fyEditError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {fyEditError}
                    </div>
                  ) : null}

                  {editingFy?.usageSummary?.hasPeriods ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-medium">Restricted edit mode</p>
                      <p className="mt-1">
                        {editingFy.editPermissions?.restrictionReason ||
                          'This fiscal year already has periods, so the date range cannot be changed.'}
                      </p>
                      <p className="mt-2">
                        Periods recorded: {editingFy.usageSummary.periodCount}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Code</span>
                      <input
                        required
                        value={fyEditForm.code}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Name</span>
                      <input
                        required
                        value={fyEditForm.name}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, name: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Start Date</span>
                      <input
                        required
                        type="date"
                        value={fyEditForm.startDate}
                        disabled={isFyStartDateEditDisabled}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, startDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">End Date</span>
                      <input
                        required
                        type="date"
                        value={fyEditForm.endDate}
                        disabled={isFyEndDateEditDisabled}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, endDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Status</span>
                      <select
                        value={fyEditForm.status}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, status: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="draft">Draft</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Close Mode</span>
                      <select
                        value={fyEditForm.closeMode}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, closeMode: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="manual">Manual</option>
                        <option value="hard_lock">Hard Lock</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Locked From Date</span>
                      <input
                        type="date"
                        value={fyEditForm.lockedFromDate}
                        onChange={(event) =>
                          setFyEditForm((previous) => ({ ...previous, lockedFromDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Notes</span>
                    <textarea
                      rows={4}
                      value={fyEditForm.notes}
                      onChange={(event) =>
                        setFyEditForm((previous) => ({ ...previous, notes: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseFyEditModal}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isFyEditSubmitting || isFyEditLoading}
                      className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isFyEditSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Update the selected ledger account with accounting safeguards applied.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isEditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleEditAccount} className="space-y-6">
                  {editError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {editError}
                    </div>
                  ) : null}

                  {editingAccount?.usageSummary?.hasTransactions ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-medium">Restricted edit mode</p>
                      <p className="mt-1">
                        {editRestrictionReason ||
                          'This account already has journal activity, so some accounting-defining fields are locked.'}
                      </p>
                      <p className="mt-2">
                        Journal lines recorded: {editingAccount.usageSummary.journalLineCount}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Code</span>
                      <input
                        required
                        value={editForm.code}
                        onChange={(event) =>
                          setEditForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Name</span>
                      <input
                        required
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((previous) => ({ ...previous, name: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Account Type</span>
                      <select
                        value={editForm.accountType}
                        disabled={isAccountTypeEditDisabled}
                        onChange={(event) =>
                          setEditForm((previous) => ({
                            ...previous,
                            accountType: event.target.value,
                            accountSubType: '',
                            normalBalance:
                              event.target.value === 'liability' ||
                              event.target.value === 'equity' ||
                              event.target.value === 'revenue'
                                ? 'credit'
                                : 'debit',
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {(chartData?.section.filters.accountTypes || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Account Subtype</span>
                      <select
                        value={editForm.accountSubType}
                        onChange={(event) =>
                          setEditForm((previous) => ({ ...previous, accountSubType: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select subtype</option>
                        {(chartData?.section.filters.accountSubTypes || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Parent Account</span>
                      <select
                        value={editForm.parentAccount}
                        disabled={isParentAccountEditDisabled}
                        onChange={(event) =>
                          setEditForm((previous) => ({ ...previous, parentAccount: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value="">No parent</option>
                        {(chartData?.referenceData.parentAccounts || []).map((account) => (
                          <option key={account.id} value={String(account.id)}>
                            {account.code ? `${account.code} ` : ''}
                            {account.name || 'Unnamed account'}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Normal Balance</span>
                      <select
                        value={editForm.normalBalance}
                        disabled={isNormalBalanceEditDisabled}
                        onChange={(event) =>
                          setEditForm((previous) => ({
                            ...previous,
                            normalBalance: event.target.value as 'debit' | 'credit',
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Sort Order</span>
                      <input
                        type="number"
                        value={editForm.sortOrder}
                        onChange={(event) =>
                          setEditForm((previous) => ({ ...previous, sortOrder: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Description</span>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm((previous) => ({ ...previous, description: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={() =>
                          setEditForm((previous) => ({ ...previous, isActive: !previous.isActive }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Active Account
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editForm.allowManualEntries}
                        onChange={() =>
                          setEditForm((previous) => ({
                            ...previous,
                            allowManualEntries: !previous.allowManualEntries,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Allow Manual Entries
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editForm.isControlAccount}
                        onChange={() =>
                          setEditForm((previous) => ({
                            ...previous,
                            isControlAccount: !previous.isControlAccount,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Control Account
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editForm.isRetainedEarnings}
                        onChange={() =>
                          setEditForm((previous) => ({
                            ...previous,
                            isRetainedEarnings: !previous.isRetainedEarnings,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Retained Earnings
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={editForm.isSuspenseAccount}
                        onChange={() =>
                          setEditForm((previous) => ({
                            ...previous,
                            isSuspenseAccount: !previous.isSuspenseAccount,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Suspense Account
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isEditSubmitting || isEditLoading}
                      className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isFyDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Fiscal Year</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingFyName}&rdquo; from the fiscal years list.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseFyDeleteModal}
                disabled={isFyDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {fyDeleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {fyDeleteError}
                </div>
              ) : null}

              {fyDeleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this fiscal year</p>
                    <p className="mt-1">
                      This fiscal year cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {fyDeleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this fiscal year.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseFyDeleteModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-medium">Are you sure?</p>
                    <p className="mt-1">
                      This action cannot be undone. The fiscal year &ldquo;{deletingFyName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseFyDeleteModal}
                      disabled={isFyDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmFyDelete}
                      disabled={isFyDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isFyDeleteSubmitting ? 'Deleting...' : 'Delete Fiscal Year'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedFyId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Fiscal Year Details</h2>
                <p className="mt-1 text-sm text-gray-600">Review the selected fiscal year record.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseFiscalYearDetail}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isFyDetailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : fyDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {fyDetailError}
                </div>
              ) : selectedFy ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenFyEditModal(selectedFy.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Fiscal Year
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Code</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedFy.code || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Name</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedFy.name || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Start Date</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedFy.startDate ? new Date(selectedFy.startDate).toISOString().slice(0, 10) : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">End Date</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedFy.endDate ? new Date(selectedFy.endDate).toISOString().slice(0, 10) : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedFy.status || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Close Mode</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedFy.closeMode || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Locked From Date</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedFy.lockedFromDate ? new Date(selectedFy.lockedFromDate).toISOString().slice(0, 10) : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Periods</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedFy.usageSummary?.periodCount ?? '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Closed At</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedFy.closedAt) || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Closed By</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {typeof selectedFy.closedBy === 'object' && selectedFy.closedBy?.name
                          ? selectedFy.closedBy.name
                          : selectedFy.closedBy || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedFy.notes || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedFy.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedFy.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {selectedAccountId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                <p className="mt-1 text-sm text-gray-600">Review the selected ledger account record.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseAccountDetail}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isAccountDetailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : accountDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {accountDetailError}
                </div>
              ) : selectedAccount ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedAccount.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Account
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Code</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{selectedAccount.code || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Name</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{selectedAccount.name || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedAccount.accountType || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subtype</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedAccount.accountSubType || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Parent</p>
                    <p className="mt-2 text-sm text-gray-700">
                      {selectedAccount.parentAccount?.code
                        ? `${selectedAccount.parentAccount.code} ${selectedAccount.parentAccount.name || ''}`.trim()
                        : selectedAccount.parentAccount?.name || '-'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Normal Balance</p>
                    <p className="mt-2 text-sm uppercase text-gray-700">{selectedAccount.normalBalance || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                    <p className="mt-2 text-sm text-gray-700">
                      {selectedAccount.isActive === false ? 'Inactive' : 'Active'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort Order</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedAccount.sortOrder ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Flags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {selectedAccount.allowManualEntries === false
                          ? 'Manual Entries Disabled'
                          : 'Manual Entries Allowed'}
                      </span>
                      {selectedAccount.isControlAccount ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          Control Account
                        </span>
                      ) : null}
                      {selectedAccount.isRetainedEarnings ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                          Retained Earnings
                        </span>
                      ) : null}
                      {selectedAccount.isSuspenseAccount ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          Suspense Account
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Description</p>
                    <p className="mt-2 text-sm text-gray-700">{selectedAccount.description || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created</p>
                    <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedAccount.createdAt)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated</p>
                    <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedAccount.updatedAt)}</p>
                  </div>
                </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isPeriodCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Period</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Add a new accounting period under a fiscal year.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePeriodCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="space-y-6 px-6 py-5">
              {periodCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {periodCreateError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Fiscal Year</span>
                  <select
                    required
                    value={periodCreateForm.fiscalYear}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, fiscalYear: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select fiscal year</option>
                    {(periodSection.filters.fiscalYears || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Period Number</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={periodCreateForm.periodNumber}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, periodNumber: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Label</span>
                  <input
                    required
                    value={periodCreateForm.label}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, label: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Start Date</span>
                  <input
                    required
                    type="date"
                    value={periodCreateForm.startDate}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, startDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">End Date</span>
                  <input
                    required
                    type="date"
                    value={periodCreateForm.endDate}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, endDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Status</span>
                  <select
                    value={periodCreateForm.status}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, status: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="soft_locked">Soft Locked</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Locked From Date</span>
                  <input
                    type="date"
                    value={periodCreateForm.lockedFromDate}
                    onChange={(event) =>
                      setPeriodCreateForm((previous) => ({ ...previous, lockedFromDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Notes</span>
                <textarea
                  rows={4}
                  value={periodCreateForm.notes}
                  onChange={(event) =>
                    setPeriodCreateForm((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleClosePeriodCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPeriodCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPeriodCreateSubmitting ? 'Creating...' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isPeriodEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Period</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Update the selected accounting period.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePeriodEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isPeriodEditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleEditPeriod} className="space-y-6">
                  {periodEditError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {periodEditError}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Fiscal Year</span>
                      <select
                        required
                        value={periodEditForm.fiscalYear}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, fiscalYear: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select fiscal year</option>
                        {(periodSection.filters.fiscalYears || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Period Number</span>
                      <input
                        required
                        type="number"
                        min={1}
                        value={periodEditForm.periodNumber}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, periodNumber: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700 md:col-span-2">
                      <span className="font-medium">Label</span>
                      <input
                        required
                        value={periodEditForm.label}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, label: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Start Date</span>
                      <input
                        required
                        type="date"
                        value={periodEditForm.startDate}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, startDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">End Date</span>
                      <input
                        required
                        type="date"
                        value={periodEditForm.endDate}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, endDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Status</span>
                      <select
                        value={periodEditForm.status}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, status: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="draft">Draft</option>
                        <option value="open">Open</option>
                        <option value="soft_locked">Soft Locked</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Locked From Date</span>
                      <input
                        type="date"
                        value={periodEditForm.lockedFromDate}
                        onChange={(event) =>
                          setPeriodEditForm((previous) => ({ ...previous, lockedFromDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Notes</span>
                    <textarea
                      rows={4}
                      value={periodEditForm.notes}
                      onChange={(event) =>
                        setPeriodEditForm((previous) => ({ ...previous, notes: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={handleClosePeriodEditModal}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPeriodEditSubmitting || isPeriodEditLoading}
                      className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPeriodEditSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isPeriodDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Period</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingPeriodName}&rdquo; from the accounting periods list.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePeriodDeleteModal}
                disabled={isPeriodDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {periodDeleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {periodDeleteError}
                </div>
              ) : null}

              {periodDeleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this period</p>
                    <p className="mt-1">
                      This period cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {periodDeleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this period.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleClosePeriodDeleteModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-medium">Are you sure?</p>
                    <p className="mt-1">
                      This action cannot be undone. The period &ldquo;{deletingPeriodName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClosePeriodDeleteModal}
                      disabled={isPeriodDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPeriodDelete}
                      disabled={isPeriodDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isPeriodDeleteSubmitting ? 'Deleting...' : 'Delete Period'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedPeriodId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Period Details</h2>
                <p className="mt-1 text-sm text-gray-600">Review the selected accounting period record.</p>
              </div>
              <button
                type="button"
                onClick={handleClosePeriodDetail}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isPeriodDetailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : periodDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {periodDetailError}
                </div>
              ) : selectedPeriod ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenPeriodEditModal(selectedPeriod.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Period
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Label</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedPeriod.label || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Period Number</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedPeriod.periodNumber ?? '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fiscal Year</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {typeof selectedPeriod.fiscalYear === 'object' && selectedPeriod.fiscalYear
                          ? `${selectedPeriod.fiscalYear.code || ''} ${selectedPeriod.fiscalYear.name || ''}`.trim() || '-'
                          : selectedPeriod.fiscalYear || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedPeriod.status || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Start Date</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedPeriod.startDate ? new Date(selectedPeriod.startDate).toISOString().slice(0, 10) : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">End Date</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedPeriod.endDate ? new Date(selectedPeriod.endDate).toISOString().slice(0, 10) : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Locked From Date</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedPeriod.lockedFromDate ? new Date(selectedPeriod.lockedFromDate).toISOString().slice(0, 10) : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Closed At</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedPeriod.closedAt) || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Closed By</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {typeof selectedPeriod.closedBy === 'object' && selectedPeriod.closedBy?.name
                          ? selectedPeriod.closedBy.name
                          : selectedPeriod.closedBy || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedPeriod.notes || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedPeriod.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedPeriod.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingAccountName}&rdquo; from the Chart of Accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {deleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {deleteError}
                </div>
              ) : null}

              {deleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this account</p>
                    <p className="mt-1">
                      This account cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {deleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this account.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseDeleteModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-medium">Are you sure?</p>
                    <p className="mt-1">
                      This action cannot be undone. The account &ldquo;{deletingAccountName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseDeleteModal}
                      disabled={isDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteAccount}
                      disabled={isDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleteSubmitting ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isTcCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Tax Code</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Add a new tax code for transaction use.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseTcCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaxCode} className="space-y-6 px-6 py-5">
              {tcCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {tcCreateError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Code</span>
                  <input
                    required
                    value={tcCreateForm.code}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Name</span>
                  <input
                    required
                    value={tcCreateForm.name}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Scope</span>
                  <select
                    value={tcCreateForm.scope}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, scope: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="both">Both</option>
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Rate (%)</span>
                  <input
                    required
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={tcCreateForm.rate}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, rate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Calculation Method</span>
                  <select
                    value={tcCreateForm.calculationMethod}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, calculationMethod: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Purchase Account</span>
                  <select
                    value={tcCreateForm.purchaseAccount}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, purchaseAccount: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select a value</option>
                    {(tcData?.referenceData.chartAccounts || []).map((account) => (
                      <option key={String(account.id)} value={String(account.id)}>
                        {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Sales Account</span>
                  <select
                    value={tcCreateForm.salesAccount}
                    onChange={(event) =>
                      setTcCreateForm((previous) => ({ ...previous, salesAccount: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select a value</option>
                    {(tcData?.referenceData.chartAccounts || []).map((account) => (
                      <option key={String(account.id)} value={String(account.id)}>
                        {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={tcCreateForm.isActive}
                  onChange={() =>
                    setTcCreateForm((previous) => ({ ...previous, isActive: !previous.isActive }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Active Tax Code
              </label>

              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Description</span>
                <textarea
                  rows={4}
                  value={tcCreateForm.description}
                  onChange={(event) =>
                    setTcCreateForm((previous) => ({ ...previous, description: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseTcCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTcCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isTcCreateSubmitting ? 'Creating...' : 'Create Tax Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isTcEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Tax Code</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Update the selected tax code.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseTcEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isTcEditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleEditTaxCode} className="space-y-6">
                  {tcEditError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {tcEditError}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Code</span>
                      <input
                        required
                        value={tcEditForm.code}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Name</span>
                      <input
                        required
                        value={tcEditForm.name}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, name: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Scope</span>
                      <select
                        value={tcEditForm.scope}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, scope: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="both">Both</option>
                        <option value="sales">Sales</option>
                        <option value="purchase">Purchase</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Rate (%)</span>
                      <input
                        required
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={tcEditForm.rate}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, rate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Calculation Method</span>
                      <select
                        value={tcEditForm.calculationMethod}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, calculationMethod: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="exclusive">Exclusive</option>
                        <option value="inclusive">Inclusive</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Purchase Account</span>
                      <select
                        value={tcEditForm.purchaseAccount}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, purchaseAccount: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select a value</option>
                        {(tcData?.referenceData.chartAccounts || []).map((account) => (
                          <option key={String(account.id)} value={String(account.id)}>
                            {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-gray-700">
                      <span className="font-medium">Sales Account</span>
                      <select
                        value={tcEditForm.salesAccount}
                        onChange={(event) =>
                          setTcEditForm((previous) => ({ ...previous, salesAccount: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select a value</option>
                        {(tcData?.referenceData.chartAccounts || []).map((account) => (
                          <option key={String(account.id)} value={String(account.id)}>
                            {account.code ? `${account.code} - ` : ''}{account.name || 'Unnamed account'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={tcEditForm.isActive}
                      onChange={() =>
                        setTcEditForm((previous) => ({ ...previous, isActive: !previous.isActive }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Active Tax Code
                  </label>

                  <label className="block space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Description</span>
                    <textarea
                      rows={4}
                      value={tcEditForm.description}
                      onChange={(event) =>
                        setTcEditForm((previous) => ({ ...previous, description: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseTcEditModal}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isTcEditSubmitting || isTcEditLoading}
                      className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isTcEditSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isTcDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Tax Code</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingTcName}&rdquo; from the tax codes list.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseTcDeleteModal}
                disabled={isTcDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {tcDeleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {tcDeleteError}
                </div>
              ) : null}

              {tcDeleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this tax code</p>
                    <p className="mt-1">
                      This tax code cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {tcDeleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this tax code.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseTcDeleteModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-medium">Are you sure?</p>
                    <p className="mt-1">
                      This action cannot be undone. The tax code &ldquo;{deletingTcName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseTcDeleteModal}
                      disabled={isTcDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmTcDelete}
                      disabled={isTcDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isTcDeleteSubmitting ? 'Deleting...' : 'Delete Tax Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedTcId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tax Code Details</h2>
                <p className="mt-1 text-sm text-gray-600">Review the selected tax code record.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseTaxCodeDetail}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {isTcDetailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : tcDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {tcDetailError}
                </div>
              ) : selectedTc ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenTcEditModal(selectedTc.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Tax Code
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Code</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedTc.code || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Name</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedTc.name || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Scope</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedTc.scope || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rate</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedTc.rate !== null && selectedTc.rate !== undefined ? `${selectedTc.rate}%` : '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Calculation Method</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedTc.calculationMethod || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedTc.isActive !== false ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Purchase Account</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {typeof selectedTc.purchaseAccount === 'object' && selectedTc.purchaseAccount
                          ? `${selectedTc.purchaseAccount.code || ''} ${selectedTc.purchaseAccount.name || ''}`.trim() || String(selectedTc.purchaseAccount.id)
                          : selectedTc.purchaseAccount || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sales Account</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {typeof selectedTc.salesAccount === 'object' && selectedTc.salesAccount
                          ? `${selectedTc.salesAccount.code || ''} ${selectedTc.salesAccount.name || ''}`.trim() || String(selectedTc.salesAccount.id)
                          : selectedTc.salesAccount || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Description</p>
                      <p className="mt-2 text-sm text-gray-700">{selectedTc.description || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedTc.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated</p>
                      <p className="mt-2 text-sm text-gray-700">{formatDateTime(selectedTc.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
