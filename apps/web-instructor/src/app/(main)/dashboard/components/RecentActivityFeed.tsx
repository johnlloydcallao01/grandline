'use client';

import React from 'react';
import type { RecentActivity } from '../actions';

interface RecentActivityFeedProps {
  data: RecentActivity[];
  loading?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  submission: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  enrollment: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  completion: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const typeColors: Record<string, string> = {
  submission: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  enrollment: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  completion: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
};

function FeedSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" />
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentActivityFeed({ data, loading }: RecentActivityFeedProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
        <FeedSkeleton />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex items-center justify-center h-48">
        <p className="text-sm text-gray-400 dark:text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
        {data.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className={`p-1.5 rounded-lg shrink-0 ${typeColors[activity.type] || 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}>
              {typeIcons[activity.type] || null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{activity.message}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
