'use client';

import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts';
import type { StatusBucket } from '../actions';

interface StatusDistributionChartProps {
  data: StatusBucket[];
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  completed: '#3b82f6',
  dropped: '#ef4444',
  pending: '#f59e0b',
  suspended: '#f97316',
};

export function StatusDistributionChart({ data, loading }: StatusDistributionChartProps) {
  const option = useMemo(() => {
    if (!data?.length) return null;

    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return null;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Enrollments: ${p.value}<br/>Share: ${p.percent.toFixed(1)}%`,
      },
      series: [
        {
          type: 'pie',
          radius: ['0%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          padAngle: 1,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: (p: { name: string; percent: number }) =>
              p.percent > 3 ? `${p.name}\n${p.percent.toFixed(0)}%` : '',
            fontSize: 10,
            color: '#374151',
            lineHeight: 14,
          },
          emphasis: {
            label: { show: true, fontWeight: 'bold', fontSize: 12 },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
          },
          data: data.map(d => ({
            name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
            value: d.count,
            itemStyle: { color: STATUS_COLORS[d.status] || '#6b7280' },
          })),
          animationDuration: 800,
          animationEasing: 'cubicOut' as const,
        },
      ],
    };
  }, [data]);

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enrollment Status</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">Distribution</span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded flex-1" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-8" />
            </div>
          ))}
        </div>
      ) : !option ? (
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-sm text-gray-400 dark:text-gray-500">No enrollment status data</p>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            notMerge
            lazyUpdate
            style={{ height: 260, width: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
