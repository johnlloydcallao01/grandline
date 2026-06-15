'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from '@/components/ui/IconWrapper';
import {
  getJournalEntriesRegister,
  getJournalEntryDetail,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntryLinesRegister,
  getJournalEntryLineDetail,
  createJournalEntryLine,
  updateJournalEntryLine,
  deleteJournalEntryLine,
  getJournalEntryChoices,
  getChartAccountChoices,
  getSourceTypesRegister,
  type JournalEntriesRegisterResponse,
  type JournalEntryDetail,
  type JournalEntryRegisterRow,
  type JournalEntryMetric,
  type JournalEntryLinesRegisterResponse,
  type JournalEntryLineRegisterRow,
  type JournalEntryLineDetail,
  type ChoiceItem,
  type SourceTypesRegisterResponse,
  type SourceTypeRegisterRow,
} from './actions';

type StaticTableCell =
  | string
  | { text: string; tone?: string; emphasis?: boolean; align?: string };

type JournalEntryTab = 'journal-entries' | 'journal-entry-detail' | 'journal-source-types';

type JournalEntryFilterState = {
  statuses: string[];
  sourceTypes: string[];
  isUnbalanced: boolean;
};

type JournalEntryDetailFilterState = {
  hasTaxCode: boolean;
  hasReference: boolean;
  lineTypes: string[];
};

type JournalEntryFormState = {
  entryDate: string;
  postingDate: string;
  sourceType: string;
  sourceReference: string;
  memo: string;
  referenceNumber: string;
  status: string;
  notes: string;
};

const SOURCE_TYPE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Opening Balance', value: 'opening_balance' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Reversal', value: 'reversal' },
  { label: 'System', value: 'system' },
];

const JOURNAL_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Posted', value: 'posted' },
  { label: 'Reversed', value: 'reversed' },
  { label: 'Voided', value: 'voided' },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: JournalEntryMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function getStatusBadgeClasses(status?: string | null) {
  switch (String(status || '').toLowerCase()) {
    case 'draft': case 'amber': return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'posted': case 'green': return 'bg-green-50 text-green-700 ring-green-200';
    case 'reversed': case 'voided': case 'gray': return 'bg-gray-100 text-gray-700 ring-gray-200';
    default: return 'bg-gray-100 text-gray-700 ring-gray-200';
  }
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  try { return new Date(value).toLocaleString(); } catch { return value; }
}

function formatUser(user: unknown): string {
  if (!user) return '-';
  if (typeof user === 'object' && user !== null) {
    const u = user as Record<string, unknown>;
    const parts = [String(u.firstName || '').trim(), String(u.middleName || '').trim(), String(u.lastName || '').trim()].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : String(u.id);
  }
  return String(user);
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

const initialForm: JournalEntryFormState = {
  entryDate: new Date().toISOString().slice(0, 10),
  postingDate: new Date().toISOString().slice(0, 10),
  sourceType: 'manual',
  sourceReference: '',
  memo: '',
  referenceNumber: '',
  status: 'draft',
  notes: '',
};

type JournalEntryLineFormState = {
  journalEntry: string;
  account: string;
  description: string;
  debit: string;
  credit: string;
  taxCode: string;
  referenceEntityType: string;
  referenceEntityId: string;
};

const initialLineForm: JournalEntryLineFormState = {
  journalEntry: '',
  account: '',
  description: '',
  debit: '0',
  credit: '0',
  taxCode: '',
  referenceEntityType: '',
  referenceEntityId: '',
};

function MetricCard({ label, value, change, trend = 'neutral' }: { label: string; value: string | number; change: string; trend?: 'up' | 'down' | 'neutral' }) {
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
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${trend ? getMetricTone(trend) : 'text-gray-600 bg-gray-100'}`}>
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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: StaticTableCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  }
  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(cell.tone)}`}>
          {cell.text}
        </span>
      </td>
    );
  }
  return (
    <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>
      {cell.text}
    </td>
  );
}

function SlideOver({ isOpen, onClose, title, description, children }: { isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  if (!mounted) return null;
  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex w-full max-w-lg flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
  );
}

type JournalManagementClientProps = {
  initialData: JournalEntriesRegisterResponse | null;
};

const STATIC_TABS: Array<{ id: JournalEntryTab; label: string; description: string; searchPlaceholder: string; tableTitle: string; tableDescription: string; columns: string[] }> = [
  {
    id: 'journal-entries',
    label: 'Journal Entries',
    description: 'Manage journal entry headers with entry numbers, dates, source type, status, posting status, and balancing totals.',
    searchPlaceholder: 'Search entry no., source ref, memo, or status',
    tableTitle: 'Journal Entry Register',
    tableDescription: 'Journal header register using entry number, posting date, source type, totals, and status.',
    columns: ['Entry No.', 'Posting Date', 'Source Type', 'Memo', 'Total Debit', 'Total Credit', 'Balanced', 'Status'],
  },
  {
    id: 'journal-entry-detail',
    label: 'Journal Entry Detail',
    description: 'Inspect journal line detail with accounts, descriptions, debit and credit values, tax codes, and reference entities.',
    searchPlaceholder: 'Search entry no., account, line description, tax code, or reference entity',
    tableTitle: 'Journal Line Detail',
    tableDescription: 'Line-level detail for journal entries showing account coding, amounts, tax links, and source references.',
    columns: ['Entry No.', 'Line', 'Account', 'Debit', 'Credit', 'Reference'],
  },
  {
    id: 'journal-source-types',
    label: 'Journal Source Types',
    description: 'Review journal records by source type such as manual, opening balance, adjustment, reversal, and system.',
    searchPlaceholder: 'Search source type, entry no., source reference, memo, or user',
    tableTitle: 'Source-Type Journal View',
    tableDescription: 'Journal inventory grouped around the supported sourceType values.',
    columns: ['Entry No.', 'Source Type', 'Source Ref', 'Posting Date', 'Posted By', 'Status'],
  },
];

