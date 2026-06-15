'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  createBankAccount,
  createCustomer,
  createVendor,
  deleteBankAccount,
  deleteCustomer,
  deleteVendor,
  getBankAccountDetail,
  getBankAccountRegister,
  getCustomerDetail,
  getCustomerRegister,
  getVendorDetail,
  getVendorRegister,
  updateBankAccount,
  updateCustomer,
  updateVendor,
  type BankAccountDetail,
  type BankAccountRegisterResponse,
  type BusinessPartyMetric as Metric,
  type CreateBankAccountInput,
  type CreateCustomerInput,
  type CreateVendorInput,
  type CustomerDetail,
  type CustomerRegisterResponse,
  type UpdateBankAccountInput,
  type UpdateVendorInput,
  type VendorDetail,
  type VendorRegisterResponse,
} from './actions';

type CustomerQuickFilterKey = 'active' | 'individual' | 'corporate' | 'with-credit-limit';
type VendorQuickFilterKey = 'active' | 'supplier' | 'contractor' | 'utility';
type BankAccountQuickFilterKey = 'active' | 'default-receipt' | 'default-disbursement' | 'cash-on-hand';

type CustomerFilterState = {
  statuses: string[];
  customerTypes: string[];
  hasCreditLimit: boolean;
};

type VendorFilterState = {
  statuses: string[];
  vendorTypes: string[];
};

type BankAccountFilterState = {
  statuses: string[];
  accountTypes: string[];
  defaultReceiptOnly: boolean;
  defaultDisbursementOnly: boolean;
  ledgerMappedOnly: boolean;
};

type CustomerCreateFormState = {
  customerCode: string;
  displayName: string;
  legalName: string;
  customerType: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  taxId: string;
  creditLimit: string;
  status: string;
  notes: string;
  currencyReference: string;
  paymentTermReference: string;
};

type VendorCreateFormState = {
  vendorCode: string;
  displayName: string;
  legalName: string;
  vendorType: string;
  email: string;
  phone: string;
  billingAddress: string;
  taxId: string;
  status: string;
  notes: string;
  currencyReference: string;
  paymentTermReference: string;
};

type BankAccountCreateFormState = {
  accountName: string;
  accountNumberMasked: string;
  bankName: string;
  branchName: string;
  accountType: string;
  currencyReference: string;
  ledgerAccount: string;
  isDefaultReceiptAccount: boolean;
  isDefaultDisbursementAccount: boolean;
  isActive: boolean;
  notes: string;
};

type BusinessPartiesTab = 'customers' | 'vendors' | 'bank-accounts';

type BusinessPartiesClientProps = {
  initialCustomerData: CustomerRegisterResponse | null;
  initialVendorData: VendorRegisterResponse | null;
  initialBankAccountData: BankAccountRegisterResponse | null;
  initialTab: BusinessPartiesTab;
};

const PAGE_TITLE = 'Business Parties';
const PAGE_DESCRIPTION =
  'Maintain customer, vendor, and bank account reference records used across commercial, treasury, and accounting workflows.';

function normalizeBusinessPartiesTab(value?: string | null): BusinessPartiesTab {
  return value === 'vendors' || value === 'bank-accounts' ? value : 'customers';
}

const customerQuickFilterConfig: Record<
  CustomerQuickFilterKey,
  {
    label: string;
    type: 'status' | 'customerType' | 'hasCreditLimit';
    value?: string;
  }
> = {
  active: { label: 'Active', type: 'status', value: 'active' },
  individual: { label: 'Individual', type: 'customerType', value: 'individual' },
  corporate: { label: 'Corporate', type: 'customerType', value: 'company' },
  'with-credit-limit': { label: 'With Credit Limit', type: 'hasCreditLimit' },
};

const vendorQuickFilterConfig: Record<
  VendorQuickFilterKey,
  {
    label: string;
    type: 'status' | 'vendorType';
    value: string;
  }
> = {
  active: { label: 'Active', type: 'status', value: 'active' },
  supplier: { label: 'Supplier', type: 'vendorType', value: 'supplier' },
  contractor: { label: 'Contractor', type: 'vendorType', value: 'contractor' },
  utility: { label: 'Utility', type: 'vendorType', value: 'utility' },
};

const bankAccountQuickFilterConfig: Record<
  BankAccountQuickFilterKey,
  {
    label: string;
    type: 'status' | 'accountType' | 'defaultReceiptOnly' | 'defaultDisbursementOnly';
    value?: string;
  }
> = {
  active: { label: 'Active', type: 'status', value: 'active' },
  'default-receipt': { label: 'Default Receipt', type: 'defaultReceiptOnly' },
  'default-disbursement': { label: 'Default Disbursement', type: 'defaultDisbursementOnly' },
  'cash-on-hand': { label: 'Cash On Hand', type: 'accountType', value: 'cash_on_hand' },
};

function getMetricTone(trend: Metric['trend']) {
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
    case 'on_hold':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'archived':
      return 'bg-gray-100 text-gray-700 ring-gray-200';
    default:
      return 'bg-blue-50 text-blue-700 ring-blue-200';
  }
}

