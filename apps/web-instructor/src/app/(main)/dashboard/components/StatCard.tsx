'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'red' | 'indigo';
  formatter?: (value: number) => string;
  loading?: boolean;
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500' },
  green: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-400', accent: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-600 dark:text-orange-400', accent: 'bg-orange-500' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', iconBg: 'bg-pink-100 dark:bg-pink-900/50', iconColor: 'text-pink-600 dark:text-pink-400', accent: 'bg-pink-500' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/30', iconBg: 'bg-teal-100 dark:bg-teal-900/50', iconColor: 'text-teal-600 dark:text-teal-400', accent: 'bg-teal-500' },
  red: { bg: 'bg-red-50 dark:bg-red-950/30', iconBg: 'bg-red-100 dark:bg-red-900/50', iconColor: 'text-red-600 dark:text-red-400', accent: 'bg-red-500' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', iconBg: 'bg-indigo-100 dark:bg-indigo-900/50', iconColor: 'text-indigo-600 dark:text-indigo-400', accent: 'bg-indigo-500' },
};

const trendStyles = {
  up: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
  down: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
  neutral: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800',
};

const trendIcons = {
  up: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  down: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  neutral: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
    </svg>
  ),
};

export function StatCard({ title, value, subtitle, icon, trend, color = 'blue', formatter, loading }: StatCardProps) {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-16" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-28" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  const displayValue = typeof value === 'number' && formatter ? formatter(value) : value;

  return (
    <div className="group relative bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight">{displayValue}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trendStyles[trend.direction]}`}>
              {trendIcons[trend.direction]}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg ${c.iconBg} shrink-0 ring-1 ring-black/5`}>
            <div className={`w-5 h-5 ${c.iconColor}`}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
