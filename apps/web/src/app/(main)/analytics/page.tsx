"use client";

import React from "react";

/**
 * Analytics page component - Shows business analytics and metrics
 */
export default function AnalyticsPage() {
  // Mock analytics data
  const keyMetrics = [
    {
      id: 1,
      title: "Total Revenue",
      value: "$2,847,392",
      change: "+12.5%",
      changeType: "positive",
      icon: "💰"
    },
    {
      id: 2,
      title: "Active Users",
      value: "45,892",
      change: "+8.2%",
      changeType: "positive",
      icon: "👥"
    },
    {
      id: 3,
      title: "Conversion Rate",
      value: "3.24%",
      change: "-0.8%",
      changeType: "negative",
      icon: "📈"
    },
    {
      id: 4,
      title: "Avg. Session Duration",
      value: "4m 32s",
      change: "+15.3%",
      changeType: "positive",
      icon: "⏱️"
    },
  ];

  const trafficSources = [
    { source: "Organic Search", visitors: 28450, percentage: 42.3, color: "bg-blue-500" },
    { source: "Direct", visitors: 18920, percentage: 28.1, color: "bg-green-500" },
    { source: "Social Media", visitors: 12340, percentage: 18.4, color: "bg-purple-500" },
    { source: "Referral", visitors: 5680, percentage: 8.4, color: "bg-orange-500" },
    { source: "Email", visitors: 1890, percentage: 2.8, color: "bg-red-500" },
  ];

  const topPages = [
    { page: "/", views: 45892, bounceRate: "32.4%", avgTime: "3m 45s" },
    { page: "/products", views: 28450, bounceRate: "28.1%", avgTime: "5m 12s" },
    { page: "/about", views: 18920, bounceRate: "45.2%", avgTime: "2m 18s" },
    { page: "/contact", views: 12340, bounceRate: "38.7%", avgTime: "1m 56s" },
    { page: "/blog", views: 8760, bounceRate: "52.3%", avgTime: "4m 33s" },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New user registration",
      user: "john.doe@example.com",
      time: "2 minutes ago",
      type: "user"
    },
    {
      id: 2,
      action: "Purchase completed",
      user: "sarah.smith@example.com",
      time: "5 minutes ago",
      type: "sale"
    },
    {
      id: 3,
      action: "Support ticket created",
      user: "mike.johnson@example.com",
      time: "8 minutes ago",
      type: "support"
    },
    {
      id: 4,
      action: "Newsletter subscription",
      user: "emma.wilson@example.com",
      time: "12 minutes ago",
      type: "marketing"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-sm md:text-base text-gray-600">Track your business performance and key metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {keyMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{metric.icon}</div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        metric.changeType === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Traffic Sources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {source.visitors.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{page.page}</div>
                      <div className="text-xs text-gray-500">{page.views.toLocaleString()} views</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Bounce: {page.bounceRate}</div>
                      <div className="text-xs text-gray-600">Time: {page.avgTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'sale' ? 'bg-green-500' :
                    activity.type === 'support' ? 'bg-orange-500' :
                    'bg-purple-500'
                  }`}>
                    {activity.type === 'user' ? '👤' :
                     activity.type === 'sale' ? '💰' :
                     activity.type === 'support' ? '🎧' :
                     '📧'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Schedule Report
            </button>
          </div>
        </div>
  );
}
