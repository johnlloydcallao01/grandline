"use client";

import React, { useState } from "react";

/**
 * Workflow page component - Business process automation and workflow management
 */
export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState("active");

  // Mock workflow data
  const workflowStats = [
    {
      id: 1,
      title: "Active Workflows",
      value: "12",
      change: "+3 this month",
      changeType: "positive",
      icon: "⚡"
    },
    {
      id: 2,
      title: "Automated Tasks",
      value: "1,247",
      change: "+156 this week",
      changeType: "positive",
      icon: "🤖"
    },
    {
      id: 3,
      title: "Time Saved",
      value: "48h",
      change: "+12h this week",
      changeType: "positive",
      icon: "⏱️"
    },
    {
      id: 4,
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1% improvement",
      changeType: "positive",
      icon: "📈"
    },
  ];

  const workflows = [
    {
      id: 1,
      name: "Employee Onboarding",
      description: "Automated process for new employee setup and documentation",
      status: "active",
      trigger: "New hire form submission",
      steps: 8,
      executions: 23,
      successRate: 96,
      lastRun: "2 hours ago",
      category: "HR"
    },
    {
      id: 2,
      name: "Invoice Processing",
      description: "Automated invoice approval and payment processing workflow",
      status: "active",
      trigger: "Invoice upload",
      steps: 6,
      executions: 156,
      successRate: 98,
      lastRun: "30 minutes ago",
      category: "Finance"
    },
    {
      id: 3,
      name: "Customer Support Ticket",
      description: "Automatic ticket routing and escalation based on priority",
      status: "active",
      trigger: "Support ticket creation",
      steps: 5,
      executions: 89,
      successRate: 92,
      lastRun: "1 hour ago",
      category: "Support"
    },
    {
      id: 4,
      name: "Project Approval",
      description: "Multi-stage approval process for new project proposals",
      status: "paused",
      trigger: "Project proposal submission",
      steps: 7,
      executions: 12,
      successRate: 88,
      lastRun: "2 days ago",
      category: "Operations"
    },
    {
      id: 5,
      name: "Marketing Campaign Launch",
      description: "Automated campaign setup and notification workflow",
      status: "draft",
      trigger: "Campaign approval",
      steps: 10,
      executions: 0,
      successRate: 0,
      lastRun: "Never",
      category: "Marketing"
    },
  ];

  const workflowTemplates = [
    {
      id: 1,
      name: "Lead Qualification",
      description: "Automatically qualify and route new leads to sales team",
      category: "Sales",
      popularity: "Most Popular",
      estimatedTime: "15 min setup"
    },
    {
      id: 2,
      name: "Content Approval",
      description: "Multi-step content review and approval process",
      category: "Marketing",
      popularity: "Trending",
      estimatedTime: "20 min setup"
    },
    {
      id: 3,
      name: "Expense Reimbursement",
      description: "Automated expense report processing and approval",
      category: "Finance",
      popularity: "New",
      estimatedTime: "25 min setup"
    },
    {
      id: 4,
      name: "Bug Report Triage",
      description: "Automatic bug categorization and assignment",
      category: "Development",
      popularity: "",
      estimatedTime: "10 min setup"
    },
  ];

  const recentExecutions = [
    {
      id: 1,
      workflow: "Employee Onboarding",
      status: "completed",
      duration: "4m 32s",
      trigger: "New hire: Sarah Wilson",
      time: "2 hours ago"
    },
    {
      id: 2,
      workflow: "Invoice Processing",
      status: "completed",
      duration: "1m 15s",
      trigger: "Invoice #INV-2024-0156",
      time: "30 minutes ago"
    },
    {
      id: 3,
      workflow: "Customer Support Ticket",
      status: "running",
      duration: "2m 45s",
      trigger: "Ticket #SUP-789",
      time: "1 hour ago"
    },
    {
      id: 4,
      workflow: "Invoice Processing",
      status: "failed",
      duration: "0m 45s",
      trigger: "Invoice #INV-2024-0157",
      time: "3 hours ago"
    },
  ];

  const workflowCategories = [
    { name: "HR", count: 4, color: "bg-blue-500" },
    { name: "Finance", count: 6, color: "bg-green-500" },
    { name: "Marketing", count: 3, color: "bg-purple-500" },
    { name: "Support", count: 5, color: "bg-orange-500" },
    { name: "Operations", count: 2, color: "bg-red-500" },
    { name: "Development", count: 3, color: "bg-indigo-500" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (activeTab === "active") return workflow.status === "active";
    if (activeTab === "paused") return workflow.status === "paused";
    if (activeTab === "draft") return workflow.status === "draft";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
              <p className="text-sm md:text-base text-gray-600">Automate your business processes and improve efficiency</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base">
                Create Workflow
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                Browse Templates
              </button>
            </div>
          </div>

          {/* Workflow Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Automation Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {workflowStats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{stat.icon}</div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        stat.changeType === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "active", name: "Active", count: workflows.filter(w => w.status === "active").length },
                  { id: "paused", name: "Paused", count: workflows.filter(w => w.status === "paused").length },
                  { id: "draft", name: "Draft", count: workflows.filter(w => w.status === "draft").length },
                  { id: "all", name: "All", count: workflows.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Workflows List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflows</h3>
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => (
                    <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(workflow.status)}`}>
                              {workflow.status}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              {workflow.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Trigger:</span>
                              <p className="font-medium text-gray-900">{workflow.trigger}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Steps:</span>
                              <p className="font-medium text-gray-900">{workflow.steps}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Executions:</span>
                              <p className="font-medium text-gray-900">{workflow.executions}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Success Rate:</span>
                              <p className="font-medium text-gray-900">{workflow.successRate}%</p>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-500">
                            Last run: {workflow.lastRun}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                          <button className="text-gray-600 hover:text-gray-700 text-sm">View</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Templates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflowTemplates.map((template) => (
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
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{template.category}</span>
                        <span>{template.estimatedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Recent Executions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
                <div className="space-y-4">
                  {recentExecutions.map((execution) => (
                    <div key={execution.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{execution.workflow}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getExecutionStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{execution.trigger}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{execution.duration}</span>
                        <span>{execution.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {workflowCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                        <span className="text-sm text-gray-900">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
