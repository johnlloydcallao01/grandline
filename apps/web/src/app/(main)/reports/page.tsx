"use client";

import React, { useState } from "react";

/**
 * Reports page component - Business reports and data analysis
 */
export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Mock reports data
  const reportCategories = [
    { id: 1, name: "Sales Reports", count: 12, icon: "💰", color: "bg-green-500" },
    { id: 2, name: "User Analytics", count: 8, icon: "👥", color: "bg-blue-500" },
    { id: 3, name: "Financial Reports", count: 15, icon: "📊", color: "bg-purple-500" },
    { id: 4, name: "Marketing Reports", count: 6, icon: "📢", color: "bg-orange-500" },
    { id: 5, name: "Operational Reports", count: 10, icon: "⚙️", color: "bg-gray-500" },
    { id: 6, name: "Custom Reports", count: 4, icon: "🔧", color: "bg-indigo-500" },
  ];

  const recentReports = [
    {
      id: 1,
      title: "Monthly Sales Summary",
      description: "Comprehensive sales analysis for the current month",
      type: "Sales",
      lastGenerated: "2 hours ago",
      size: "2.4 MB",
      format: "PDF",
      status: "ready"
    },
    {
      id: 2,
      title: "User Engagement Analytics",
      description: "Detailed user behavior and engagement metrics",
      type: "Analytics",
      lastGenerated: "1 day ago",
      size: "1.8 MB",
      format: "Excel",
      status: "ready"
    },
    {
      id: 3,
      title: "Financial Performance Q1",
      description: "Quarterly financial performance and projections",
      type: "Financial",
      lastGenerated: "3 days ago",
      size: "3.2 MB",
      format: "PDF",
      status: "ready"
    },
    {
      id: 4,
      title: "Marketing Campaign ROI",
      description: "Return on investment analysis for recent campaigns",
      type: "Marketing",
      lastGenerated: "Processing...",
      size: "-",
      format: "PDF",
      status: "processing"
    },
  ];

  const scheduledReports = [
    {
      id: 1,
      title: "Weekly Sales Report",
      schedule: "Every Monday at 9:00 AM",
      recipients: "sales@company.com",
      nextRun: "Tomorrow, 9:00 AM"
    },
    {
      id: 2,
      title: "Monthly User Report",
      schedule: "1st of every month",
      recipients: "management@company.com",
      nextRun: "March 1, 2024"
    },
    {
      id: 3,
      title: "Daily Operations Summary",
      schedule: "Daily at 6:00 PM",
      recipients: "ops@company.com",
      nextRun: "Today, 6:00 PM"
    },
  ];

  const reportTemplates = [
    {
      id: 1,
      name: "Sales Performance",
      description: "Track sales metrics and performance indicators",
      category: "Sales",
      popularity: "Most Popular"
    },
    {
      id: 2,
      name: "Customer Analysis",
      description: "Analyze customer behavior and demographics",
      category: "Analytics",
      popularity: "Trending"
    },
    {
      id: 3,
      name: "Revenue Breakdown",
      description: "Detailed revenue analysis by product and region",
      category: "Financial",
      popularity: "New"
    },
    {
      id: 4,
      name: "Marketing Metrics",
      description: "Campaign performance and marketing ROI",
      category: "Marketing",
      popularity: ""
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Reports</h1>
              <p className="text-sm md:text-base text-gray-600">Generate, schedule, and manage your business reports</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                Create Report
              </button>
            </div>
          </div>

          {/* Report Categories */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Report Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {reportCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white text-xl mb-3`}>
                    {category.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} reports</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Reports */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.lastGenerated}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span>{report.format}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {report.status === 'ready' && (
                          <>
                            <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                            <button className="text-gray-600 hover:text-gray-700 text-sm">Share</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Templates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        {template.popularity && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            template.popularity === 'Most Popular' ? 'bg-green-100 text-green-800' :
                            template.popularity === 'Trending' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {template.popularity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <span className="text-xs text-gray-500">{template.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scheduled Reports */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-900 text-sm">{report.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{report.schedule}</p>
                      <p className="text-xs text-gray-500 mb-1">To: {report.recipients}</p>
                      <p className="text-xs text-blue-600 font-medium">Next: {report.nextRun}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50">
                    Schedule New Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
