'use client';

import React from 'react';
import { Users, TrendingUp, Award, Clock, CheckCircle, AlertCircle, DollarSign } from '@/components/ui/IconWrapper';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <span className="text-sm text-gray-500">Last updated: Just now</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">2,543</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last month
            </p>
          </div>
        </div>

        {/* Course Completions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start space-x-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Course Completions</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">1,205</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% from last month
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start space-x-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">$45,231</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15.3% from last month
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {[
                {
                  id: 1,
                  content: 'New user registration',
                  target: 'Sarah Wilson',
                  date: '10 minutes ago',
                  icon: Users,
                  iconBackground: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                },
                {
                  id: 2,
                  content: 'Course completed',
                  target: 'Advanced React Patterns',
                  date: '2 hours ago',
                  icon: CheckCircle,
                  iconBackground: 'bg-green-100',
                  iconColor: 'text-green-600',
                },
                {
                  id: 3,
                  content: 'New active subscription',
                  target: 'Enterprise Plan',
                  date: '4 hours ago',
                  icon: DollarSign,
                  iconBackground: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                },
                {
                  id: 4,
                  content: 'System alert',
                  target: 'High server load detected',
                  date: '1 day ago',
                  icon: AlertCircle,
                  iconBackground: 'bg-yellow-100',
                  iconColor: 'text-yellow-600',
                },
                {
                  id: 5,
                  content: 'New review posted',
                  target: 'UI/UX Design Masterclass',
                  date: '1 day ago',
                  icon: Users,
                  iconBackground: 'bg-gray-100',
                  iconColor: 'text-gray-600',
                },
              ].map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== 4 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.iconBackground}`}
                        >
                          <activity.icon
                            className={`h-5 w-5 ${activity.iconColor}`}
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.content}{' '}
                            <span className="font-medium text-gray-900">
                              {activity.target}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.date}>{activity.date}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
