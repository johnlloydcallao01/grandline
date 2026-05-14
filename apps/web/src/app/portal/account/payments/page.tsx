'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

type PaymentBreakdownEnrollment = {
  id: string | number;
  status: string;
  enrollmentType?: string | null;
  paymentStatus?: string | null;
  amountPaid?: number | null;
  enrolledAt?: string | null;
  course?: {
    id?: string | number;
    title?: string | null;
    price?: number | null;
    discountedPrice?: number | null;
  } | null;
};

function formatStatusLabel(status?: string | null): string {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return 'PHP 0.00';

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return 'No date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getEffectiveCoursePrice(enrollment: PaymentBreakdownEnrollment): number {
  if (typeof enrollment.course?.discountedPrice === 'number') {
    return enrollment.course.discountedPrice;
  }

  return typeof enrollment.course?.price === 'number' ? enrollment.course.price : 0;
}

export default function AccountPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<PaymentBreakdownEnrollment[]>([]);

  useEffect(() => {
    let active = true;

    async function loadPayments() {
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

        if (!active) return;

        setEnrollments(docs);
      } catch (loadError) {
        console.error('Failed to load payment breakdown', loadError);
        if (active) {
          setError('We could not load your payment breakdown right now.');
          setEnrollments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      active = false;
    };
  }, [router]);

  const paidEnrollments = useMemo(() => {
    return [...enrollments]
      .filter((enrollment) => (typeof enrollment.amountPaid === 'number' ? enrollment.amountPaid : 0) > 0)
      .sort((a, b) => {
        const aTime = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
        const bTime = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [enrollments]);

  const totalAmountPaid = useMemo(() => {
    return paidEnrollments.reduce((total, enrollment) => total + (enrollment.amountPaid || 0), 0);
  }, [paidEnrollments]);

  const totalRemainingBalance = useMemo(() => {
    return paidEnrollments.reduce((total, enrollment) => {
      const remaining = Math.max(getEffectiveCoursePrice(enrollment) - (enrollment.amountPaid || 0), 0);
      return total + remaining;
    }, 0);
  }, [paidEnrollments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-[10px] py-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6">
            <div className="h-7 w-60 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mt-3 h-4 w-80 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="mt-4 h-8 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)]">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-b border-[var(--card-border)] p-6 last:border-b-0">
                <div className="h-5 w-52 rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((__, innerIndex) => (
                    <div key={innerIndex}>
                      <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="mt-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-[10px] py-6">
        <div className="space-y-6">
          <Link
            href="/portal/account?tab=Account"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#201a7c] hover:text-[#1a1563] dark:text-[#7b75ef] dark:hover:text-[#968fff]"
          >
            <i className="fa fa-arrow-left"></i>
            Back to Account
          </Link>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-[10px] py-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/portal/account?tab=Account"
            className="font-medium text-[#201a7c] hover:text-[#1a1563] dark:text-[#7b75ef] dark:hover:text-[#968fff]"
          >
            <i className="fa fa-arrow-left mr-2"></i>
            Back to Account
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span>Amount Paid Breakdown</span>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Amount Paid Breakdown</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review the paid courses contributing to your `Total Amount Paid`, including the course price, paid amount, and remaining balance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Paid Enrollments</p>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{paidEnrollments.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Amount Paid</p>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalAmountPaid)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Remaining Balance</p>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalRemainingBalance)}</p>
          </div>
        </div>

        {paidEnrollments.length === 0 ? (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No paid courses yet</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Courses with a recorded `Amount Paid` will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
            {paidEnrollments.map((enrollment) => {
              const coursePrice = getEffectiveCoursePrice(enrollment);
              const amountPaid = enrollment.amountPaid || 0;
              const remainingBalance = Math.max(coursePrice - amountPaid, 0);

              return (
                <div
                  key={String(enrollment.id)}
                  className="border-b border-[var(--card-border)] p-6 last:border-b-0"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {enrollment.course?.title || 'Untitled Course'}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span>{formatStatusLabel(enrollment.status)}</span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span>{formatStatusLabel(enrollment.paymentStatus || 'unknown')}</span>
                      </div>
                    </div>

                    <Link
                      href={`/portal/account/enrollments/${enrollment.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[#201a7c] transition-colors hover:bg-gray-50 dark:text-[#7b75ef] dark:hover:bg-gray-800"
                    >
                      View Details
                    </Link>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrollment Type</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatStatusLabel(enrollment.enrollmentType)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Course Price</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(coursePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Amount Paid</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(amountPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Remaining Balance</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(remainingBalance)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
