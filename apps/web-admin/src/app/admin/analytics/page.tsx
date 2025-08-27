'use client';


import { BarChart3,
  TrendingUp,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight } from '@/components/ui/IconWrapper';

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Total Visitors', value: '24,567', change: '+12.5%', trend: 'up' },
    { label: 'Page Views', value: '89,234', change: '+8.2%', trend: 'up' },
    { label: 'Bounce Rate', value: '34.2%', change: '-2.1%', trend: 'down' },
    { label: 'Avg. Session', value: '3m 42s', change: '+15.3%', trend: 'up' },
  ];

  const topPages = [
    { page: '/blog/marketing-strategies', views: 12567, percentage: 45 },
    { page: '/services/seo-optimization', views: 8934, percentage: 32 },
    { page: '/about', views: 5678, percentage: 20 },
    { page: '/contact', views: 3456, percentage: 12 },
    { page: '/blog/content-marketing', views: 2345, percentage: 8 },
  ];

  const deviceStats = [
    { device: 'Desktop', percentage: 52, count: '12,775' },
    { device: 'Mobile', percentage: 38, count: '9,336' },
    { device: 'Tablet', percentage: 10, count: '2,456' },
  ];

  return (
    <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your website performance and user engagement</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                  <div className={`flex items-center ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="text-sm font-medium ml-1">{metric.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Top Pages
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{page.page}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${page.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{page.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Device Breakdown
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {deviceStats.map((device, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex items-center flex-1">
                        {device.device === 'Desktop' && <Monitor className="w-5 h-5 text-gray-600 mr-3" />}
                        {device.device === 'Mobile' && <Smartphone className="w-5 h-5 text-gray-600 mr-3" />}
                        {device.device === 'Tablet' && <Globe className="w-5 h-5 text-gray-600 mr-3" />}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">{device.device}</span>
                            <span className="text-sm text-gray-600">{device.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${device.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{device.count} visitors</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Chart Placeholder */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Traffic Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive chart will be displayed here</p>
                  <p className="text-sm text-gray-400 mt-1">Integration with analytics service required</p>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
