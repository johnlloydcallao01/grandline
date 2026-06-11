'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from '@/components/ui/IconWrapper';
import {
  getSponsorRegister,
  getSponsorDetail,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getCorporateAccountRegister,
  getCorporateAccountDetail,
  createCorporateAccount,
  updateCorporateAccount,
  deleteCorporateAccount,
  getCoverageLinkRegister,
  getCustomerChoices,
  getScholarshipAwardDetail,
  createScholarshipAward,
  updateScholarshipAward,
  deleteScholarshipAward,
  getCorporateBillingLinkDetail,
  createCorporateBillingLink,
  updateCorporateBillingLink,
  deleteCorporateBillingLink,
  getEnrollmentBillingLinkChoices,
  getTraineeChoices,
  type SponsorRegisterResponse,
  type SponsorDetail,
  type SponsorRegisterRow,
  type CreateSponsorInput,
  type UpdateSponsorInput,
  type CorporateAccountRegisterResponse,
  type CorporateAccountDetail,
  type CorporateAccountRegisterRow,
  type CreateCorporateAccountInput,
  type UpdateCorporateAccountInput,
  type CoverageLinkRegisterResponse,
  type CustomerChoice,
  type CreateScholarshipAwardInput,
  type CreateCorporateBillingLinkInput,
} from './actions';

type SponsorCreateFormState = {
  sponsorCode: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  defaultCustomer: string;
  status: string;
  notes: string;
};

type CorporateAccountCreateFormState = {
  accountCode: string;
  name: string;
  customer: string;
  billingContact: string;
  email: string;
  phone: string;
  creditTerms: string;
  paymentTerms: string;
  status: string;
  notes: string;
};

type SponsorFilterState = {
  statuses: string[];
  contactFilter?: string;
};

type CorporateAccountFilterState = {
  statuses: string[];
  creditFilter?: string;
};

const TAB_IDS = {
  SCHOLARSHIP_SPONSORS: 'scholarship-sponsors',
  CORPORATE_ACCOUNTS: 'corporate-accounts',
  COVERAGE_LINKS: 'coverage-links',
} as const;

const SPONSOR_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
] as const;

const initialSponsorCreateFormState: SponsorCreateFormState = {
  sponsorCode: '',
  name: '',
  contactName: '',
  email: '',
  phone: '',
  billingAddress: '',
  defaultCustomer: '',
  status: 'active',
  notes: '',
};

