'use client';

import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts';

const CHART_COLORS = [
  '#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48',
  '#0ea5e9', '#84cc16', '#d946ef', '#10b981', '#fb923c',
];

export type ChartDatum = {
  name: string;
  value: number;
};

export type RevenueChartProps = {
  type: 'bar' | 'pie';
  data: ChartDatum[];
  title?: string;
  height?: number;
  barDirection?: 'horizontal' | 'vertical';
  showLegend?: boolean;
  showValueLabel?: boolean;
  emptyMessage?: string;
  className?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatShortNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function RevenueChart({
  type,
  data,
  title,
  height = 320,
  barDirection = 'horizontal',
  showLegend = true,
  showValueLabel = true,
  emptyMessage = 'No data available',
  className = '',
}: RevenueChartProps) {
  const option = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => b.value - a.value);
    const names = sorted.map((d) => d.name);
    const values = sorted.map((d) => d.value);
    const total = values.reduce((s, v) => s + v, 0);

    if (type === 'bar') {
      const isHorizontal = barDirection === 'horizontal';
      const displayNames = isHorizontal ? names.map((n) => (n.length > 28 ? `${n.slice(0, 26)}...` : n)) : names;

      return {
        tooltip: {
          trigger: 'axis' as const,
          axisPointer: { type: 'shadow' as const },
          formatter: (params: Array<{ name: string; value: number; seriesName: string }>) => {
            const p = params[0];
            const share = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0';
            return `<strong>${p.name}</strong><br/>Revenue: ${formatCurrency(p.value)}<br/>Share: ${share}%`;
          },
        },
        grid: {
          left: isHorizontal ? 140 : 40,
          right: showValueLabel ? 100 : 20,
          top: title ? 50 : 20,
          bottom: 30,
          containLabel: false,
        },
        xAxis: isHorizontal
          ? {
              type: 'value' as const,
              axisLabel: { formatter: (v: number) => formatShortNumber(v), fontSize: 11 },
              splitLine: { lineStyle: { color: '#e5e7eb' } },
            }
          : {
              type: 'category' as const,
              data: displayNames,
              axisLabel: { rotate: names.length > 6 ? 45 : 0, fontSize: 11, interval: 0 },
              splitLine: { show: false },
            },
        yAxis: isHorizontal
          ? {
              type: 'category' as const,
              data: displayNames,
              axisLabel: { fontSize: 11, width: 130, overflow: 'truncate' as const },
            }
          : {
              type: 'value' as const,
              axisLabel: { formatter: (v: number) => formatShortNumber(v), fontSize: 11 },
              splitLine: { lineStyle: { color: '#e5e7eb' } },
            },
        series: [
          {
            type: 'bar' as const,
            data: values.map((v, i) => ({
              value: v,
              itemStyle: {
                color: CHART_COLORS[i % CHART_COLORS.length],
                borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
              },
            })),
            barMaxWidth: 40,
            label: showValueLabel
              ? {
                  show: true,
                  position: isHorizontal ? 'right' : 'top',
                  formatter: (p: { value: number }) => formatShortNumber(p.value),
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#374151',
                }
              : undefined,
            backgroundStyle: { color: '#f3f4f6', borderRadius: 4 },
            showBackground: true,
          },
        ],
        color: CHART_COLORS,
      };
    }

    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Revenue: ${formatCurrency(p.value)}<br/>Share: ${formatPercent(p.percent)}`,
      },
      series: [
        {
          type: 'pie' as const,
          radius: ['35%', '62%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: showValueLabel
            ? {
                show: true,
                formatter: (p: { name: string; percent: number }) => `${p.name}\n${formatPercent(p.percent)}`,
                fontSize: 11,
                color: '#374151',
              }
            : { show: false },
          emphasis: {
            label: { show: true, fontWeight: 'bold', fontSize: 13 },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
          },
          data: sorted.map((d, i) => ({
            ...d,
            itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
          })),
        },
      ],
      color: CHART_COLORS,
      legend: showLegend
        ? {
            orient: 'horizontal' as const,
            bottom: 0,
            left: 'center',
            itemWidth: 12,
            itemHeight: 12,
            textStyle: { fontSize: 11, color: '#6b7280' },
          }
        : undefined,
    };
  }, [data, type, barDirection, showLegend, showValueLabel, title]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 ${className}`} style={{ height }}>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        style={{ height, width: '100%' }}
      />
    </div>
  );
}
