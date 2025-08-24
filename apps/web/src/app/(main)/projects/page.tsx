"use client";

import React from "react";

/**
 * Projects page component - Project management and tracking
 */
export default function ProjectsPage() {

  // Mock projects data
  const projectStats = [
    {
      id: 1,
      title: "Active Projects",
      value: "12",
      change: "+2 this month",
      changeType: "positive",
      icon: "🚀"
    },
    {
      id: 2,
      title: "Completed",
      value: "34",
      change: "+8 this quarter",
      changeType: "positive",
      icon: "✅"
    },
    {
      id: 3,
      title: "On Schedule",
      value: "85%",
      change: "+5% improvement",
      changeType: "positive",
      icon: "⏰"
    },
    {
      id: 4,
      title: "Team Utilization",
      value: "78%",
      change: "Optimal range",
      changeType: "neutral",
      icon: "👥"
    },
  ];

  const projects = [
    {
      id: 1,
      name: "Mobile App Redesign",
      description: "Complete redesign of the mobile application with new UI/UX",
      status: "in-progress",
      priority: "high",
      progress: 65,
      startDate: "Feb 1, 2024",
      endDate: "Apr 15, 2024",
      team: ["Sarah Johnson", "Mike Chen", "David Kim"],
      budget: "$85,000",
      spent: "$52,000"
    },
    {
      id: 2,
      name: "API Integration Platform",
      description: "Build a comprehensive API integration platform for third-party services",
      status: "in-progress",
      priority: "medium",
      progress: 40,
      startDate: "Jan 15, 2024",
      endDate: "May 30, 2024",
      team: ["Emily Rodriguez", "James Wilson"],
      budget: "$120,000",
      spent: "$48,000"
    },
    {
      id: 3,
      name: "Customer Analytics Dashboard",
      description: "Advanced analytics dashboard for customer behavior insights",
      status: "planning",
      priority: "medium",
      progress: 15,
      startDate: "Mar 1, 2024",
      endDate: "Jun 15, 2024",
      team: ["Lisa Wang", "Alex Thompson"],
      budget: "$65,000",
      spent: "$9,750"
    },
    {
      id: 4,
      name: "Security Audit & Compliance",
      description: "Comprehensive security audit and compliance implementation",
      status: "completed",
      priority: "high",
      progress: 100,
      startDate: "Dec 1, 2023",
      endDate: "Feb 28, 2024",
      team: ["Mike Chen", "Sarah Johnson", "David Kim"],
      budget: "$45,000",
      spent: "$43,200"
    },
  ];

  const milestones = [
    {
      id: 1,
      title: "Mobile App Beta Release",
      project: "Mobile App Redesign",
      date: "Mar 30, 2024",
      status: "upcoming",
      daysLeft: 8
    },
    {
      id: 2,
      title: "API Documentation Complete",
      project: "API Integration Platform",
      date: "Apr 5, 2024",
      status: "upcoming",
      daysLeft: 14
    },
    {
      id: 3,
      title: "User Research Phase",
      project: "Customer Analytics Dashboard",
      date: "Mar 15, 2024",
      status: "overdue",
      daysLeft: -7
    },
    {
      id: 4,
      title: "Security Report Delivered",
      project: "Security Audit & Compliance",
      date: "Feb 28, 2024",
      status: "completed",
      daysLeft: 0
    },
  ];

  const recentActivities = [
    {
      id: 1,
      activity: "Task completed: UI mockups approved",
      project: "Mobile App Redesign",
      user: "David Kim",
      time: "2 hours ago",
      type: "task"
    },
    {
      id: 2,
      activity: "New milestone added",
      project: "API Integration Platform",
      user: "Emily Rodriguez",
      time: "4 hours ago",
      type: "milestone"
    },
    {
      id: 3,
      activity: "Budget updated",
      project: "Customer Analytics Dashboard",
      user: "Lisa Wang",
      time: "1 day ago",
      type: "budget"
    },
    {
      id: 4,
      activity: "Project status changed to completed",
      project: "Security Audit & Compliance",
      user: "Mike Chen",
      time: "2 days ago",
      type: "status"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
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

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-sm md:text-base text-gray-600">Manage and track your projects, milestones, and team progress</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base">
                New Project
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                Gantt View
              </button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {projectStats.map((stat) => (
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
                          : stat.changeType === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option>All Projects</option>
                    <option>In Progress</option>
                    <option>Planning</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="space-y-6">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(project.priority)}`}>
                              {project.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-900 font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>{project.startDate} - {project.endDate}</span>
                              <span>Team: {project.team.length} members</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>{project.spent} / {project.budget}</span>
                            </div>
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
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Upcoming Milestones */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getMilestoneStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{milestone.project}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{milestone.date}</span>
                        {milestone.status === 'upcoming' && (
                          <span className="text-blue-600">{milestone.daysLeft} days left</span>
                        )}
                        {milestone.status === 'overdue' && (
                          <span className="text-red-600">{Math.abs(milestone.daysLeft)} days overdue</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'task' ? 'bg-green-500' :
                        activity.type === 'milestone' ? 'bg-blue-500' :
                        activity.type === 'budget' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-xs text-gray-600">{activity.project}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
