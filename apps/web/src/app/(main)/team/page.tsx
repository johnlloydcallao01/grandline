"use client";

import React from "react";
import Image from "next/image";

/**
 * Team Management page component - Manage team members and organization
 */
export default function TeamPage() {

  // Mock team data
  const teamStats = [
    {
      id: 1,
      title: "Total Members",
      value: "48",
      change: "+3 this month",
      changeType: "positive",
      icon: "👥"
    },
    {
      id: 2,
      title: "Active Projects",
      value: "12",
      change: "+2 this week",
      changeType: "positive",
      icon: "📋"
    },
    {
      id: 3,
      title: "Departments",
      value: "6",
      change: "No change",
      changeType: "neutral",
      icon: "🏢"
    },
    {
      id: 4,
      title: "Avg. Performance",
      value: "87%",
      change: "+5% this quarter",
      changeType: "positive",
      icon: "📈"
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Engineering Manager",
      department: "Engineering",
      email: "sarah.johnson@company.com",
      status: "active",
      joinDate: "Jan 2022",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      performance: 92
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Senior Developer",
      department: "Engineering",
      email: "mike.chen@company.com",
      status: "active",
      joinDate: "Mar 2021",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      performance: 88
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Product Manager",
      department: "Product",
      email: "emily.rodriguez@company.com",
      status: "active",
      joinDate: "Aug 2020",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      performance: 95
    },
    {
      id: 4,
      name: "David Kim",
      role: "UX Designer",
      department: "Design",
      email: "david.kim@company.com",
      status: "active",
      joinDate: "Nov 2022",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      performance: 90
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Marketing Lead",
      department: "Marketing",
      email: "lisa.wang@company.com",
      status: "on-leave",
      joinDate: "Feb 2021",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      performance: 85
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Sales Manager",
      department: "Sales",
      email: "james.wilson@company.com",
      status: "active",
      joinDate: "Jun 2019",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      performance: 93
    },
  ];

  const departments = [
    { name: "Engineering", members: 18, lead: "Sarah Johnson", budget: "$2.4M" },
    { name: "Product", members: 8, lead: "Emily Rodriguez", budget: "$1.2M" },
    { name: "Design", members: 6, lead: "David Kim", budget: "$800K" },
    { name: "Marketing", members: 9, lead: "Lisa Wang", budget: "$1.5M" },
    { name: "Sales", members: 5, lead: "James Wilson", budget: "$900K" },
    { name: "Operations", members: 2, lead: "Alex Thompson", budget: "$600K" },
  ];

  const recentActivities = [
    {
      id: 1,
      activity: "New team member onboarded",
      user: "Alex Thompson",
      department: "Operations",
      time: "2 hours ago",
      type: "join"
    },
    {
      id: 2,
      activity: "Performance review completed",
      user: "Mike Chen",
      department: "Engineering",
      time: "1 day ago",
      type: "review"
    },
    {
      id: 3,
      activity: "Department budget updated",
      user: "Marketing Team",
      department: "Marketing",
      time: "2 days ago",
      type: "budget"
    },
    {
      id: 4,
      activity: "Team meeting scheduled",
      user: "Sarah Johnson",
      department: "Engineering",
      time: "3 days ago",
      type: "meeting"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
              <p className="text-sm md:text-base text-gray-600">Manage your team members, departments, and organizational structure</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base">
                Add Member
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                Org Chart
              </button>
            </div>
          </div>

          {/* Team Stats */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Team Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {teamStats.map((stat) => (
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
            {/* Team Members */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <div className="flex gap-2">
                    <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                      <option>All Departments</option>
                      <option>Engineering</option>
                      <option>Product</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{member.department}</span>
                          <span>•</span>
                          <span>Joined {member.joinDate}</span>
                          <span>•</span>
                          <span className={getPerformanceColor(member.performance)}>
                            {member.performance}% performance
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Departments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Departments</h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        <span className="text-sm text-gray-600">{dept.members} members</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Lead: {dept.lead}</p>
                      <p className="text-xs text-gray-500">Budget: {dept.budget}</p>
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
                        activity.type === 'join' ? 'bg-green-500' :
                        activity.type === 'review' ? 'bg-blue-500' :
                        activity.type === 'budget' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-xs text-gray-600">{activity.user} • {activity.department}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
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