export default function JournalManagementClient({ initialData }: JournalManagementClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<JournalEntryTab>(
    (searchParams.get('tab') as JournalEntryTab) || 'journal-entries',
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [data, setData] = useState<JournalEntriesRegisterResponse | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchInput, setSearchInput] = useState(initialData?.appliedFilters.search || '');
  const [submittedSearch, setSubmittedSearch] = useState(initialData?.appliedFilters.search || '');
  const [currentPage, setCurrentPage] = useState(initialData?.pagination.page || 1);
  const [draftFilters, setDraftFilters] = useState<JournalEntryFilterState>({
    statuses: initialData?.appliedFilters.statuses || [],
    sourceTypes: initialData?.appliedFilters.sourceTypes || [],
    isUnbalanced: initialData?.appliedFilters.isUnbalanced || false,
  });
  const [appliedFilters, setAppliedFilters] = useState<JournalEntryFilterState>({
    statuses: initialData?.appliedFilters.statuses || [],
    sourceTypes: initialData?.appliedFilters.sourceTypes || [],
    isUnbalanced: initialData?.appliedFilters.isUnbalanced || false,
  });
  const [quickFilters, setQuickFilters] = useState<string[]>(initialData?.appliedFilters.quickFilters || []);
  const initialFetchRef = useRef(false);

  // --- Create state ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<JournalEntryFormState>(initialForm);

  // --- Edit state ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editForm, setEditForm] = useState<JournalEntryFormState>(initialForm);
  const [editingTotals, setEditingTotals] = useState<{ totalDebit: number | null; totalCredit: number | null; isBalanced: boolean | null }>({ totalDebit: null, totalCredit: null, isBalanced: null });

  // --- Detail/view state ---
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  // --- Delete state ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [deletingEntryNumber, setDeletingEntryNumber] = useState('');
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [deleteBlockers, setDeleteBlockers] = useState<string[]>([]);

  // --- Lines state ---
  const [lineData, setLineData] = useState<JournalEntryLinesRegisterResponse | null>(null);
  const [lineError, setLineError] = useState<string | null>(null);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const [lineSearchInput, setLineSearchInput] = useState('');
  const [lineSubmittedSearch, setLineSubmittedSearch] = useState('');
  const [lineCurrentPage, setLineCurrentPage] = useState(1);
  const [lineFilters, setLineFilters] = useState<JournalEntryDetailFilterState>({ hasTaxCode: false, hasReference: false, lineTypes: [] });
  const [lineQuickFilters, setLineQuickFilters] = useState<string[]>([]);
  const [draftLineFilters, setDraftLineFilters] = useState<JournalEntryDetailFilterState>({ hasTaxCode: false, hasReference: false, lineTypes: [] });
  const [isLineFilterPanelOpen, setIsLineFilterPanelOpen] = useState(false);

  // --- Lines CRUD state ---
  const [isLineCreateOpen, setIsLineCreateOpen] = useState(false);
  const [isLineCreateSubmitting, setIsLineCreateSubmitting] = useState(false);
  const [lineCreateErr, setLineCreateErr] = useState<string | null>(null);
  const [lineCreateForm, setLineCreateForm] = useState<JournalEntryLineFormState>(initialLineForm);

  const [isLineEditOpen, setIsLineEditOpen] = useState(false);
  const [isLineEditSubmitting, setIsLineEditSubmitting] = useState(false);
  const [lineEditErr, setLineEditErr] = useState<string | null>(null);
  const [lineEditingId, setLineEditingId] = useState<number | string | null>(null);
  const [lineEditForm, setLineEditForm] = useState<JournalEntryLineFormState>(initialLineForm);

  const [lineSelectedId, setLineSelectedId] = useState<number | string | null>(null);
  const [lineSelected, setLineSelected] = useState<JournalEntryLineDetail | null>(null);
  const [isLineDetailLoading, setIsLineDetailLoading] = useState(false);
  const [lineDetailErr, setLineDetailErr] = useState<string | null>(null);

  const [isLineDeleteOpen, setIsLineDeleteOpen] = useState(false);
  const [lineDeletingId, setLineDeletingId] = useState<number | string | null>(null);
  const [isLineDeleteSubmitting, setIsLineDeleteSubmitting] = useState(false);
  const [lineDeleteErr, setLineDeleteErr] = useState<string | null>(null);

  // --- Line choices for dropdowns ---
  const [journalEntryChoices, setJournalEntryChoices] = useState<ChoiceItem[]>([]);
  const [chartAccountChoices, setChartAccountChoices] = useState<ChoiceItem[]>([]);

  // --- Source types state ---
  const [stData, setStData] = useState<SourceTypesRegisterResponse | null>(null);
  const [stError, setStError] = useState<string | null>(null);
  const [isStLoading, setIsStLoading] = useState(false);
  const [stSearchInput, setStSearchInput] = useState('');
  const [stSubmittedSearch, setStSubmittedSearch] = useState('');
  const [stCurrentPage, setStCurrentPage] = useState(1);
  const [stFilters, setStFilters] = useState<{ sourceTypes: string[]; statuses: string[] }>({ sourceTypes: [], statuses: [] });
  const [stQuickFilters, setStQuickFilters] = useState<string[]>([]);
  const [draftStFilters, setDraftStFilters] = useState<{ sourceTypes: string[]; statuses: string[] }>({ sourceTypes: [], statuses: [] });
  const [isStFilterPanelOpen, setIsStFilterPanelOpen] = useState(false);

  // --- URL tab sync ---
  useEffect(() => {
    const raw = searchParams.get('tab') as JournalEntryTab | null;
    const nextTab: JournalEntryTab = raw === 'journal-entry-detail' || raw === 'journal-source-types' ? raw : 'journal-entries';
    setActiveTab((previous) => (previous === nextTab ? previous : nextTab));
  }, [searchParams]);

  const handleTabChange = (tab: JournalEntryTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // --- Derived data ---
  const currentSection = data?.section ?? STATIC_TABS.find((t) => t.id === activeTab) ?? STATIC_TABS[0];
  const currentRows = data?.section.table.rows ?? [];
  const currentMetrics = data?.section.metrics;
  const currentPagination = data?.pagination;
  const currentTotal = data?.totals.filteredEntries;
  const filterCount = appliedFilters.statuses.length + appliedFilters.sourceTypes.length + (appliedFilters.isUnbalanced ? 1 : 0);
  const lineFilterCount = (lineFilters.hasTaxCode ? 1 : 0) + (lineFilters.hasReference ? 1 : 0) + lineFilters.lineTypes.length;
  const stFilterCount = stFilters.sourceTypes.length + stFilters.statuses.length;

  // --- Fetch ---
  const fetchData = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: JournalEntryFilterState; nextQuickFilters: string[] }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getJournalEntriesRegister({ search, page, statuses: f.statuses, sourceTypes: f.sourceTypes, isUnbalanced: f.isUnbalanced, quickFilters: nextQuickFilters });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load journal entries.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Lines fetch ---
  const fetchLines = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: JournalEntryDetailFilterState; nextQuickFilters: string[] }) => {
    setIsLineLoading(true);
    setLineError(null);
    try {
      const result = await getJournalEntryLinesRegister({
        search,
        page,
        hasTaxCode: f.hasTaxCode,
        hasReference: f.hasReference,
        lineTypes: f.lineTypes,
        quickFilters: nextQuickFilters,
      });
      setLineData(result);
    } catch (err) {
      setLineError(err instanceof Error ? err.message : 'Unable to load journal entry lines.');
    } finally {
      setIsLineLoading(false);
    }
  }, []);

  // --- Source types fetch ---
  const fetchSt = useCallback(async ({ search, page, filters: f, nextQuickFilters }: { search: string; page: number; filters: { sourceTypes: string[]; statuses: string[] }; nextQuickFilters: string[] }) => {
    setIsStLoading(true);
    setStError(null);
    try {
      const result = await getSourceTypesRegister({ search, page, sourceTypes: f.sourceTypes, statuses: f.statuses, quickFilters: nextQuickFilters });
      setStData(result);
    } catch (err) {
      setStError(err instanceof Error ? err.message : 'Unable to load journal source types.');
    } finally {
      setIsStLoading(false);
    }
  }, []);

  // --- Initial fetch skip ---
  useEffect(() => {
    if (activeTab !== 'journal-entries') return;
    if (!initialFetchRef.current && initialData) { initialFetchRef.current = true; return; }
    void fetchData({ search: submittedSearch, page: currentPage, filters: appliedFilters, nextQuickFilters: quickFilters });
  }, [activeTab, appliedFilters, currentPage, submittedSearch, quickFilters, fetchData, initialData]);

  // --- Lines fetch on tab switch ---
  useEffect(() => {
    if (activeTab !== 'journal-entry-detail') return;
    void fetchLines({ search: lineSubmittedSearch, page: lineCurrentPage, filters: lineFilters, nextQuickFilters: lineQuickFilters });
  }, [activeTab, lineFilters, lineCurrentPage, lineSubmittedSearch, lineQuickFilters, fetchLines]);

  // --- Source types fetch on tab switch ---
  useEffect(() => {
    if (activeTab !== 'journal-source-types') return;
    void fetchSt({ search: stSubmittedSearch, page: stCurrentPage, filters: stFilters, nextQuickFilters: stQuickFilters });
  }, [activeTab, stFilters, stCurrentPage, stSubmittedSearch, stQuickFilters, fetchSt]);

  // --- Search ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchInput);
    fetchData({ search: searchInput, page: 1, filters: appliedFilters, nextQuickFilters: quickFilters });
  };

  // --- Filter apply/reset ---
  const handleApplyFilters = () => {
    if (JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters)) {
      setCurrentPage(1);
      setAppliedFilters({ ...draftFilters });
    }
    setIsFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const reset: JournalEntryFilterState = { statuses: [], sourceTypes: [], isUnbalanced: false };
    setDraftFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  // --- Quick filter toggle ---
  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  // --- Refresh ---
  const handleRefresh = () => {
    fetchData({ search: submittedSearch, page: currentPage, filters: appliedFilters, nextQuickFilters: quickFilters });
  };

  // --- Create ---
  const handleOpenCreate = () => {
    setCreateForm(initialForm);
    setCreateErr(null);
    setIsCreateSubmitting(false);
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setCreateErr(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateSubmitting(true);
    setCreateErr(null);
    try {
      const created = await createJournalEntry({
        entryDate: createForm.entryDate,
        postingDate: createForm.postingDate,
        sourceType: createForm.sourceType,
        sourceReference: createForm.sourceReference || null,
        memo: createForm.memo || null,
        referenceNumber: createForm.referenceNumber || null,
        status: createForm.status,
        notes: createForm.notes || null,
      });
      handleCloseCreate();
      setCurrentPage(1);
      if (activeTab === 'journal-source-types') {
        fetchSt({ search: stSubmittedSearch, page: 1, filters: stFilters, nextQuickFilters: stQuickFilters });
      } else {
        fetchData({ search: submittedSearch, page: 1, filters: appliedFilters, nextQuickFilters: quickFilters });
      }
      handleView(created.id);
    } catch (err) {
      setCreateErr(err instanceof Error ? err.message : 'Unable to create journal entry.');
      setIsCreateSubmitting(false);
    }
  };

  // --- View detail ---
  const handleView = async (id: number | string) => {
    setSelectedId(id);
    setSelectedEntry(null);
    setIsDetailLoading(true);
    setDetailErr(null);
    try {
      const detail = await getJournalEntryDetail(id);
      setSelectedEntry(detail);
    } catch (err) {
      setDetailErr(err instanceof Error ? err.message : 'Unable to load journal entry detail.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedId(null);
    setSelectedEntry(null);
    setDetailErr(null);
  };

  // --- Edit ---
  const handleOpenEdit = async (id: number | string) => {
    handleCloseDetail();
    setEditingId(id);
    setEditForm(initialForm);
    setEditErr(null);
    setIsEditSubmitting(false);
    setIsEditOpen(true);
    try {
      const detail = await getJournalEntryDetail(id);
      setEditForm({
        entryDate: (detail.entryDate || '').slice(0, 10),
        postingDate: (detail.postingDate || '').slice(0, 10),
        sourceType: detail.sourceType || 'manual',
        sourceReference: detail.sourceReference || '',
        memo: detail.memo || '',
        referenceNumber: detail.referenceNumber || '',
        status: detail.status || 'draft',
        notes: detail.notes || '',
      });
      setEditingTotals({ totalDebit: detail.totalDebit ?? null, totalCredit: detail.totalCredit ?? null, isBalanced: detail.isBalanced ?? null });
    } catch (err) {
      setEditErr(err instanceof Error ? err.message : 'Unable to load for editing.');
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingId(null);
    setEditErr(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    setIsEditSubmitting(true);
    setEditErr(null);
    try {
      await updateJournalEntry(editingId, {
        entryDate: editForm.entryDate,
        postingDate: editForm.postingDate,
        sourceType: editForm.sourceType,
        sourceReference: editForm.sourceReference || null,
        memo: editForm.memo || null,
        referenceNumber: editForm.referenceNumber || null,
        status: editForm.status,
        notes: editForm.notes || null,
      });
      handleCloseEdit();
      if (activeTab === 'journal-source-types') {
        fetchSt({ search: stSubmittedSearch, page: stCurrentPage, filters: stFilters, nextQuickFilters: stQuickFilters });
      } else {
        fetchData({ search: submittedSearch, page: currentPage, filters: appliedFilters, nextQuickFilters: quickFilters });
      }
    } catch (err) {
      setEditErr(err instanceof Error ? err.message : 'Unable to update journal entry.');
      setIsEditSubmitting(false);
    }
  };

  // --- Delete ---
  const handleOpenDelete = async (id: number | string, entryNumber: string) => {
    setDeletingId(id);
    setDeletingEntryNumber(entryNumber);
    setDeleteErr(null);
    setDeleteBlockers([]);
    setIsDeleteSubmitting(false);
    setIsDeleteOpen(true);
    try {
      const result = await deleteJournalEntry(id);
      setDeleteBlockers(result.blockers || []);
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : 'Unable to check dependencies.');
    }
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setDeletingId(null);
    setDeletingEntryNumber('');
    setDeleteErr(null);
    setDeleteBlockers([]);
    setIsDeleteSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId === null) return;
    setIsDeleteSubmitting(true);
    setDeleteErr(null);
    try {
      const result = await deleteJournalEntry(deletingId);
      if (result.blockers && result.blockers.length > 0) {
        setDeleteErr('Cannot delete: dependencies exist.');
        setIsDeleteSubmitting(false);
        return;
      }
      handleCloseDelete();
      if (activeTab === 'journal-source-types') {
        fetchSt({ search: stSubmittedSearch, page: stCurrentPage, filters: stFilters, nextQuickFilters: stQuickFilters });
      } else {
        fetchData({ search: submittedSearch, page: currentPage, filters: appliedFilters, nextQuickFilters: quickFilters });
      }
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : 'Unable to delete journal entry.');
      setIsDeleteSubmitting(false);
    }
  };

  // --- CSV Export ---
  const handleExport = () => {
    const rows = currentRows as JournalEntryRegisterRow[];
    if (!rows.length) return;
    const headers = ['Entry No.', 'Posting Date', 'Source Type', 'Memo', 'Total Debit', 'Total Credit', 'Balanced', 'Status'];
    const csvRows = rows.map((r) => [
      r.entryNumber ?? '-',
      r.postingDate ?? '-',
      r.sourceTypeLabel ?? r.sourceType ?? '-',
      r.memo ?? '-',
      r.totalDebit != null ? `PHP ${Number(r.totalDebit).toLocaleString()}` : '-',
      r.totalCredit != null ? `PHP ${Number(r.totalCredit).toLocaleString()}` : '-',
      r.isBalanced ? 'Yes' : 'No',
      r.statusLabel ?? '-',
    ]);
    const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))]
      .map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'journal-entry-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ===== RENDER =====
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Core / Journals &amp; Ledger</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Journal Management</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">Create, review, and track journal headers, line detail, and supported journal source types.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Tab bar */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {STATIC_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="space-y-6 p-6">

      {activeTab === 'journal-source-types' ? (
        <>
          {/* Source types tab header */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">Journal Source Types</h2>
              <p className="text-sm text-gray-600">{STATIC_TABS[2].description}</p>
              <p className="text-sm text-gray-500">{stData?.totals.filteredEntries ?? 0} matching entries</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" /> Create Journal
              </button>
              <button type="button" onClick={() => fetchSt({ search: stSubmittedSearch, page: stCurrentPage, filters: stFilters, nextQuickFilters: stQuickFilters })}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button type="button" onClick={() => {
                const rows = stData?.section.table.rows ?? [];
                if (!rows.length) return;
                const headers = ['Entry No.', 'Source Type', 'Source Ref', 'Posting Date', 'Posted By', 'Status'];
                const csvRows = rows.map((r) => { const row = r as SourceTypeRegisterRow; return [row.entryNumber ?? '-', row.sourceTypeLabel ?? row.sourceType ?? '-', row.sourceReference ?? '-', row.postingDate ?? '-', row.createdBy ?? '-', row.statusLabel ?? '-']; });
                const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a'); link.href = url; link.download = 'journal-source-types.csv';
                document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
              }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!(stData?.section.table.rows.length)}>
                <Download className="h-4 w-4" /> Download View
              </button>
            </div>
          </div>

          {/* Source types metrics */}
          {stData?.section.metrics && stData.section.metrics.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {stData.section.metrics.map((metric) => (
                <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>
              ))}
            </div>
          ) : null}

          {/* Source types table card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Source-Type Journal View</h3>
                  <p className="mt-1 text-sm text-gray-600">Journal inventory grouped around the supported sourceType values.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{stData?.totals.filteredEntries ?? 0} matching entries</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={(e) => { e.preventDefault(); setStSubmittedSearch(stSearchInput); fetchSt({ search: stSearchInput, page: 1, filters: stFilters, nextQuickFilters: stQuickFilters }); }} className="relative min-w-0 flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search source type, entry no., source reference, memo, or user"
                    value={stSearchInput} onChange={(e) => setStSearchInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </form>
                <button type="button" onClick={() => { if (!isStFilterPanelOpen) setDraftStFilters({ ...stFilters }); setIsStFilterPanelOpen((p) => !p); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <Filter className="h-4 w-4" /> Filters
                  {stFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">{stFilterCount}</span>
                  )}
                </button>
              </div>

              {/* Source types quick filter chips */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const qf = stData?.section?.filters?.quickFilters;
                  if (qf && qf.length > 0) {
                    return qf.map((f) => {
                      const isActive = stQuickFilters.includes(f.value);
                      return (
                        <button key={f.value} type="button" onClick={() => {
                          setStQuickFilters((previous) => toggleFilterValue(previous, f.value));
                          setStCurrentPage(1);
                        }}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {f.label}
                        </button>
                      );
                    });
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Source types filter panel */}
            {isStFilterPanelOpen && (
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Source Type Filters</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setDraftStFilters({ sourceTypes: [], statuses: [] }); setStFilters({ sourceTypes: [], statuses: [] }); setStCurrentPage(1); setIsStFilterPanelOpen(false); }}
                      className="text-sm text-gray-500 hover:text-gray-700">Reset</button>
                    <button type="button" onClick={() => { setStFilters({ ...draftStFilters }); setStCurrentPage(1); setIsStFilterPanelOpen(false); }}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stData?.section?.filters?.sourceTypes?.map((opt) => {
                    const isSelected = draftStFilters.sourceTypes.includes(opt.value);
                    return (
                      <button key={opt.value} type="button" onClick={() => setDraftStFilters((p) => ({ ...p, sourceTypes: toggleFilterValue(p.sourceTypes, opt.value) }))}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-900">Status Filters</h4>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stData?.section?.filters?.statuses?.map((opt) => {
                    const isSelected = draftStFilters.statuses.includes(opt.value);
                    return (
                      <button key={opt.value} type="button" onClick={() => setDraftStFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Source types table */}
            <div className="space-y-4 p-5">
              {stError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {stError}
                </div>
              )}

              {isStLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {STATIC_TABS[2].columns.map((col) => (
                              <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(stData?.section.table.rows ?? []).length > 0 ? (
                            (stData?.section.table.rows ?? []).map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell, index) => renderCell(cell, index))}
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => handleView(row.id)}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => handleOpenEdit(row.id)}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => { const r = row as SourceTypeRegisterRow; handleOpenDelete(row.id, r.entryNumber || 'Journal Entry'); }}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={STATIC_TABS[2].columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No journal entries found for the selected source types.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {stData?.pagination && stData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {stData.pagination.page} of {stData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!stData.pagination.hasPrevPage}
                          onClick={() => setStCurrentPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!stData.pagination.hasNextPage}
                          onClick={() => setStCurrentPage((p) => p + 1)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </div>
        </>
      ) : activeTab === 'journal-entry-detail' ? (
        <>
          {/* Lines tab header */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">Journal Entry Detail</h2>
              <p className="text-sm text-gray-600">{STATIC_TABS[1].description}</p>
              <p className="text-sm text-gray-500">{lineData?.totals.filteredLines ?? 0} matching journal lines</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={async () => { setLineCreateForm(initialLineForm); setLineCreateErr(null); setIsLineCreateSubmitting(false); setIsLineCreateOpen(true); try { const [je, ca] = await Promise.all([getJournalEntryChoices(), getChartAccountChoices()]); setJournalEntryChoices(je.choices); setChartAccountChoices(ca.choices); } catch (_e) { /* choices fetch failed */ } }}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" /> Create Line
              </button>
              <button type="button" onClick={() => fetchLines({ search: lineSubmittedSearch, page: lineCurrentPage, filters: lineFilters, nextQuickFilters: lineQuickFilters })}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button type="button" onClick={() => {
                const rows = lineData?.section.table.rows ?? [];
                if (!rows.length) return;
                const headers = ['Entry No.', 'Line', 'Account', 'Description', 'Debit', 'Credit', 'Tax Code', 'Reference'];
                const csvRows = rows.map((r) => {
                  const row = r as JournalEntryLineRegisterRow;
                  return [row.entryNumber ?? '-', String(row.lineNumber ?? '-'), row.accountCode ? `${row.accountCode} - ${row.accountName || ''}` : (row.accountName || '-'), row.description ?? '-', row.debit != null ? `PHP ${Number(row.debit).toLocaleString()}` : '-', row.credit != null ? `PHP ${Number(row.credit).toLocaleString()}` : '-', row.taxCode ?? '-', (row.referenceEntityType && row.referenceEntityId) ? `${row.referenceEntityType} / ${row.referenceEntityId}` : '-'];
                });
                const csvContent = [headers.map((h) => escapeCsvValue(h)), ...csvRows.map((r) => r.map((c) => escapeCsvValue(c)))].map((r) => r.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a'); link.href = url; link.download = 'journal-line-detail.csv';
                document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
              }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!(lineData?.section.table.rows.length)}>
                <Download className="h-4 w-4" /> Download View
              </button>
            </div>
          </div>

          {/* Lines metrics */}
          {lineData?.section.metrics && lineData.section.metrics.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {lineData.section.metrics.map((metric) => (
                <div key={metric.id}>
                  <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                </div>
              ))}
            </div>
          ) : null}

          {/* Lines table card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Journal Line Detail Register</h3>
                  <p className="mt-1 text-sm text-gray-600">Line-level detail for journal entries showing account coding, amounts, tax links, and source references.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{lineData?.totals.filteredLines ?? 0} matching journal lines</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form onSubmit={(e) => { e.preventDefault(); setLineSubmittedSearch(lineSearchInput); fetchLines({ search: lineSearchInput, page: 1, filters: lineFilters, nextQuickFilters: lineQuickFilters }); }} className="relative min-w-0 flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search entry no., account, line description, tax code, or reference entity"
                    value={lineSearchInput} onChange={(e) => setLineSearchInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </form>
                <button type="button" onClick={() => { if (!isLineFilterPanelOpen) setDraftLineFilters({ ...lineFilters }); setIsLineFilterPanelOpen((p) => !p); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <Filter className="h-4 w-4" /> Filters
                  {lineFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      {lineFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Lines quick filter chips */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const quickFilters = lineData?.section?.filters?.quickFilters;
                  if (quickFilters && quickFilters.length > 0) {
                    return quickFilters.map((qf) => {
                      const isActive = lineQuickFilters.includes(qf.value);
                      return (
                        <button key={qf.value} type="button" onClick={() => {
                          setLineQuickFilters((previous) => toggleFilterValue(previous, qf.value));
                          setLineCurrentPage(1);
                        }}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {qf.label}
                        </button>
                      );
                    });
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Lines filter panel */}
            {isLineFilterPanelOpen && (
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Line Filters</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setDraftLineFilters({ hasTaxCode: false, hasReference: false, lineTypes: [] }); setLineFilters({ hasTaxCode: false, hasReference: false, lineTypes: [] }); setLineCurrentPage(1); setIsLineFilterPanelOpen(false); }}
                      className="text-sm text-gray-500 hover:text-gray-700">Reset</button>
                    <button type="button" onClick={() => { setLineFilters({ ...draftLineFilters }); setLineCurrentPage(1); setIsLineFilterPanelOpen(false); }}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={draftLineFilters.hasTaxCode}
                      onChange={() => setDraftLineFilters((p) => ({ ...p, hasTaxCode: !p.hasTaxCode }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Has Tax Code
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={draftLineFilters.hasReference}
                      onChange={() => setDraftLineFilters((p) => ({ ...p, hasReference: !p.hasReference }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Has Reference
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={draftLineFilters.lineTypes.includes('debit')}
                        onChange={() => setDraftLineFilters((p) => ({ ...p, lineTypes: toggleFilterValue(p.lineTypes, 'debit') }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      Debit Lines
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={draftLineFilters.lineTypes.includes('credit')}
                        onChange={() => setDraftLineFilters((p) => ({ ...p, lineTypes: toggleFilterValue(p.lineTypes, 'credit') }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      Credit Lines
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Lines table */}
            <div className="space-y-4 p-5">
              {lineError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {lineError}
                </div>
              )}

              {isLineLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {STATIC_TABS[1].columns.map((col) => (
                              <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {(lineData?.section.table.rows ?? []).length > 0 ? (
                            (lineData?.section.table.rows ?? []).map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell, index) => renderCell(cell, index))}
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={async () => { setLineSelectedId(row.id); setLineSelected(null); setIsLineDetailLoading(true); setLineDetailErr(null); try { setLineSelected(await getJournalEntryLineDetail(row.id)); } catch (err) { setLineDetailErr(err instanceof Error ? err.message : 'Unable to load line detail.'); } finally { setIsLineDetailLoading(false); } }}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={async () => { try { const [je, ca] = await Promise.all([getJournalEntryChoices(), getChartAccountChoices()]); setJournalEntryChoices(je.choices); setChartAccountChoices(ca.choices); } catch (_e) { /* choices fetch failed */ } setLineSelectedId(null); setLineEditingId(row.id); setLineEditForm(initialLineForm); setLineEditErr(null); setIsLineEditSubmitting(false); setIsLineEditOpen(true); try { const d = await getJournalEntryLineDetail(row.id); setLineEditForm({ journalEntry: d.journalEntry && typeof d.journalEntry === 'object' ? String((d.journalEntry as Record<string, unknown>).id ?? '') : String(d.journalEntry ?? ''), account: d.account && typeof d.account === 'object' ? String((d.account as Record<string, unknown>).id ?? '') : String(d.account ?? ''), description: d.description || '', debit: String(d.debit ?? '0'), credit: String(d.credit ?? '0'), taxCode: d.taxCode && typeof d.taxCode === 'object' ? String((d.taxCode as Record<string, unknown>).id ?? '') : String(d.taxCode ?? ''), referenceEntityType: d.referenceEntityType || '', referenceEntityId: d.referenceEntityId || '' }); } catch (err) { setLineEditErr(err instanceof Error ? err.message : 'Unable to load for editing.'); } }}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Edit">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => { setLineDeletingId(row.id); setLineDeleteErr(null); setIsLineDeleteSubmitting(false); setIsLineDeleteOpen(true); }}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700" title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={STATIC_TABS[1].columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No journal lines found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Lines Pagination */}
                  {lineData?.pagination && lineData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {lineData.pagination.page} of {lineData.pagination.totalPages}</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!lineData.pagination.hasPrevPage}
                          onClick={() => setLineCurrentPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={!lineData.pagination.hasNextPage}
                          onClick={() => setLineCurrentPage((p) => p + 1)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </div>
        </>
      ) : (
        <>
          {/* Tab header */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentSection.label}</h2>
              <p className="text-sm text-gray-600">{currentSection.description}</p>
              <p className="text-sm text-gray-500">{currentTotal ?? 0} matching journal entries</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
                <Plus className="h-4 w-4" /> Create Journal
              </button>
              <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Metrics */}
          {currentMetrics && currentMetrics.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {currentMetrics.map((metric) => (
                <div key={metric.id}>
                  <MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i}>
                  <MetricCard label="-" value={0} change="-" trend="neutral" />
                </div>
              ))}
            </div>
          )}

          {/* Table card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{data?.section.table.title || 'Journal Entry Register'}</h3>
                  <p className="mt-1 text-sm text-gray-600">{data?.section.table.description || 'Journal header register using entry number, posting date, source type, totals, and status.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{currentTotal ?? 0} matching journal entries</span>
                  <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!currentRows.length}><Download className="h-4 w-4" /> Export View</button>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1 max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder={currentSection.searchPlaceholder}
                    value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </form>
                <button type="button" onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <Filter className="h-4 w-4" /> Filters
                  {filterCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      {filterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick filter chips */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const quickFilterOptions = data?.section?.filters?.quickFilters;
                  if (quickFilterOptions && quickFilterOptions.length > 0) {
                    return quickFilterOptions.map((qf) => {
                      const isActive = quickFilters.includes(qf.value);
                      return (
                        <button key={qf.value} type="button" onClick={() => handleToggleQuickFilter(qf.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {qf.label}
                        </button>
                      );
                    });
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Filter panel */}
            {isFilterPanelOpen && (
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Status Filters</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleResetFilters} className="text-sm text-gray-500 hover:text-gray-700">Reset</button>
                    <button type="button" onClick={handleApplyFilters} className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data?.section?.filters?.statuses?.map((opt) => {
                    const isSelected = draftFilters.statuses.includes(opt.value);
                    return (
                      <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, statuses: toggleFilterValue(p.statuses, opt.value) }))}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-900">Source Type Filters</h4>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data?.section?.filters?.sourceTypes?.map((opt) => {
                    const isSelected = draftFilters.sourceTypes.includes(opt.value);
                    return (
                      <button key={opt.value} type="button" onClick={() => setDraftFilters((p) => ({ ...p, sourceTypes: toggleFilterValue(p.sourceTypes, opt.value) }))}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={draftFilters.isUnbalanced}
                      onChange={() => setDraftFilters((p) => ({ ...p, isUnbalanced: !p.isUnbalanced }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Unbalanced Only
                  </label>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="space-y-4 p-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {STATIC_TABS[0].columns.map((col) => (
                              <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col}</th>
                            ))}
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentRows.length > 0 ? (
                            currentRows.map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                {row.cells.map((cell, index) => renderCell(cell, index))}
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => handleView(row.id)}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                      title="View detail">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => handleOpenEdit(row.id)}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                      title="Edit">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => {
                                      const r = row as JournalEntryRegisterRow;
                                      handleOpenDelete(row.id, r.entryNumber || 'Journal Entry');
                                    }}
                                      className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                      title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={STATIC_TABS[0].columns.length + 1} className="px-4 py-10 text-center text-sm text-gray-500">No journal entries found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {currentPagination && currentPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Page {currentPagination.page} of {currentPagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button type="button" disabled={!currentPagination.hasPrevPage}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Previous
                        </button>
                        <button type="button" disabled={!currentPagination.hasNextPage}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </div>
        </>
      )}
        </div>
      </div>

      {/* Detail SlideOver */}
      <SlideOver isOpen={selectedId !== null} onClose={handleCloseDetail} title={selectedEntry?.entryNumber || 'Journal Entry Detail'}>
        {detailErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{detailErr}</div>}
        {isDetailLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : selectedEntry ? (
          <div className="space-y-4 text-sm">
            <div><span className="font-medium text-gray-500">Entry No.:</span> <span className="ml-2 text-gray-900">{selectedEntry.entryNumber || '-'}</span></div>
            <div><span className="font-medium text-gray-500">Entry Date:</span> <span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.entryDate)}</span></div>
            <div><span className="font-medium text-gray-500">Posting Date:</span> <span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.postingDate)}</span></div>
            <div><span className="font-medium text-gray-500">Source Type:</span> <span className="ml-2 text-gray-900">{selectedEntry.sourceType || '-'}</span></div>
            {selectedEntry.sourceReference && <div><span className="font-medium text-gray-500">Source Ref:</span> <span className="ml-2 text-gray-900">{selectedEntry.sourceReference}</span></div>}
            {selectedEntry.memo && <div><span className="font-medium text-gray-500">Memo:</span> <span className="ml-2 text-gray-900">{selectedEntry.memo}</span></div>}
            {selectedEntry.referenceNumber && <div><span className="font-medium text-gray-500">Reference No.:</span> <span className="ml-2 text-gray-900">{selectedEntry.referenceNumber}</span></div>}
            <div><span className="font-medium text-gray-500">Status:</span> <span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(selectedEntry.status)}`}>{selectedEntry.status || '-'}</span></div>
            <div><span className="font-medium text-gray-500">Total Debit:</span> <span className="ml-2 text-gray-900">{selectedEntry.totalDebit != null ? `PHP ${Number(selectedEntry.totalDebit).toLocaleString()}` : '-'}</span></div>
            <div><span className="font-medium text-gray-500">Total Credit:</span> <span className="ml-2 text-gray-900">{selectedEntry.totalCredit != null ? `PHP ${Number(selectedEntry.totalCredit).toLocaleString()}` : '-'}</span></div>
            <div><span className="font-medium text-gray-500">Balanced:</span> <span className="ml-2 text-gray-900">{selectedEntry.isBalanced ? 'Yes' : 'No'}</span></div>
            {selectedEntry.notes && <div><span className="font-medium text-gray-500">Notes:</span> <span className="ml-2 text-gray-900">{selectedEntry.notes}</span></div>}
            <div><span className="font-medium text-gray-500">Created:</span> <span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.createdAt)}</span></div>
            <div><span className="font-medium text-gray-500">Updated:</span> <span className="ml-2 text-gray-900">{formatDateTime(selectedEntry.updatedAt)}</span></div>
            <div><span className="font-medium text-gray-500">Created By:</span> <span className="ml-2 text-gray-900">{formatUser(selectedEntry.createdBy)}</span></div>
            <div><span className="font-medium text-gray-500">Updated By:</span> <span className="ml-2 text-gray-900">{formatUser(selectedEntry.updatedBy)}</span></div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => { const id = selectedEntry.id; handleCloseDetail(); handleOpenEdit(id); }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button type="button" onClick={handleCloseDetail}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      {/* Create SlideOver */}
      <SlideOver isOpen={isCreateOpen} onClose={handleCloseCreate} title="Create Journal Entry">
        {createErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{createErr}</div>}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Entry Date" required>
            <Input type="date" value={createForm.entryDate} onChange={(v) => setCreateForm((p) => ({ ...p, entryDate: v }))} required />
          </FormField>
          <FormField label="Posting Date" required>
            <Input type="date" value={createForm.postingDate} onChange={(v) => setCreateForm((p) => ({ ...p, postingDate: v }))} required />
          </FormField>
          <FormField label="Source Type">
            <Select value={createForm.sourceType} onChange={(v) => setCreateForm((p) => ({ ...p, sourceType: v }))} options={SOURCE_TYPE_OPTIONS} />
          </FormField>
          <FormField label="Source Reference">
            <Input value={createForm.sourceReference} onChange={(v) => setCreateForm((p) => ({ ...p, sourceReference: v }))} placeholder="e.g. MEM-2026-001" />
          </FormField>
          <FormField label="Memo">
            <TextArea value={createForm.memo} onChange={(v) => setCreateForm((p) => ({ ...p, memo: v }))} />
          </FormField>
          <FormField label="Reference Number">
            <Input value={createForm.referenceNumber} onChange={(v) => setCreateForm((p) => ({ ...p, referenceNumber: v }))} placeholder="Optional" />
          </FormField>
          <FormField label="Status">
            <Select value={createForm.status} onChange={(v) => setCreateForm((p) => ({ ...p, status: v }))} options={JOURNAL_STATUS_OPTIONS} />
          </FormField>
          <FormField label="Notes">
            <TextArea value={createForm.notes} onChange={(v) => setCreateForm((p) => ({ ...p, notes: v }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseCreate} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isCreateSubmitting} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isCreateSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Edit SlideOver */}
      <SlideOver isOpen={isEditOpen} onClose={handleCloseEdit} title="Edit Journal Entry">
        {editErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{editErr}</div>}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label="Entry Date" required>
            <Input type="date" value={editForm.entryDate} onChange={(v) => setEditForm((p) => ({ ...p, entryDate: v }))} required />
          </FormField>
          <FormField label="Posting Date" required>
            <Input type="date" value={editForm.postingDate} onChange={(v) => setEditForm((p) => ({ ...p, postingDate: v }))} required />
          </FormField>
          <FormField label="Source Type">
            <Select value={editForm.sourceType} onChange={(v) => setEditForm((p) => ({ ...p, sourceType: v }))} options={SOURCE_TYPE_OPTIONS} />
          </FormField>
          <FormField label="Source Reference">
            <Input value={editForm.sourceReference} onChange={(v) => setEditForm((p) => ({ ...p, sourceReference: v }))} placeholder="e.g. MEM-2026-001" />
          </FormField>
          <FormField label="Memo">
            <TextArea value={editForm.memo} onChange={(v) => setEditForm((p) => ({ ...p, memo: v }))} />
          </FormField>
          <FormField label="Reference Number">
            <Input value={editForm.referenceNumber} onChange={(v) => setEditForm((p) => ({ ...p, referenceNumber: v }))} placeholder="Optional" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Debit">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{editingTotals.totalDebit != null ? `PHP ${Number(editingTotals.totalDebit).toLocaleString()}` : 'PHP 0'}</div>
            </FormField>
            <FormField label="Total Credit">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{editingTotals.totalCredit != null ? `PHP ${Number(editingTotals.totalCredit).toLocaleString()}` : 'PHP 0'}</div>
            </FormField>
          </div>
          <FormField label="Balanced">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{editingTotals.isBalanced ? 'Yes' : 'No'}</div>
          </FormField>
          <FormField label="Status">
            <Select value={editForm.status} onChange={(v) => setEditForm((p) => ({ ...p, status: v }))} options={JOURNAL_STATUS_OPTIONS} />
          </FormField>
          <FormField label="Notes">
            <TextArea value={editForm.notes} onChange={(v) => setEditForm((p) => ({ ...p, notes: v }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCloseEdit} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isEditSubmitting} className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isEditSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Delete SlideOver */}
      <SlideOver isOpen={isDeleteOpen} onClose={handleCloseDelete}
        title="Delete Journal Entry"
        description={`Remove "${deletingEntryNumber}" from the Journal Entries list.`}>
        {deleteErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{deleteErr}</div>}
        {deleteBlockers.length > 0 ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Cannot delete this journal entry</p>
              <p className="mt-1">This journal entry cannot be deleted because the following dependencies exist:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {deleteBlockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <p className="mt-2">Remove all dependencies before attempting to delete this journal entry.</p>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleCloseDelete} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-medium">Are you sure?</p>
              <p className="mt-1">This action cannot be undone. The journal entry &ldquo;{deletingEntryNumber}&rdquo; will be permanently removed.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleCloseDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                {isDeleteSubmitting ? 'Deleting...' : 'Delete Entry'}
              </button>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Line Detail SlideOver */}
      <SlideOver isOpen={lineSelectedId !== null} onClose={() => { setLineSelectedId(null); setLineSelected(null); setLineDetailErr(null); }} title="Journal Line Detail">
        {lineDetailErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{lineDetailErr}</div>}
        {isLineDetailLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : lineSelected ? (
          <div className="space-y-4 text-sm">
            <div><span className="font-medium text-gray-500">Entry No.:</span> <span className="ml-2 text-gray-900">{lineSelected.journalEntry && typeof lineSelected.journalEntry === 'object' ? String((lineSelected.journalEntry as Record<string, unknown>).entryNumber ?? '') : '-'}</span></div>
            <div><span className="font-medium text-gray-500">Line No.:</span> <span className="ml-2 text-gray-900">{lineSelected.lineNumber ?? '-'}</span></div>
            <div><span className="font-medium text-gray-500">Account:</span> <span className="ml-2 text-gray-900">{lineSelected.account && typeof lineSelected.account === 'object' ? `${(lineSelected.account as Record<string, unknown>).code ?? ''} - ${(lineSelected.account as Record<string, unknown>).name ?? ''}` : '-'}</span></div>
            {lineSelected.description && <div><span className="font-medium text-gray-500">Description:</span> <span className="ml-2 text-gray-900">{lineSelected.description}</span></div>}
            <div><span className="font-medium text-gray-500">Debit:</span> <span className="ml-2 text-gray-900">{lineSelected.debit != null ? `PHP ${Number(lineSelected.debit).toLocaleString()}` : '-'}</span></div>
            <div><span className="font-medium text-gray-500">Credit:</span> <span className="ml-2 text-gray-900">{lineSelected.credit != null ? `PHP ${Number(lineSelected.credit).toLocaleString()}` : '-'}</span></div>
            {lineSelected.taxCode && <div><span className="font-medium text-gray-500">Tax Code:</span> <span className="ml-2 text-gray-900">{typeof lineSelected.taxCode === 'object' ? String((lineSelected.taxCode as Record<string, unknown>).code ?? '') : String(lineSelected.taxCode)}</span></div>}
            {lineSelected.referenceEntityType && <div><span className="font-medium text-gray-500">Reference:</span> <span className="ml-2 text-gray-900">{lineSelected.referenceEntityType} / {lineSelected.referenceEntityId || ''}</span></div>}
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={async () => { try { const [je, ca] = await Promise.all([getJournalEntryChoices(), getChartAccountChoices()]); setJournalEntryChoices(je.choices); setChartAccountChoices(ca.choices); } catch (_e) { /* choices fetch failed */ } const id = lineSelected.id; setLineSelectedId(null); setLineSelected(null); setLineEditingId(id); setLineEditForm(initialLineForm); setLineEditErr(null); setIsLineEditSubmitting(false); setIsLineEditOpen(true); try { const d = await getJournalEntryLineDetail(id); setLineEditForm({ journalEntry: d.journalEntry && typeof d.journalEntry === 'object' ? String((d.journalEntry as Record<string, unknown>).id ?? '') : String(d.journalEntry ?? ''), account: d.account && typeof d.account === 'object' ? String((d.account as Record<string, unknown>).id ?? '') : String(d.account ?? ''), description: d.description || '', debit: String(d.debit ?? '0'), credit: String(d.credit ?? '0'), taxCode: d.taxCode && typeof d.taxCode === 'object' ? String((d.taxCode as Record<string, unknown>).id ?? '') : String(d.taxCode ?? ''), referenceEntityType: d.referenceEntityType || '', referenceEntityId: d.referenceEntityId || '' }); } catch (err) { setLineEditErr(err instanceof Error ? err.message : 'Unable to load for editing.'); } }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button type="button" onClick={() => { setLineSelectedId(null); setLineSelected(null); setLineDetailErr(null); }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        ) : null}
      </SlideOver>

      {/* Line Create SlideOver */}
      <SlideOver isOpen={isLineCreateOpen} onClose={() => { setIsLineCreateOpen(false); setLineCreateErr(null); }} title="Create Journal Line">
        {lineCreateErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{lineCreateErr}</div>}
        <form onSubmit={async (e) => { e.preventDefault(); setIsLineCreateSubmitting(true); setLineCreateErr(null); try { await createJournalEntryLine({ journalEntry: Number(lineCreateForm.journalEntry), account: Number(lineCreateForm.account), description: lineCreateForm.description || null, debit: Number(lineCreateForm.debit) || 0, credit: Number(lineCreateForm.credit) || 0, taxCode: lineCreateForm.taxCode ? Number(lineCreateForm.taxCode) : null, referenceEntityType: lineCreateForm.referenceEntityType || null, referenceEntityId: lineCreateForm.referenceEntityId || null }); setIsLineCreateOpen(false); setLineCreateErr(null); setLineCreateForm(initialLineForm); setIsLineCreateSubmitting(false); setLineCurrentPage(1); fetchLines({ search: lineSubmittedSearch, page: 1, filters: lineFilters, nextQuickFilters: lineQuickFilters }); } catch (err) { setLineCreateErr(err instanceof Error ? err.message : 'Unable to create line.'); setIsLineCreateSubmitting(false); } }} className="space-y-4">
           <FormField label="Journal Entry" required>
            <select value={lineCreateForm.journalEntry} onChange={(v) => setLineCreateForm((p) => ({ ...p, journalEntry: v.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required>
              <option value="">Select a journal entry...</option>
              {journalEntryChoices.map((c) => <option key={String(c.value)} value={String(c.value)}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Account" required>
            <select value={lineCreateForm.account} onChange={(v) => setLineCreateForm((p) => ({ ...p, account: v.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required>
              <option value="">Select an account...</option>
              {chartAccountChoices.map((c) => <option key={String(c.value)} value={String(c.value)}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Description">
            <Input value={lineCreateForm.description} onChange={(v) => setLineCreateForm((p) => ({ ...p, description: v }))} placeholder="Line description" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Debit"><Input type="number" value={lineCreateForm.debit} onChange={(v) => setLineCreateForm((p) => ({ ...p, debit: v }))} /></FormField>
            <FormField label="Credit"><Input type="number" value={lineCreateForm.credit} onChange={(v) => setLineCreateForm((p) => ({ ...p, credit: v }))} /></FormField>
          </div>
          <FormField label="Tax Code ID">
            <Input value={lineCreateForm.taxCode} onChange={(v) => setLineCreateForm((p) => ({ ...p, taxCode: v }))} placeholder="Numeric tax code ID" />
          </FormField>
          <FormField label="Reference Entity Type">
            <Input value={lineCreateForm.referenceEntityType} onChange={(v) => setLineCreateForm((p) => ({ ...p, referenceEntityType: v }))} placeholder="e.g. invoice" />
          </FormField>
          <FormField label="Reference Entity ID">
            <Input value={lineCreateForm.referenceEntityId} onChange={(v) => setLineCreateForm((p) => ({ ...p, referenceEntityId: v }))} placeholder="e.g. 42" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setIsLineCreateOpen(false); setLineCreateErr(null); }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLineCreateSubmitting}
              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isLineCreateSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Line Edit SlideOver */}
      <SlideOver isOpen={isLineEditOpen} onClose={() => { setIsLineEditOpen(false); setLineEditingId(null); setLineEditErr(null); }} title="Edit Journal Line">
        {lineEditErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{lineEditErr}</div>}
        <form onSubmit={async (e) => { e.preventDefault(); if (lineEditingId === null) return; setIsLineEditSubmitting(true); setLineEditErr(null); try { await updateJournalEntryLine(lineEditingId, { account: Number(lineEditForm.account), description: lineEditForm.description || null, debit: Number(lineEditForm.debit) || 0, credit: Number(lineEditForm.credit) || 0, taxCode: lineEditForm.taxCode ? Number(lineEditForm.taxCode) : null, referenceEntityType: lineEditForm.referenceEntityType || null, referenceEntityId: lineEditForm.referenceEntityId || null }); setIsLineEditOpen(false); setLineEditingId(null); setLineEditErr(null); setLineEditForm(initialLineForm); fetchLines({ search: lineSubmittedSearch, page: lineCurrentPage, filters: lineFilters, nextQuickFilters: lineQuickFilters }); } catch (err) { setLineEditErr(err instanceof Error ? err.message : 'Unable to update line.'); setIsLineEditSubmitting(false); } }} className="space-y-4">
           <FormField label="Account" required>
            <select value={lineEditForm.account} onChange={(v) => setLineEditForm((p) => ({ ...p, account: v.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required>
              <option value="">Select an account...</option>
              {chartAccountChoices.map((c) => <option key={String(c.value)} value={String(c.value)}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Description">
            <Input value={lineEditForm.description} onChange={(v) => setLineEditForm((p) => ({ ...p, description: v }))} placeholder="Line description" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Debit"><Input type="number" value={lineEditForm.debit} onChange={(v) => setLineEditForm((p) => ({ ...p, debit: v }))} /></FormField>
            <FormField label="Credit"><Input type="number" value={lineEditForm.credit} onChange={(v) => setLineEditForm((p) => ({ ...p, credit: v }))} /></FormField>
          </div>
          <FormField label="Tax Code ID">
            <Input value={lineEditForm.taxCode} onChange={(v) => setLineEditForm((p) => ({ ...p, taxCode: v }))} placeholder="Numeric tax code ID" />
          </FormField>
          <FormField label="Reference Entity Type">
            <Input value={lineEditForm.referenceEntityType} onChange={(v) => setLineEditForm((p) => ({ ...p, referenceEntityType: v }))} placeholder="e.g. invoice" />
          </FormField>
          <FormField label="Reference Entity ID">
            <Input value={lineEditForm.referenceEntityId} onChange={(v) => setLineEditForm((p) => ({ ...p, referenceEntityId: v }))} placeholder="e.g. 42" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setIsLineEditOpen(false); setLineEditingId(null); setLineEditErr(null); }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLineEditSubmitting}
              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isLineEditSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Line Delete SlideOver */}
      <SlideOver isOpen={isLineDeleteOpen} onClose={() => { setIsLineDeleteOpen(false); setLineDeletingId(null); setLineDeleteErr(null); }}
        title="Delete Journal Line"
        description={`Remove this journal line`}>
        {lineDeleteErr && <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{lineDeleteErr}</div>}
        <div className="space-y-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Are you sure?</p>
            <p className="mt-1">This action cannot be undone. This journal line will be permanently removed.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setIsLineDeleteOpen(false); setLineDeletingId(null); setLineDeleteErr(null); }} disabled={isLineDeleteSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={async () => { if (lineDeletingId === null) return; setIsLineDeleteSubmitting(true); setLineDeleteErr(null); try { await deleteJournalEntryLine(lineDeletingId); setIsLineDeleteOpen(false); setLineDeletingId(null); setLineDeleteErr(null); setIsLineDeleteSubmitting(false); fetchLines({ search: lineSubmittedSearch, page: lineCurrentPage, filters: lineFilters, nextQuickFilters: lineQuickFilters }); } catch (err) { setLineDeleteErr(err instanceof Error ? err.message : 'Unable to delete line.'); setIsLineDeleteSubmitting(false); } }}
              disabled={isLineDeleteSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
              {isLineDeleteSubmitting ? 'Deleting...' : 'Delete Line'}
            </button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
