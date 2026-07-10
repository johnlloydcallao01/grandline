'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
  X,
} from 'lucide-react';
import {
  createCoupon,
  deleteCoupon,
  getCouponDetail,
  getCoupons,
  updateCoupon,
  type CouponCell,
  type CouponDetail,
  type CouponMetric,
  type CouponMutationInput,
  type CouponRegisterResponse,
} from './actions-coupon-mapping';

type CouponFilterState = { statuses: string[]; discountTypes: string[] };
type CouponFormState = {
  code: string;
  name: string;
  description: string;
  status: string;
  discountType: string;
  amount: string;
  maxDiscountAmount: string;
  scopeType: string;
  includedCourses: string[];
  excludedCourses: string[];
  includedCategories: string[];
  excludedCategories: string[];
  excludeSaleCourses: boolean;
  minimumAmount: string;
  maximumAmount: string;
  usageLimitTotal: string;
  usageLimitPerUser: string;
  maxItemsAffected: string;
  stackable: boolean;
  priority: string;
  startsAt: string;
  expiresAt: string;
  allowedTrainees: string[];
  allowedEmails: string;
  notes: string;
};
type CouponActionTarget = {
  id: string;
  code: string;
};

const MUTABLE_STATUSES = new Set(['draft', 'active', 'paused']);

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Expired', value: 'expired' },
  { label: 'Archived', value: 'archived' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Percent', value: 'percent' },
  { label: 'Fixed Course', value: 'fixed_course' },
  { label: 'Fixed Cart', value: 'fixed_cart' },
];

const SCOPE_TYPE_OPTIONS = [
  { label: 'All Courses', value: 'all_courses' },
  { label: 'Specific Courses', value: 'specific_courses' },
  { label: 'Specific Categories', value: 'specific_categories' },
];

function getActionClasses(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  if (variant === 'primary') return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700';
  if (variant === 'ghost') return 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
}

function getMetricTone(trend: CouponMetric['trend']) {
  if (trend === 'down') return 'text-red-600 bg-red-50';
  if (trend === 'neutral') return 'text-gray-600 bg-gray-100';
  return 'text-green-600 bg-green-50';
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toggleFilterValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}

function createEmptyForm(): CouponFormState {
  return {
    code: '',
    name: '',
    description: '',
    status: 'draft',
    discountType: 'percent',
    amount: '0',
    maxDiscountAmount: '',
    scopeType: 'all_courses',
    includedCourses: [],
    excludedCourses: [],
    includedCategories: [],
    excludedCategories: [],
    excludeSaleCourses: false,
    minimumAmount: '',
    maximumAmount: '',
    usageLimitTotal: '',
    usageLimitPerUser: '',
    maxItemsAffected: '',
    stackable: false,
    priority: '100',
    startsAt: '',
    expiresAt: '',
    allowedTrainees: [],
    allowedEmails: '',
    notes: '',
  };
}

function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-4xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return undefined;
    }
    setAnimate(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${animate ? 'bg-black/50' : 'bg-transparent'}`} onClick={onClose}>
      <div className={`flex h-full w-full ${width} flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${animate ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
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
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}

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
          <FileText className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getMetricTone(trend)}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-5 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 7 }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-6 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: CouponCell, index: number) {
  if (typeof cell === 'string') {
    return <td key={index} className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{cell}</td>;
  }

  const alignClass = cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left';
  if (cell.tone) {
    const toneMap: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700 ring-amber-200',
      blue: 'bg-blue-50 text-blue-700 ring-blue-200',
      gray: 'bg-gray-100 text-gray-700 ring-gray-200',
      green: 'bg-green-50 text-green-700 ring-green-200',
      red: 'bg-red-50 text-red-700 ring-red-200',
    };
    return (
      <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${alignClass}`}>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneMap[cell.tone] || toneMap.gray}`}>{cell.text}</span>
      </td>
    );
  }

  return <td key={index} className={`whitespace-nowrap px-4 py-3 text-sm ${cell.emphasis ? 'font-semibold text-gray-900' : 'text-gray-600'} ${alignClass}`}>{cell.text}</td>;
}

function MultiSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
      >
        {value.length > 0
          ? `${value.length} selected`
          : 'Select items...'}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No options available</p>
          ) : (
            options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {option.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CouponDiscountMappingClient() {
  const [data, setData] = useState<CouponRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CouponFilterState>({ statuses: [], discountTypes: [] });
  const [draftFilters, setDraftFilters] = useState<CouponFilterState>({ statuses: [], discountTypes: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [viewDetail, setViewDetail] = useState<CouponDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [formState, setFormState] = useState<CouponFormState>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponActionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterCount = filters.statuses.length + filters.discountTypes.length;

  const fetchCoupons = useCallback(async ({
    search,
    page,
    nextFilters,
    nextQuickFilters,
  }: {
    search: string;
    page: number;
    nextFilters: CouponFilterState;
    nextQuickFilters: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCoupons({
        search,
        page,
        statuses: nextFilters.statuses,
        discountTypes: nextFilters.discountTypes,
        quickFilters: nextQuickFilters,
      });
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load coupon codes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCoupons({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  }, [currentPage, fetchCoupons, filters, quickFilters, submittedSearch]);

  const referenceData = data?.referenceData;

  const courseOptions = useMemo(
    () => [
      ...(referenceData?.courses || []).map((c) => ({
        label: c.name ? (c.courseCode ? `${c.courseCode} - ${c.name}` : c.name) : 'Unnamed course',
        value: String(c.id),
      })),
    ],
    [referenceData?.courses],
  );

  const categoryOptions = useMemo(
    () => [
      ...(referenceData?.categories || []).map((cat) => ({
        label: cat.name || 'Unnamed category',
        value: String(cat.id),
      })),
    ],
    [referenceData?.categories],
  );

  const traineeOptions = useMemo(
    () => [
      ...(referenceData?.trainees || []).map((t) => ({
        label: t.label || 'Unnamed trainee',
        value: String(t.id),
      })),
    ],
    [referenceData?.trainees],
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchInput);
    setCurrentPage(1);
    void fetchCoupons({ search: searchInput, page: 1, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleRefresh = () => {
    void fetchCoupons({ search: submittedSearch, page: currentPage, nextFilters: filters, nextQuickFilters: quickFilters });
  };

  const handleExport = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const headers = ['Coupon Code', 'Status', 'Discount Type', 'Amount', 'Scope', 'Usage Count'];
    const csvRows = rows.map((row) => [
      row.code,
      row.statusLabel,
      row.discountTypeLabel,
      String(row.amount),
      row.scopeTypeLabel,
      String(row.usageCount),
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coupon-codes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleQuickFilter = (value: string) => {
    setQuickFilters((previous) => toggleFilterValue(previous, value));
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setFormState(createEmptyForm());
    setIsFormOpen(true);
  };

  const handleView = async (id: string) => {
    setIsViewOpen(true);
    setIsViewLoading(true);
    setViewDetail(null);
    try {
      const detail = await getCouponDetail(id);
      setViewDetail(detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load coupon detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setIsFormOpen(true);
    setIsViewLoading(true);
    try {
      const detail = await getCouponDetail(id);
      setFormState({
        code: detail.code,
        name: detail.name || '',
        description: detail.description || '',
        status: detail.status,
        discountType: detail.discountType,
        amount: String(detail.amount || 0),
        maxDiscountAmount: detail.maxDiscountAmount != null ? String(detail.maxDiscountAmount) : '',
        scopeType: detail.scopeType,
        includedCourses: detail.includedCourseIds,
        excludedCourses: detail.excludedCourseIds,
        includedCategories: detail.includedCategoryIds,
        excludedCategories: detail.excludedCategoryIds,
        excludeSaleCourses: detail.excludeSaleCourses,
        minimumAmount: detail.minimumAmount != null ? String(detail.minimumAmount) : '',
        maximumAmount: detail.maximumAmount != null ? String(detail.maximumAmount) : '',
        usageLimitTotal: detail.usageLimitTotal != null ? String(detail.usageLimitTotal) : '',
        usageLimitPerUser: detail.usageLimitPerUser != null ? String(detail.usageLimitPerUser) : '',
        maxItemsAffected: detail.maxItemsAffected != null ? String(detail.maxItemsAffected) : '',
        stackable: detail.stackable,
        priority: String(detail.priority || 100),
        startsAt: toDateInputValue(detail.startsAt),
        expiresAt: toDateInputValue(detail.expiresAt),
        allowedTrainees: detail.allowedTraineeIds,
        allowedEmails: detail.allowedEmails.join(', '),
        notes: '',
      });
    } catch (detailError) {
      setFormError(detailError instanceof Error ? detailError.message : 'Unable to load coupon detail.');
    } finally {
      setIsViewLoading(false);
    }
  };

  const normalizeFormPayload = (): CouponMutationInput => ({
    code: formState.code.trim().toUpperCase() || undefined,
    name: formState.name.trim() || undefined,
    description: formState.description.trim() || undefined,
    status: formState.status,
    discountType: formState.discountType,
    amount: Number(formState.amount) || 0,
    maxDiscountAmount: formState.maxDiscountAmount ? Number(formState.maxDiscountAmount) : null,
    scopeType: formState.scopeType,
    includedCourses: formState.scopeType === 'specific_courses' ? formState.includedCourses : undefined,
    excludedCourses: formState.excludedCourses.length > 0 ? formState.excludedCourses : undefined,
    includedCategories: formState.scopeType === 'specific_categories' ? formState.includedCategories : undefined,
    excludedCategories: formState.excludedCategories.length > 0 ? formState.excludedCategories : undefined,
    excludeSaleCourses: formState.excludeSaleCourses,
    minimumAmount: formState.minimumAmount ? Number(formState.minimumAmount) : null,
    maximumAmount: formState.maximumAmount ? Number(formState.maximumAmount) : null,
    usageLimitTotal: formState.usageLimitTotal ? Number(formState.usageLimitTotal) : null,
    usageLimitPerUser: formState.usageLimitPerUser ? Number(formState.usageLimitPerUser) : null,
    maxItemsAffected: formState.maxItemsAffected ? Number(formState.maxItemsAffected) : null,
    stackable: formState.stackable,
    priority: Number(formState.priority) || 100,
    startsAt: formState.startsAt || null,
    expiresAt: formState.expiresAt || null,
    allowedTrainees: formState.allowedTrainees.length > 0 ? formState.allowedTrainees : undefined,
    allowedEmails: formState.allowedEmails
      ? formState.allowedEmails.split(',').map((email) => email.trim()).filter(Boolean)
      : [],
  });

  const refreshCurrentView = async () => {
    await fetchCoupons({
      search: submittedSearch,
      page: currentPage,
      nextFilters: filters,
      nextQuickFilters: quickFilters,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = normalizeFormPayload();
      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }
      setIsFormOpen(false);
      await refreshCurrentView();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to save coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCoupon(deleteTarget.id);
      setDeleteTarget(null);
      await refreshCurrentView();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete coupon.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">Coupon & Discount Mapping</h2>
          <p className="text-sm text-gray-600">Review coupon-code definitions and the discount impact they create through enrollment billing link snapshots used in LMS finance reporting.</p>
          <p className="text-sm text-gray-500">{data?.totals.filteredRows ?? 0} matching rows</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleOpenCreate} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('primary')}`}>
            <Plus className="h-4 w-4" />
            New Coupon
          </button>
          <button type="button" onClick={handleRefresh} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getActionClasses('secondary')}`}>
            <RefreshCw className="h-4 w-4" />
            Refresh Coupons
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data?.rows.length}>
            <Download className="h-4 w-4" />
            Download View
          </button>
        </div>
      </div>

      {data?.metrics?.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <div key={metric.id}><MetricCard label={metric.label} value={metric.value} change={metric.change} trend={metric.trend} /></div>)}</div> : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <form onSubmit={handleSearch} className="flex min-w-0 max-w-xl flex-1 gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder={data?.meta.searchPlaceholder || 'Search coupon code, name, status, discount type, amount, or scope'} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
            <button type="button" onClick={() => { if (!isFilterPanelOpen) setDraftFilters({ ...filters }); setIsFilterPanelOpen((previous) => !previous); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isFilterPanelOpen || filterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 ? <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{filterCount}</span> : null}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data?.filterOptions.quickFilters || []).map((filter) => (
              <button key={filter.value} type="button" onClick={() => handleToggleQuickFilter(filter.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${quickFilters.includes(filter.value) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {isFilterPanelOpen ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                  <p className="mt-1 text-sm text-gray-600">Select as many values as needed per group, then apply the filtered view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setDraftFilters({ statuses: [], discountTypes: [] }); setFilters({ statuses: [], discountTypes: [] }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Clear all</button>
                  <button type="button" onClick={() => setIsFilterPanelOpen(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => { setFilters({ ...draftFilters }); setCurrentPage(1); setIsFilterPanelOpen(false); }} className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply Filters</button>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.statuses || []).map((option) => {
                      const selected = draftFilters.statuses.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, statuses: toggleFilterValue(previous.statuses, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Discount Type</h5>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data?.filterOptions.discountTypes || []).map((option) => {
                      const selected = draftFilters.discountTypes.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setDraftFilters((previous) => ({ ...previous, discountTypes: toggleFilterValue(previous.discountTypes, option.value) }))} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100'}`}>{option.label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{data?.meta.tableTitle || 'Coupon And Discount Register'}</h3>
              <p className="text-sm text-gray-600">{data?.meta.tableDescription || 'Coupon and discount view aligned to `coupon-codes` plus usage tracking from coupon redemptions.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{data?.totals.filteredRows ?? 0} matching rows</span>
            </div>
          </div>

          {error ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

          {isLoading ? <LoadingSkeleton /> : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Coupon Code', 'Status', 'Discount Type', 'Amount', 'Scope', 'Usage Count'].map((column) => (
                          <th key={column} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column === 'Amount' || column === 'Usage Count' ? 'text-right' : 'text-left'}`}>{column}</th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(data?.rows || []).length > 0 ? (data?.rows || []).map((row) => {
                        const statusTone = row.status === 'active' ? 'green' as const : row.status === 'paused' ? 'amber' as const : row.status === 'expired' ? 'gray' as const : row.status === 'archived' ? 'red' as const : 'blue' as const;
                        const cells: CouponCell[] = [
                          { text: row.code, emphasis: true },
                          { text: row.statusLabel, tone: statusTone },
                          row.discountTypeLabel,
                          { text: String(row.amount), align: 'right' },
                          row.scopeTypeLabel,
                          { text: String(row.usageCount), align: 'right' },
                        ];
                        const isMutable = MUTABLE_STATUSES.has(row.status);
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {cells.map((cell, index) => renderCell(cell, index))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => handleView(row.id)} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="View detail">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleOpenEdit(row.id)} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40" title="Edit coupon">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => setDeleteTarget({ id: row.id, code: row.code })} disabled={!isMutable} className="inline-flex items-center gap-1 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" title="Delete coupon">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No coupon code rows found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!data.pagination.hasPrevPage} onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setCurrentPage((previous) => previous + 1)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Next</button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SlideOver isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Coupon Detail" description="Review coupon-code header values, discount configuration, usage rules, and redemption summary.">
        <div className="space-y-6">
          {isViewLoading ? <LoadingSkeleton /> : viewDetail ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Coupon Code', viewDetail.code],
                  ['Name', viewDetail.name || '-'],
                  ['Description', viewDetail.description || '-'],
                  ['Status', viewDetail.statusLabel],
                  ['Discount Type', viewDetail.discountTypeLabel],
                  ['Amount', String(viewDetail.amount)],
                  ['Max Discount Amount', viewDetail.maxDiscountAmount != null ? String(viewDetail.maxDiscountAmount) : '-'],
                  ['Scope', viewDetail.scopeTypeLabel],
                  ['Exclude Sale Courses', viewDetail.excludeSaleCourses ? 'Yes' : 'No'],
                  ['Minimum Amount', viewDetail.minimumAmount != null ? String(viewDetail.minimumAmount) : '-'],
                  ['Maximum Amount', viewDetail.maximumAmount != null ? String(viewDetail.maximumAmount) : '-'],
                  ['Usage Limit (Total)', viewDetail.usageLimitTotal != null ? String(viewDetail.usageLimitTotal) : '-'],
                  ['Usage Limit (Per User)', viewDetail.usageLimitPerUser != null ? String(viewDetail.usageLimitPerUser) : '-'],
                  ['Max Items Affected', viewDetail.maxItemsAffected != null ? String(viewDetail.maxItemsAffected) : '-'],
                  ['Stackable', viewDetail.stackable ? 'Yes' : 'No'],
                  ['Priority', String(viewDetail.priority)],
                  ['Usage Count', String(viewDetail.usageCount)],
                  ['Starts At', viewDetail.startsAt ? new Date(viewDetail.startsAt).toLocaleDateString() : '-'],
                  ['Expires At', viewDetail.expiresAt ? new Date(viewDetail.expiresAt).toLocaleDateString() : '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {viewDetail.includedCourseIds.length > 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-5 py-4">
                    <h4 className="text-sm font-semibold text-gray-900">Included Courses</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {viewDetail.includedCourseLabels.map((label, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {viewDetail.includedCategoryIds.length > 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-5 py-4">
                    <h4 className="text-sm font-semibold text-gray-900">Included Categories</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {viewDetail.includedCategoryLabels.map((label, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Dependencies</p>
                <p className="mt-2">Redemption Count: {viewDetail.usageSummary.redemptionCount}</p>
                <p>Has Blocking Dependents: {viewDetail.usageSummary.hasBlockingDependents ? 'Yes' : 'No'}</p>
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No details available.</p>}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
          </div>
        </div>
      </SlideOver>

      <SlideOver isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Coupon' : 'New Coupon'} description="Configure coupon code, discount rules, scope, usage limits, and scheduling for enrollment checkout.">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div> : null}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Coupon Code" required>
                <Input value={formState.code} onChange={(value) => setFormState((previous) => ({ ...previous, code: value }))} placeholder="e.g., SAVE10" required />
              </FormField>
              <FormField label="Name">
                <Input value={formState.name} onChange={(value) => setFormState((previous) => ({ ...previous, name: value }))} placeholder="Internal campaign name" />
              </FormField>
              <FormField label="Status" required>
                <Select value={formState.status} onChange={(value) => setFormState((previous) => ({ ...previous, status: value }))} options={STATUS_OPTIONS} />
              </FormField>
              <FormField label="Stackable">
                <Checkbox label="Allow stacking with other coupons" checked={formState.stackable} onChange={(checked) => setFormState((previous) => ({ ...previous, stackable: checked }))} />
              </FormField>
              <FormField label="Priority">
                <Input type="number" value={formState.priority} onChange={(value) => setFormState((previous) => ({ ...previous, priority: value }))} />
              </FormField>
              <FormField label="Exclude Sale Courses">
                <Checkbox label="Don't apply if course has sale/discounted price" checked={formState.excludeSaleCourses} onChange={(checked) => setFormState((previous) => ({ ...previous, excludeSaleCourses: checked }))} />
              </FormField>
            </div>
          </div>
          <FormField label="Description">
            <TextArea value={formState.description} onChange={(value) => setFormState((previous) => ({ ...previous, description: value }))} rows={2} />
          </FormField>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Discount Configuration</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Discount Type" required>
                <Select value={formState.discountType} onChange={(value) => setFormState((previous) => ({ ...previous, discountType: value }))} options={DISCOUNT_TYPE_OPTIONS} />
              </FormField>
              <FormField label="Amount" required>
                <Input type="number" value={formState.amount} onChange={(value) => setFormState((previous) => ({ ...previous, amount: value }))} required />
              </FormField>
              <FormField label="Max Discount Amount">
                <Input type="number" value={formState.maxDiscountAmount} onChange={(value) => setFormState((previous) => ({ ...previous, maxDiscountAmount: value }))} placeholder="Leave empty for no cap" />
              </FormField>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Scope & Targeting</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Scope Type" required>
                <Select value={formState.scopeType} onChange={(value) => setFormState((previous) => ({ ...previous, scopeType: value }))} options={SCOPE_TYPE_OPTIONS} />
              </FormField>
              {formState.scopeType === 'specific_courses' ? (
                <FormField label="Included Courses">
                  <MultiSelect value={formState.includedCourses} onChange={(value) => setFormState((previous) => ({ ...previous, includedCourses: value }))} options={courseOptions} />
                </FormField>
              ) : null}
              {formState.scopeType === 'specific_categories' ? (
                <FormField label="Included Categories">
                  <MultiSelect value={formState.includedCategories} onChange={(value) => setFormState((previous) => ({ ...previous, includedCategories: value }))} options={categoryOptions} />
                </FormField>
              ) : null}
              <FormField label="Excluded Courses">
                <MultiSelect value={formState.excludedCourses} onChange={(value) => setFormState((previous) => ({ ...previous, excludedCourses: value }))} options={courseOptions} />
              </FormField>
              <FormField label="Excluded Categories">
                <MultiSelect value={formState.excludedCategories} onChange={(value) => setFormState((previous) => ({ ...previous, excludedCategories: value }))} options={categoryOptions} />
              </FormField>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Scheduling & Limits</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Starts At">
                <Input type="date" value={formState.startsAt} onChange={(value) => setFormState((previous) => ({ ...previous, startsAt: value }))} />
              </FormField>
              <FormField label="Expires At">
                <Input type="date" value={formState.expiresAt} onChange={(value) => setFormState((previous) => ({ ...previous, expiresAt: value }))} />
              </FormField>
              <FormField label="Minimum Amount">
                <Input type="number" value={formState.minimumAmount} onChange={(value) => setFormState((previous) => ({ ...previous, minimumAmount: value }))} placeholder="Min cart subtotal" />
              </FormField>
              <FormField label="Maximum Amount">
                <Input type="number" value={formState.maximumAmount} onChange={(value) => setFormState((previous) => ({ ...previous, maximumAmount: value }))} placeholder="Max cart subtotal" />
              </FormField>
              <FormField label="Usage Limit (Total)">
                <Input type="number" value={formState.usageLimitTotal} onChange={(value) => setFormState((previous) => ({ ...previous, usageLimitTotal: value }))} placeholder="Leave empty for unlimited" />
              </FormField>
              <FormField label="Usage Limit (Per User)">
                <Input type="number" value={formState.usageLimitPerUser} onChange={(value) => setFormState((previous) => ({ ...previous, usageLimitPerUser: value }))} placeholder="Leave empty for unlimited" />
              </FormField>
              <FormField label="Max Items Affected">
                <Input type="number" value={formState.maxItemsAffected} onChange={(value) => setFormState((previous) => ({ ...previous, maxItemsAffected: value }))} placeholder="Items coupon can apply to" />
              </FormField>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Restrictions</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Allowed Trainees">
                <MultiSelect value={formState.allowedTrainees} onChange={(value) => setFormState((previous) => ({ ...previous, allowedTrainees: value }))} options={traineeOptions} />
              </FormField>
              <FormField label="Allowed Emails">
                <Input value={formState.allowedEmails} onChange={(value) => setFormState((previous) => ({ ...previous, allowedEmails: value }))} placeholder="Comma-separated emails" />
              </FormField>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${getActionClasses('primary')}`}>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Coupon'}</button>
          </div>
        </form>
      </SlideOver>

      <SlideOver isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Coupon" description="Delete this coupon code." width="max-w-lg">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Delete coupon {deleteTarget?.code}?</p>
            <p className="mt-1">This will permanently remove the coupon code. This action cannot be undone if the coupon has no linked redemptions.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Coupon'}</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
