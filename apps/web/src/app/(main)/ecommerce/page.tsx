"use client";

import React from "react";
import Image from "next/image";

/**
 * E-commerce page component - Online store management and analytics
 */
export default function EcommercePage() {

  // Mock e-commerce data
  const storeMetrics = [
    {
      id: 1,
      title: "Total Sales",
      value: "$47,892",
      change: "+12.5%",
      changeType: "positive",
      icon: "💰"
    },
    {
      id: 2,
      title: "Orders Today",
      value: "156",
      change: "+8.2%",
      changeType: "positive",
      icon: "📦"
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
      title: "Average Order",
      value: "$127.50",
      change: "+15.3%",
      changeType: "positive",
      icon: "🛒"
    },
  ];

  const recentOrders = [
    {
      id: "ORD-2024-001",
      customer: "John Smith",
      items: 3,
      total: "$299.99",
      status: "processing",
      date: "2 hours ago"
    },
    {
      id: "ORD-2024-002",
      customer: "Sarah Johnson",
      items: 1,
      total: "$89.99",
      status: "shipped",
      date: "4 hours ago"
    },
    {
      id: "ORD-2024-003",
      customer: "Mike Wilson",
      items: 5,
      total: "$567.50",
      status: "delivered",
      date: "6 hours ago"
    },
    {
      id: "ORD-2024-004",
      customer: "Emma Davis",
      items: 2,
      total: "$149.99",
      status: "pending",
      date: "8 hours ago"
    },
  ];

  const topProducts = [
    {
      id: 1,
      name: "Wireless Headphones Pro",
      sku: "WHP-001",
      price: "$199.99",
      sold: 145,
      revenue: "$28,998.55",
      stock: 23,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Smart Watch Series X",
      sku: "SWX-002",
      price: "$299.99",
      sold: 89,
      revenue: "$26,699.11",
      stock: 45,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Bluetooth Speaker Mini",
      sku: "BSM-003",
      price: "$79.99",
      sold: 234,
      revenue: "$18,717.66",
      stock: 12,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop"
    },
    {
      id: 4,
      name: "USB-C Hub Deluxe",
      sku: "UCH-004",
      price: "$49.99",
      sold: 167,
      revenue: "$8,348.33",
      stock: 78,
      image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=100&h=100&fit=crop"
    },
  ];

  const inventoryAlerts = [
    {
      id: 1,
      product: "Wireless Headphones Pro",
      sku: "WHP-001",
      currentStock: 23,
      minStock: 25,
      status: "low"
    },
    {
      id: 2,
      product: "Bluetooth Speaker Mini",
      sku: "BSM-003",
      currentStock: 12,
      minStock: 20,
      status: "critical"
    },
    {
      id: 3,
      product: "Gaming Mouse Elite",
      sku: "GME-005",
      currentStock: 0,
      minStock: 15,
      status: "out"
    },
  ];

  const salesChannels = [
    { channel: "Website", sales: "$32,450", percentage: 68, orders: 234 },
    { channel: "Mobile App", sales: "$12,340", percentage: 26, orders: 89 },
    { channel: "Marketplace", sales: "$3,102", percentage: 6, orders: 23 },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">E-commerce</h1>
              <p className="text-sm md:text-base text-gray-600">Manage your online store, orders, and inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base">
                Add Product
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                View Store
              </button>
            </div>
          </div>

          {/* Store Metrics */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Store Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {storeMetrics.map((metric) => (
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-medium text-gray-900">{order.id}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.items} items • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{order.total}</p>
                        <button className="text-xs text-blue-600 hover:text-blue-700">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{product.sold} sold</span>
                          <span>Stock: {product.stock}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{product.revenue}</p>
                        <p className="text-xs text-gray-600">{product.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Sales Channels */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Channels</h3>
                <div className="space-y-4">
                  {salesChannels.map((channel, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{channel.channel}</span>
                        <span className="text-sm text-gray-600">{channel.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${channel.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{channel.sales}</span>
                        <span>{channel.orders} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Alerts</h3>
                <div className="space-y-4">
                  {inventoryAlerts.map((alert) => (
                    <div key={alert.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{alert.product}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStockStatusColor(alert.status)}`}>
                          {alert.status === 'out' ? 'Out of Stock' : 
                           alert.status === 'critical' ? 'Critical' : 'Low Stock'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">SKU: {alert.sku}</p>
                      <p className="text-xs text-gray-500">
                        Current: {alert.currentStock} | Min: {alert.minStock}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50">
                    Manage Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
