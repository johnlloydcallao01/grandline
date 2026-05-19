'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');
const COURSE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535466657820-08e46762b06f?auto=format&fit=crop&q=80&w=600';

type EnrollmentMedia = {
  cloudinaryURL?: string | null;
  url?: string | null;
};

type EnrollmentUser = {
  id?: string | number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  username?: string | null;
};

type EnrollmentDetail = {
  id: string | number;
  status: string;
  enrolledAt?: string | null;
  enrollmentType?: string | null;
  paymentStatus?: string | null;
  accessExpiresAt?: string | null;
  amountPaid?: number | null;
  couponCode?: string | null;
  couponDiscountAmount?: number | null;
  listPriceSnapshot?: number | null;
  finalPriceSnapshot?: number | null;
  pricingBreakdown?: Record<string, unknown> | null;
  progressPercentage?: number | null;
  lastAccessedAt?: string | null;
  completedAt?: string | null;
  currentGrade?: number | null;
  finalGrade?: number | null;
  finalEvaluation?: 'passed' | 'failed' | null;
  certificateIssued?: boolean | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  enrolledBy?: EnrollmentUser | string | number | null;
  student?: {
    id?: string | number;
    srn?: string | null;
    user?: EnrollmentUser | null;
  } | null;
  course?: {
    id: string | number;
    title?: string | null;
    price?: number | null;
    discountedPrice?: number | null;
    difficultyLevel?: string | null;
    estimatedDuration?: number | null;
    estimatedDurationUnit?: string | null;
    excerpt?: string | null;
    thumbnail?: EnrollmentMedia | null;
    instructor?: {
      user?: EnrollmentUser | null;
    } | null;
  } | null;
};

function getMediaUrl(media?: EnrollmentMedia | null): string {
  if (!media) return COURSE_FALLBACK_IMAGE;
  if (media.cloudinaryURL) return media.cloudinaryURL;
  if (media.url) {
    if (media.url.startsWith('http')) return media.url;
    return `${API_BASE_URL}${media.url}`;
  }
  return COURSE_FALLBACK_IMAGE;
}

