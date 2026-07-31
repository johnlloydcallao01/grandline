'use client';

import React from 'react';
import type { CourseStat } from '../actions';

interface CourseStatsTableProps {
  data: CourseStat[];
  loading?: boolean;
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-10" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-10" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseStatsTable({ data, loading }: CourseStatsTableProps) {
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
        <p className="text-sm text-gray-400 dark:text-gray-500">No course data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Course Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Grade</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{course.courseCode}</p>
                </td>
                <td className="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-300 tabular-nums">{course.totalEnrollments}</td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                    {course.activeEnrollments}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-sm font-medium tabular-nums ${
                    course.averageGrade >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                    course.averageGrade >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {course.averageGrade}%
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
                        style={{ width: `${course.averageProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{course.averageProgress}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  {course.pendingGrading > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                      {course.pendingGrading}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