function escapeCsvValue(value: string | number | null | undefined) {
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

function getCustomerFilterCount(filters: CustomerFilterState) {
  return filters.statuses.length + filters.customerTypes.length + (filters.hasCreditLimit ? 1 : 0);
}

function getCustomerQuickFilterValue(filterKey: CustomerQuickFilterKey) {
  const config = customerQuickFilterConfig[filterKey];

  if (config.type === 'hasCreditLimit') {
    return 'hasCreditLimit:true';
  }

  return `${config.type}:${config.value}`;
}

function getVendorFilterCount(filters: VendorFilterState) {
  return filters.statuses.length + filters.vendorTypes.length;
}

function getVendorQuickFilterValue(filterKey: VendorQuickFilterKey) {
  const config = vendorQuickFilterConfig[filterKey];
  return `${config.type}:${config.value}`;
}

function getBankAccountFilterCount(filters: BankAccountFilterState) {
  return (
    filters.statuses.length +
    filters.accountTypes.length +
    (filters.defaultReceiptOnly ? 1 : 0) +
    (filters.defaultDisbursementOnly ? 1 : 0) +
    (filters.ledgerMappedOnly ? 1 : 0)
  );
}

function getBankAccountQuickFilterValue(filterKey: BankAccountQuickFilterKey) {
  const config = bankAccountQuickFilterConfig[filterKey];

  if (config.type === 'defaultReceiptOnly') {
    return 'defaultReceiptOnly:true';
  }

  if (config.type === 'defaultDisbursementOnly') {
    return 'defaultDisbursementOnly:true';
  }

  return `${config.type}:${config.value}`;
}

function areCustomerFilterStatesEqual(left: CustomerFilterState, right: CustomerFilterState) {
  return (
    haveSameEntries(left.statuses, right.statuses) &&
    haveSameEntries(left.customerTypes, right.customerTypes) &&
    left.hasCreditLimit === right.hasCreditLimit
  );
}

function areVendorFilterStatesEqual(left: VendorFilterState, right: VendorFilterState) {
  return haveSameEntries(left.statuses, right.statuses) && haveSameEntries(left.vendorTypes, right.vendorTypes);
}

function areBankAccountFilterStatesEqual(left: BankAccountFilterState, right: BankAccountFilterState) {
  return (
    haveSameEntries(left.statuses, right.statuses) &&
    haveSameEntries(left.accountTypes, right.accountTypes) &&
    left.defaultReceiptOnly === right.defaultReceiptOnly &&
    left.defaultDisbursementOnly === right.defaultDisbursementOnly &&
    left.ledgerMappedOnly === right.ledgerMappedOnly
  );
}

function isCustomerQuickFilterActive(filterKey: CustomerQuickFilterKey, quickFilters: string[]) {
  return quickFilters.includes(getCustomerQuickFilterValue(filterKey));
}

function isVendorQuickFilterActive(filterKey: VendorQuickFilterKey, quickFilters: string[]) {
  return quickFilters.includes(getVendorQuickFilterValue(filterKey));
}

function isBankAccountQuickFilterActive(
  filterKey: BankAccountQuickFilterKey,
  quickFilters: string[],
) {
  return quickFilters.includes(getBankAccountQuickFilterValue(filterKey));
}

function getBankAccountStatus(isActive?: boolean | null) {
  return isActive === false ? 'Inactive' : 'Active';
}

function formatPartyTypeLabel(value?: string | null) {
  if (!value) {
    return '-';
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} aria-hidden="true" />;
}

function RegisterSkeleton({
  columns,
}: {
  columns: string[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`metric-skeleton-${index}`} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-8 w-16" />
              </div>
              <SkeletonBlock className="h-11 w-11 rounded-lg" />
            </div>
            <div className="mt-4">
              <SkeletonBlock className="h-6 w-48 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <SkeletonBlock className="h-11 w-full max-w-xl rounded-lg" />
            <SkeletonBlock className="h-11 w-28 rounded-lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`filter-skeleton-${index}`}>
                <SkeletonBlock className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-52" />
              <SkeletonBlock className="h-4 w-80 max-w-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-9 w-28 rounded-lg" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[...columns, 'Actions'].map((column) => (
                      <th
                        key={`skeleton-column-${column}`}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.from({ length: 6 }).map((_, rowIndex) => (
                    <tr key={`customer-row-skeleton-${rowIndex}`}>
                      <td className="px-4 py-3">
                        <SkeletonBlock className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <SkeletonBlock className="h-4 w-36" />
                      </td>
                      <td className="px-4 py-3">
                        <SkeletonBlock className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <SkeletonBlock className="h-4 w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <SkeletonBlock className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <SkeletonBlock className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <SkeletonBlock className="h-8 w-20 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-10 w-24 rounded-lg" />
              <SkeletonBlock className="h-10 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`detail-card-skeleton-${index}`} className="rounded-xl border border-gray-200 p-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 p-4">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-3 h-16 w-full" />
      </div>
    </div>
  );
}

const initialCustomerCreateFormState: CustomerCreateFormState = {
  customerCode: '',
  displayName: '',
  legalName: '',
  customerType: 'individual',
  email: '',
  phone: '',
  billingAddress: '',
  shippingAddress: '',
  taxId: '',
  creditLimit: '0',
  status: 'active',
  notes: '',
  currencyReference: '',
  paymentTermReference: '',
};

const initialVendorCreateFormState: VendorCreateFormState = {
  vendorCode: '',
  displayName: '',
  legalName: '',
  vendorType: 'supplier',
  email: '',
  phone: '',
  billingAddress: '',
  taxId: '',
  status: 'active',
  notes: '',
  currencyReference: '',
  paymentTermReference: '',
};

const initialBankAccountCreateFormState: BankAccountCreateFormState = {
  accountName: '',
  accountNumberMasked: '',
  bankName: '',
  branchName: '',
  accountType: 'bank',
  currencyReference: '',
  ledgerAccount: '',
  isDefaultReceiptAccount: false,
  isDefaultDisbursementAccount: false,
  isActive: true,
  notes: '',
};

function normalizeRelationshipValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const numericValue = Number(trimmedValue);
  return Number.isFinite(numericValue) ? numericValue : trimmedValue;
}

function mapCustomerDetailToFormState(customer: CustomerDetail): CustomerCreateFormState {
  return {
    customerCode: customer.customerCode || '',
    displayName: customer.displayName || '',
    legalName: customer.legalName || '',
    customerType: customer.customerType || 'individual',
    email: customer.email || '',
    phone: customer.phone || '',
    billingAddress: customer.billingAddress || '',
    shippingAddress: customer.shippingAddress || '',
    taxId: customer.taxId || '',
    creditLimit: String(customer.creditLimit ?? 0),
    status: customer.status || 'active',
    notes: customer.notes || '',
    currencyReference: customer.currencyReference?.id ? String(customer.currencyReference.id) : '',
    paymentTermReference: customer.paymentTermReference?.id ? String(customer.paymentTermReference.id) : '',
  };
}

function mapVendorDetailToFormState(vendor: VendorDetail): VendorCreateFormState {
  return {
    vendorCode: vendor.vendorCode || '',
    displayName: vendor.displayName || '',
    legalName: vendor.legalName || '',
    vendorType: vendor.vendorType || 'supplier',
    email: vendor.email || '',
    phone: vendor.phone || '',
    billingAddress: vendor.billingAddress || '',
    taxId: vendor.taxId || '',
    status: vendor.status || 'active',
    notes: vendor.notes || '',
    currencyReference: vendor.currencyReference?.id ? String(vendor.currencyReference.id) : '',
    paymentTermReference: vendor.paymentTermReference?.id ? String(vendor.paymentTermReference.id) : '',
  };
}

function mapBankAccountDetailToFormState(account: BankAccountDetail): BankAccountCreateFormState {
  return {
    accountName: account.accountName || '',
    accountNumberMasked: account.accountNumberMasked || '',
    bankName: account.bankName || '',
    branchName: account.branchName || '',
    accountType: account.accountType || 'bank',
    currencyReference: account.currencyReference?.id ? String(account.currencyReference.id) : '',
    ledgerAccount: account.ledgerAccount?.id ? String(account.ledgerAccount.id) : '',
    isDefaultReceiptAccount: account.isDefaultReceiptAccount ?? false,
    isDefaultDisbursementAccount: account.isDefaultDisbursementAccount ?? false,
    isActive: account.isActive ?? true,
    notes: account.notes || '',
  };
}

export function BusinessPartiesClient({
  initialCustomerData,
  initialVendorData,
  initialBankAccountData,
  initialTab,
}: BusinessPartiesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<BusinessPartiesTab>(initialTab);
  const [customerSearchInput, setCustomerSearchInput] = useState(initialCustomerData?.appliedFilters.search || '');
  const [customerSubmittedSearch, setCustomerSubmittedSearch] = useState(
    initialCustomerData?.appliedFilters.search || '',
  );
  const [customerCurrentPage, setCustomerCurrentPage] = useState(initialCustomerData?.pagination.page || 1);
  const [customerData, setCustomerData] = useState<CustomerRegisterResponse | null>(initialCustomerData);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(!initialCustomerData);
  const [appliedCustomerFilters, setAppliedCustomerFilters] = useState<CustomerFilterState>({
    statuses: initialCustomerData?.appliedFilters.statuses || [],
    customerTypes: initialCustomerData?.appliedFilters.customerTypes || [],
    hasCreditLimit: initialCustomerData?.appliedFilters.hasCreditLimit || false,
  });
  const [draftCustomerFilters, setDraftCustomerFilters] = useState<CustomerFilterState>({
    statuses: initialCustomerData?.appliedFilters.statuses || [],
    customerTypes: initialCustomerData?.appliedFilters.customerTypes || [],
    hasCreditLimit: initialCustomerData?.appliedFilters.hasCreditLimit || false,
  });
  const [customerQuickFilters, setCustomerQuickFilters] = useState<string[]>(
    initialCustomerData?.appliedFilters.quickFilters || [],
  );
  const [isCustomerFilterPanelOpen, setIsCustomerFilterPanelOpen] = useState(false);
  const [isCustomerCreateModalOpen, setIsCustomerCreateModalOpen] = useState(false);
  const [isCustomerCreateSubmitting, setIsCustomerCreateSubmitting] = useState(false);
  const [customerCreateError, setCustomerCreateError] = useState<string | null>(null);
  const [customerCreateForm, setCustomerCreateForm] = useState<CustomerCreateFormState>(
    initialCustomerCreateFormState,
  );

  const [isCustomerEditModalOpen, setIsCustomerEditModalOpen] = useState(false);
  const [isCustomerEditLoading, setIsCustomerEditLoading] = useState(false);
  const [isCustomerEditSubmitting, setIsCustomerEditSubmitting] = useState(false);
  const [customerEditError, setCustomerEditError] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<number | string | null>(null);
  const [customerEditForm, setCustomerEditForm] = useState<CustomerCreateFormState>(
    initialCustomerCreateFormState,
  );

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | null>(null);
  const [isCustomerDetailLoading, setIsCustomerDetailLoading] = useState(false);
  const [customerDetailError, setCustomerDetailError] = useState<string | null>(null);

  const [isCustomerDeleteModalOpen, setIsCustomerDeleteModalOpen] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | string | null>(null);
  const [deletingCustomerName, setDeletingCustomerName] = useState<string>('');
  const [isCustomerDeleteSubmitting, setIsCustomerDeleteSubmitting] = useState(false);
  const [customerDeleteError, setCustomerDeleteError] = useState<string | null>(null);
  const [customerDeleteBlockers, setCustomerDeleteBlockers] = useState<string[]>([]);

  const [vendorSearchInput, setVendorSearchInput] = useState(initialVendorData?.appliedFilters.search || '');
  const [vendorSubmittedSearch, setVendorSubmittedSearch] = useState(initialVendorData?.appliedFilters.search || '');
  const [vendorCurrentPage, setVendorCurrentPage] = useState(initialVendorData?.pagination.page || 1);
  const [vendorData, setVendorData] = useState<VendorRegisterResponse | null>(initialVendorData);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [isVendorLoading, setIsVendorLoading] = useState(!initialVendorData);
  const [appliedVendorFilters, setAppliedVendorFilters] = useState<VendorFilterState>({
    statuses: initialVendorData?.appliedFilters.statuses || [],
    vendorTypes: initialVendorData?.appliedFilters.vendorTypes || [],
  });
  const [draftVendorFilters, setDraftVendorFilters] = useState<VendorFilterState>({
    statuses: initialVendorData?.appliedFilters.statuses || [],
    vendorTypes: initialVendorData?.appliedFilters.vendorTypes || [],
  });
  const [vendorQuickFilters, setVendorQuickFilters] = useState<string[]>(
    initialVendorData?.appliedFilters.quickFilters || [],
  );
  const [isVendorFilterPanelOpen, setIsVendorFilterPanelOpen] = useState(false);
  const [isVendorCreateModalOpen, setIsVendorCreateModalOpen] = useState(false);
  const [isVendorCreateSubmitting, setIsVendorCreateSubmitting] = useState(false);
  const [vendorCreateError, setVendorCreateError] = useState<string | null>(null);
  const [vendorCreateForm, setVendorCreateForm] = useState<VendorCreateFormState>(initialVendorCreateFormState);

  const [isVendorEditModalOpen, setIsVendorEditModalOpen] = useState(false);
  const [isVendorEditLoading, setIsVendorEditLoading] = useState(false);
  const [isVendorEditSubmitting, setIsVendorEditSubmitting] = useState(false);
  const [vendorEditError, setVendorEditError] = useState<string | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<number | string | null>(null);
  const [vendorEditForm, setVendorEditForm] = useState<VendorCreateFormState>(initialVendorCreateFormState);

  const [selectedVendor, setSelectedVendor] = useState<VendorDetail | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | string | null>(null);

  const [isVendorDeleteModalOpen, setIsVendorDeleteModalOpen] = useState(false);
  const [deletingVendorId, setDeletingVendorId] = useState<number | string | null>(null);
  const [deletingVendorName, setDeletingVendorName] = useState<string>('');
  const [isVendorDeleteSubmitting, setIsVendorDeleteSubmitting] = useState(false);
  const [vendorDeleteError, setVendorDeleteError] = useState<string | null>(null);
  const [vendorDeleteBlockers, setVendorDeleteBlockers] = useState<string[]>([]);
  const [isVendorDetailLoading, setIsVendorDetailLoading] = useState(false);
  const [vendorDetailError, setVendorDetailError] = useState<string | null>(null);

  const [isBankAccountDeleteModalOpen, setIsBankAccountDeleteModalOpen] = useState(false);
  const [deletingBankAccountId, setDeletingBankAccountId] = useState<number | string | null>(null);
  const [deletingBankAccountName, setDeletingBankAccountName] = useState<string>('');
  const [isBankAccountDeleteSubmitting, setIsBankAccountDeleteSubmitting] = useState(false);
  const [bankAccountDeleteError, setBankAccountDeleteError] = useState<string | null>(null);
  const [bankAccountDeleteBlockers, setBankAccountDeleteBlockers] = useState<string[]>([]);

  const [bankAccountSearchInput, setBankAccountSearchInput] = useState(
    initialBankAccountData?.appliedFilters.search || '',
  );
  const [bankAccountSubmittedSearch, setBankAccountSubmittedSearch] = useState(
    initialBankAccountData?.appliedFilters.search || '',
  );
  const [bankAccountCurrentPage, setBankAccountCurrentPage] = useState(
    initialBankAccountData?.pagination.page || 1,
  );
  const [bankAccountData, setBankAccountData] = useState<BankAccountRegisterResponse | null>(
    initialBankAccountData,
  );
  const [bankAccountError, setBankAccountError] = useState<string | null>(null);
  const [isBankAccountLoading, setIsBankAccountLoading] = useState(!initialBankAccountData);
  const [appliedBankAccountFilters, setAppliedBankAccountFilters] = useState<BankAccountFilterState>({
    statuses: initialBankAccountData?.appliedFilters.statuses || [],
    accountTypes: initialBankAccountData?.appliedFilters.accountTypes || [],
    defaultReceiptOnly: initialBankAccountData?.appliedFilters.defaultReceiptOnly || false,
    defaultDisbursementOnly: initialBankAccountData?.appliedFilters.defaultDisbursementOnly || false,
    ledgerMappedOnly: initialBankAccountData?.appliedFilters.ledgerMappedOnly || false,
  });
  const [draftBankAccountFilters, setDraftBankAccountFilters] = useState<BankAccountFilterState>({
    statuses: initialBankAccountData?.appliedFilters.statuses || [],
    accountTypes: initialBankAccountData?.appliedFilters.accountTypes || [],
    defaultReceiptOnly: initialBankAccountData?.appliedFilters.defaultReceiptOnly || false,
    defaultDisbursementOnly: initialBankAccountData?.appliedFilters.defaultDisbursementOnly || false,
    ledgerMappedOnly: initialBankAccountData?.appliedFilters.ledgerMappedOnly || false,
  });
  const [bankAccountQuickFilters, setBankAccountQuickFilters] = useState<string[]>(
    initialBankAccountData?.appliedFilters.quickFilters || [],
  );
  const [isBankAccountFilterPanelOpen, setIsBankAccountFilterPanelOpen] = useState(false);
  const [isBankAccountCreateModalOpen, setIsBankAccountCreateModalOpen] = useState(false);
  const [isBankAccountCreateSubmitting, setIsBankAccountCreateSubmitting] = useState(false);
  const [bankAccountCreateError, setBankAccountCreateError] = useState<string | null>(null);
  const [bankAccountCreateForm, setBankAccountCreateForm] = useState<BankAccountCreateFormState>(
    initialBankAccountCreateFormState,
  );
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccountDetail | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | string | null>(null);
  const [isBankAccountDetailLoading, setIsBankAccountDetailLoading] = useState(false);
  const [bankAccountDetailError, setBankAccountDetailError] = useState<string | null>(null);

  const [isBankAccountEditModalOpen, setIsBankAccountEditModalOpen] = useState(false);
  const [isBankAccountEditLoading, setIsBankAccountEditLoading] = useState(false);
  const [isBankAccountEditSubmitting, setIsBankAccountEditSubmitting] = useState(false);
  const [bankAccountEditError, setBankAccountEditError] = useState<string | null>(null);
  const [editingBankAccountId, setEditingBankAccountId] = useState<number | string | null>(null);
  const [bankAccountEditForm, setBankAccountEditForm] = useState<BankAccountCreateFormState>(initialBankAccountCreateFormState);

  const initialCustomerFetchSkippedRef = useRef(false);
  const initialVendorFetchSkippedRef = useRef(false);
  const initialBankAccountFetchSkippedRef = useRef(false);

  useEffect(() => {
    const nextTab = normalizeBusinessPartiesTab(searchParams.get('tab'));
    setActiveTab((previous) => (previous === nextTab ? previous : nextTab));
  }, [searchParams]);

  const fetchCustomerRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      activeFilters: CustomerFilterState;
      nextQuickFilters?: string[];
    }) => {
      setIsCustomerLoading(true);
      setCustomerError(null);

      try {
        const quickFilters = nextQuickFilters ?? customerQuickFilters;
        const payload = await getCustomerRegister({
          search,
          page,
          statuses: activeFilters.statuses,
          customerTypes: activeFilters.customerTypes,
          hasCreditLimit: activeFilters.hasCreditLimit,
          quickFilters,
        });

        setCustomerData(payload);
      } catch (error) {
        setCustomerError(error instanceof Error ? error.message : 'Unable to load customers.');
      } finally {
        setIsCustomerLoading(false);
      }
    },
    [customerQuickFilters],
  );

  const fetchVendorRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      activeFilters: VendorFilterState;
      nextQuickFilters?: string[];
    }) => {
      setIsVendorLoading(true);
      setVendorError(null);

      try {
        const quickFilters = nextQuickFilters ?? vendorQuickFilters;
        const payload = await getVendorRegister({
          search,
          page,
          statuses: activeFilters.statuses,
          vendorTypes: activeFilters.vendorTypes,
          quickFilters,
        });

        setVendorData(payload);
      } catch (error) {
        setVendorError(error instanceof Error ? error.message : 'Unable to load vendors.');
      } finally {
        setIsVendorLoading(false);
      }
    },
    [vendorQuickFilters],
  );

  const fetchBankAccountRegister = useCallback(
    async ({
      search,
      page,
      activeFilters,
      nextQuickFilters,
    }: {
      search: string;
      page: number;
      activeFilters: BankAccountFilterState;
      nextQuickFilters?: string[];
    }) => {
      setIsBankAccountLoading(true);
      setBankAccountError(null);

      try {
        const quickFilters = nextQuickFilters ?? bankAccountQuickFilters;
        const payload = await getBankAccountRegister({
          search,
          page,
          statuses: activeFilters.statuses,
          accountTypes: activeFilters.accountTypes,
          defaultReceiptOnly: activeFilters.defaultReceiptOnly,
          defaultDisbursementOnly: activeFilters.defaultDisbursementOnly,
          ledgerMappedOnly: activeFilters.ledgerMappedOnly,
          quickFilters,
        });

        setBankAccountData(payload);
      } catch (error) {
        setBankAccountError(error instanceof Error ? error.message : 'Unable to load bank accounts.');
      } finally {
        setIsBankAccountLoading(false);
      }
    },
    [bankAccountQuickFilters],
  );

  useEffect(() => {
    if (activeTab !== 'customers') {
      return;
    }

    if (!initialCustomerFetchSkippedRef.current && initialCustomerData) {
      initialCustomerFetchSkippedRef.current = true;
      return;
    }

    void fetchCustomerRegister({
      search: customerSubmittedSearch,
      page: customerCurrentPage,
      activeFilters: appliedCustomerFilters,
      nextQuickFilters: customerQuickFilters,
    });
  }, [
    activeTab,
    appliedCustomerFilters,
    customerCurrentPage,
    customerQuickFilters,
    customerSubmittedSearch,
    fetchCustomerRegister,
    initialCustomerData,
  ]);

  useEffect(() => {
    if (activeTab !== 'vendors') {
      return;
    }

    if (!initialVendorFetchSkippedRef.current && initialVendorData) {
      initialVendorFetchSkippedRef.current = true;
      return;
    }

    void fetchVendorRegister({
      search: vendorSubmittedSearch,
      page: vendorCurrentPage,
      activeFilters: appliedVendorFilters,
      nextQuickFilters: vendorQuickFilters,
    });
  }, [
    activeTab,
    appliedVendorFilters,
    fetchVendorRegister,
    initialVendorData,
    vendorQuickFilters,
    vendorCurrentPage,
    vendorSubmittedSearch,
  ]);

  useEffect(() => {
    if (activeTab !== 'bank-accounts') {
      return;
    }

    if (!initialBankAccountFetchSkippedRef.current && initialBankAccountData) {
      initialBankAccountFetchSkippedRef.current = true;
      return;
    }

    void fetchBankAccountRegister({
      search: bankAccountSubmittedSearch,
      page: bankAccountCurrentPage,
      activeFilters: appliedBankAccountFilters,
      nextQuickFilters: bankAccountQuickFilters,
    });
  }, [
    activeTab,
    appliedBankAccountFilters,
    bankAccountCurrentPage,
    bankAccountQuickFilters,
    bankAccountSubmittedSearch,
    fetchBankAccountRegister,
    initialBankAccountData,
  ]);

  const customerRows = customerData?.section.table.rows || [];
  const vendorRows = vendorData?.section.table.rows || [];
  const bankAccountRows = bankAccountData?.section.table.rows || [];
  const showCustomerSkeleton = isCustomerLoading && !customerError;
  const showVendorSkeleton = isVendorLoading && !vendorError;
  const showBankAccountSkeleton = isBankAccountLoading && !bankAccountError;
  const customerActiveFilterCount = getCustomerFilterCount(appliedCustomerFilters);
  const customerDraftFilterCount = getCustomerFilterCount(draftCustomerFilters);
  const hasPendingCustomerFilterChanges = !areCustomerFilterStatesEqual(
    appliedCustomerFilters,
    draftCustomerFilters,
  );
  const vendorActiveFilterCount = getVendorFilterCount(appliedVendorFilters);
  const vendorDraftFilterCount = getVendorFilterCount(draftVendorFilters);
  const hasPendingVendorFilterChanges = !areVendorFilterStatesEqual(
    appliedVendorFilters,
    draftVendorFilters,
  );
  const bankAccountActiveFilterCount = getBankAccountFilterCount(appliedBankAccountFilters);
  const bankAccountDraftFilterCount = getBankAccountFilterCount(draftBankAccountFilters);
  const hasPendingBankAccountFilterChanges = !areBankAccountFilterStatesEqual(
    appliedBankAccountFilters,
    draftBankAccountFilters,
  );
  const handleToggleCustomerFilterPanel = () => {
    setIsCustomerFilterPanelOpen((previous) => {
      const nextIsOpen = !previous;

      if (nextIsOpen) {
        setDraftCustomerFilters(appliedCustomerFilters);
      }

      return nextIsOpen;
    });
  };

  const handleToggleVendorFilterPanel = () => {
    setIsVendorFilterPanelOpen((previous) => {
      const nextIsOpen = !previous;

      if (nextIsOpen) {
        setDraftVendorFilters(appliedVendorFilters);
      }

      return nextIsOpen;
    });
  };

  const handleToggleBankAccountFilterPanel = () => {
    setIsBankAccountFilterPanelOpen((previous) => {
      const nextIsOpen = !previous;

      if (nextIsOpen) {
        setDraftBankAccountFilters(appliedBankAccountFilters);
      }

      return nextIsOpen;
    });
  };

  const handleToggleCustomerQuickFilter = (filterKey: CustomerQuickFilterKey) => {
    setCustomerCurrentPage(1);
    setCustomerQuickFilters((previous) =>
      toggleFilterValue(previous, getCustomerQuickFilterValue(filterKey)),
    );
  };

  const handleToggleVendorQuickFilter = (filterKey: VendorQuickFilterKey) => {
    setVendorCurrentPage(1);
    setVendorQuickFilters((previous) =>
      toggleFilterValue(previous, getVendorQuickFilterValue(filterKey)),
    );
  };

  const handleToggleBankAccountQuickFilter = (filterKey: BankAccountQuickFilterKey) => {
    setBankAccountCurrentPage(1);
    setBankAccountQuickFilters((previous) =>
      toggleFilterValue(previous, getBankAccountQuickFilterValue(filterKey)),
    );
  };

  const handleToggleStatusFilter = (status: string) => {
    setDraftCustomerFilters((previous) => ({
      ...previous,
      statuses: toggleFilterValue(previous.statuses, status),
    }));
  };

  const handleToggleCustomerTypeFilter = (customerType: string) => {
    setDraftCustomerFilters((previous) => ({
      ...previous,
      customerTypes: toggleFilterValue(previous.customerTypes, customerType),
    }));
  };

  const handleToggleCreditLimitFilter = () => {
    setDraftCustomerFilters((previous) => ({
      ...previous,
      hasCreditLimit: !previous.hasCreditLimit,
    }));
  };

  const handleToggleVendorStatusFilter = (status: string) => {
    setDraftVendorFilters((previous) => ({
      ...previous,
      statuses: toggleFilterValue(previous.statuses, status),
    }));
  };

  const handleToggleVendorTypeFilter = (vendorType: string) => {
    setDraftVendorFilters((previous) => ({
      ...previous,
      vendorTypes: toggleFilterValue(previous.vendorTypes, vendorType),
    }));
  };

  const handleToggleBankAccountStatusFilter = (status: string) => {
    setDraftBankAccountFilters((previous) => ({
      ...previous,
      statuses: toggleFilterValue(previous.statuses, status),
    }));
  };

  const handleToggleBankAccountTypeFilter = (accountType: string) => {
    setDraftBankAccountFilters((previous) => ({
      ...previous,
      accountTypes: toggleFilterValue(previous.accountTypes, accountType),
    }));
  };

  const handleToggleDefaultReceiptOnlyFilter = () => {
    setDraftBankAccountFilters((previous) => ({
      ...previous,
      defaultReceiptOnly: !previous.defaultReceiptOnly,
    }));
  };

  const handleToggleDefaultDisbursementOnlyFilter = () => {
    setDraftBankAccountFilters((previous) => ({
      ...previous,
      defaultDisbursementOnly: !previous.defaultDisbursementOnly,
    }));
  };

  const handleToggleLedgerMappedOnlyFilter = () => {
    setDraftBankAccountFilters((previous) => ({
      ...previous,
      ledgerMappedOnly: !previous.ledgerMappedOnly,
    }));
  };

  const handleClearCustomerDraftFilters = () => {
    setDraftCustomerFilters({
      statuses: [],
      customerTypes: [],
      hasCreditLimit: false,
    });
  };

  const handleClearVendorDraftFilters = () => {
    setDraftVendorFilters({
      statuses: [],
      vendorTypes: [],
    });
  };

  const handleClearBankAccountDraftFilters = () => {
    setDraftBankAccountFilters({
      statuses: [],
      accountTypes: [],
      defaultReceiptOnly: false,
      defaultDisbursementOnly: false,
      ledgerMappedOnly: false,
    });
  };

  const handleApplyCustomerFilters = () => {
    setCustomerCurrentPage(1);
    setAppliedCustomerFilters(draftCustomerFilters);
    setIsCustomerFilterPanelOpen(false);
  };

  const handleApplyVendorFilters = () => {
    setVendorCurrentPage(1);
    setAppliedVendorFilters(draftVendorFilters);
    setIsVendorFilterPanelOpen(false);
  };

  const handleApplyBankAccountFilters = () => {
    setBankAccountCurrentPage(1);
    setAppliedBankAccountFilters(draftBankAccountFilters);
    setIsBankAccountFilterPanelOpen(false);
  };

  const handleSubmitCustomerSearch = () => {
    setCustomerCurrentPage(1);
    setCustomerSubmittedSearch(customerSearchInput.trim());
  };

  const handleSubmitVendorSearch = () => {
    setVendorCurrentPage(1);
    setVendorSubmittedSearch(vendorSearchInput.trim());
  };

  const handleSubmitBankAccountSearch = () => {
    setBankAccountCurrentPage(1);
    setBankAccountSubmittedSearch(bankAccountSearchInput.trim());
  };

  const handleClearAppliedCustomerFilters = () => {
    const clearedFilters = {
      statuses: [],
      customerTypes: [],
      hasCreditLimit: false,
    };

    setCustomerCurrentPage(1);
    setAppliedCustomerFilters(clearedFilters);
    setDraftCustomerFilters(clearedFilters);
  };

  const handleClearAppliedVendorFilters = () => {
    const clearedFilters = {
      statuses: [],
      vendorTypes: [],
    };

    setVendorCurrentPage(1);
    setAppliedVendorFilters(clearedFilters);
    setDraftVendorFilters(clearedFilters);
  };

  const handleClearAppliedBankAccountFilters = () => {
    const clearedFilters = {
      statuses: [],
      accountTypes: [],
      defaultReceiptOnly: false,
      defaultDisbursementOnly: false,
      ledgerMappedOnly: false,
    };

    setBankAccountCurrentPage(1);
    setAppliedBankAccountFilters(clearedFilters);
    setDraftBankAccountFilters(clearedFilters);
  };

  const handleRefreshCustomers = () => {
    void fetchCustomerRegister({
      search: customerSubmittedSearch,
      page: customerCurrentPage,
      activeFilters: appliedCustomerFilters,
    });
  };

  const handleRefreshVendors = () => {
    void fetchVendorRegister({
      search: vendorSubmittedSearch,
      page: vendorCurrentPage,
      activeFilters: appliedVendorFilters,
    });
  };

  const handleRefreshBankAccounts = () => {
    void fetchBankAccountRegister({
      search: bankAccountSubmittedSearch,
      page: bankAccountCurrentPage,
      activeFilters: appliedBankAccountFilters,
    });
  };

  const handleOpenCustomerCreateModal = () => {
    setCustomerCreateForm({
      ...initialCustomerCreateFormState,
      currencyReference: String(customerData?.referenceData.currencies[0]?.id || ''),
      paymentTermReference: String(customerData?.referenceData.paymentTerms[0]?.id || ''),
    });
    setCustomerCreateError(null);
    setIsCustomerCreateSubmitting(false);
    setIsCustomerCreateModalOpen(true);
  };

  const handleCloseCustomerCreateModal = () => {
    setIsCustomerCreateModalOpen(false);
    setIsCustomerCreateSubmitting(false);
    setCustomerCreateError(null);
    setCustomerCreateForm(initialCustomerCreateFormState);
  };

  const handleOpenVendorCreateModal = () => {
    setVendorCreateForm({
      ...initialVendorCreateFormState,
      currencyReference: String(vendorData?.referenceData.currencies[0]?.id || ''),
      paymentTermReference: String(vendorData?.referenceData.paymentTerms[0]?.id || ''),
    });
    setVendorCreateError(null);
    setIsVendorCreateSubmitting(false);
    setIsVendorCreateModalOpen(true);
  };

  const handleCloseVendorCreateModal = () => {
    setIsVendorCreateModalOpen(false);
    setIsVendorCreateSubmitting(false);
    setVendorCreateError(null);
    setVendorCreateForm(initialVendorCreateFormState);
  };

  const handleOpenBankAccountCreateModal = () => {
    setBankAccountCreateForm({
      ...initialBankAccountCreateFormState,
      currencyReference: String(bankAccountData?.referenceData.currencies[0]?.id || ''),
      ledgerAccount: String(bankAccountData?.referenceData.ledgerAccounts[0]?.id || ''),
    });
    setBankAccountCreateError(null);
    setIsBankAccountCreateSubmitting(false);
    setIsBankAccountCreateModalOpen(true);
  };

  const handleCloseBankAccountCreateModal = () => {
    setIsBankAccountCreateModalOpen(false);
    setIsBankAccountCreateSubmitting(false);
    setBankAccountCreateError(null);
    setBankAccountCreateForm(initialBankAccountCreateFormState);
  };

  const handleCreateCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCustomerCreateError(null);
    setIsCustomerCreateSubmitting(true);

    try {
      const payload: CreateCustomerInput = {
        customerCode: customerCreateForm.customerCode || null,
        displayName: customerCreateForm.displayName,
        legalName: customerCreateForm.legalName || null,
        customerType: customerCreateForm.customerType,
        email: customerCreateForm.email || null,
        phone: customerCreateForm.phone || null,
        billingAddress: customerCreateForm.billingAddress || null,
        shippingAddress: customerCreateForm.shippingAddress || null,
        taxId: customerCreateForm.taxId || null,
        creditLimit: Number.isFinite(Number(customerCreateForm.creditLimit))
          ? Number(customerCreateForm.creditLimit)
          : 0,
        status: customerCreateForm.status,
        notes: customerCreateForm.notes || null,
        currencyReference:
          normalizeRelationshipValue(customerCreateForm.currencyReference) || customerCreateForm.currencyReference,
        paymentTermReference:
          normalizeRelationshipValue(customerCreateForm.paymentTermReference) ||
          customerCreateForm.paymentTermReference,
      };

      const created = await createCustomer(payload);
      handleCloseCustomerCreateModal();
      setCustomerCurrentPage(1);
      await fetchCustomerRegister({
        search: customerSubmittedSearch,
        page: 1,
        activeFilters: appliedCustomerFilters,
      });
      await handleViewCustomer(created.id);
    } catch (error) {
      setCustomerCreateError(error instanceof Error ? error.message : 'Unable to create customer.');
      setIsCustomerCreateSubmitting(false);
    }
  };

  const handleOpenCustomerEditModal = async (customerId: number | string) => {
    closeDetailModal();
    setEditingCustomerId(customerId);
    setCustomerEditForm(initialCustomerCreateFormState);
    setCustomerEditError(null);
    setIsCustomerEditSubmitting(false);
    setIsCustomerEditLoading(true);
    setIsCustomerEditModalOpen(true);

    try {
      const payload = await getCustomerDetail(customerId);
      setCustomerEditForm(mapCustomerDetailToFormState(payload));
    } catch (error) {
      setCustomerEditError(error instanceof Error ? error.message : 'Unable to load customer for editing.');
    } finally {
      setIsCustomerEditLoading(false);
    }
  };

  const handleCloseCustomerEditModal = () => {
    setIsCustomerEditModalOpen(false);
    setIsCustomerEditLoading(false);
    setIsCustomerEditSubmitting(false);
    setCustomerEditError(null);
    setEditingCustomerId(null);
    setCustomerEditForm(initialCustomerCreateFormState);
  };

  const handleEditCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingCustomerId === null) {
      setCustomerEditError('No customer selected for editing.');
      return;
    }

    setCustomerEditError(null);
    setIsCustomerEditSubmitting(true);

    try {
      const payload = {
        customerCode: customerEditForm.customerCode || null,
        displayName: customerEditForm.displayName,
        legalName: customerEditForm.legalName || null,
        customerType: customerEditForm.customerType,
        email: customerEditForm.email || null,
        phone: customerEditForm.phone || null,
        billingAddress: customerEditForm.billingAddress || null,
        shippingAddress: customerEditForm.shippingAddress || null,
        taxId: customerEditForm.taxId || null,
        creditLimit: Number.isFinite(Number(customerEditForm.creditLimit))
          ? Number(customerEditForm.creditLimit)
          : 0,
        status: customerEditForm.status,
        notes: customerEditForm.notes || null,
        currencyReference:
          normalizeRelationshipValue(customerEditForm.currencyReference) || customerEditForm.currencyReference,
        paymentTermReference:
          normalizeRelationshipValue(customerEditForm.paymentTermReference) ||
          customerEditForm.paymentTermReference,
      };

      const updated = await updateCustomer(editingCustomerId, payload);
      handleCloseCustomerEditModal();
      await fetchCustomerRegister({
        search: customerSubmittedSearch,
        page: customerCurrentPage,
        activeFilters: appliedCustomerFilters,
      });
      await handleViewCustomer(updated.id);
    } catch (error) {
      setCustomerEditError(error instanceof Error ? error.message : 'Unable to update customer.');
      setIsCustomerEditSubmitting(false);
    }
  };


  const handleCreateVendor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVendorCreateError(null);
    setIsVendorCreateSubmitting(true);

    try {
      const payload: CreateVendorInput = {
        vendorCode: vendorCreateForm.vendorCode || null,
        displayName: vendorCreateForm.displayName,
        legalName: vendorCreateForm.legalName || null,
        vendorType: vendorCreateForm.vendorType,
        email: vendorCreateForm.email || null,
        phone: vendorCreateForm.phone || null,
        billingAddress: vendorCreateForm.billingAddress || null,
        taxId: vendorCreateForm.taxId || null,
        status: vendorCreateForm.status,
        notes: vendorCreateForm.notes || null,
        currencyReference:
          normalizeRelationshipValue(vendorCreateForm.currencyReference) || vendorCreateForm.currencyReference,
        paymentTermReference:
          normalizeRelationshipValue(vendorCreateForm.paymentTermReference) ||
          vendorCreateForm.paymentTermReference,
      };

      const created = await createVendor(payload);
      handleCloseVendorCreateModal();
      setVendorCurrentPage(1);
      await fetchVendorRegister({
        search: vendorSubmittedSearch,
        page: 1,
        activeFilters: appliedVendorFilters,
      });
      await handleViewVendor(created.id);
    } catch (error) {
      setVendorCreateError(error instanceof Error ? error.message : 'Unable to create vendor.');
      setIsVendorCreateSubmitting(false);
    }
  };

  const handleOpenVendorEditModal = async (vendorId: number | string) => {
    closeVendorDetailModal();
    setEditingVendorId(vendorId);
    setVendorEditForm(initialVendorCreateFormState);
    setVendorEditError(null);
    setIsVendorEditSubmitting(false);
    setIsVendorEditLoading(true);
    setIsVendorEditModalOpen(true);

    try {
      const payload = await getVendorDetail(vendorId);
      setVendorEditForm(mapVendorDetailToFormState(payload));
    } catch (error) {
      setVendorEditError(error instanceof Error ? error.message : 'Unable to load vendor for editing.');
    } finally {
      setIsVendorEditLoading(false);
    }
  };

  const handleCloseVendorEditModal = () => {
    setIsVendorEditModalOpen(false);
    setIsVendorEditLoading(false);
    setIsVendorEditSubmitting(false);
    setVendorEditError(null);
    setEditingVendorId(null);
    setVendorEditForm(initialVendorCreateFormState);
  };

  const handleEditVendor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingVendorId === null) {
      setVendorEditError('No vendor selected for editing.');
      return;
    }

    setVendorEditError(null);
    setIsVendorEditSubmitting(true);

    try {
      const payload: UpdateVendorInput = {
        vendorCode: vendorEditForm.vendorCode || null,
        displayName: vendorEditForm.displayName,
        legalName: vendorEditForm.legalName || null,
        vendorType: vendorEditForm.vendorType,
        email: vendorEditForm.email || null,
        phone: vendorEditForm.phone || null,
        billingAddress: vendorEditForm.billingAddress || null,
        taxId: vendorEditForm.taxId || null,
        status: vendorEditForm.status,
        notes: vendorEditForm.notes || null,
        currencyReference:
          normalizeRelationshipValue(vendorEditForm.currencyReference) || vendorEditForm.currencyReference,
        paymentTermReference:
          normalizeRelationshipValue(vendorEditForm.paymentTermReference) ||
          vendorEditForm.paymentTermReference,
      };

      const updated = await updateVendor(editingVendorId, payload);
      handleCloseVendorEditModal();
      await fetchVendorRegister({
        search: vendorSubmittedSearch,
        page: vendorCurrentPage,
        activeFilters: appliedVendorFilters,
      });
      await handleViewVendor(updated.id);
    } catch (error) {
      setVendorEditError(error instanceof Error ? error.message : 'Unable to update vendor.');
      setIsVendorEditSubmitting(false);
    }
  };

  const handleOpenBankAccountEditModal = async (bankAccountId: number | string) => {
    closeBankAccountDetailModal();
    setEditingBankAccountId(bankAccountId);
    setBankAccountEditForm(initialBankAccountCreateFormState);
    setBankAccountEditError(null);
    setIsBankAccountEditSubmitting(false);
    setIsBankAccountEditLoading(true);
    setIsBankAccountEditModalOpen(true);

    try {
      const payload = await getBankAccountDetail(bankAccountId);
      setBankAccountEditForm(mapBankAccountDetailToFormState(payload));
    } catch (error) {
      setBankAccountEditError(error instanceof Error ? error.message : 'Unable to load bank account for editing.');
    } finally {
      setIsBankAccountEditLoading(false);
    }
  };

  const handleCloseBankAccountEditModal = () => {
    setIsBankAccountEditModalOpen(false);
    setIsBankAccountEditLoading(false);
    setIsBankAccountEditSubmitting(false);
    setBankAccountEditError(null);
    setEditingBankAccountId(null);
    setBankAccountEditForm(initialBankAccountCreateFormState);
  };

  const handleEditBankAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingBankAccountId === null) {
      setBankAccountEditError('No bank account selected for editing.');
      return;
    }

    setBankAccountEditError(null);
    setIsBankAccountEditSubmitting(true);

    try {
      const payload: UpdateBankAccountInput = {
        accountName: bankAccountEditForm.accountName,
        accountNumberMasked: bankAccountEditForm.accountNumberMasked || null,
        bankName: bankAccountEditForm.bankName || null,
        branchName: bankAccountEditForm.branchName || null,
        accountType: bankAccountEditForm.accountType,
        isDefaultReceiptAccount: bankAccountEditForm.isDefaultReceiptAccount,
        isDefaultDisbursementAccount: bankAccountEditForm.isDefaultDisbursementAccount,
        isActive: bankAccountEditForm.isActive,
        notes: bankAccountEditForm.notes || null,
        currencyReference:
          normalizeRelationshipValue(bankAccountEditForm.currencyReference) || bankAccountEditForm.currencyReference,
        ledgerAccount:
          normalizeRelationshipValue(bankAccountEditForm.ledgerAccount) || bankAccountEditForm.ledgerAccount,
      };

      const updated = await updateBankAccount(editingBankAccountId, payload);
      handleCloseBankAccountEditModal();
      await fetchBankAccountRegister({
        search: bankAccountSubmittedSearch,
        page: bankAccountCurrentPage,
        activeFilters: appliedBankAccountFilters,
      });
      await handleViewBankAccount(updated.id);
    } catch (error) {
      setBankAccountEditError(error instanceof Error ? error.message : 'Unable to update bank account.');
      setIsBankAccountEditSubmitting(false);
    }
  };

  const handleCreateBankAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBankAccountCreateError(null);
    setIsBankAccountCreateSubmitting(true);

    try {
      const payload: CreateBankAccountInput = {
        accountName: bankAccountCreateForm.accountName,
        accountNumberMasked: bankAccountCreateForm.accountNumberMasked || null,
        bankName: bankAccountCreateForm.bankName || null,
        branchName: bankAccountCreateForm.branchName || null,
        accountType: bankAccountCreateForm.accountType,
        currencyReference:
          normalizeRelationshipValue(bankAccountCreateForm.currencyReference) ||
          bankAccountCreateForm.currencyReference,
        ledgerAccount:
          normalizeRelationshipValue(bankAccountCreateForm.ledgerAccount) || bankAccountCreateForm.ledgerAccount,
        isDefaultReceiptAccount: bankAccountCreateForm.isDefaultReceiptAccount,
        isDefaultDisbursementAccount: bankAccountCreateForm.isDefaultDisbursementAccount,
        isActive: bankAccountCreateForm.isActive,
        notes: bankAccountCreateForm.notes || null,
      };

      const created = await createBankAccount(payload);
      handleCloseBankAccountCreateModal();
      setBankAccountCurrentPage(1);
      await fetchBankAccountRegister({
        search: bankAccountSubmittedSearch,
        page: 1,
        activeFilters: appliedBankAccountFilters,
      });
      await handleViewBankAccount(created.id);
    } catch (error) {
      setBankAccountCreateError(error instanceof Error ? error.message : 'Unable to create bank account.');
      setIsBankAccountCreateSubmitting(false);
    }
  };

  const handleExportCustomers = () => {
    if (!customerRows.length) {
      return;
    }

    const csvRows = [
      ['Customer Code', 'Display Name', 'Type', 'Currency', 'Payment Terms', 'Status'],
      ...customerRows.map((row) => [
        row.customerCode,
        row.displayName,
        row.typeLabel,
        row.currency,
        row.paymentTerms,
        row.statusLabel,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'customer-master-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleExportVendors = () => {
    if (!vendorRows.length) {
      return;
    }

    const csvRows = [
      ['Vendor Code', 'Display Name', 'Type', 'Currency', 'Payment Terms', 'Status'],
      ...vendorRows.map((row) => [
        row.vendorCode,
        row.displayName,
        row.typeLabel,
        row.currency,
        row.paymentTerms,
        row.statusLabel,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'vendor-master-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleExportBankAccounts = () => {
    if (!bankAccountRows.length) {
      return;
    }

    const csvRows = [
      ['Account Name', 'Bank Name', 'Type', 'Currency', 'Ledger Account', 'Status'],
      ...bankAccountRows.map((row) => [
        row.accountName,
        row.bankName,
        row.typeLabel,
        row.currency,
        row.ledgerAccountDisplay,
        row.statusLabel,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'bank-account-master-register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleViewCustomer = async (customerId: number | string) => {
    setSelectedBankAccountId(null);
    setSelectedBankAccount(null);
    setBankAccountDetailError(null);
    setIsBankAccountDetailLoading(false);
    setSelectedVendorId(null);
    setSelectedVendor(null);
    setVendorDetailError(null);
    setIsVendorDetailLoading(false);
    setSelectedCustomerId(customerId);
    setSelectedCustomer(null);
    setCustomerDetailError(null);
    setIsCustomerDetailLoading(true);

    try {
      const payload = await getCustomerDetail(customerId);
      setSelectedCustomer(payload);
    } catch (error) {
      setCustomerDetailError(error instanceof Error ? error.message : 'Unable to load customer details.');
    } finally {
      setIsCustomerDetailLoading(false);
    }
  };

  const handleOpenCustomerDeleteModal = async (customerId: number | string, customerName: string) => {
    setCustomerDeleteError(null);
    setCustomerDeleteBlockers([]);
    setDeletingCustomerId(customerId);
    setDeletingCustomerName(customerName);
    setIsCustomerDeleteSubmitting(false);
    setIsCustomerDeleteModalOpen(true);

    try {
      const detail = await getCustomerDetail(customerId);
      const blockers: string[] = [];

      if (detail?.usageSummary?.invoiceCount && detail.usageSummary.invoiceCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.invoiceCount} invoice(s)`);
      }

      if (detail?.usageSummary?.paymentReceivedCount && detail.usageSummary.paymentReceivedCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.paymentReceivedCount} payment(s) received`);
      }

      if (detail?.usageSummary?.creditNoteCount && detail.usageSummary.creditNoteCount > 0) {
        blockers.push(`Referenced by ${detail.usageSummary.creditNoteCount} credit note(s)`);
      }

      setCustomerDeleteBlockers(blockers);
    } catch {
      setCustomerDeleteBlockers([]);
    }
  };

  const handleCloseCustomerDeleteModal = () => {
    setIsCustomerDeleteModalOpen(false);
    setDeletingCustomerId(null);
    setDeletingCustomerName('');
    setIsCustomerDeleteSubmitting(false);
    setCustomerDeleteError(null);
    setCustomerDeleteBlockers([]);
  };

  const handleConfirmCustomerDelete = async () => {
    if (deletingCustomerId === null) return;

    setIsCustomerDeleteSubmitting(true);
    setCustomerDeleteError(null);

    try {
      await deleteCustomer(deletingCustomerId);
      handleCloseCustomerDeleteModal();
      await fetchCustomerRegister({
        search: customerSubmittedSearch,
        page: customerCurrentPage,
        activeFilters: appliedCustomerFilters,
      });
    } catch (error) {
      setCustomerDeleteError(error instanceof Error ? error.message : 'Unable to delete customer.');
      setIsCustomerDeleteSubmitting(false);
    }
  };

  const handleOpenVendorDeleteModal = async (vendorId: number | string, vendorName: string) => {
    setDeletingVendorId(vendorId);
    setDeletingVendorName(vendorName);
    setVendorDeleteError(null);
    setVendorDeleteBlockers([]);
    setIsVendorDeleteSubmitting(false);
    setIsVendorDeleteModalOpen(true);

    try {
      const detail = await getVendorDetail(vendorId);
      const blockers: string[] = [];
      const summary = (detail as VendorDetail).usageSummary;

      if (summary) {
        if (summary.billCount > 0) blockers.push(`Referenced by ${summary.billCount} bill(s)`);
        if (summary.paymentMadeCount > 0) blockers.push(`Referenced by ${summary.paymentMadeCount} payment(s) made`);
        if (summary.vendorCreditCount > 0) blockers.push(`Referenced by ${summary.vendorCreditCount} vendor credit(s)`);
        if (summary.expenseCount > 0) blockers.push(`Referenced by ${summary.expenseCount} expense(s)`);
      }

      setVendorDeleteBlockers(blockers);
      setIsVendorDeleteSubmitting(false);
    } catch (error) {
      setVendorDeleteError(error instanceof Error ? error.message : 'Unable to check vendor dependencies.');
      setIsVendorDeleteSubmitting(false);
    }
  };

  const handleCloseVendorDeleteModal = () => {
    setIsVendorDeleteModalOpen(false);
    setDeletingVendorId(null);
    setDeletingVendorName('');
    setVendorDeleteError(null);
    setVendorDeleteBlockers([]);
    setIsVendorDeleteSubmitting(false);
  };

  const handleConfirmVendorDelete = async () => {
    if (deletingVendorId === null) return;

    setIsVendorDeleteSubmitting(true);
    setVendorDeleteError(null);

    try {
      await deleteVendor(deletingVendorId);
      handleCloseVendorDeleteModal();
      await fetchVendorRegister({
        search: vendorSubmittedSearch,
        page: vendorCurrentPage,
        activeFilters: appliedVendorFilters,
      });
    } catch (error) {
      setVendorDeleteError(error instanceof Error ? error.message : 'Unable to delete vendor.');
      setIsVendorDeleteSubmitting(false);
    }
  };

  const handleOpenBankAccountDeleteModal = async (bankAccountId: number | string, bankAccountName: string) => {
    setDeletingBankAccountId(bankAccountId);
    setDeletingBankAccountName(bankAccountName);
    setBankAccountDeleteError(null);
    setBankAccountDeleteBlockers([]);
    setIsBankAccountDeleteSubmitting(false);
    setIsBankAccountDeleteModalOpen(true);

    try {
      const detail = await getBankAccountDetail(bankAccountId);
      const blockers: string[] = [];
      const summary = (detail as BankAccountDetail).usageSummary;

      if (summary) {
        if (summary.bankTransactionCount > 0) blockers.push(`Referenced by ${summary.bankTransactionCount} bank transaction(s)`);
        if (summary.bankReconciliationCount > 0) blockers.push(`Referenced by ${summary.bankReconciliationCount} bank reconciliation(s)`);
        if (summary.paymentMadeCount > 0) blockers.push(`Referenced by ${summary.paymentMadeCount} payment(s) made`);
        if (summary.paymentReceivedCount > 0) blockers.push(`Referenced by ${summary.paymentReceivedCount} payment(s) received`);
        if (summary.depositCount > 0) blockers.push(`Referenced by ${summary.depositCount} deposit(s)`);
      }

      setBankAccountDeleteBlockers(blockers);
      setIsBankAccountDeleteSubmitting(false);
    } catch (error) {
      setBankAccountDeleteError(error instanceof Error ? error.message : 'Unable to check bank account dependencies.');
      setIsBankAccountDeleteSubmitting(false);
    }
  };

  const handleCloseBankAccountDeleteModal = () => {
    setIsBankAccountDeleteModalOpen(false);
    setDeletingBankAccountId(null);
    setDeletingBankAccountName('');
    setBankAccountDeleteError(null);
    setBankAccountDeleteBlockers([]);
    setIsBankAccountDeleteSubmitting(false);
  };

  const handleConfirmBankAccountDelete = async () => {
    if (deletingBankAccountId === null) return;

    setIsBankAccountDeleteSubmitting(true);
    setBankAccountDeleteError(null);

    try {
      await deleteBankAccount(deletingBankAccountId);
      handleCloseBankAccountDeleteModal();
      await fetchBankAccountRegister({
        search: bankAccountSubmittedSearch,
        page: bankAccountCurrentPage,
        activeFilters: appliedBankAccountFilters,
      });
    } catch (error) {
      setBankAccountDeleteError(error instanceof Error ? error.message : 'Unable to delete bank account.');
      setIsBankAccountDeleteSubmitting(false);
    }
  };

  const handleViewVendor = async (vendorId: number | string) => {
    setSelectedBankAccountId(null);
    setSelectedBankAccount(null);
    setBankAccountDetailError(null);
    setIsBankAccountDetailLoading(false);
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    setCustomerDetailError(null);
    setIsCustomerDetailLoading(false);
    setSelectedVendorId(vendorId);
    setSelectedVendor(null);
    setVendorDetailError(null);
    setIsVendorDetailLoading(true);

    try {
      const payload = await getVendorDetail(vendorId);
      setSelectedVendor(payload);
    } catch (error) {
      setVendorDetailError(error instanceof Error ? error.message : 'Unable to load vendor details.');
    } finally {
      setIsVendorDetailLoading(false);
    }
  };

  const handleViewBankAccount = async (bankAccountId: number | string) => {
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    setCustomerDetailError(null);
    setIsCustomerDetailLoading(false);
    setSelectedVendorId(null);
    setSelectedVendor(null);
    setVendorDetailError(null);
    setIsVendorDetailLoading(false);
    setSelectedBankAccountId(bankAccountId);
    setSelectedBankAccount(null);
    setBankAccountDetailError(null);
    setIsBankAccountDetailLoading(true);

    try {
      const payload = await getBankAccountDetail(bankAccountId);
      setSelectedBankAccount(payload);
    } catch (error) {
      setBankAccountDetailError(error instanceof Error ? error.message : 'Unable to load bank account details.');
    } finally {
      setIsBankAccountDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    setCustomerDetailError(null);
    setIsCustomerDetailLoading(false);
  };

  const closeVendorDetailModal = () => {
    setSelectedVendorId(null);
    setSelectedVendor(null);
    setVendorDetailError(null);
    setIsVendorDetailLoading(false);
  };

  const closeBankAccountDetailModal = () => {
    setSelectedBankAccountId(null);
    setSelectedBankAccount(null);
    setBankAccountDetailError(null);
    setIsBankAccountDetailLoading(false);
  };

  const handleTabChange = (tabId: BusinessPartiesTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
              <h1 className="text-2xl font-bold text-gray-900">{PAGE_TITLE}</h1>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">{PAGE_DESCRIPTION}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={
              activeTab === 'customers'
                ? handleRefreshCustomers
                : activeTab === 'vendors'
                  ? handleRefreshVendors
                  : handleRefreshBankAccounts
            }
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                activeTab === 'customers'
                  ? isCustomerLoading
                    ? 'animate-spin'
                    : ''
                  : activeTab === 'vendors'
                    ? isVendorLoading
                      ? 'animate-spin'
                      : ''
                    : isBankAccountLoading
                      ? 'animate-spin'
                      : ''
              }`}
            />
            Refresh Workspace
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {(['customers', 'vendors', 'bank-accounts'] as const).map((tabId) => {
              const label =
                tabId === 'customers' ? 'Customers' : tabId === 'vendors' ? 'Vendors' : 'Bank Accounts';
              const isActive = activeTab === tabId;

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => handleTabChange(tabId)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'customers' ? (
          <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {customerData?.section.label || 'Customers'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {customerData?.section.description ||
                    'Manage customer master records with codes, type, contacts, tax profile, currency, terms, and credit limit.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCustomerCreateModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Customer
                </button>
                <button
                  type="button"
                  onClick={handleRefreshCustomers}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isCustomerLoading ? 'animate-spin' : ''}`} />
                  Refresh Customers
                </button>
                <button
                  type="button"
                  onClick={handleExportCustomers}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!customerRows.length}
                >
                  <Download className="h-4 w-4" />
                  Download View
                </button>
              </div>
            </div>

            {showCustomerSkeleton ? (
              <RegisterSkeleton
                columns={
                  customerData?.section.table.columns || [
                    'Customer Code',
                    'Display Name',
                    'Type',
                    'Currency',
                    'Payment Terms',
                    'Status',
                  ]
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  {(customerData?.section.metrics || []).map((metric) => {
                    const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
                    return (
                      <div key={metric.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(metric.trend)}`}
                          >
                            <TrendIcon className="h-3.5 w-3.5" />
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSubmitCustomerSearch();
                    }}
                    className="flex min-w-0 max-w-xl flex-1 gap-3"
                  >
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={customerSearchInput}
                        onChange={(event) => {
                          setCustomerSearchInput(event.target.value);
                        }}
                        placeholder={
                          customerData?.section.searchPlaceholder ||
                          'Search customer code, display name, type, email, or status'
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={handleToggleCustomerFilterPanel}
                    aria-expanded={isCustomerFilterPanelOpen}
                    aria-controls="customer-filter-panel"
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      isCustomerFilterPanelOpen || customerActiveFilterCount > 0
                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {customerActiveFilterCount > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {customerActiveFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(customerQuickFilterConfig) as CustomerQuickFilterKey[]).map((filterKey) => {
                    const isActive = isCustomerQuickFilterActive(filterKey, customerQuickFilters);
                    return (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => handleToggleCustomerQuickFilter(filterKey)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {customerQuickFilterConfig[filterKey].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 p-5">
                {isCustomerFilterPanelOpen ? (
                  <div
                    id="customer-filter-panel"
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Customer Filters</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Select as many filter values as needed, then apply them in one step.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleClearCustomerDraftFilters}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={customerDraftFilterCount === 0}
                        >
                          Clear Selections
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyCustomerFilters}
                          className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                          disabled={!hasPendingCustomerFilterChanges}
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                        <div className="mt-3 space-y-2">
                          {(customerData?.section.filters.statuses || []).map((option) => (
                            <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={draftCustomerFilters.statuses.includes(option.value)}
                                onChange={() => handleToggleStatusFilter(option.value)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer Type</p>
                        <div className="mt-3 space-y-2">
                          {(customerData?.section.filters.customerTypes || []).map((option) => (
                            <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={draftCustomerFilters.customerTypes.includes(option.value)}
                                onChange={() => handleToggleCustomerTypeFilter(option.value)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Other</p>
                        <div className="mt-3 space-y-2">
                          <label className="flex items-center gap-3 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={draftCustomerFilters.hasCreditLimit}
                              onChange={handleToggleCreditLimitFilter}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>With Credit Limit</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    {hasPendingCustomerFilterChanges ? (
                      <p className="mt-4 text-sm text-amber-700">
                        You have unapplied filter changes. Click Apply Filters to update the register.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {customerData?.section.table.title || 'Customer Master Register'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {customerData?.section.table.description ||
                        'Customer records using customer code, type, currency, payment terms, and status.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{customerData?.totals.filteredCustomers ?? 0} matching customers</span>
                    {customerActiveFilterCount > 0 ? (
                      <button
                        type="button"
                        onClick={handleClearAppliedCustomerFilters}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Clear Applied Filters
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleExportCustomers}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!customerRows.length}
                    >
                      <Download className="h-4 w-4" />
                      Export View
                    </button>
                  </div>
                </div>

                {customerError ? (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                    <div>
                      <p className="font-medium">Unable to load the customer register.</p>
                      <p className="mt-1">{customerError}</p>
                    </div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {(customerData?.section.table.columns || [
                            'Customer Code',
                            'Display Name',
                            'Type',
                            'Currency',
                            'Payment Terms',
                            'Status',
                          ]).map((column) => (
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
                        {customerRows.length ? (
                          customerRows.map((row) => (
                            <tr key={String(row.id)} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                {row.customerCode || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{row.displayName || '-'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {row.typeLabel || '-'}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{row.currency || '-'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                {row.paymentTerms || '-'}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(row.status)}`}
                                >
                                  {row.statusLabel || row.status || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handleOpenCustomerEditModal(row.customerId)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleOpenCustomerDeleteModal(row.customerId, row.displayName || `Customer #${row.customerId}`)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleViewCustomer(row.customerId)}
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
                            <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                              No customers match the current search and filter combination.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Page {customerData?.pagination.page || 1} of {customerData?.pagination.totalPages || 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerCurrentPage((previous) => Math.max(1, previous - 1))}
                      disabled={!customerData?.pagination.hasPrevPage || isCustomerLoading}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerCurrentPage((previous) => previous + 1)}
                      disabled={!customerData?.pagination.hasNextPage || isCustomerLoading}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'vendors' ? (
          <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{vendorData?.section.label || 'Vendors'}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {vendorData?.section.description ||
                    'Manage vendor master records with codes, type, contacts, tax profile, currency, payment terms, and status.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenVendorCreateModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Vendor
                </button>
                <button
                  type="button"
                  onClick={handleRefreshVendors}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isVendorLoading ? 'animate-spin' : ''}`} />
                  Refresh Vendors
                </button>
                <button
                  type="button"
                  onClick={handleExportVendors}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!vendorRows.length}
                >
                  <Download className="h-4 w-4" />
                  Download View
                </button>
              </div>
            </div>

            {showVendorSkeleton ? (
              <RegisterSkeleton
                columns={
                  vendorData?.section.table.columns || [
                    'Vendor Code',
                    'Display Name',
                    'Type',
                    'Currency',
                    'Payment Terms',
                    'Status',
                  ]
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  {(vendorData?.section.metrics || []).map((metric) => {
                    const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
                    return (
                      <div key={metric.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(metric.trend)}`}
                          >
                            <TrendIcon className="h-3.5 w-3.5" />
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSubmitVendorSearch();
                        }}
                        className="flex min-w-0 max-w-xl flex-1 gap-3"
                      >
                        <div className="relative min-w-0 flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={vendorSearchInput}
                            onChange={(event) => {
                              setVendorSearchInput(event.target.value);
                            }}
                            placeholder={
                              vendorData?.section.searchPlaceholder ||
                              'Search vendor code, display name, type, email, or status'
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                        >
                          <Search className="h-4 w-4" />
                          Search
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={handleToggleVendorFilterPanel}
                        aria-expanded={isVendorFilterPanelOpen}
                        aria-controls="vendor-filter-panel"
                        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                          isVendorFilterPanelOpen || vendorActiveFilterCount > 0
                            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                        {vendorActiveFilterCount > 0 ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {vendorActiveFilterCount}
                          </span>
                        ) : null}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(vendorQuickFilterConfig) as VendorQuickFilterKey[]).map((filterKey) => {
                        const isActive = isVendorQuickFilterActive(filterKey, vendorQuickFilters);
                        return (
                          <button
                            key={filterKey}
                            type="button"
                            onClick={() => handleToggleVendorQuickFilter(filterKey)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {vendorQuickFilterConfig[filterKey].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    {isVendorFilterPanelOpen ? (
                      <div id="vendor-filter-panel" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Vendor Filters</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              Select as many filter values as needed, then apply them in one step.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleClearVendorDraftFilters}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={vendorDraftFilterCount === 0}
                            >
                              Clear Selections
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyVendorFilters}
                              className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                              disabled={!hasPendingVendorFilterChanges}
                            >
                              Apply Filters
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                            <div className="mt-3 space-y-2">
                              {(vendorData?.section.filters.statuses || []).map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftVendorFilters.statuses.includes(option.value)}
                                    onChange={() => handleToggleVendorStatusFilter(option.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor Type</p>
                            <div className="mt-3 space-y-2">
                              {(vendorData?.section.filters.vendorTypes || []).map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftVendorFilters.vendorTypes.includes(option.value)}
                                    onChange={() => handleToggleVendorTypeFilter(option.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        {hasPendingVendorFilterChanges ? (
                          <p className="mt-4 text-sm text-amber-700">
                            You have unapplied filter changes. Click Apply Filters to update the register.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {vendorData?.section.table.title || 'Vendor Master Register'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {vendorData?.section.table.description ||
                            'Vendor records using vendor code, type, currency, payment terms, and status.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>{vendorData?.totals.filteredVendors ?? 0} matching vendors</span>
                        {vendorActiveFilterCount > 0 ? (
                          <button
                            type="button"
                            onClick={handleClearAppliedVendorFilters}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            Clear Applied Filters
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleExportVendors}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!vendorRows.length}
                        >
                          <Download className="h-4 w-4" />
                          Export View
                        </button>
                      </div>
                    </div>

                    {vendorError ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                        <div>
                          <p className="font-medium">Unable to load the vendor register.</p>
                          <p className="mt-1">{vendorError}</p>
                        </div>
                      </div>
                    ) : null}

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {(vendorData?.section.table.columns || [
                                'Vendor Code',
                                'Display Name',
                                'Type',
                                'Currency',
                                'Payment Terms',
                                'Status',
                              ]).map((column) => (
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
                            {vendorRows.length ? (
                              vendorRows.map((row) => (
                                <tr key={String(row.id)} className="hover:bg-gray-50">
                                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                    {row.vendorCode || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{row.displayName || '-'}</td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.typeLabel || '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.currency || '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.paymentTerms || '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(row.status)}`}
                                    >
                                      {row.statusLabel || row.status || '-'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => void handleOpenVendorEditModal(row.vendorId)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleOpenVendorDeleteModal(row.vendorId, row.displayName || `Vendor #${row.vendorId}`)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleViewVendor(row.vendorId)}
                                        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                                  No vendors match the current search and filter combination.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Page {vendorData?.pagination.page || 1} of {vendorData?.pagination.totalPages || 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVendorCurrentPage((previous) => Math.max(1, previous - 1))}
                          disabled={!vendorData?.pagination.hasPrevPage || isVendorLoading}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setVendorCurrentPage((previous) => previous + 1)}
                          disabled={!vendorData?.pagination.hasNextPage || isVendorLoading}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'bank-accounts' ? (
          <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {bankAccountData?.section.label || 'Bank Accounts'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {bankAccountData?.section.description ||
                    'Manage bank, cash on hand, and undeposited funds accounts used across treasury and accounting workflows.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenBankAccountCreateModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Bank Account
                </button>
                <button
                  type="button"
                  onClick={handleRefreshBankAccounts}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isBankAccountLoading ? 'animate-spin' : ''}`} />
                  Refresh Bank Accounts
                </button>
                <button
                  type="button"
                  onClick={handleExportBankAccounts}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!bankAccountRows.length}
                >
                  <Download className="h-4 w-4" />
                  Download View
                </button>
              </div>
            </div>

            {showBankAccountSkeleton ? (
              <RegisterSkeleton
                columns={
                  bankAccountData?.section.table.columns || [
                    'Account Name',
                    'Bank Name',
                    'Type',
                    'Currency',
                    'Ledger Account',
                    'Status',
                  ]
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  {(bankAccountData?.section.metrics || []).map((metric) => {
                    const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;
                    return (
                      <div key={metric.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(metric.trend)}`}
                          >
                            <TrendIcon className="h-3.5 w-3.5" />
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSubmitBankAccountSearch();
                        }}
                        className="flex min-w-0 max-w-xl flex-1 gap-3"
                      >
                        <div className="relative min-w-0 flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={bankAccountSearchInput}
                            onChange={(event) => {
                              setBankAccountSearchInput(event.target.value);
                            }}
                            placeholder={
                              bankAccountData?.section.searchPlaceholder ||
                              'Search account name, bank name, type, currency, ledger account, or status'
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
                        >
                          <Search className="h-4 w-4" />
                          Search
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={handleToggleBankAccountFilterPanel}
                        aria-expanded={isBankAccountFilterPanelOpen}
                        aria-controls="bank-account-filter-panel"
                        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                          isBankAccountFilterPanelOpen || bankAccountActiveFilterCount > 0
                            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                        {bankAccountActiveFilterCount > 0 ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {bankAccountActiveFilterCount}
                          </span>
                        ) : null}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(bankAccountQuickFilterConfig) as BankAccountQuickFilterKey[]).map((filterKey) => {
                        const isActive = isBankAccountQuickFilterActive(filterKey, bankAccountQuickFilters);
                        return (
                          <button
                            key={filterKey}
                            type="button"
                            onClick={() => handleToggleBankAccountQuickFilter(filterKey)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {bankAccountQuickFilterConfig[filterKey].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    {isBankAccountFilterPanelOpen ? (
                      <div
                        id="bank-account-filter-panel"
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Bank Account Filters</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              Select as many filter values as needed, then apply them in one step.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleClearBankAccountDraftFilters}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={bankAccountDraftFilterCount === 0}
                            >
                              Clear Selections
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyBankAccountFilters}
                              className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                              disabled={!hasPendingBankAccountFilterChanges}
                            >
                              Apply Filters
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                            <div className="mt-3 space-y-2">
                              {(bankAccountData?.section.filters.statuses || []).map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftBankAccountFilters.statuses.includes(option.value)}
                                    onChange={() => handleToggleBankAccountStatusFilter(option.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Type</p>
                            <div className="mt-3 space-y-2">
                              {(bankAccountData?.section.filters.accountTypes || []).map((option) => (
                                <label key={option.value} className="flex items-center gap-3 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draftBankAccountFilters.accountTypes.includes(option.value)}
                                    onChange={() => handleToggleBankAccountTypeFilter(option.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Other</p>
                            <div className="mt-3 space-y-2">
                              <label className="flex items-center gap-3 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={draftBankAccountFilters.defaultReceiptOnly}
                                  onChange={handleToggleDefaultReceiptOnlyFilter}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Default Receipt Accounts</span>
                              </label>
                              <label className="flex items-center gap-3 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={draftBankAccountFilters.defaultDisbursementOnly}
                                  onChange={handleToggleDefaultDisbursementOnlyFilter}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Default Disbursement Accounts</span>
                              </label>
                              <label className="flex items-center gap-3 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={draftBankAccountFilters.ledgerMappedOnly}
                                  onChange={handleToggleLedgerMappedOnlyFilter}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Ledger Mapped Only</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        {hasPendingBankAccountFilterChanges ? (
                          <p className="mt-4 text-sm text-amber-700">
                            You have unapplied filter changes. Click Apply Filters to update the register.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {bankAccountData?.section.table.title || 'Bank Account Master Register'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {bankAccountData?.section.table.description ||
                            'Cash and bank accounts using account name, bank name, type, currency, ledger account, and status.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>{bankAccountData?.totals.filteredBankAccounts ?? 0} matching bank accounts</span>
                        {bankAccountActiveFilterCount > 0 ? (
                          <button
                            type="button"
                            onClick={handleClearAppliedBankAccountFilters}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            Clear Applied Filters
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleExportBankAccounts}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!bankAccountRows.length}
                        >
                          <Download className="h-4 w-4" />
                          Export View
                        </button>
                      </div>
                    </div>

                    {bankAccountError ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                        <div>
                          <p className="font-medium">Unable to load the bank account register.</p>
                          <p className="mt-1">{bankAccountError}</p>
                        </div>
                      </div>
                    ) : null}

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {(bankAccountData?.section.table.columns || [
                                'Account Name',
                                'Bank Name',
                                'Type',
                                'Currency',
                                'Ledger Account',
                                'Status',
                              ]).map((column) => (
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
                            {bankAccountRows.length ? (
                              bankAccountRows.map((row) => (
                                <tr key={String(row.id)} className="hover:bg-gray-50">
                                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                    {row.accountName || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{row.bankName || '-'}</td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.typeLabel || '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.currency || '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.ledgerAccountDisplay || '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(row.status)}`}
                                    >
                                      {row.statusLabel || row.status || '-'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => void handleOpenBankAccountEditModal(row.bankAccountId)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleOpenBankAccountDeleteModal(row.bankAccountId, row.accountName || `Bank Account #${row.bankAccountId}`)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleViewBankAccount(row.bankAccountId)}
                                        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                                  No bank accounts match the current search and filter combination.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Page {bankAccountData?.pagination.page || 1} of {bankAccountData?.pagination.totalPages || 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBankAccountCurrentPage((previous) => Math.max(1, previous - 1))}
                          disabled={!bankAccountData?.pagination.hasPrevPage || isBankAccountLoading}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setBankAccountCurrentPage((previous) => previous + 1)}
                          disabled={!bankAccountData?.pagination.hasNextPage || isBankAccountLoading}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {isCustomerCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Customer</h2>
                <p className="mt-1 text-sm text-gray-600">Add a new customer master record from the live CMS.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseCustomerCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-6 px-6 py-5">
              {customerCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {customerCreateError}
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Customer Code</span>
                  <input
                    value={customerCreateForm.customerCode}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({
                        ...previous,
                        customerCode: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Auto-generate if blank"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Display Name</span>
                  <input
                    required
                    value={customerCreateForm.displayName}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, displayName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Legal Name</span>
                  <input
                    value={customerCreateForm.legalName}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, legalName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Customer Type</span>
                  <select
                    value={customerCreateForm.customerType}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, customerType: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {(customerData?.section.filters.customerTypes || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Currency</span>
                  <select
                    required
                    value={customerCreateForm.currencyReference}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, currencyReference: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select currency</option>
                    {(customerData?.referenceData.currencies || []).map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.code ? `${option.code} ` : ''}
                        {option.name || 'Unnamed currency'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Payment Terms</span>
                  <select
                    required
                    value={customerCreateForm.paymentTermReference}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({
                        ...previous,
                        paymentTermReference: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select payment terms</option>
                    {(customerData?.referenceData.paymentTerms || []).map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.name || option.code || 'Unnamed term'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Status</span>
                  <select
                    value={customerCreateForm.status}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, status: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {(customerData?.section.filters.statuses || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Credit Limit</span>
                  <input
                    type="number"
                    min="0"
                    value={customerCreateForm.creditLimit}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, creditLimit: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Email</span>
                  <input
                    type="email"
                    value={customerCreateForm.email}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, email: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Phone</span>
                  <input
                    value={customerCreateForm.phone}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, phone: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Tax ID</span>
                  <input
                    value={customerCreateForm.taxId}
                    onChange={(event) =>
                      setCustomerCreateForm((previous) => ({ ...previous, taxId: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Billing Address</span>
                <textarea
                  rows={3}
                  value={customerCreateForm.billingAddress}
                  onChange={(event) =>
                    setCustomerCreateForm((previous) => ({ ...previous, billingAddress: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Shipping Address</span>
                <textarea
                  rows={3}
                  value={customerCreateForm.shippingAddress}
                  onChange={(event) =>
                    setCustomerCreateForm((previous) => ({ ...previous, shippingAddress: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Notes</span>
                <textarea
                  rows={4}
                  value={customerCreateForm.notes}
                  onChange={(event) =>
                    setCustomerCreateForm((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCustomerCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCustomerCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCustomerCreateSubmitting ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCustomerEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Customer</h2>
                <p className="mt-1 text-sm text-gray-600">Update an existing customer master record.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseCustomerEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {isCustomerEditLoading ? (
              <div className="p-6">
                <DetailSkeleton />
              </div>
            ) : (
              <form onSubmit={handleEditCustomer} className="space-y-6 px-6 py-5">
                {customerEditError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {customerEditError}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Customer Code</span>
                    <input
                      value={customerEditForm.customerCode}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({
                          ...previous,
                          customerCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="Auto-generate if blank"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Display Name</span>
                    <input
                      required
                      value={customerEditForm.displayName}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, displayName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Legal Name</span>
                    <input
                      value={customerEditForm.legalName}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, legalName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Customer Type</span>
                    <select
                      value={customerEditForm.customerType}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, customerType: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {(customerData?.section.filters.customerTypes || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Currency</span>
                    <select
                      required
                      value={customerEditForm.currencyReference}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, currencyReference: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select currency</option>
                      {(customerData?.referenceData.currencies || []).map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.code ? `${option.code} ` : ''}
                          {option.name || 'Unnamed currency'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Payment Terms</span>
                    <select
                      required
                      value={customerEditForm.paymentTermReference}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({
                          ...previous,
                          paymentTermReference: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select payment terms</option>
                      {(customerData?.referenceData.paymentTerms || []).map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.name || option.code || 'Unnamed term'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Status</span>
                    <select
                      value={customerEditForm.status}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, status: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {(customerData?.section.filters.statuses || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Credit Limit</span>
                    <input
                      type="number"
                      min="0"
                      value={customerEditForm.creditLimit}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, creditLimit: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Email</span>
                    <input
                      type="email"
                      value={customerEditForm.email}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Phone</span>
                    <input
                      value={customerEditForm.phone}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, phone: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Tax ID</span>
                    <input
                      value={customerEditForm.taxId}
                      onChange={(event) =>
                        setCustomerEditForm((previous) => ({ ...previous, taxId: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                </div>
                <label className="block space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Billing Address</span>
                  <textarea
                    rows={3}
                    value={customerEditForm.billingAddress}
                    onChange={(event) =>
                      setCustomerEditForm((previous) => ({ ...previous, billingAddress: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Shipping Address</span>
                  <textarea
                    rows={3}
                    value={customerEditForm.shippingAddress}
                    onChange={(event) =>
                      setCustomerEditForm((previous) => ({ ...previous, shippingAddress: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Notes</span>
                  <textarea
                    rows={4}
                    value={customerEditForm.notes}
                    onChange={(event) =>
                      setCustomerEditForm((previous) => ({ ...previous, notes: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseCustomerEditModal}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCustomerEditSubmitting}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCustomerEditSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {isVendorCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Vendor</h2>
                <p className="mt-1 text-sm text-gray-600">Add a new vendor master record from the live CMS.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseVendorCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="space-y-6 px-6 py-5">
              {vendorCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {vendorCreateError}
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Vendor Code</span>
                  <input
                    value={vendorCreateForm.vendorCode}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({
                        ...previous,
                        vendorCode: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Auto-generate if blank"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Display Name</span>
                  <input
                    required
                    value={vendorCreateForm.displayName}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, displayName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Legal Name</span>
                  <input
                    value={vendorCreateForm.legalName}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, legalName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Vendor Type</span>
                  <select
                    value={vendorCreateForm.vendorType}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, vendorType: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {(vendorData?.section.filters.vendorTypes || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Currency</span>
                  <select
                    required
                    value={vendorCreateForm.currencyReference}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, currencyReference: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select currency</option>
                    {(vendorData?.referenceData.currencies || []).map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.code ? `${option.code} ` : ''}
                        {option.name || 'Unnamed currency'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Payment Terms</span>
                  <select
                    required
                    value={vendorCreateForm.paymentTermReference}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({
                        ...previous,
                        paymentTermReference: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select payment terms</option>
                    {(vendorData?.referenceData.paymentTerms || []).map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.name || option.code || 'Unnamed term'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Status</span>
                  <select
                    value={vendorCreateForm.status}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, status: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {(vendorData?.section.filters.statuses || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Email</span>
                  <input
                    type="email"
                    value={vendorCreateForm.email}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, email: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Phone</span>
                  <input
                    value={vendorCreateForm.phone}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, phone: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Tax ID</span>
                  <input
                    value={vendorCreateForm.taxId}
                    onChange={(event) =>
                      setVendorCreateForm((previous) => ({ ...previous, taxId: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Billing Address</span>
                <textarea
                  rows={3}
                  value={vendorCreateForm.billingAddress}
                  onChange={(event) =>
                    setVendorCreateForm((previous) => ({ ...previous, billingAddress: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Notes</span>
                <textarea
                  rows={4}
                  value={vendorCreateForm.notes}
                  onChange={(event) =>
                    setVendorCreateForm((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseVendorCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVendorCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVendorCreateSubmitting ? 'Creating...' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isBankAccountCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Bank Account</h2>
                <p className="mt-1 text-sm text-gray-600">Add a new treasury account using the live CMS backend.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseBankAccountCreateModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBankAccount} className="space-y-6 px-6 py-5">
              {bankAccountCreateError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {bankAccountCreateError}
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Account Name</span>
                  <input
                    required
                    value={bankAccountCreateForm.accountName}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({ ...previous, accountName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Account Number</span>
                  <input
                    value={bankAccountCreateForm.accountNumberMasked}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({
                        ...previous,
                        accountNumberMasked: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Bank Name</span>
                  <input
                    value={bankAccountCreateForm.bankName}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({ ...previous, bankName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Branch Name</span>
                  <input
                    value={bankAccountCreateForm.branchName}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({ ...previous, branchName: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Account Type</span>
                  <select
                    value={bankAccountCreateForm.accountType}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({ ...previous, accountType: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {(bankAccountData?.section.filters.accountTypes || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Currency</span>
                  <select
                    required
                    value={bankAccountCreateForm.currencyReference}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({
                        ...previous,
                        currencyReference: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select currency</option>
                    {(bankAccountData?.referenceData.currencies || []).map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.code ? `${option.code} ` : ''}
                        {option.name || 'Unnamed currency'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Ledger Account</span>
                  <select
                    required
                    value={bankAccountCreateForm.ledgerAccount}
                    onChange={(event) =>
                      setBankAccountCreateForm((previous) => ({ ...previous, ledgerAccount: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select ledger account</option>
                    {(bankAccountData?.referenceData.ledgerAccounts || []).map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.code ? `${option.code} ` : ''}
                        {option.name || 'Unnamed ledger account'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={bankAccountCreateForm.isDefaultReceiptAccount}
                    onChange={() =>
                      setBankAccountCreateForm((previous) => ({
                        ...previous,
                        isDefaultReceiptAccount: !previous.isDefaultReceiptAccount,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Default Receipt
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={bankAccountCreateForm.isDefaultDisbursementAccount}
                    onChange={() =>
                      setBankAccountCreateForm((previous) => ({
                        ...previous,
                        isDefaultDisbursementAccount: !previous.isDefaultDisbursementAccount,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Default Disbursement
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={bankAccountCreateForm.isActive}
                    onChange={() =>
                      setBankAccountCreateForm((previous) => ({
                        ...previous,
                        isActive: !previous.isActive,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active Account
                </label>
              </div>
              <label className="block space-y-2 text-sm text-gray-700">
                <span className="font-medium">Notes</span>
                <textarea
                  rows={4}
                  value={bankAccountCreateForm.notes}
                  onChange={(event) =>
                    setBankAccountCreateForm((previous) => ({ ...previous, notes: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseBankAccountCreateModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBankAccountCreateSubmitting}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBankAccountCreateSubmitting ? 'Creating...' : 'Create Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCustomerDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Customer</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingCustomerName}&rdquo; from the customers list.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCustomerDeleteModal}
                disabled={isCustomerDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {customerDeleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {customerDeleteError}
                </div>
              ) : null}

              {customerDeleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this customer</p>
                    <p className="mt-1">
                      This customer cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {customerDeleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this customer.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseCustomerDeleteModal}
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
                      This action cannot be undone. The customer &ldquo;{deletingCustomerName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseCustomerDeleteModal}
                      disabled={isCustomerDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCustomerDelete}
                      disabled={isCustomerDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isCustomerDeleteSubmitting ? 'Deleting...' : 'Delete Customer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedCustomerId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Record</h2>
                <p className="mt-1 text-sm text-gray-500">Review the full master record returned by the CMS.</p>
              </div>
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-5">
              {isCustomerDetailLoading ? (
                <DetailSkeleton />
              ) : customerDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {customerDetailError}
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleOpenCustomerEditModal(selectedCustomer.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Customer
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customer Code</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedCustomer.customerCode || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.status || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Display Name</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.displayName || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Legal Name</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.legalName || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {formatPartyTypeLabel(selectedCustomer.customerType)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Credit Limit</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.creditLimit ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Currency</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedCustomer.currencyReference?.code || selectedCustomer.currencyReference?.name || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Terms</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedCustomer.paymentTermReference?.name || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.email || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.phone || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Billing Address</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.billingAddress || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedCustomer.notes || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</p>
                      <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedCustomer.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated At</p>
                      <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedCustomer.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedVendorId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Vendor Record</h2>
                <p className="mt-1 text-sm text-gray-500">Review the full master record returned by the CMS.</p>
              </div>
              <button
                type="button"
                onClick={closeVendorDetailModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-5">
              {isVendorDetailLoading ? (
                <DetailSkeleton />
              ) : vendorDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {vendorDetailError}
                </div>
              ) : selectedVendor ? (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleOpenVendorEditModal(selectedVendor.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Vendor
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vendor Code</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{selectedVendor.vendorCode || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.status || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Display Name</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.displayName || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Legal Name</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.legalName || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {formatPartyTypeLabel(selectedVendor.vendorType)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax ID</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.taxId || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Currency</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedVendor.currencyReference?.code || selectedVendor.currencyReference?.name || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Terms</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedVendor.paymentTermReference?.name || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.email || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.phone || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Billing Address</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.billingAddress || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedVendor.notes || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</p>
                      <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedVendor.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated At</p>
                      <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedVendor.updatedAt)}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeVendorDetailModal}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isVendorDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Vendor</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingVendorName}&rdquo; from the vendors list.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseVendorDeleteModal}
                disabled={isVendorDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {vendorDeleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {vendorDeleteError}
                </div>
              ) : null}

              {vendorDeleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this vendor</p>
                    <p className="mt-1">
                      This vendor cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {vendorDeleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this vendor.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseVendorDeleteModal}
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
                      This action cannot be undone. The vendor &ldquo;{deletingVendorName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseVendorDeleteModal}
                      disabled={isVendorDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmVendorDelete}
                      disabled={isVendorDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isVendorDeleteSubmitting ? 'Deleting...' : 'Delete Vendor'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isVendorEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Vendor</h2>
                <p className="mt-1 text-sm text-gray-600">Update an existing vendor master record.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseVendorEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {isVendorEditLoading ? (
              <div className="p-6">
                <DetailSkeleton />
              </div>
            ) : (
              <form onSubmit={handleEditVendor} className="space-y-6 px-6 py-5">
                {vendorEditError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {vendorEditError}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Vendor Code</span>
                    <input
                      value={vendorEditForm.vendorCode}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({
                          ...previous,
                          vendorCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="Auto-generate if blank"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Display Name</span>
                    <input
                      required
                      value={vendorEditForm.displayName}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, displayName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Legal Name</span>
                    <input
                      value={vendorEditForm.legalName}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, legalName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Vendor Type</span>
                    <select
                      value={vendorEditForm.vendorType}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, vendorType: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {(vendorData?.section.filters.vendorTypes || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Currency</span>
                    <select
                      required
                      value={vendorEditForm.currencyReference}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, currencyReference: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select currency</option>
                      {(vendorData?.referenceData.currencies || []).map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.code ? `${option.code} ` : ''}
                          {option.name || 'Unnamed currency'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Payment Terms</span>
                    <select
                      required
                      value={vendorEditForm.paymentTermReference}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({
                          ...previous,
                          paymentTermReference: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select payment terms</option>
                      {(vendorData?.referenceData.paymentTerms || []).map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.name || option.code || 'Unnamed term'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Status</span>
                    <select
                      value={vendorEditForm.status}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, status: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {(vendorData?.section.filters.statuses || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Email</span>
                    <input
                      type="email"
                      value={vendorEditForm.email}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Phone</span>
                    <input
                      value={vendorEditForm.phone}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, phone: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Tax ID</span>
                    <input
                      value={vendorEditForm.taxId}
                      onChange={(event) =>
                        setVendorEditForm((previous) => ({ ...previous, taxId: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                </div>
                <label className="block space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Billing Address</span>
                  <textarea
                    rows={3}
                    value={vendorEditForm.billingAddress}
                    onChange={(event) =>
                      setVendorEditForm((previous) => ({ ...previous, billingAddress: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Notes</span>
                  <textarea
                    rows={4}
                    value={vendorEditForm.notes}
                    onChange={(event) =>
                      setVendorEditForm((previous) => ({ ...previous, notes: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseVendorEditModal}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVendorEditSubmitting}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVendorEditSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {isBankAccountDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Bank Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove &ldquo;{deletingBankAccountName}&rdquo; from the bank accounts list.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseBankAccountDeleteModal}
                disabled={isBankAccountDeleteSubmitting}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {bankAccountDeleteError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {bankAccountDeleteError}
                </div>
              ) : null}

              {bankAccountDeleteBlockers.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Cannot delete this bank account</p>
                    <p className="mt-1">
                      This bank account cannot be deleted because the following dependencies exist:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {bankAccountDeleteBlockers.map((blocker, index) => (
                        <li key={index}>{blocker}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Remove all dependencies before attempting to delete this bank account.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseBankAccountDeleteModal}
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
                      This action cannot be undone. The bank account &ldquo;{deletingBankAccountName}&rdquo; will be permanently removed.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseBankAccountDeleteModal}
                      disabled={isBankAccountDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBankAccountDelete}
                      disabled={isBankAccountDeleteSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isBankAccountDeleteSubmitting ? 'Deleting...' : 'Delete Bank Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isBankAccountEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Bank Account</h2>
                <p className="mt-1 text-sm text-gray-600">Update an existing bank account master record.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseBankAccountEditModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {isBankAccountEditLoading ? (
              <div className="p-6">
                <DetailSkeleton />
              </div>
            ) : (
              <form onSubmit={handleEditBankAccount} className="space-y-6 px-6 py-5">
                {bankAccountEditError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {bankAccountEditError}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Account Name</span>
                    <input
                      required
                      value={bankAccountEditForm.accountName}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({ ...previous, accountName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Account Number</span>
                    <input
                      value={bankAccountEditForm.accountNumberMasked}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({
                          ...previous,
                          accountNumberMasked: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Bank Name</span>
                    <input
                      value={bankAccountEditForm.bankName}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({ ...previous, bankName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Branch Name</span>
                    <input
                      value={bankAccountEditForm.branchName}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({ ...previous, branchName: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Account Type</span>
                    <select
                      value={bankAccountEditForm.accountType}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({ ...previous, accountType: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {(bankAccountData?.section.filters.accountTypes || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Currency</span>
                    <select
                      required
                      value={bankAccountEditForm.currencyReference}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({
                          ...previous,
                          currencyReference: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select currency</option>
                      {(bankAccountData?.referenceData.currencies || []).map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.code ? `${option.code} ` : ''}
                          {option.name || 'Unnamed currency'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Ledger Account</span>
                    <select
                      required
                      value={bankAccountEditForm.ledgerAccount}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({
                          ...previous,
                          ledgerAccount: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select ledger account</option>
                      {(bankAccountData?.referenceData.ledgerAccounts || []).map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.code ? `${option.code} ` : ''}
                          {option.name || 'Unnamed ledger'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Status</span>
                    <select
                      value={bankAccountEditForm.isActive ? 'true' : 'false'}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({
                          ...previous,
                          isActive: event.target.value === 'true',
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Default Receipt Account</span>
                    <select
                      value={bankAccountEditForm.isDefaultReceiptAccount ? 'true' : 'false'}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({
                          ...previous,
                          isDefaultReceiptAccount: event.target.value === 'true',
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-gray-700">
                    <span className="font-medium">Default Disbursement Account</span>
                    <select
                      value={bankAccountEditForm.isDefaultDisbursementAccount ? 'true' : 'false'}
                      onChange={(event) =>
                        setBankAccountEditForm((previous) => ({
                          ...previous,
                          isDefaultDisbursementAccount: event.target.value === 'true',
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </label>
                </div>
                <label className="block space-y-2 text-sm text-gray-700">
                  <span className="font-medium">Notes</span>
                  <textarea
                    rows={4}
                    value={bankAccountEditForm.notes}
                    onChange={(event) =>
                      setBankAccountEditForm((previous) => ({ ...previous, notes: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseBankAccountEditModal}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBankAccountEditSubmitting}
                    className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBankAccountEditSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {selectedBankAccountId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bank Account Record</h2>
                <p className="mt-1 text-sm text-gray-500">Review the full master record returned by the CMS.</p>
              </div>
              <button
                type="button"
                onClick={closeBankAccountDetailModal}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-5">
              {isBankAccountDetailLoading ? (
                <DetailSkeleton />
              ) : bankAccountDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bankAccountDetailError}
                </div>
              ) : selectedBankAccount ? (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleOpenBankAccountEditModal(selectedBankAccount.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Bank Account
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Name</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {selectedBankAccount.accountName || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {getBankAccountStatus(selectedBankAccount.isActive)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bank Name</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedBankAccount.bankName || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Branch Name</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedBankAccount.branchName || '-'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Type</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {formatPartyTypeLabel(selectedBankAccount.accountType)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Number</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedBankAccount.accountNumberMasked || '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Currency</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedBankAccount.currencyReference?.code ||
                          selectedBankAccount.currencyReference?.name ||
                          '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ledger Account</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedBankAccount.ledgerAccount?.code && selectedBankAccount.ledgerAccount?.name
                          ? `${selectedBankAccount.ledgerAccount.code} ${selectedBankAccount.ledgerAccount.name}`
                          : selectedBankAccount.ledgerAccount?.code ||
                            selectedBankAccount.ledgerAccount?.name ||
                            '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Default Receipt</p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedBankAccount.isDefaultReceiptAccount ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Default Disbursement
                      </p>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedBankAccount.isDefaultDisbursementAccount ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</p>
                      <p className="mt-2 text-sm text-gray-900">{selectedBankAccount.notes || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</p>
                      <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedBankAccount.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Updated At</p>
                      <p className="mt-2 text-sm text-gray-900">{formatDateTime(selectedBankAccount.updatedAt)}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeBankAccountDetailModal}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
