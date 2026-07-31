'use client';

import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts';
import type { MonthlyTrend } from '../actions';

interface EnrollmentTrendChartProps {
  enrollments: MonthlyTrend[];
  completions: MonthlyTrend[];
  loading?: boolean;
}

export function EnrollmentTrendChart({ enrollments, completions, loading }: EnrollmentTrendChartProps) {
  const option = useMemo(() => {
    if (!enrollments?.length && !completions?.length) return null;

    const allMonths = new Set<string>();
    enrollments?.forEach(e => allMonths.add(e.month));
    completions?.forEach(c => allMonths.add(c.month));
    const months = Array.from(allMonths).sort();

    const enrollMap = new Map(enrollments?.map(e => [e.month, e.count]) || []);
    const completeMap = new Map(completions?.map(c => [c.month, c.count]) || []);

    const enrollData = months.map(m => enrollMap.get(m) || 0);
    const completeData = months.map(m => completeMap.get(m) || 0);

    const labels = months.map(m => {
      const [year, month] = m.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['Enrollments', 'Completions'],
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12, color: '#6b7280' },
      },
      grid: {
        left: 50,
        right: 20,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 11, color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 11, color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
      },
      series: [
        {
          name: 'Enrollments',
          type: 'bar',
          barWidth: '28%',
          barGap: '15%',
          data: enrollData.map(v => ({
            value: v,
            itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] },
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (p: { value: number }) => p.value > 0 ? String(p.value) : '',
            fontSize: 10,
            color: '#6b7280',
          },
          animationDuration: 800,
          animationEasing: 'cubicOut' as const,
        },
        {
          name: 'Completions',
          type: 'bar',
          barWidth: '28%',
          data: completeData.map(v => ({
            value: v,
            itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (p: { value: number }) => p.value > 0 ? String(p.value) : '',
            fontSize: 10,
            color: '#6b7280',
          },
          animationDuration: 800,
          animationEasing: 'cubicOut' as const,
          animationDelay: (idx: number) => idx * 80,
        },
      ],
      color: ['#2563eb', '#22c55e'],
    };
  }, [enrollments, completions]);

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enrollment Trends</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">Monthly</span>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="flex items-end gap-3 h-[280px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${30 + Math.random() * 70}%` }} />
            ))}
          </div>
        </div>
      ) : !option ? (
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-sm text-gray-400 dark:text-gray-500">No enrollment trend data available</p>
        </div>
      ) : (
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge
          lazyUpdate
          style={{ height: 280, width: '100%' }}
        />
      )}
    </div>
  );
}