const initialCorporateAccountCreateFormState: CorporateAccountCreateFormState = {
  accountCode: '',
  name: '',
  customer: '',
  billingContact: '',
  email: '',
  phone: '',
  creditTerms: '',
  paymentTerms: '',
  status: 'active',
  notes: '',
};

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ''}`} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`detail-skel-${index}`} className="rounded-xl border border-gray-200 p-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

function mapSponsorDetailToFormState(detail: SponsorDetail): SponsorCreateFormState {
  return {
    sponsorCode: detail.sponsorCode || '',
    name: detail.name || '',
    contactName: detail.contactName || '',
    email: detail.email || '',
    phone: detail.phone || '',
    billingAddress: detail.billingAddress || '',
    defaultCustomer:
      typeof detail.defaultCustomer === 'object' && detail.defaultCustomer !== null
        ? String((detail.defaultCustomer as Record<string, unknown>).id ?? '')
        : String(detail.defaultCustomer ?? ''),
    status: detail.status || 'active',
    notes: detail.notes || '',
  };
}

function mapCorporateAccountDetailToFormState(detail: CorporateAccountDetail): CorporateAccountCreateFormState {
  return {
    accountCode: detail.accountCode || '',
    name: detail.name || '',
    customer:
      typeof detail.customer === 'object' && detail.customer !== null
        ? String((detail.customer as Record<string, unknown>).id ?? '')
        : String(detail.customer ?? ''),
    billingContact: detail.billingContact || '',
    email: detail.email || '',
    phone: detail.phone || '',
    creditTerms: detail.creditTerms || '',
    paymentTerms: detail.paymentTerms || '',
    status: detail.status || 'active',
    notes: detail.notes || '',
  };
}

export function SponsorsClient({
  initialSponsorData,
  initialCorporateAccountData,
}: {
  initialSponsorData?: SponsorRegisterResponse | null;
  initialCorporateAccountData?: CorporateAccountRegisterResponse | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabFromUrl = searchParams.get('tab') || TAB_IDS.SCHOLARSHIP_SPONSORS;

  const [activeTab, setActiveTab] = useState<string>(activeTabFromUrl);

  const switchTab = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tabId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [sponsorSearchInput, setSponsorSearchInput] = useState(initialSponsorData?.section.searchPlaceholder ? '' : '');
  const [sponsorSubmittedSearch, setSponsorSubmittedSearch] = useState('');
  const [sponsorCurrentPage, setSponsorCurrentPage] = useState(initialSponsorData?.pagination?.page || 1);
  const [sponsorData, setSponsorData] = useState<SponsorRegisterResponse | null>(initialSponsorData ?? null);
  const [sponsorError, setSponsorError] = useState<string | null>(null);
  const [isSponsorLoading, setIsSponsorLoading] = useState(!initialSponsorData);
  const [appliedSponsorFilters, setAppliedSponsorFilters] = useState<SponsorFilterState>({
    statuses: [],
  });

  const [corporateSearchInput, setCorporateSearchInput] = useState('');
  const [corporateSubmittedSearch, setCorporateSubmittedSearch] = useState('');
  const [corporateCurrentPage, setCorporateCurrentPage] = useState(initialCorporateAccountData?.pagination?.page || 1);
  const [corporateData, setCorporateData] = useState<CorporateAccountRegisterResponse | null>(
    initialCorporateAccountData ?? null,
  );
  const [corporateError, setCorporateError] = useState<string | null>(null);
  const [isCorporateLoading, setIsCorporateLoading] = useState(!initialCorporateAccountData);
  const [appliedCorporateFilters, setAppliedCorporateFilters] = useState<CorporateAccountFilterState>({
    statuses: [],
  });

  const [coverageData, setCoverageData] = useState<CoverageLinkRegisterResponse | null>(null);
  const [isCoverageLoading, setIsCoverageLoading] = useState(false);
  const [coverageError, setCoverageError] = useState<string | null>(null);
  const [coverageCurrentPage, setCoverageCurrentPage] = useState(1);
  const [coverageFilters, setCoverageFilters] = useState<string[]>([]);
  const COVERAGE_PAGE_SIZE = 10;

  const coverageFilteredRows = useMemo(() => {
    const allRows = coverageData?.section.table.rows ?? [];
    if (coverageFilters.length === 0) return allRows;
    return allRows.filter((row) => {
      const linkType = typeof row.cells[0] === 'string' ? row.cells[0] : '';
      const statusCell = row.cells[5];
      const status = typeof statusCell === 'string' ? statusCell : (statusCell && typeof statusCell === 'object' && 'text' in statusCell ? (statusCell as { text: string }).text : '');
      if (coverageFilters.includes('scholarship') && linkType === 'Scholarship Award') return true;
      if (coverageFilters.includes('corporate') && linkType === 'Corporate Billing Link') return true;
      if (coverageFilters.includes('active') && status === 'active') return true;
      return false;
    });
  }, [coverageData, coverageFilters]);

  const [customerChoices, setCustomerChoices] = useState<CustomerChoice[]>([]);

  const [isCoverageCreateModalOpen, setIsCoverageCreateModalOpen] = useState(false);
  const [coverageCreateType, setCoverageCreateType] = useState<'award' | 'billing'>('award');
  const [isCoverageCreateSubmitting, setIsCoverageCreateSubmitting] = useState(false);
  const [coverageCreateError, setCoverageCreateError] = useState<string | null>(null);
  const [billingLinkChoices, setBillingLinkChoices] = useState<CustomerChoice[]>([]);
  const [traineeChoices, setTraineeChoices] = useState<CustomerChoice[]>([]);

  const [coverageAwardForm, setCoverageAwardForm] = useState({
    enrollmentBillingLink: '',
    scholarshipSponsor: '',
    trainee: '',
    awardType: 'partial',
    awardAmount: '',
    awardPercent: '',
    traineeShareAmount: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    status: 'active',
    notes: '',
  });

  const [coverageBillingForm, setCoverageBillingForm] = useState({
    corporateAccount: '',
    enrollmentBillingLink: '',
    invoice: '',
    coverageType: 'full_company_pay',
    coveredAmount: '',
    traineeShareAmount: '',
    status: 'active',
    notes: '',
  });

  const [isCoverageEditModalOpen, setIsCoverageEditModalOpen] = useState(false);
  const [isCoverageEditLoading, setIsCoverageEditLoading] = useState(false);
  const [isCoverageEditSubmitting, setIsCoverageEditSubmitting] = useState(false);
  const [coverageEditError, setCoverageEditError] = useState<string | null>(null);
  const [editingCoverageId, setEditingCoverageId] = useState<string | null>(null);
  const [editingCoverageType, setEditingCoverageType] = useState<'award' | 'billing'>('award');
  const [coverageEditAwardForm, setCoverageEditAwardForm] = useState(coverageAwardForm);
  const [coverageEditBillingForm, setCoverageEditBillingForm] = useState(coverageBillingForm);

  const [isCoverageDeleteModalOpen, setIsCoverageDeleteModalOpen] = useState(false);
  const [deletingCoverageId, setDeletingCoverageId] = useState<string | null>(null);
  const [deletingCoverageLabel, setDeletingCoverageLabel] = useState('');
  const [isCoverageDeleteSubmitting, setIsCoverageDeleteSubmitting] = useState(false);
  const [coverageDeleteError, setCoverageDeleteError] = useState<string | null>(null);
  const [coverageDeleteBlockers, setCoverageDeleteBlockers] = useState<string[]>([]);

  const [isSponsorCreateModalOpen, setIsSponsorCreateModalOpen] = useState(false);
  const [isSponsorCreateSubmitting, setIsSponsorCreateSubmitting] = useState(false);
  const [sponsorCreateError, setSponsorCreateError] = useState<string | null>(null);
  const [sponsorCreateForm, setSponsorCreateForm] = useState<SponsorCreateFormState>(initialSponsorCreateFormState);

  const [isSponsorEditModalOpen, setIsSponsorEditModalOpen] = useState(false);
  const [isSponsorEditLoading, setIsSponsorEditLoading] = useState(false);
  const [isSponsorEditSubmitting, setIsSponsorEditSubmitting] = useState(false);
  const [sponsorEditError, setSponsorEditError] = useState<string | null>(null);
  const [editingSponsorId, setEditingSponsorId] = useState<number | string | null>(null);
  const [sponsorEditForm, setSponsorEditForm] = useState<SponsorCreateFormState>(initialSponsorCreateFormState);

  const [isSponsorDeleteModalOpen, setIsSponsorDeleteModalOpen] = useState(false);
  const [deletingSponsorId, setDeletingSponsorId] = useState<number | string | null>(null);
  const [deletingSponsorName, setDeletingSponsorName] = useState<string>('');
  const [isSponsorDeleteSubmitting, setIsSponsorDeleteSubmitting] = useState(false);
  const [sponsorDeleteError, setSponsorDeleteError] = useState<string | null>(null);
  const [sponsorDeleteBlockers, setSponsorDeleteBlockers] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | string | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorDetail | null>(null);
  const [isSponsorDetailLoading, setIsSponsorDetailLoading] = useState(false);
  const [sponsorDetailError, setSponsorDetailError] = useState<string | null>(null);

  const [isCorporateCreateModalOpen, setIsCorporateCreateModalOpen] = useState(false);
  const [isCorporateCreateSubmitting, setIsCorporateCreateSubmitting] = useState(false);
  const [corporateCreateError, setCorporateCreateError] = useState<string | null>(null);
  const [corporateCreateForm, setCorporateCreateForm] = useState<CorporateAccountCreateFormState>(
    initialCorporateAccountCreateFormState,
  );

  const [isCorporateEditModalOpen, setIsCorporateEditModalOpen] = useState(false);
  const [isCorporateEditLoading, setIsCorporateEditLoading] = useState(false);
  const [isCorporateEditSubmitting, setIsCorporateEditSubmitting] = useState(false);
  const [corporateEditError, setCorporateEditError] = useState<string | null>(null);
  const [editingCorporateId, setEditingCorporateId] = useState<number | string | null>(null);
  const [corporateEditForm, setCorporateEditForm] = useState<CorporateAccountCreateFormState>(
    initialCorporateAccountCreateFormState,
  );

  const [isCorporateDeleteModalOpen, setIsCorporateDeleteModalOpen] = useState(false);
  const [deletingCorporateId, setDeletingCorporateId] = useState<number | string | null>(null);
  const [deletingCorporateName, setDeletingCorporateName] = useState<string>('');
  const [isCorporateDeleteSubmitting, setIsCorporateDeleteSubmitting] = useState(false);
  const [corporateDeleteError, setCorporateDeleteError] = useState<string | null>(null);
  const [corporateDeleteBlockers, setCorporateDeleteBlockers] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCorporateId, setSelectedCorporateId] = useState<number | string | null>(null);
  const [selectedCorporate, setSelectedCorporate] = useState<CorporateAccountDetail | null>(null);
  const [isCorporateDetailLoading, setIsCorporateDetailLoading] = useState(false);
  const [corporateDetailError, setCorporateDetailError] = useState<string | null>(null);

  const fetchSponsorRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
    }: {
      search: string;
      page: number;
      activeFilters: SponsorFilterState;
    }) => {
      setIsSponsorLoading(true);
      setSponsorError(null);

      try {
      const payload = await getSponsorRegister({
        search,
        page,
        statuses: activeFilters.statuses,
        contactFilter: activeFilters.contactFilter,
      });
        setSponsorData(payload);
        setSponsorCurrentPage(payload.pagination.page);
      } catch (error) {
        setSponsorError(error instanceof Error ? error.message : 'Unable to load sponsor register.');
      } finally {
        setIsSponsorLoading(false);
      }
    },
    [],
  );

  const fetchCorporateAccountRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
    }: {
      search: string;
      page: number;
      activeFilters: CorporateAccountFilterState;
    }) => {
      setIsCorporateLoading(true);
      setCorporateError(null);

      try {
      const payload = await getCorporateAccountRegister({
        search,
        page,
        statuses: activeFilters.statuses,
        creditFilter: activeFilters.creditFilter,
      });
        setCorporateData(payload);
        setCorporateCurrentPage(payload.pagination.page);
      } catch (error) {
        setCorporateError(error instanceof Error ? error.message : 'Unable to load corporate account register.');
      } finally {
        setIsCorporateLoading(false);
      }
    },
    [],
  );

  const fetchCoverageData = useCallback(async () => {
    setIsCoverageLoading(true);
    setCoverageError(null);

    try {
      const payload = await getCoverageLinkRegister();
      setCoverageData(payload);
      setCoverageCurrentPage(1);
    } catch (error) {
      setCoverageError(error instanceof Error ? error.message : 'Unable to load coverage links.');
    } finally {
      setIsCoverageLoading(false);
    }
  }, []);

  const handleCreateCoverageAward = useCallback(async () => {
    setIsCoverageCreateSubmitting(true);
    setCoverageCreateError(null);
    try {
      const payload: CreateScholarshipAwardInput = {
        enrollmentBillingLink: Number(coverageAwardForm.enrollmentBillingLink) || coverageAwardForm.enrollmentBillingLink,
        scholarshipSponsor: Number(coverageAwardForm.scholarshipSponsor) || coverageAwardForm.scholarshipSponsor,
        trainee: Number(coverageAwardForm.trainee) || coverageAwardForm.trainee,
        awardType: coverageAwardForm.awardType,
        awardAmount: coverageAwardForm.awardAmount ? Number(coverageAwardForm.awardAmount) : null,
        awardPercent: coverageAwardForm.awardPercent ? Number(coverageAwardForm.awardPercent) : null,
        traineeShareAmount: coverageAwardForm.traineeShareAmount ? Number(coverageAwardForm.traineeShareAmount) : null,
        effectiveDate: coverageAwardForm.effectiveDate,
        status: coverageAwardForm.status,
        notes: coverageAwardForm.notes || null,
      };
      await createScholarshipAward(payload);
      setIsCoverageCreateModalOpen(false);
      fetchCoverageData();
    } catch (error) {
      setCoverageCreateError(error instanceof Error ? error.message : 'Failed to create award.');
    } finally {
      setIsCoverageCreateSubmitting(false);
    }
  }, [coverageAwardForm, fetchCoverageData]);

  const handleCreateCoverageBilling = useCallback(async () => {
    setIsCoverageCreateSubmitting(true);
    setCoverageCreateError(null);
    try {
      const payload: CreateCorporateBillingLinkInput = {
        corporateAccount: Number(coverageBillingForm.corporateAccount) || coverageBillingForm.corporateAccount,
        enrollmentBillingLink: Number(coverageBillingForm.enrollmentBillingLink) || coverageBillingForm.enrollmentBillingLink,
        invoice: coverageBillingForm.invoice ? Number(coverageBillingForm.invoice) || coverageBillingForm.invoice : null,
        coverageType: coverageBillingForm.coverageType,
        coveredAmount: coverageBillingForm.coveredAmount ? Number(coverageBillingForm.coveredAmount) : null,
        traineeShareAmount: coverageBillingForm.traineeShareAmount ? Number(coverageBillingForm.traineeShareAmount) : null,
        status: coverageBillingForm.status,
        notes: coverageBillingForm.notes || null,
      };
      await createCorporateBillingLink(payload);
      setIsCoverageCreateModalOpen(false);
      fetchCoverageData();
    } catch (error) {
      setCoverageCreateError(error instanceof Error ? error.message : 'Failed to create billing link.');
    } finally {
      setIsCoverageCreateSubmitting(false);
    }
  }, [coverageBillingForm, fetchCoverageData]);

  const handleOpenCoverageEdit = useCallback(async (rowId: string) => {
    setEditingCoverageId(rowId);
    setIsCoverageEditLoading(true);
    setCoverageEditError(null);
    const isAward = rowId.startsWith('scholarship-');
    const actualId = rowId.replace(/^(scholarship|corporate)-/, '');
    setEditingCoverageType(isAward ? 'award' : 'billing');
    try {
      if (isAward) {
        const detail = await getScholarshipAwardDetail(actualId);
        setCoverageEditAwardForm({
          enrollmentBillingLink: String(detail.enrollmentBillingLink || ''),
          scholarshipSponsor: String(detail.scholarshipSponsor || ''),
          trainee: String(detail.trainee || ''),
          awardType: String(detail.awardType || 'partial'),
          awardAmount: String(detail.awardAmount ?? ''),
          awardPercent: String(detail.awardPercent ?? ''),
          traineeShareAmount: String(detail.traineeShareAmount ?? ''),
          effectiveDate: detail.effectiveDate ? String(detail.effectiveDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: String(detail.status || 'active'),
          notes: String(detail.notes || ''),
        });
      } else {
        const detail = await getCorporateBillingLinkDetail(actualId);
        setCoverageEditBillingForm({
          corporateAccount: String(detail.corporateAccount || ''),
          enrollmentBillingLink: String(detail.enrollmentBillingLink || ''),
          invoice: String(detail.invoice || ''),
          coverageType: String(detail.coverageType || 'full_company_pay'),
          coveredAmount: String(detail.coveredAmount ?? ''),
          traineeShareAmount: String(detail.traineeShareAmount ?? ''),
          status: String(detail.status || 'active'),
          notes: String(detail.notes || ''),
        });
      }
      setIsCoverageEditModalOpen(true);
    } catch (error) {
      setCoverageEditError(error instanceof Error ? error.message : 'Failed to load detail.');
    } finally {
      setIsCoverageEditLoading(false);
    }
  }, []);

  const handleUpdateCoverage = useCallback(async () => {
    if (!editingCoverageId) return;
    setIsCoverageEditSubmitting(true);
    setCoverageEditError(null);
    const actualId = editingCoverageId.replace(/^(scholarship|corporate)-/, '');
    try {
      if (editingCoverageType === 'award') {
        const payload: Record<string, unknown> = {};
        if (coverageEditAwardForm.enrollmentBillingLink) payload.enrollmentBillingLink = Number(coverageEditAwardForm.enrollmentBillingLink) || coverageEditAwardForm.enrollmentBillingLink;
        if (coverageEditAwardForm.scholarshipSponsor) payload.scholarshipSponsor = Number(coverageEditAwardForm.scholarshipSponsor) || coverageEditAwardForm.scholarshipSponsor;
        if (coverageEditAwardForm.trainee) payload.trainee = Number(coverageEditAwardForm.trainee) || coverageEditAwardForm.trainee;
        payload.awardType = coverageEditAwardForm.awardType;
        payload.awardAmount = coverageEditAwardForm.awardAmount ? Number(coverageEditAwardForm.awardAmount) : null;
        payload.awardPercent = coverageEditAwardForm.awardPercent ? Number(coverageEditAwardForm.awardPercent) : null;
        payload.traineeShareAmount = coverageEditAwardForm.traineeShareAmount ? Number(coverageEditAwardForm.traineeShareAmount) : null;
        payload.effectiveDate = coverageEditAwardForm.effectiveDate;
        payload.status = coverageEditAwardForm.status;
        payload.notes = coverageEditAwardForm.notes || null;
        await updateScholarshipAward(actualId, payload);
      } else {
        const payload: Record<string, unknown> = {};
        if (coverageEditBillingForm.corporateAccount) payload.corporateAccount = Number(coverageEditBillingForm.corporateAccount) || coverageEditBillingForm.corporateAccount;
        if (coverageEditBillingForm.enrollmentBillingLink) payload.enrollmentBillingLink = Number(coverageEditBillingForm.enrollmentBillingLink) || coverageEditBillingForm.enrollmentBillingLink;
        payload.invoice = coverageEditBillingForm.invoice ? Number(coverageEditBillingForm.invoice) || coverageEditBillingForm.invoice : null;
        payload.coverageType = coverageEditBillingForm.coverageType;
        payload.coveredAmount = coverageEditBillingForm.coveredAmount ? Number(coverageEditBillingForm.coveredAmount) : null;
        payload.traineeShareAmount = coverageEditBillingForm.traineeShareAmount ? Number(coverageEditBillingForm.traineeShareAmount) : null;
        payload.status = coverageEditBillingForm.status;
        payload.notes = coverageEditBillingForm.notes || null;
        await updateCorporateBillingLink(actualId, payload);
      }
      setIsCoverageEditModalOpen(false);
      setEditingCoverageId(null);
      fetchCoverageData();
    } catch (error) {
      setCoverageEditError(error instanceof Error ? error.message : 'Failed to update.');
    } finally {
      setIsCoverageEditSubmitting(false);
    }
  }, [editingCoverageId, editingCoverageType, coverageEditAwardForm, coverageEditBillingForm, fetchCoverageData]);

  const handleOpenCoverageDelete = useCallback((rowId: string, label: string) => {
    setDeletingCoverageId(rowId);
    setDeletingCoverageLabel(label);
    setCoverageDeleteError(null);
    setCoverageDeleteBlockers([]);
    setIsCoverageDeleteSubmitting(false);
    setIsCoverageDeleteModalOpen(true);

    // Coverage items are leaf records (nothing references them), so blockers always empty.
    // Pattern preserved for consistency with sponsor/corporate delete dialogs.
    setCoverageDeleteBlockers([]);
  }, []);

  const handleCloseCoverageDeleteModal = useCallback(() => {
    setIsCoverageDeleteModalOpen(false);
    setDeletingCoverageId(null);
    setDeletingCoverageLabel('');
    setCoverageDeleteError(null);
    setCoverageDeleteBlockers([]);
    setIsCoverageDeleteSubmitting(false);
  }, []);

  const handleConfirmCoverageDelete = useCallback(async () => {
    if (!deletingCoverageId) return;
    setIsCoverageDeleteSubmitting(true);
    setCoverageDeleteError(null);
    const isAward = deletingCoverageId.startsWith('scholarship-');
    const actualId = deletingCoverageId.replace(/^(scholarship|corporate)-/, '');
    try {
      if (isAward) {
        await deleteScholarshipAward(actualId);
      } else {
        await deleteCorporateBillingLink(actualId);
      }
      handleCloseCoverageDeleteModal();
      fetchCoverageData();
    } catch (error) {
      setCoverageDeleteError(error instanceof Error ? error.message : 'Failed to delete.');
    } finally {
      setIsCoverageDeleteSubmitting(false);
    }
  }, [deletingCoverageId, fetchCoverageData]);

  function escapeCsvValue(value: string | number | null | undefined) {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const handleExportSponsors = useCallback(() => {
    const rows = sponsorData?.section.table.rows ?? [];
    if (!rows.length) {
      return;
    }
    const csvRows = [
      ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'],
      ...rows.map((row: SponsorRegisterRow) => [
        row.sponsorCode,
        row.name,
        row.defaultCustomer != null ? `Customer #${row.defaultCustomer}` : '',
        row.contactName,
        row.email,
        row.statusLabel || row.status || '',
      ]),
    ];
    const csvContent = csvRows.map((r) => r.map((v) => escapeCsvValue(v)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholarship-sponsor-register.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sponsorData]);

  const handleExportCorporateAccounts = useCallback(() => {
    const rows = corporateData?.section.table.rows ?? [];
    if (!rows.length) {
      return;
    }
    const csvRows = [
      ['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status'],
      ...rows.map((row: CorporateAccountRegisterRow) => [
        row.accountCode,
        row.name,
        row.customer != null ? `Customer #${row.customer}` : '',
        row.billingContact,
        row.paymentTerms || row.creditTerms || '',
        row.statusLabel || row.status || '',
      ]),
    ];
    const csvContent = csvRows.map((r) => r.map((v) => escapeCsvValue(v)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corporate-account-register.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [corporateData]);

  const handleExportCoverage = useCallback(() => {
    const rows = coverageFilteredRows;
    if (!rows.length) {
      return;
    }
    const csvRows = [
      ['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status'],
      ...rows.map((row) => {
        const cell0 = typeof row.cells[0] === 'string' ? row.cells[0] : row.cells[0]?.text || '';
        const cell1 = typeof row.cells[1] === 'string' ? row.cells[1] : row.cells[1]?.text || '';
        const cell2 = typeof row.cells[2] === 'string' ? row.cells[2] : row.cells[2]?.text || '';
        const cell3 = typeof row.cells[3] === 'string' ? row.cells[3] : row.cells[3]?.text || '';
        const cell4 = typeof row.cells[4] === 'string' ? row.cells[4] : row.cells[4]?.text || '';
        const cell5 = typeof row.cells[5] === 'string' ? row.cells[5] : row.cells[5]?.text || '';
        return [cell0, cell1, cell2, cell3, cell4, cell5];
      }),
    ];
    const csvContent = csvRows.map((r) => r.map((v) => escapeCsvValue(v)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coverage-link-register.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [coverageData]);

  useEffect(() => {
    if (activeTab === TAB_IDS.COVERAGE_LINKS && !coverageData && !isCoverageLoading) {
      fetchCoverageData();
    }
  }, [activeTab, coverageData, fetchCoverageData, isCoverageLoading]);

  useEffect(() => {
    if (!sponsorData && activeTab === TAB_IDS.SCHOLARSHIP_SPONSORS && !isSponsorLoading) {
      fetchSponsorRegister({ search: '', page: 1, activeFilters: { statuses: [] } });
    }
  }, [sponsorData, activeTab, fetchSponsorRegister, isSponsorLoading]);

  useEffect(() => {
    getCustomerChoices().then(setCustomerChoices).catch(() => {});
    getEnrollmentBillingLinkChoices().then(setBillingLinkChoices).catch(() => {});
    getTraineeChoices().then(setTraineeChoices).catch(() => {});
  }, []);

  useEffect(() => {
    if (!corporateData && activeTab === TAB_IDS.CORPORATE_ACCOUNTS && !isCorporateLoading) {
      fetchCorporateAccountRegister({ search: '', page: 1, activeFilters: { statuses: [] } });
    }
  }, [corporateData, activeTab, fetchCorporateAccountRegister, isCorporateLoading]);

  const handleSponsorSearch = useCallback(() => {
    setSponsorSubmittedSearch(sponsorSearchInput);
    fetchSponsorRegister({
      search: sponsorSearchInput,
      page: 1,
      activeFilters: appliedSponsorFilters,
    });
  }, [sponsorSearchInput, fetchSponsorRegister, appliedSponsorFilters]);

  const handleCorporateSearch = useCallback(() => {
    setCorporateSubmittedSearch(corporateSearchInput);
    fetchCorporateAccountRegister({
      search: corporateSearchInput,
      page: 1,
      activeFilters: appliedCorporateFilters,
    });
  }, [corporateSearchInput, fetchCorporateAccountRegister, appliedCorporateFilters]);

  const handleOpenSponsorCreateModal = useCallback(() => {
    setSponsorCreateForm(initialSponsorCreateFormState);
    setSponsorCreateError(null);
    setIsSponsorCreateSubmitting(false);
    setIsSponsorCreateModalOpen(true);
  }, []);

  const handleCloseSponsorCreateModal = useCallback(() => {
    setIsSponsorCreateModalOpen(false);
    setIsSponsorCreateSubmitting(false);
    setSponsorCreateError(null);
    setSponsorCreateForm(initialSponsorCreateFormState);
  }, []);

  const handleCreateSponsor = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSponsorCreateError(null);
      setIsSponsorCreateSubmitting(true);

      try {
        const payload: CreateSponsorInput = {
          sponsorCode: sponsorCreateForm.sponsorCode,
          name: sponsorCreateForm.name,
          contactName: sponsorCreateForm.contactName || null,
          email: sponsorCreateForm.email || null,
          phone: sponsorCreateForm.phone || null,
          billingAddress: sponsorCreateForm.billingAddress || null,
          defaultCustomer: sponsorCreateForm.defaultCustomer
            ? Number(sponsorCreateForm.defaultCustomer) || sponsorCreateForm.defaultCustomer
            : null,
          status: sponsorCreateForm.status,
          notes: sponsorCreateForm.notes || null,
        };

        await createSponsor(payload);
        handleCloseSponsorCreateModal();
        await fetchSponsorRegister({
          search: sponsorSubmittedSearch,
          page: sponsorCurrentPage,
          activeFilters: appliedSponsorFilters,
        });
      } catch (error) {
        setSponsorCreateError(error instanceof Error ? error.message : 'Unable to create sponsor.');
        setIsSponsorCreateSubmitting(false);
      }
    },
    [sponsorCreateForm, handleCloseSponsorCreateModal, fetchSponsorRegister, sponsorSubmittedSearch, sponsorCurrentPage, appliedSponsorFilters],
  );

  const handleOpenSponsorEditModal = useCallback(async (sponsorId: number | string) => {
    setEditingSponsorId(sponsorId);
    setSponsorEditForm(initialSponsorCreateFormState);
    setSponsorEditError(null);
    setIsSponsorEditSubmitting(false);
    setIsSponsorEditLoading(true);
    setIsSponsorEditModalOpen(true);

    try {
      const payload = await getSponsorDetail(sponsorId);
      setSponsorEditForm(mapSponsorDetailToFormState(payload));
    } catch (error) {
      setSponsorEditError(error instanceof Error ? error.message : 'Unable to load sponsor for editing.');
    } finally {
      setIsSponsorEditLoading(false);
    }
  }, []);

  const handleCloseSponsorEditModal = useCallback(() => {
    setIsSponsorEditModalOpen(false);
    setIsSponsorEditLoading(false);
    setIsSponsorEditSubmitting(false);
    setSponsorEditError(null);
    setEditingSponsorId(null);
    setSponsorEditForm(initialSponsorCreateFormState);
  }, []);

  const handleEditSponsor = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (editingSponsorId === null) {
        setSponsorEditError('No sponsor selected for editing.');
        return;
      }

      setSponsorEditError(null);
      setIsSponsorEditSubmitting(true);

      try {
        const payload: UpdateSponsorInput = {
          sponsorCode: sponsorEditForm.sponsorCode,
          name: sponsorEditForm.name,
          contactName: sponsorEditForm.contactName || null,
          email: sponsorEditForm.email || null,
          phone: sponsorEditForm.phone || null,
          billingAddress: sponsorEditForm.billingAddress || null,
          defaultCustomer: sponsorEditForm.defaultCustomer
            ? Number(sponsorEditForm.defaultCustomer) || sponsorEditForm.defaultCustomer
            : null,
          status: sponsorEditForm.status,
          notes: sponsorEditForm.notes || null,
        };

        await updateSponsor(editingSponsorId, payload);
        handleCloseSponsorEditModal();
        await fetchSponsorRegister({
          search: sponsorSubmittedSearch,
          page: sponsorCurrentPage,
          activeFilters: appliedSponsorFilters,
        });
      } catch (error) {
        setSponsorEditError(error instanceof Error ? error.message : 'Unable to update sponsor.');
        setIsSponsorEditSubmitting(false);
      }
    },
    [editingSponsorId, sponsorEditForm, handleCloseSponsorEditModal, fetchSponsorRegister, sponsorSubmittedSearch, sponsorCurrentPage, appliedSponsorFilters],
  );

  const handleViewSponsor = useCallback(async (sponsorId: number | string) => {
    setSelectedCorporateId(null);
    setSelectedCorporate(null);
    setCorporateDetailError(null);
    setIsSponsorDetailLoading(true);
    setSponsorDetailError(null);

    try {
      const detail = await getSponsorDetail(sponsorId);
      setSelectedSponsor(detail);
      setSelectedSponsorId(sponsorId);
    } catch (error) {
      setSponsorDetailError(error instanceof Error ? error.message : 'Unable to load sponsor detail.');
    } finally {
      setIsSponsorDetailLoading(false);
    }
  }, []);

  const closeSponsorDetailModal = useCallback(() => {
    setSelectedSponsorId(null);
    setSelectedSponsor(null);
    setSponsorDetailError(null);
  }, []);

  const handleOpenSponsorDeleteModal = useCallback(
    async (sponsorId: number | string, sponsorName: string) => {
      setDeletingSponsorId(sponsorId);
      setDeletingSponsorName(sponsorName);
      setSponsorDeleteError(null);
      setSponsorDeleteBlockers([]);
      setIsSponsorDeleteSubmitting(false);
      setIsSponsorDeleteModalOpen(true);

      try {
        const detail = await getSponsorDetail(sponsorId);
        const blockers: string[] = [];
        const summary = detail.usageSummary;

        if (summary) {
          if (summary.scholarshipAwardCount > 0) {
            blockers.push(`Referenced by ${summary.scholarshipAwardCount} scholarship award(s)`);
          }
        }

        setSponsorDeleteBlockers(blockers);
      } catch (error) {
        setSponsorDeleteError(error instanceof Error ? error.message : 'Unable to check sponsor dependencies.');
      } finally {
        setIsSponsorDeleteSubmitting(false);
      }
    },
    [],
  );

  const handleCloseSponsorDeleteModal = useCallback(() => {
    setIsSponsorDeleteModalOpen(false);
    setDeletingSponsorId(null);
    setDeletingSponsorName('');
    setSponsorDeleteError(null);
    setSponsorDeleteBlockers([]);
    setIsSponsorDeleteSubmitting(false);
  }, []);

  const handleConfirmSponsorDelete = useCallback(async () => {
    if (deletingSponsorId === null) return;

    setIsSponsorDeleteSubmitting(true);
    setSponsorDeleteError(null);

    try {
      await deleteSponsor(deletingSponsorId);
      handleCloseSponsorDeleteModal();
      await fetchSponsorRegister({
        search: sponsorSubmittedSearch,
        page: sponsorCurrentPage,
        activeFilters: appliedSponsorFilters,
      });
    } catch (error) {
      setSponsorDeleteError(error instanceof Error ? error.message : 'Unable to delete sponsor.');
      setIsSponsorDeleteSubmitting(false);
    }
  }, [deletingSponsorId, handleCloseSponsorDeleteModal, fetchSponsorRegister, sponsorSubmittedSearch, sponsorCurrentPage, appliedSponsorFilters]);

  const handleOpenCorporateCreateModal = useCallback(() => {
    setCorporateCreateForm(initialCorporateAccountCreateFormState);
    setCorporateCreateError(null);
    setIsCorporateCreateSubmitting(false);
    setIsCorporateCreateModalOpen(true);
  }, []);

  const handleCloseCorporateCreateModal = useCallback(() => {
    setIsCorporateCreateModalOpen(false);
    setIsCorporateCreateSubmitting(false);
    setCorporateCreateError(null);
    setCorporateCreateForm(initialCorporateAccountCreateFormState);
  }, []);

  const handleCreateCorporate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCorporateCreateError(null);
      setIsCorporateCreateSubmitting(true);

      try {
        const payload: CreateCorporateAccountInput = {
          accountCode: corporateCreateForm.accountCode,
          name: corporateCreateForm.name,
          customer: Number(corporateCreateForm.customer) || corporateCreateForm.customer,
          billingContact: corporateCreateForm.billingContact || null,
          email: corporateCreateForm.email || null,
          phone: corporateCreateForm.phone || null,
          creditTerms: corporateCreateForm.creditTerms || null,
          paymentTerms: corporateCreateForm.paymentTerms || null,
          status: corporateCreateForm.status,
          notes: corporateCreateForm.notes || null,
        };

        await createCorporateAccount(payload);
        handleCloseCorporateCreateModal();
        await fetchCorporateAccountRegister({
          search: corporateSubmittedSearch,
          page: corporateCurrentPage,
          activeFilters: appliedCorporateFilters,
        });
      } catch (error) {
        setCorporateCreateError(error instanceof Error ? error.message : 'Unable to create corporate account.');
        setIsCorporateCreateSubmitting(false);
      }
    },
    [corporateCreateForm, handleCloseCorporateCreateModal, fetchCorporateAccountRegister, corporateSubmittedSearch, corporateCurrentPage, appliedCorporateFilters],
  );

  const handleOpenCorporateEditModal = useCallback(async (accountId: number | string) => {
    setEditingCorporateId(accountId);
    setCorporateEditForm(initialCorporateAccountCreateFormState);
    setCorporateEditError(null);
    setIsCorporateEditSubmitting(false);
    setIsCorporateEditLoading(true);
    setIsCorporateEditModalOpen(true);

    try {
      const payload = await getCorporateAccountDetail(accountId);
      setCorporateEditForm(mapCorporateAccountDetailToFormState(payload));
    } catch (error) {
      setCorporateEditError(error instanceof Error ? error.message : 'Unable to load corporate account for editing.');
    } finally {
      setIsCorporateEditLoading(false);
    }
  }, []);

  const handleCloseCorporateEditModal = useCallback(() => {
    setIsCorporateEditModalOpen(false);
    setIsCorporateEditLoading(false);
    setIsCorporateEditSubmitting(false);
    setCorporateEditError(null);
    setEditingCorporateId(null);
    setCorporateEditForm(initialCorporateAccountCreateFormState);
  }, []);

  const handleEditCorporate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (editingCorporateId === null) {
        setCorporateEditError('No corporate account selected for editing.');
        return;
      }

      setCorporateEditError(null);
      setIsCorporateEditSubmitting(true);

      try {
        const payload: UpdateCorporateAccountInput = {
          accountCode: corporateEditForm.accountCode,
          name: corporateEditForm.name,
          customer: corporateEditForm.customer ? Number(corporateEditForm.customer) || corporateEditForm.customer : undefined,
          billingContact: corporateEditForm.billingContact || null,
          email: corporateEditForm.email || null,
          phone: corporateEditForm.phone || null,
          creditTerms: corporateEditForm.creditTerms || null,
          paymentTerms: corporateEditForm.paymentTerms || null,
          status: corporateEditForm.status,
          notes: corporateEditForm.notes || null,
        };

        await updateCorporateAccount(editingCorporateId, payload);
        handleCloseCorporateEditModal();
        await fetchCorporateAccountRegister({
          search: corporateSubmittedSearch,
          page: corporateCurrentPage,
          activeFilters: appliedCorporateFilters,
        });
      } catch (error) {
        setCorporateEditError(error instanceof Error ? error.message : 'Unable to update corporate account.');
        setIsCorporateEditSubmitting(false);
      }
    },
    [editingCorporateId, corporateEditForm, handleCloseCorporateEditModal, fetchCorporateAccountRegister, corporateSubmittedSearch, corporateCurrentPage, appliedCorporateFilters],
  );

  const handleViewCorporate = useCallback(async (accountId: number | string) => {
    setSelectedSponsorId(null);
    setSelectedSponsor(null);
    setSponsorDetailError(null);
    setIsCorporateDetailLoading(true);
    setCorporateDetailError(null);

    try {
      const detail = await getCorporateAccountDetail(accountId);
      setSelectedCorporate(detail);
      setSelectedCorporateId(accountId);
    } catch (error) {
      setCorporateDetailError(error instanceof Error ? error.message : 'Unable to load corporate account detail.');
    } finally {
      setIsCorporateDetailLoading(false);
    }
  }, []);

  const closeCorporateDetailModal = useCallback(() => {
    setSelectedCorporateId(null);
    setSelectedCorporate(null);
    setCorporateDetailError(null);
  }, []);

  const handleOpenCorporateDeleteModal = useCallback(
    async (accountId: number | string, accountName: string) => {
      setDeletingCorporateId(accountId);
      setDeletingCorporateName(accountName);
      setCorporateDeleteError(null);
      setCorporateDeleteBlockers([]);
      setIsCorporateDeleteSubmitting(false);
      setIsCorporateDeleteModalOpen(true);

      try {
        const detail = await getCorporateAccountDetail(accountId);
        const blockers: string[] = [];
        const summary = detail.usageSummary;

        if (summary) {
          if (summary.corporateBillingLinkCount > 0) {
            blockers.push(`Referenced by ${summary.corporateBillingLinkCount} corporate billing link(s)`);
          }
        }

        setCorporateDeleteBlockers(blockers);
      } catch (error) {
        setCorporateDeleteError(error instanceof Error ? error.message : 'Unable to check corporate account dependencies.');
      } finally {
        setIsCorporateDeleteSubmitting(false);
      }
    },
    [],
  );

  const handleCloseCorporateDeleteModal = useCallback(() => {
    setIsCorporateDeleteModalOpen(false);
    setDeletingCorporateId(null);
    setDeletingCorporateName('');
    setCorporateDeleteError(null);
    setCorporateDeleteBlockers([]);
    setIsCorporateDeleteSubmitting(false);
  }, []);

  const handleConfirmCorporateDelete = useCallback(async () => {
    if (deletingCorporateId === null) return;

    setIsCorporateDeleteSubmitting(true);
    setCorporateDeleteError(null);

    try {
      await deleteCorporateAccount(deletingCorporateId);
      handleCloseCorporateDeleteModal();
      await fetchCorporateAccountRegister({
        search: corporateSubmittedSearch,
        page: corporateCurrentPage,
        activeFilters: appliedCorporateFilters,
      });
    } catch (error) {
      setCorporateDeleteError(error instanceof Error ? error.message : 'Unable to delete corporate account.');
      setIsCorporateDeleteSubmitting(false);
    }
  }, [deletingCorporateId, handleCloseCorporateDeleteModal, fetchCorporateAccountRegister, corporateSubmittedSearch, corporateCurrentPage, appliedCorporateFilters]);

  const handleSponsorFilterToggle = useCallback(
    (filterValue: string) => {
      const newFilters = { ...appliedSponsorFilters };
      if (filterValue === 'hasContact') {
        newFilters.contactFilter = appliedSponsorFilters.contactFilter === 'hasContact' ? '' : 'hasContact';
      } else {
        const index = newFilters.statuses.indexOf(filterValue);
        if (index >= 0) {
          newFilters.statuses = [...newFilters.statuses.filter((s) => s !== filterValue)];
        } else {
          newFilters.statuses = [...newFilters.statuses, filterValue];
        }
      }
      setAppliedSponsorFilters(newFilters);
      fetchSponsorRegister({ search: sponsorSubmittedSearch, page: 1, activeFilters: newFilters });
    },
    [appliedSponsorFilters, fetchSponsorRegister, sponsorSubmittedSearch],
  );

  const handleCorporateFilterToggle = useCallback(
    (filterValue: string) => {
      const newFilters = { ...appliedCorporateFilters };
      if (filterValue === 'hasCredit') {
        newFilters.creditFilter = appliedCorporateFilters.creditFilter === 'hasCredit' ? '' : 'hasCredit';
      } else {
        const index = newFilters.statuses.indexOf(filterValue);
        if (index >= 0) {
          newFilters.statuses = [...newFilters.statuses.filter((s) => s !== filterValue)];
        } else {
          newFilters.statuses = [...newFilters.statuses, filterValue];
        }
      }
      setAppliedCorporateFilters(newFilters);
      fetchCorporateAccountRegister({ search: corporateSubmittedSearch, page: 1, activeFilters: newFilters });
    },
    [appliedCorporateFilters, fetchCorporateAccountRegister, corporateSubmittedSearch],
  );

  const handleCoverageFilterToggle = (filterValue: string) => {
    setCoverageFilters((prev) => {
      const index = prev.indexOf(filterValue);
      return index >= 0 ? prev.filter((v) => v !== filterValue) : [...prev, filterValue];
    });
    setCoverageCurrentPage(1);
  };

  const renderSponsorTable = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Scholarship Sponsors</h2>
          <p className="mt-1 text-sm text-gray-600">
            Maintain sponsor master records mapped to accounting customers with contact and status information.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenSponsorCreateModal}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Sponsor
          </button>
          <button
            type="button"
            onClick={() =>
              fetchSponsorRegister({
                search: sponsorSubmittedSearch,
                page: 1,
                activeFilters: appliedSponsorFilters,
              })
            }
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {sponsorData?.section.metrics ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {sponsorData.section.metrics.map((metric) => {
            const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
            const toneClass =
              metric.trend === 'down'
                ? 'text-red-600 bg-red-50'
                : metric.trend === 'neutral'
                  ? 'text-gray-600 bg-gray-100'
                  : 'text-green-600 bg-green-50';
            return (
              <div key={`sponsor-metric-${metric.label}`} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
                    {metric.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sponsor code, name, default customer, contact, or status"
                value={sponsorSearchInput}
                onChange={(e) => setSponsorSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSponsorSearch();
                }}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
      {(sponsorData?.section.filters ?? []).map((filter) => {
        const isActive = filter.value === 'hasContact'
          ? appliedSponsorFilters.contactFilter === 'hasContact'
          : appliedSponsorFilters.statuses.includes(filter.value);
        return (
                <button
                  key={`sponsor-filter-${filter.value}`}
                  type="button"
                  onClick={() => handleSponsorFilterToggle(filter.value)}
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

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {sponsorData?.section.table.title || 'Scholarship Sponsor Register'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {sponsorData?.section.table.description || 'Sponsor records using sponsor code, name, default customer relationship, and status.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{sponsorData?.totals?.filteredSponsors ?? sponsorData?.pagination.totalDocs ?? 0} matching sponsors</span>
              <button
                type="button"
                onClick={handleExportSponsors}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!sponsorData?.section.table.rows.length}
              >
                <Download className="h-4 w-4" />
                Export View
              </button>
            </div>
          </div>

          {sponsorError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{sponsorError}</div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {(sponsorData?.section.table.columns ?? ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status']).map(
                      (column) => (
                        <th
                          key={`sponsor-col-${column}`}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {column}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isSponsorLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        Loading sponsors...
                      </td>
                    </tr>
                  ) : sponsorData?.section.table.rows.length ? (
                    sponsorData.section.table.rows.map((row: SponsorRegisterRow) => (
                      <tr key={String(row.id)} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                          {row.sponsorCode || '-'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.name || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {row.defaultCustomer ? `Customer #${row.defaultCustomer}` : '-'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.contactName || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.email || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                              row.status === 'active'
                                ? 'bg-green-50 text-green-700 ring-green-200'
                                : 'bg-amber-50 text-amber-700 ring-amber-200'
                            }`}
                          >
                            {row.statusLabel || row.status || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void handleOpenSponsorEditModal(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleOpenSponsorDeleteModal(row.id, row.name || `Sponsor #${row.id}`)
                              }
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleViewSponsor(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        No sponsors match the current search and filter combination.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {sponsorData?.pagination ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {sponsorData.pagination.page} of {sponsorData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!sponsorData.pagination.hasPrevPage}
                  onClick={() =>
                    fetchSponsorRegister({
                      search: sponsorSubmittedSearch,
                      page: sponsorCurrentPage - 1,
                      activeFilters: appliedSponsorFilters,
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!sponsorData.pagination.hasNextPage}
                  onClick={() =>
                    fetchSponsorRegister({
                      search: sponsorSubmittedSearch,
                      page: sponsorCurrentPage + 1,
                      activeFilters: appliedSponsorFilters,
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderCorporateAccountTable = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Corporate Accounts</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage corporate payer accounts linked to customers with contact data, credit terms, payment terms, and status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCorporateCreateModal}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Corporate Account
          </button>
          <button
            type="button"
            onClick={() =>
              fetchCorporateAccountRegister({
                search: corporateSubmittedSearch,
                page: 1,
                activeFilters: appliedCorporateFilters,
              })
            }
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {corporateData?.section.metrics ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {corporateData.section.metrics.map((metric) => {
            const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
            const toneClass =
              metric.trend === 'down'
                ? 'text-red-600 bg-red-50'
                : metric.trend === 'neutral'
                  ? 'text-gray-600 bg-gray-100'
                  : 'text-green-600 bg-green-50';
            return (
              <div key={`corp-metric-${metric.label}`} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
                    {metric.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search account code, company name, customer, billing contact, or status"
                value={corporateSearchInput}
                onChange={(e) => setCorporateSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCorporateSearch();
                }}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
      {(corporateData?.section.filters ?? []).map((filter) => {
        const isActive = filter.value === 'hasCredit'
          ? appliedCorporateFilters.creditFilter === 'hasCredit'
          : appliedCorporateFilters.statuses.includes(filter.value);
        return (
                <button
                  key={`corp-filter-${filter.value}`}
                  type="button"
                  onClick={() => handleCorporateFilterToggle(filter.value)}
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

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {corporateData?.section.table.title || 'Corporate Account Register'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {corporateData?.section.table.description ||
                  'Corporate account records using account code, linked customer, billing contact, terms, and status.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{corporateData?.totals?.filteredAccounts ?? corporateData?.pagination.totalDocs ?? 0} matching corporate accounts</span>
              <button
                type="button"
                onClick={handleExportCorporateAccounts}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!corporateData?.section.table.rows.length}
              >
                <Download className="h-4 w-4" />
                Export View
              </button>
            </div>
          </div>

          {corporateError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{corporateError}</div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {(corporateData?.section.table.columns ?? ['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status']).map(
                      (column) => (
                        <th
                          key={`corp-col-${column}`}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {column}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isCorporateLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        Loading corporate accounts...
                      </td>
                    </tr>
                  ) : corporateData?.section.table.rows.length ? (
                    corporateData.section.table.rows.map((row: CorporateAccountRegisterRow) => (
                      <tr key={String(row.id)} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                          {row.accountCode || '-'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.name || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {row.customer ? `Customer #${row.customer}` : '-'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.billingContact || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.creditTerms || '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                              row.status === 'active'
                                ? 'bg-green-50 text-green-700 ring-green-200'
                                : 'bg-amber-50 text-amber-700 ring-amber-200'
                            }`}
                          >
                            {row.statusLabel || row.status || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void handleOpenCorporateEditModal(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleOpenCorporateDeleteModal(row.id, row.name || `Corporate Account #${row.id}`)
                              }
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleViewCorporate(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        No corporate accounts match the current search and filter combination.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {corporateData?.pagination ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {corporateData.pagination.page} of {corporateData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!corporateData.pagination.hasPrevPage}
                  onClick={() =>
                    fetchCorporateAccountRegister({
                      search: corporateSubmittedSearch,
                      page: corporateCurrentPage - 1,
                      activeFilters: appliedCorporateFilters,
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!corporateData.pagination.hasNextPage}
                  onClick={() =>
                    fetchCorporateAccountRegister({
                      search: corporateSubmittedSearch,
                      page: corporateCurrentPage + 1,
                      activeFilters: appliedCorporateFilters,
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderCoverageLinksTable = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Coverage Links</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review sponsor awards and corporate billing links that connect enrollment billing to payer entities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setCoverageCreateType('award'); setIsCoverageCreateModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            New Award
          </button>
          <button
            type="button"
            onClick={() => { setCoverageCreateType('billing'); setIsCoverageCreateModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            New Billing Link
          </button>
          <button
            type="button"
            onClick={fetchCoverageData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {coverageData?.section.metrics ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {coverageData.section.metrics.map((metric) => {
            const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
            const toneClass =
              metric.trend === 'down'
                ? 'text-red-600 bg-red-50'
                : metric.trend === 'neutral'
                  ? 'text-gray-600 bg-gray-100'
                  : 'text-green-600 bg-green-50';
            return (
              <div key={`cov-metric-${metric.label}`} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
                    {metric.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Coverage quick filter chips */}
      <div className="flex flex-wrap gap-2 px-1">
        {(coverageData?.section.filters ?? []).map((filter) => {
          const isActive = coverageFilters.includes(filter.value);
          return (
            <button
              key={`cov-filter-${filter.value}`}
              type="button"
              onClick={() => handleCoverageFilterToggle(filter.value)}
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

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {coverageData?.section.table.title || 'Coverage Link Register'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {coverageData?.section.table.description ||
                  'Coverage links drawn from scholarship awards and corporate billing-link records in the backend.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{coverageFilteredRows.length} matching coverage links</span>
              <span className="text-sm text-gray-400">
                Page {coverageCurrentPage} of {Math.max(1, Math.ceil(coverageFilteredRows.length / COVERAGE_PAGE_SIZE))}
              </span>
              <button
                type="button"
                onClick={handleExportCoverage}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!coverageData?.section.table.rows.length}
              >
                <Download className="h-4 w-4" />
                Export View
              </button>
            </div>
          </div>

          {coverageError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{coverageError}</div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {(coverageData?.section.table.columns ?? ['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status']).map(
                      (column) => (
                        <th
                          key={`cov-col-${column}`}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {column}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isCoverageLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        Loading coverage links...
                      </td>
                    </tr>
                  ) : coverageData && coverageFilteredRows.length ? (
                    (() => {
                      const allRows = coverageData.section.table.rows;
                      const filteredRows = coverageFilters.length > 0
                        ? allRows.filter((row) => {
                            const linkType = typeof row.cells[0] === 'string' ? row.cells[0] : '';
                            const statusCell = row.cells[5];
                            const status = typeof statusCell === 'string' ? statusCell : (statusCell && typeof statusCell === 'object' && 'text' in statusCell ? (statusCell as { text: string }).text : '');
                            if (coverageFilters.includes('scholarship') && linkType === 'Scholarship Award') return true;
                            if (coverageFilters.includes('corporate') && linkType === 'Corporate Billing Link') return true;
                            if (coverageFilters.includes('active') && status === 'active') return true;
                            return coverageFilters.length === 0;
                          })
                        : allRows;
                      const totalPages = Math.max(1, Math.ceil(filteredRows.length / COVERAGE_PAGE_SIZE));
                      const safePage = Math.min(coverageCurrentPage, totalPages);
                      const startIdx = (safePage - 1) * COVERAGE_PAGE_SIZE;
                      const paginatedRows = filteredRows.slice(startIdx, startIdx + COVERAGE_PAGE_SIZE);
                      return paginatedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.cells.map((cell, index) => {
                          if (typeof cell === 'string') {
                            return (
                              <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {cell}
                              </td>
                            );
                          }
                          const alignClass =
                            cell.align === 'right'
                              ? 'text-right'
                              : cell.align === 'center'
                                ? 'text-center'
                                : 'text-left';
                          if (cell.tone) {
                            return (
                              <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                    cell.tone === 'green'
                                      ? 'bg-green-50 text-green-700 ring-green-200'
                                      : 'bg-amber-50 text-amber-700 ring-amber-200'
                                  }`}
                                >
                                  {cell.text}
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td
                              key={index}
                              className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}
                            >
                              {cell.text}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void handleOpenCoverageEdit(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleOpenCoverageDelete(row.id, row.entity || 'Coverage Link')}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                    })()
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        No coverage links found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {coverageFilteredRows.length ? (
            <div className="flex items-center justify-between px-5 pb-5">
              <p className="text-sm text-gray-600">
                Page {coverageCurrentPage} of {Math.max(1, Math.ceil(coverageFilteredRows.length / COVERAGE_PAGE_SIZE))}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={coverageCurrentPage <= 1}
                  onClick={() => setCoverageCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={coverageCurrentPage >= Math.ceil(coverageFilteredRows.length / COVERAGE_PAGE_SIZE)}
                  onClick={() => setCoverageCurrentPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderCoverageCreateModal = () => {
    if (!isCoverageCreateModalOpen) return null;
    const isAward = coverageCreateType === 'award';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setIsCoverageCreateModalOpen(false)}>
        <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900">New {isAward ? 'Scholarship Award' : 'Corporate Billing Link'}</h3>
          <p className="mt-1 text-sm text-gray-500">Create a new coverage record.</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {isAward ? (
              <>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Enrollment Billing Link <span className="text-red-500">*</span></label>
                  <select required value={coverageAwardForm.enrollmentBillingLink} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, enrollmentBillingLink: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select billing link</option>
                    {billingLinkChoices.map((c) => (<option key={String(c.value)} value={String(c.value)}>{c.label}</option>))}
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Scholarship Sponsor <span className="text-red-500">*</span></label>
                  <select required value={coverageAwardForm.scholarshipSponsor} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, scholarshipSponsor: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select sponsor</option>
                    {customerChoices.map((c) => (<option key={String(c.value)} value={String(c.value)}>{c.label}</option>))}
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Trainee <span className="text-red-500">*</span></label>
                  <select required value={coverageAwardForm.trainee} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, trainee: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select trainee</option>
                    {traineeChoices.map((c) => (<option key={String(c.value)} value={String(c.value)}>{c.label}</option>))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Award Type <span className="text-red-500">*</span></label>
                  <select value={coverageAwardForm.awardType} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, awardType: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="full">Full</option>
                    <option value="partial">Partial</option>
                    <option value="contra_revenue">Contra Revenue</option>
                    <option value="third_party_billed">Third Party Billed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                  <select value={coverageAwardForm.status} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, status: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Award Amount</label>
                  <input type="number" min="0" value={coverageAwardForm.awardAmount} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, awardAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Award Percent</label>
                  <input type="number" min="0" max="100" value={coverageAwardForm.awardPercent} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, awardPercent: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Trainee Share</label>
                  <input type="number" min="0" value={coverageAwardForm.traineeShareAmount} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, traineeShareAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Effective Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={coverageAwardForm.effectiveDate} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, effectiveDate: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows={3} value={coverageAwardForm.notes} onChange={(e) => setCoverageAwardForm({ ...coverageAwardForm, notes: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Corporate Account <span className="text-red-500">*</span></label>
                  <select required value={coverageBillingForm.corporateAccount} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, corporateAccount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select account</option>
                    {customerChoices.map((c) => (<option key={String(c.value)} value={String(c.value)}>{c.label}</option>))}
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Enrollment Billing Link <span className="text-red-500">*</span></label>
                  <select required value={coverageBillingForm.enrollmentBillingLink} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, enrollmentBillingLink: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select billing link</option>
                    {billingLinkChoices.map((c) => (<option key={String(c.value)} value={String(c.value)}>{c.label}</option>))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Coverage Type <span className="text-red-500">*</span></label>
                  <select value={coverageBillingForm.coverageType} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, coverageType: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="full_company_pay">Full Company Pay</option>
                    <option value="shared_pay">Shared Pay</option>
                    <option value="credit_terms">Credit Terms</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                  <select value={coverageBillingForm.status} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, status: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Covered Amount</label>
                  <input type="number" min="0" value={coverageBillingForm.coveredAmount} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, coveredAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Trainee Share</label>
                  <input type="number" min="0" value={coverageBillingForm.traineeShareAmount} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, traineeShareAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Invoice (ID)</label>
                  <input type="text" value={coverageBillingForm.invoice} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, invoice: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="e.g., 14" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows={3} value={coverageBillingForm.notes} onChange={(e) => setCoverageBillingForm({ ...coverageBillingForm, notes: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
              </>
            )}
          </div>
          {coverageCreateError ? <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{coverageCreateError}</div> : null}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCoverageCreateModalOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={isAward ? handleCreateCoverageAward : handleCreateCoverageBilling} disabled={isCoverageCreateSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isCoverageCreateSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCoverageEditModal = () => {
    if (!isCoverageEditModalOpen) return null;
    const isAward = editingCoverageType === 'award';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setIsCoverageEditModalOpen(false)}>
        <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900">Edit {isAward ? 'Scholarship Award' : 'Corporate Billing Link'}</h3>
          <p className="mt-1 text-sm text-gray-500">Update an existing coverage record.</p>
          {isCoverageEditLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {isAward ? (
                  <>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Award Type <span className="text-red-500">*</span></label>
                      <select value={coverageEditAwardForm.awardType} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, awardType: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        <option value="full">Full</option>
                        <option value="partial">Partial</option>
                        <option value="contra_revenue">Contra Revenue</option>
                        <option value="third_party_billed">Third Party Billed</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Award Amount</label>
                      <input type="number" min="0" value={coverageEditAwardForm.awardAmount} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, awardAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Award Percent</label>
                      <input type="number" min="0" max="100" value={coverageEditAwardForm.awardPercent} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, awardPercent: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Trainee Share</label>
                      <input type="number" min="0" value={coverageEditAwardForm.traineeShareAmount} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, traineeShareAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Effective Date <span className="text-red-500">*</span></label>
                      <input type="date" required value={coverageEditAwardForm.effectiveDate} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, effectiveDate: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                      <select value={coverageEditAwardForm.status} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, status: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <textarea rows={3} value={coverageEditAwardForm.notes} onChange={(e) => setCoverageEditAwardForm({ ...coverageEditAwardForm, notes: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Coverage Type <span className="text-red-500">*</span></label>
                      <select value={coverageEditBillingForm.coverageType} onChange={(e) => setCoverageEditBillingForm({ ...coverageEditBillingForm, coverageType: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        <option value="full_company_pay">Full Company Pay</option>
                        <option value="shared_pay">Shared Pay</option>
                        <option value="credit_terms">Credit Terms</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                      <select value={coverageEditBillingForm.status} onChange={(e) => setCoverageEditBillingForm({ ...coverageEditBillingForm, status: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Covered Amount</label>
                      <input type="number" min="0" value={coverageEditBillingForm.coveredAmount} onChange={(e) => setCoverageEditBillingForm({ ...coverageEditBillingForm, coveredAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Trainee Share</label>
                      <input type="number" min="0" value={coverageEditBillingForm.traineeShareAmount} onChange={(e) => setCoverageEditBillingForm({ ...coverageEditBillingForm, traineeShareAmount: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <textarea rows={3} value={coverageEditBillingForm.notes} onChange={(e) => setCoverageEditBillingForm({ ...coverageEditBillingForm, notes: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                  </>
                )}
              </div>
              {coverageEditError ? <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{coverageEditError}</div> : null}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCoverageEditModalOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleUpdateCoverage} disabled={isCoverageEditSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {isCoverageEditSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCoverageDeleteDialog = () => {
    if (!isCoverageDeleteModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCloseCoverageDeleteModal}>
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete Coverage Link</h3>
            <button type="button" onClick={handleCloseCoverageDeleteModal} disabled={isCoverageDeleteSubmitting} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5">
            {coverageDeleteError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{coverageDeleteError}</div>
            ) : null}

            {coverageDeleteBlockers.length > 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Cannot delete this coverage link</p>
                  <p className="mt-1">
                    This coverage link cannot be deleted because the following dependencies exist:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {coverageDeleteBlockers.map((blocker, index) => (
                      <li key={index}>{blocker}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Remove all dependencies before attempting to delete this coverage link.</p>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={handleCloseCoverageDeleteModal} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-medium">Are you sure?</p>
                  <p className="mt-1">
                    This action cannot be undone. The coverage link &ldquo;{deletingCoverageLabel}&rdquo; will be permanently removed.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={handleCloseCoverageDeleteModal} disabled={isCoverageDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                  <button type="button" onClick={handleConfirmCoverageDelete} disabled={isCoverageDeleteSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                    {isCoverageDeleteSubmitting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSponsorCreateModal = () => {
    if (!isSponsorCreateModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Sponsor</h2>
              <p className="mt-1 text-sm text-gray-600">Add a new scholarship sponsor master record.</p>
            </div>
            <button
              type="button"
              onClick={handleCloseSponsorCreateModal}
              disabled={isSponsorCreateSubmitting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSponsor} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Sponsor Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sponsorCreateForm.sponsorCode}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, sponsorCode: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., SCH-001"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sponsorCreateForm.name}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, name: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Maritime Scholars Fund"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Contact Name</label>
                <input
                  type="text"
                  value={sponsorCreateForm.contactName}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, contactName: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., L. Garcia"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={sponsorCreateForm.email}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, email: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., scholars@msf.org"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={sponsorCreateForm.phone}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, phone: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., +63 2 1234 5678"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Default Customer</label>
                <select
                  value={sponsorCreateForm.defaultCustomer}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, defaultCustomer: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">None</option>
                  {customerChoices.map((c) => (
                    <option key={String(c.value)} value={String(c.value)}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={sponsorCreateForm.status}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, status: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SPONSOR_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Billing Address</label>
                <textarea
                  value={sponsorCreateForm.billingAddress}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, billingAddress: e.target.value })}
                  rows={2}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Billing address"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={sponsorCreateForm.notes}
                  onChange={(e) => setSponsorCreateForm({ ...sponsorCreateForm, notes: e.target.value })}
                  rows={2}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {sponsorCreateError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {sponsorCreateError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleCloseSponsorCreateModal}
                disabled={isSponsorCreateSubmitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSponsorCreateSubmitting}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSponsorCreateSubmitting ? 'Creating...' : 'Create Sponsor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSponsorEditModal = () => {
    if (!isSponsorEditModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Sponsor</h2>
              <p className="mt-1 text-sm text-gray-600">Update an existing scholarship sponsor master record.</p>
            </div>
            <button
              type="button"
              onClick={handleCloseSponsorEditModal}
              disabled={isSponsorEditSubmitting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isSponsorEditLoading ? (
            <div className="px-6 py-5">
              <DetailSkeleton />
            </div>
          ) : (
            <form onSubmit={handleEditSponsor} className="px-6 py-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Sponsor Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorEditForm.sponsorCode}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, sponsorCode: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorEditForm.name}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, name: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    value={sponsorEditForm.contactName}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, contactName: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={sponsorEditForm.email}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, email: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={sponsorEditForm.phone}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, phone: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Default Customer</label>
                  <select
                    value={sponsorEditForm.defaultCustomer}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, defaultCustomer: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">None</option>
                    {customerChoices.map((c) => (
                      <option key={String(c.value)} value={String(c.value)}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={sponsorEditForm.status}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, status: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {SPONSOR_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Billing Address</label>
                  <textarea
                    value={sponsorEditForm.billingAddress}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, billingAddress: e.target.value })}
                    rows={2}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={sponsorEditForm.notes}
                    onChange={(e) => setSponsorEditForm({ ...sponsorEditForm, notes: e.target.value })}
                    rows={2}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {sponsorEditError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {sponsorEditError}
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseSponsorEditModal}
                  disabled={isSponsorEditSubmitting}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSponsorEditSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSponsorEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderSponsorDetailModal = () => {
    if (!selectedSponsor) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sponsor Record</h2>
              <p className="mt-1 text-sm text-gray-500">Review the full sponsor master record returned by the CMS.</p>
            </div>
            <button
              type="button"
              onClick={closeSponsorDetailModal}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-6 py-5">
            {isSponsorDetailLoading ? (
              <DetailSkeleton />
            ) : sponsorDetailError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {sponsorDetailError}
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      closeSponsorDetailModal();
                      void handleOpenSponsorEditModal(selectedSponsor.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Sponsor
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sponsor Code</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{selectedSponsor.sponsorCode || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedSponsor.status || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Name</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedSponsor.name || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Contact Name</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedSponsor.contactName || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedSponsor.email || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedSponsor.phone || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Default Customer</p>
                    <p className="mt-2 text-sm text-gray-900">
                      {typeof selectedSponsor.defaultCustomer === 'object' && selectedSponsor.defaultCustomer !== null
                        ? `${(selectedSponsor.defaultCustomer as Record<string, unknown>).displayName || (selectedSponsor.defaultCustomer as Record<string, unknown>).customerCode || `Customer #${(selectedSponsor.defaultCustomer as Record<string, unknown>).id}`}`
                        : selectedSponsor.defaultCustomer
                          ? `Customer #${selectedSponsor.defaultCustomer}`
                          : '-'}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Billing Address</p>
                  <p className="mt-2 text-sm text-gray-900">{selectedSponsor.billingAddress || '-'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                  <p className="mt-2 text-sm text-gray-900">{selectedSponsor.notes || '-'}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</p>
                    <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedSponsor.createdAt)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated At</p>
                    <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedSponsor.updatedAt)}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={closeSponsorDetailModal}
              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSponsorDeleteModal = () => {
    if (!isSponsorDeleteModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Sponsor</h2>
              <p className="mt-1 text-sm text-gray-600">
                Remove &ldquo;{deletingSponsorName}&rdquo; from the sponsors list.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseSponsorDeleteModal}
              disabled={isSponsorDeleteSubmitting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            {sponsorDeleteError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{sponsorDeleteError}</div>
            ) : null}

            {sponsorDeleteBlockers.length > 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Cannot delete this sponsor</p>
                  <p className="mt-1">
                    This sponsor cannot be deleted because the following dependencies exist:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {sponsorDeleteBlockers.map((blocker, index) => (
                      <li key={index}>{blocker}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Remove all dependencies before attempting to delete this sponsor.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseSponsorDeleteModal}
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
                    This action cannot be undone. The sponsor &ldquo;{deletingSponsorName}&rdquo; will be permanently removed.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseSponsorDeleteModal}
                    disabled={isSponsorDeleteSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSponsorDelete}
                    disabled={isSponsorDeleteSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSponsorDeleteSubmitting ? 'Deleting...' : 'Delete Sponsor'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCorporateCreateModal = () => {
    if (!isCorporateCreateModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Corporate Account</h2>
              <p className="mt-1 text-sm text-gray-600">Add a new corporate payer account record.</p>
            </div>
            <button
              type="button"
              onClick={handleCloseCorporateCreateModal}
              disabled={isCorporateCreateSubmitting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateCorporate} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Account Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={corporateCreateForm.accountCode}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, accountCode: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., CORP-001"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={corporateCreateForm.name}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, name: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Grandline Corporate Training"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={corporateCreateForm.customer}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, customer: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a customer</option>
                  {customerChoices.map((c) => (
                    <option key={String(c.value)} value={String(c.value)}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Billing Contact</label>
                <input
                  type="text"
                  value={corporateCreateForm.billingContact}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, billingContact: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., T. Mendoza"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={corporateCreateForm.email}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, email: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={corporateCreateForm.phone}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, phone: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Credit Terms</label>
                <input
                  type="text"
                  value={corporateCreateForm.creditTerms}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, creditTerms: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., 30 days"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Payment Terms</label>
                <input
                  type="text"
                  value={corporateCreateForm.paymentTerms}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, paymentTerms: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={corporateCreateForm.status}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, status: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SPONSOR_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={corporateCreateForm.notes}
                  onChange={(e) => setCorporateCreateForm({ ...corporateCreateForm, notes: e.target.value })}
                  rows={2}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {corporateCreateError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {corporateCreateError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleCloseCorporateCreateModal}
                disabled={isCorporateCreateSubmitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCorporateCreateSubmitting}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isCorporateCreateSubmitting ? 'Creating...' : 'Create Corporate Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCorporateEditModal = () => {
    if (!isCorporateEditModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Corporate Account</h2>
              <p className="mt-1 text-sm text-gray-600">Update an existing corporate payer account record.</p>
            </div>
            <button
              type="button"
              onClick={handleCloseCorporateEditModal}
              disabled={isCorporateEditSubmitting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isCorporateEditLoading ? (
            <div className="px-6 py-5">
              <DetailSkeleton />
            </div>
          ) : (
            <form onSubmit={handleEditCorporate} className="px-6 py-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Account Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={corporateEditForm.accountCode}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, accountCode: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={corporateEditForm.name}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, name: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={corporateEditForm.customer}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, customer: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select a customer</option>
                    {customerChoices.map((c) => (
                      <option key={String(c.value)} value={String(c.value)}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Billing Contact</label>
                  <input
                    type="text"
                    value={corporateEditForm.billingContact}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, billingContact: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={corporateEditForm.email}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, email: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={corporateEditForm.phone}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, phone: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Credit Terms</label>
                  <input
                    type="text"
                    value={corporateEditForm.creditTerms}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, creditTerms: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Payment Terms</label>
                  <input
                    type="text"
                    value={corporateEditForm.paymentTerms}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, paymentTerms: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={corporateEditForm.status}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, status: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {SPONSOR_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={corporateEditForm.notes}
                    onChange={(e) => setCorporateEditForm({ ...corporateEditForm, notes: e.target.value })}
                    rows={2}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {corporateEditError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {corporateEditError}
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCorporateEditModal}
                  disabled={isCorporateEditSubmitting}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCorporateEditSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCorporateEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderCorporateDetailModal = () => {
    if (!selectedCorporate) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Corporate Account Record</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review the full corporate account master record returned by the CMS.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCorporateDetailModal}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-6 py-5">
            {isCorporateDetailLoading ? (
              <DetailSkeleton />
            ) : corporateDetailError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {corporateDetailError}
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      closeCorporateDetailModal();
                      void handleOpenCorporateEditModal(selectedCorporate.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Corporate Account
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Code</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{selectedCorporate.accountCode || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.status || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Name</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.name || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</p>
                    <p className="mt-2 text-sm text-gray-900">
                      {typeof selectedCorporate.customer === 'object' && selectedCorporate.customer !== null
                        ? `${(selectedCorporate.customer as Record<string, unknown>).displayName || (selectedCorporate.customer as Record<string, unknown>).customerCode || `Customer #${(selectedCorporate.customer as Record<string, unknown>).id}`}`
                        : selectedCorporate.customer
                          ? `Customer #${selectedCorporate.customer}`
                          : '-'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Billing Contact</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.billingContact || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.email || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.phone || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Credit Terms</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.creditTerms || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Terms</p>
                    <p className="mt-2 text-sm text-gray-900">{selectedCorporate.paymentTerms || '-'}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                  <p className="mt-2 text-sm text-gray-900">{selectedCorporate.notes || '-'}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</p>
                    <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedCorporate.createdAt)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated At</p>
                    <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedCorporate.updatedAt)}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={closeCorporateDetailModal}
              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCorporateDeleteModal = () => {
    if (!isCorporateDeleteModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Corporate Account</h2>
              <p className="mt-1 text-sm text-gray-600">
                Remove &ldquo;{deletingCorporateName}&rdquo; from the corporate accounts list.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseCorporateDeleteModal}
              disabled={isCorporateDeleteSubmitting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            {corporateDeleteError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {corporateDeleteError}
              </div>
            ) : null}

            {corporateDeleteBlockers.length > 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">Cannot delete this corporate account</p>
                  <p className="mt-1">
                    This corporate account cannot be deleted because the following dependencies exist:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {corporateDeleteBlockers.map((blocker, index) => (
                      <li key={index}>{blocker}</li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    Remove all dependencies before attempting to delete this corporate account.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseCorporateDeleteModal}
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
                    This action cannot be undone. The corporate account &ldquo;{deletingCorporateName}&rdquo; will be
                    permanently removed.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseCorporateDeleteModal}
                    disabled={isCorporateDeleteSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCorporateDelete}
                    disabled={isCorporateDeleteSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isCorporateDeleteSubmitting ? 'Deleting...' : 'Delete Corporate Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Sponsored & Corporate Billing Entities</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Maintain sponsor and corporate payer entities together with the coverage links that support scholarship
                and company-billed training.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              type="button"
              onClick={() => switchTab(TAB_IDS.SCHOLARSHIP_SPONSORS)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === TAB_IDS.SCHOLARSHIP_SPONSORS
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Scholarship Sponsors
            </button>
            <button
              type="button"
              onClick={() => switchTab(TAB_IDS.CORPORATE_ACCOUNTS)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === TAB_IDS.CORPORATE_ACCOUNTS
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Corporate Accounts
            </button>
            <button
              type="button"
              onClick={() => switchTab(TAB_IDS.COVERAGE_LINKS)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === TAB_IDS.COVERAGE_LINKS
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Coverage Links
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === TAB_IDS.SCHOLARSHIP_SPONSORS && renderSponsorTable()}
          {activeTab === TAB_IDS.CORPORATE_ACCOUNTS && renderCorporateAccountTable()}
          {activeTab === TAB_IDS.COVERAGE_LINKS && renderCoverageLinksTable()}
        </div>
      </div>

      {renderSponsorCreateModal()}
      {renderSponsorEditModal()}
      {renderSponsorDetailModal()}
      {renderSponsorDeleteModal()}

      {renderCorporateCreateModal()}
      {renderCorporateEditModal()}
      {renderCorporateDetailModal()}
      {renderCorporateDeleteModal()}

      {renderCoverageCreateModal()}
      {renderCoverageEditModal()}
      {renderCoverageDeleteDialog()}
    </div>
  );
}
