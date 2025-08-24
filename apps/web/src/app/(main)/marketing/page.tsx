"use client";

import React from "react";

/**
 * Marketing page component - Marketing hub with campaigns and analytics
 */
export default function MarketingPage() {

  // Mock marketing data
  const marketingMetrics = [
    {
      id: 1,
      title: "Campaign ROI",
      value: "324%",
      change: "+45.2%",
      changeType: "positive",
      icon: "📈"
    },
    {
      id: 2,
      title: "Email Open Rate",
      value: "28.5%",
      change: "+3.1%",
      changeType: "positive",
      icon: "📧"
    },
    {
      id: 3,
      title: "Social Engagement",
      value: "12.8K",
      change: "+18.7%",
      changeType: "positive",
      icon: "👥"
    },
    {
      id: 4,
      title: "Conversion Rate",
      value: "4.2%",
      change: "-0.5%",
      changeType: "negative",
      icon: "🎯"
    },
  ];

  const activeCampaigns = [
    {
      id: 1,
      name: "Summer Sale 2024",
      type: "Email Campaign",
      status: "active",
      budget: "$5,000",
      spent: "$3,200",
      impressions: "125K",
      clicks: "3.2K",
      conversions: "156",
      endDate: "March 31, 2024"
    },
    {
      id: 2,
      name: "Social Media Boost",
      type: "Social Campaign",
      status: "active",
      budget: "$2,500",
      spent: "$1,800",
      impressions: "89K",
      clicks: "2.1K",
      conversions: "89",
      endDate: "March 25, 2024"
    },
    {
      id: 3,
      name: "Product Launch",
      type: "Multi-Channel",
      status: "scheduled",
      budget: "$10,000",
      spent: "$0",
      impressions: "-",
      clicks: "-",
      conversions: "-",
      endDate: "April 15, 2024"
    },
  ];

  const marketingChannels = [
    { channel: "Email Marketing", performance: 85, budget: "$8,500", roi: "420%" },
    { channel: "Social Media", performance: 72, budget: "$6,200", roi: "280%" },
    { channel: "Google Ads", performance: 68, budget: "$12,000", roi: "245%" },
    { channel: "Content Marketing", performance: 91, budget: "$4,800", roi: "380%" },
    { channel: "Influencer Marketing", performance: 76, budget: "$7,500", roi: "310%" },
  ];

  const recentActivities = [
    {
      id: 1,
      activity: "New email campaign launched",
      campaign: "Summer Sale 2024",
      time: "2 hours ago",
      type: "launch"
    },
    {
      id: 2,
      activity: "Social media post published",
      campaign: "Brand Awareness",
      time: "4 hours ago",
      type: "content"
    },
    {
      id: 3,
      activity: "Campaign budget updated",
      campaign: "Product Launch",
      time: "6 hours ago",
      type: "budget"
    },
    {
      id: 4,
      activity: "A/B test results available",
      campaign: "Email Newsletter",
      time: "1 day ago",
      type: "analysis"
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: "Review campaign performance",
      campaign: "Summer Sale 2024",
      dueDate: "Today",
      priority: "high"
    },
    {
      id: 2,
      task: "Create social media content",
      campaign: "Brand Awareness",
      dueDate: "Tomorrow",
      priority: "medium"
    },
    {
      id: 3,
      task: "Prepare launch materials",
      campaign: "Product Launch",
      dueDate: "March 28",
      priority: "high"
    },
    {
      id: 4,
      task: "Analyze competitor campaigns",
      campaign: "Market Research",
      dueDate: "March 30",
      priority: "low"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Marketing Hub</h1>
              <p className="text-sm md:text-base text-gray-600">Manage campaigns, track performance, and optimize your marketing efforts</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
              Create Campaign
            </button>
          </div>

          {/* Marketing Metrics */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {marketingMetrics.map((metric) => (
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

          {/* Active Campaigns */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Campaigns</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">{campaign.type}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.spent} / {campaign.budget}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(parseInt(campaign.spent.replace(/[$,]/g, '')) / parseInt(campaign.budget.replace(/[$,]/g, ''))) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.impressions} impressions</div>
                          <div className="text-sm text-gray-500">{campaign.clicks} clicks • {campaign.conversions} conversions</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-gray-600 hover:text-gray-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Marketing Channels and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Marketing Channels */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
                <div className="space-y-4">
                  {marketingChannels.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900">{channel.channel}</span>
                          <span className="text-sm text-gray-600">{channel.performance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${channel.performance}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Budget: {channel.budget}</span>
                          <span>ROI: {channel.roi}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'launch' ? 'bg-green-500' :
                        activity.type === 'content' ? 'bg-blue-500' :
                        activity.type === 'budget' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-xs text-gray-600">{activity.campaign}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{task.task}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{task.campaign}</p>
                      <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
