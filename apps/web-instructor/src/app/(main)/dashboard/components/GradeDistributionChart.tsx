'use client';

import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts';
import type { GradeBucket } from '../actions';

interface GradeDistributionChartProps {
  data: GradeBucket[];
  loading?: boolean;
}

const GRADE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

export function GradeDistributionChart({ data, loading }: GradeDistributionChartProps) {
  const option = useMemo(() => {
    if (!data?.length) return null;

    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return null;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Students: ${p.value}<br/>Share: ${p.percent.toFixed(1)}%`,
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          padAngle: 1.5,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: (p: { name: string; percent: number }) =>
              p.percent > 4 ? `${p.name}\n${p.percent.toFixed(0)}%` : '',
            fontSize: 10,
            color: '#374151',
            lineHeight: 14,
          },
          emphasis: {
            label: { show: true, fontWeight: 'bold', fontSize: 12 },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
          },
          data: data.map((d, i) => ({
            name: `${d.label} (${d.range})`,
            value: d.count,
            itemStyle: { color: GRADE_COLORS[i % GRADE_COLORS.length] },
          })),
          animationDuration: 1000,
          animationEasing: 'cubicOut' as const,
        },
      ],
      color: GRADE_COLORS,
    };
  }, [data]);

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Grade Distribution</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">Across all courses</span>
      </div>
      {loading ? (
        <div className="animate-pulse flex items-center justify-center h-[280px]">
          <div className="relative h-40 w-40">
            <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="absolute inset-5 rounded-full bg-white dark:bg-[var(--card-background)]" />
          </div>
        </div>
      ) : !option ? (
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-sm text-gray-400 dark:text-gray-500">No grade data available</p>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            notMerge
            lazyUpdate
            style={{ height: 280, width: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