function formatStatusLabel(status?: string | null): string {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getEnrollmentDisplayStatus(enrollment: EnrollmentDetail): string {
  if (enrollment.status === 'completed' && enrollment.finalEvaluation === 'passed') {
    return 'Passed';
  }

  if (enrollment.status === 'completed' && enrollment.finalEvaluation === 'failed') {
    return 'Failed';
  }

  if (enrollment.status === 'completed') {
    return 'Completed';
  }

  return formatStatusLabel(enrollment.status);
}

function getEnrollmentBadgeClasses(enrollment: EnrollmentDetail): string {
  const displayStatus = getEnrollmentDisplayStatus(enrollment);

  switch (displayStatus) {
    case 'Active':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'Passed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'Failed':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    case 'Suspended':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    case 'Pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'Dropped':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    case 'Expired':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatNumber(value?: number | null, suffix = ''): string {
  if (value === null || value === undefined) return 'Not available';
  return `${value.toLocaleString()}${suffix}`;
}

function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return 'Not available';

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);
}

function getPersonName(user?: EnrollmentUser | null): string {
  if (!user) return 'Not available';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username || user.email || 'Not available';
}

function getRelationshipName(value?: EnrollmentUser | string | number | null): string {
  if (!value) return 'Not available';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return getPersonName(value);
}

function renderMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return 'Not available';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

export default function EnrollmentDetailsPage() {
  const params = useParams<{ enrollmentId: string }>();
  const router = useRouter();
  const enrollmentId = Array.isArray(params?.enrollmentId) ? params.enrollmentId[0] : params?.enrollmentId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);

  useEffect(() => {
    if (!enrollmentId) {
      setError('Enrollment not found.');
      setLoading(false);
      return;
    }

    let active = true;

    async function loadEnrollment() {
      setLoading(true);
      setError(null);

      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/signin');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/lms/enrollments?userId=${currentUser.id}&limit=100`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch enrollments: ${response.status}`);
        }

        const data = await response.json();
        const docs = Array.isArray(data.docs) ? data.docs : [];
        const matchedEnrollment = docs.find((item: EnrollmentDetail) => String(item.id) === String(enrollmentId)) || null;

        if (!active) return;

        if (!matchedEnrollment) {
          setError('Enrollment record not found in your account.');
          setEnrollment(null);
          return;
        }

        setEnrollment(matchedEnrollment);
      } catch (loadError) {
        console.error('Failed to load enrollment details', loadError);
        if (active) {
          setError('We could not load your enrollment details right now.');
          setEnrollment(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEnrollment();

    return () => {
      active = false;
    };
  }, [enrollmentId, router]);

  const metadataEntries = useMemo(() => {
    if (!enrollment?.metadata || typeof enrollment.metadata !== 'object') return [];
    return Object.entries(enrollment.metadata);
  }, [enrollment?.metadata]);

  const pricingBreakdownEntries = useMemo(() => {
    if (!enrollment?.pricingBreakdown || typeof enrollment.pricingBreakdown !== 'object') return [];
    return Object.entries(enrollment.pricingBreakdown);
  }, [enrollment?.pricingBreakdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-[10px] py-6">
        <div className="w-full space-y-6">
          <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 animate-pulse">
            <div className="mb-4 h-6 w-2/5 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 animate-pulse">
                <div className="mb-4 h-5 w-36 rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index}>
                      <div className="mb-2 h-3 w-24 rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 animate-pulse">
                <div className="mb-4 h-5 w-28 rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-[10px] py-6">
        <div className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <i className="fa fa-exclamation-circle text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enrollment Details Unavailable</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{error || 'We could not find that enrollment record.'}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/portal/account?tab=Account"
              className="inline-flex items-center justify-center rounded-lg bg-[#201a7c] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#1a1563] dark:bg-[#3028a3] dark:hover:bg-[#3b32c4]"
            >
              Back to Account
            </Link>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const course = enrollment.course;
  const studentName = getPersonName(enrollment.student?.user);
  const instructorName = getPersonName(course?.instructor?.user);
  const coursePlayerLink = course?.id ? `/portal/courses/${course.id}/player` : null;

  return (
    <div className="min-h-screen bg-[var(--background)] px-[10px] py-6">
      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/portal/account?tab=Account" className="font-medium text-[#201a7c] hover:text-[#1a1563] dark:text-[#7b75ef] dark:hover:text-[#968fff]">
            <i className="fa fa-arrow-left mr-2"></i>
            Back to Account
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span>Enrollment Details</span>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getEnrollmentBadgeClasses(enrollment)}`}>
                  {getEnrollmentDisplayStatus(enrollment)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Enrollment ID: {enrollment.id}</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {course?.title || 'Course Enrollment'}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                Review your enrollment record, progress, payment details, access dates, and administrative notes for this course.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              {coursePlayerLink ? (
                <Link
                  href={coursePlayerLink as any}
                  className="inline-flex items-center justify-center rounded-lg bg-[#201a7c] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#1a1563] dark:bg-[#3028a3] dark:hover:bg-[#3b32c4]"
                >
                  Open Course Player
                </Link>
              ) : null}
              <Link
                href="/portal/account?tab=Account"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Return to History
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enrollment Record</h2>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrolled At</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateTime(enrollment.enrolledAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrollment Type</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatStatusLabel(enrollment.enrollmentType)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrollment Status</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatStatusLabel(enrollment.status)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment Status</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatStatusLabel(enrollment.paymentStatus)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Access Expires At</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateTime(enrollment.accessExpiresAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Amount Paid</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(enrollment.amountPaid)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Coupon Code Snapshot</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{enrollment.couponCode || 'Not applied'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Coupon Discount Snapshot</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(enrollment.couponDiscountAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Original Price Snapshot</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(enrollment.listPriceSnapshot)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Final Price Snapshot</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(enrollment.finalPriceSnapshot)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Course Price</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(course?.price)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Discounted Price</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(course?.discountedPrice)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Certificate Issued</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{enrollment.certificateIssued ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrolled By</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{getRelationshipName(enrollment.enrolledBy)}</p>
                </div>
              </div>

              {pricingBreakdownEntries.length > 0 ? (
                <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-gray-50 px-4 py-4 dark:bg-gray-800/40">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pricing Breakdown Snapshot</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {pricingBreakdownEntries.map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {formatStatusLabel(key)}
                        </p>
                        <p className="mt-1 break-words text-sm text-gray-900 dark:text-gray-100">
                          {typeof value === 'number'
                            ? formatCurrency(value)
                            : renderMetadataValue(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Progress And Evaluation</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Progress Percentage</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatNumber(enrollment.progressPercentage, '%')}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-[#201a7c] dark:bg-[#5c54e0]"
                      style={{ width: `${enrollment.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Current Grade</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatNumber(enrollment.currentGrade, '%')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Final Grade</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatNumber(enrollment.finalGrade, '%')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Final Evaluation</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatStatusLabel(enrollment.finalEvaluation)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Completed At</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateTime(enrollment.completedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Last Accessed At</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateTime(enrollment.lastAccessedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {enrollment.notes ? (
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Administrative Notes</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">{enrollment.notes}</p>
              </div>
            ) : null}

            {metadataEntries.length > 0 ? (
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Metadata</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {metadataEntries.map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-[var(--card-border)] bg-gray-50 px-4 py-3 dark:bg-gray-800/40">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{formatStatusLabel(key)}</p>
                      <p className="mt-2 break-words text-sm text-gray-900 dark:text-gray-100">{renderMetadataValue(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
              <img
                src={getMediaUrl(course?.thumbnail)}
                alt={course?.title || 'Course'}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course?.title || 'Course'}</h2>
                {course?.excerpt ? (
                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{course.excerpt}</p>
                ) : null}
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Course Price</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(course?.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Discounted Price</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(course?.discountedPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Instructor</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{instructorName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Difficulty</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{course?.difficultyLevel || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Estimated Duration</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {course?.estimatedDuration
                        ? `${course.estimatedDuration} ${course.estimatedDurationUnit || 'Hours'}`
                        : 'Self-paced'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Record</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Student</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{studentName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">SRN</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{enrollment.student?.srn || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{enrollment.student?.user?.email || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
