"use client";

import React from "react";

/**
 * Dashboard page component - Main business dashboard with overview
 */
export default function DashboardPage() {

  // Mock dashboard data
  const quickStats = [
    {
      id: 1,
      title: "Today's Sales",
      value: "$12,847",
      change: "+23.5%",
      changeType: "positive",
      icon: "💰",
      color: "bg-green-500"
    },
    {
      id: 2,
      title: "New Customers",
      value: "156",
      change: "+12.3%",
      changeType: "positive",
      icon: "👥",
      color: "bg-blue-500"
    },
    {
      id: 3,
      title: "Pending Orders",
      value: "23",
      change: "-5.2%",
      changeType: "negative",
      icon: "📦",
      color: "bg-orange-500"
    },
    {
      id: 4,
      title: "Support Tickets",
      value: "8",
      change: "+2",
      changeType: "neutral",
      icon: "🎧",
      color: "bg-purple-500"
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Smith",
      product: "Premium Package",
      amount: "$299.00",
      status: "completed",
      time: "2 hours ago"
    },
    {
      id: "ORD-002",
      customer: "Sarah Johnson",
      product: "Basic Plan",
      amount: "$99.00",
      status: "processing",
      time: "3 hours ago"
    },
    {
      id: "ORD-003",
      customer: "Mike Wilson",
      product: "Enterprise Suite",
      amount: "$599.00",
      status: "pending",
      time: "5 hours ago"
    },
    {
      id: "ORD-004",
      customer: "Emma Davis",
      product: "Starter Kit",
      amount: "$49.00",
      status: "completed",
      time: "6 hours ago"
    },
  ];

  const topProducts = [
    { name: "Premium Package", sales: 145, revenue: "$43,350", trend: "up" },
    { name: "Basic Plan", sales: 89, revenue: "$8,811", trend: "up" },
    { name: "Enterprise Suite", sales: 34, revenue: "$20,366", trend: "down" },
    { name: "Starter Kit", sales: 67, revenue: "$3,283", trend: "up" },
  ];

  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Low Stock Alert",
      message: "Premium Package inventory is running low",
      time: "10 minutes ago"
    },
    {
      id: 2,
      type: "info",
      title: "New Feature Released",
      message: "Advanced analytics dashboard is now available",
      time: "2 hours ago"
    },
    {
      id: 3,
      type: "success",
      title: "Goal Achieved",
      message: "Monthly sales target reached ahead of schedule",
      time: "1 day ago"
    },
  ];

  const quickActions = [
    { id: 1, title: "Add New Product", icon: "➕", color: "bg-blue-500" },
    { id: 2, title: "Create Campaign", icon: "📢", color: "bg-green-500" },
    { id: 3, title: "Generate Report", icon: "📊", color: "bg-purple-500" },
    { id: 4, title: "Manage Users", icon: "👥", color: "bg-orange-500" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your business today.</p>
      </div>

          {/* Quick Stats */}
          <div className="mb-6 md:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickStats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {stat.icon}
                    </div>
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
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">{order.id}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer} • {order.product}</p>
                        <p className="text-xs text-gray-500">{order.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All Orders
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity text-center`}
                    >
                      <div className="text-2xl mb-2">{action.icon}</div>
                      <div className="text-xs font-medium">{action.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'alert' ? 'bg-red-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <span className={`text-xs ${product.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {product.trend === 'up' ? '↗️' : '↘️'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{product.revenue}</p>
                    <p className="text-xs text-gray-600">{product.sales} sales</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </div>
  );
}
