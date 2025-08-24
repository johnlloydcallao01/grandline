"use client";

import React, { useState } from "react";
import Image from "next/image";

/**
 * Tasks page component - Task management and tracking
 */
export default function TasksPage() {
  const [filter, setFilter] = useState("all");

  // Mock tasks data
  const taskStats = [
    {
      id: 1,
      title: "Total Tasks",
      value: "47",
      change: "+8 this week",
      changeType: "positive",
      icon: "📋"
    },
    {
      id: 2,
      title: "Completed",
      value: "23",
      change: "+12 this week",
      changeType: "positive",
      icon: "✅"
    },
    {
      id: 3,
      title: "In Progress",
      value: "18",
      change: "Active tasks",
      changeType: "neutral",
      icon: "🔄"
    },
    {
      id: 4,
      title: "Overdue",
      value: "6",
      change: "-2 from yesterday",
      changeType: "positive",
      icon: "⚠️"
    },
  ];

  const tasks = [
    {
      id: 1,
      title: "Update user authentication system",
      description: "Implement OAuth 2.0 and improve security measures",
      status: "in-progress",
      priority: "high",
      assignee: "Mike Chen",
      project: "Mobile App Redesign",
      dueDate: "Mar 25, 2024",
      progress: 65,
      tags: ["security", "backend"]
    },
    {
      id: 2,
      title: "Design new dashboard layout",
      description: "Create wireframes and mockups for the analytics dashboard",
      status: "todo",
      priority: "medium",
      assignee: "David Kim",
      project: "Customer Analytics Dashboard",
      dueDate: "Mar 28, 2024",
      progress: 0,
      tags: ["design", "ui/ux"]
    },
    {
      id: 3,
      title: "Write API documentation",
      description: "Complete documentation for all REST API endpoints",
      status: "in-progress",
      priority: "medium",
      assignee: "Sarah Johnson",
      project: "API Integration Platform",
      dueDate: "Mar 30, 2024",
      progress: 40,
      tags: ["documentation", "api"]
    },
    {
      id: 4,
      title: "Conduct user testing sessions",
      description: "Organize and conduct usability testing with 10 users",
      status: "completed",
      priority: "high",
      assignee: "Emily Rodriguez",
      project: "Mobile App Redesign",
      dueDate: "Mar 20, 2024",
      progress: 100,
      tags: ["testing", "user research"]
    },
    {
      id: 5,
      title: "Optimize database queries",
      description: "Improve performance of slow-running database queries",
      status: "todo",
      priority: "low",
      assignee: "Mike Chen",
      project: "Performance Optimization",
      dueDate: "Apr 5, 2024",
      progress: 0,
      tags: ["database", "performance"]
    },
    {
      id: 6,
      title: "Set up CI/CD pipeline",
      description: "Configure automated testing and deployment pipeline",
      status: "overdue",
      priority: "high",
      assignee: "Alex Thompson",
      project: "DevOps Infrastructure",
      dueDate: "Mar 15, 2024",
      progress: 25,
      tags: ["devops", "automation"]
    },
  ];

  const taskFilters = [
    { id: "all", name: "All Tasks", count: 47 },
    { id: "todo", name: "To Do", count: 18 },
    { id: "in-progress", name: "In Progress", count: 18 },
    { id: "completed", name: "Completed", count: 23 },
    { id: "overdue", name: "Overdue", count: 6 },
  ];

  const recentActivities = [
    {
      id: 1,
      activity: "Task completed",
      task: "Conduct user testing sessions",
      user: "Emily Rodriguez",
      time: "2 hours ago",
      type: "completed"
    },
    {
      id: 2,
      activity: "Task assigned",
      task: "Design new dashboard layout",
      user: "David Kim",
      time: "4 hours ago",
      type: "assigned"
    },
    {
      id: 3,
      activity: "Priority updated",
      task: "Update user authentication system",
      user: "Sarah Johnson",
      time: "6 hours ago",
      type: "updated"
    },
    {
      id: 4,
      activity: "Comment added",
      task: "Write API documentation",
      user: "Mike Chen",
      time: "1 day ago",
      type: "comment"
    },
  ];

  const teamMembers = [
    { name: "Mike Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face", tasks: 8 },
    { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face", tasks: 6 },
    { name: "David Kim", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face", tasks: 5 },
    { name: "Emily Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face", tasks: 7 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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

  const filteredTasks = filter === "all" ? tasks : tasks.filter(task => task.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
              <p className="text-sm md:text-base text-gray-600">Manage and track your tasks and project deliverables</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base">
                New Task
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                Kanban View
              </button>
            </div>
          </div>

          {/* Task Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Task Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {taskStats.map((stat) => (
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

          {/* Task Filters */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {taskFilters.map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === filterOption.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filterOption.name} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tasks List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {filter === "all" ? "All Tasks" : taskFilters.find(f => f.id === filter)?.name}
                  </h3>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option>Sort by Due Date</option>
                    <option>Sort by Priority</option>
                    <option>Sort by Status</option>
                    <option>Sort by Assignee</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          
                          {/* Progress Bar */}
                          {task.status === 'in-progress' && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="text-gray-900 font-medium">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>👤 {task.assignee}</span>
                              <span>📁 {task.project}</span>
                              <span>📅 {task.dueDate}</span>
                            </div>
                            <div className="flex gap-1">
                              {task.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
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
              {/* Team Workload */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{member.tasks}</span>
                        <span className="text-xs text-gray-500 ml-1">tasks</span>
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
                        activity.type === 'completed' ? 'bg-green-500' :
                        activity.type === 'assigned' ? 'bg-blue-500' :
                        activity.type === 'updated' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-xs text-gray-600">{activity.task}</p>
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
