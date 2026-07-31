'use client';

import React from 'react';
import type { PendingSubmission } from '../actions';

interface PendingSubmissionsTableProps {
  data: PendingSubmission[];
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  returned_for_revision: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  graded: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
};

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" />
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PendingSubmissionsTable({ data, loading }: PendingSubmissionsTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
        <TableSkeleton />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex items-center justify-center h-48">
        <p className="text-sm text-gray-400 dark:text-gray-500">No pending submissions</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pending Submissions</h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
          {data.length} need review
        </span>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
        {data.map((sub) => (
          <div key={sub.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{sub.traineeName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{sub.assignmentTitle}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub.courseTitle}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sub.status] || 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {sub.status === 'returned_for_revision' ? 'Revision' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
