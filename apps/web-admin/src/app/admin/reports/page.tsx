'use client';


import { FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Eye } from '@/components/ui/IconWrapper';

export default function ReportsPage() {
  const reportTypes = [
    {
      title: 'Traffic Report',
      description: 'Detailed analysis of website traffic and user behavior',
      icon: TrendingUp,
      lastGenerated: '2 hours ago',
      status: 'ready'
    },
    {
      title: 'User Engagement',
      description: 'User interaction metrics and engagement patterns',
      icon: Users,
      lastGenerated: '1 day ago',
      status: 'ready'
    },
    {
      title: 'Content Performance',
      description: 'Blog posts and page performance analytics',
      icon: FileText,
      lastGenerated: '3 hours ago',
      status: 'ready'
    },
    {
      title: 'Revenue Analytics',
      description: 'Financial performance and conversion tracking',
      icon: DollarSign,
      lastGenerated: 'Generating...',
      status: 'processing'
    },
    {
      title: 'SEO Performance',
      description: 'Search engine optimization metrics and rankings',
      icon: Eye,
      lastGenerated: '6 hours ago',
      status: 'ready'
    },
    {
      title: 'System Performance',
      description: 'Server performance and uptime statistics',
      icon: BarChart3,
      lastGenerated: '30 minutes ago',
      status: 'ready'
    }
  ];

  const recentReports = [
    {
      name: 'Monthly Traffic Summary - December 2024',
      type: 'Traffic Report',
      generatedAt: '2024-12-15 14:30',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      name: 'User Engagement Analysis - Q4 2024',
      type: 'User Engagement',
      generatedAt: '2024-12-14 09:15',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      name: 'Content Performance Report - November',
      type: 'Content Performance',
      generatedAt: '2024-12-13 16:45',
      size: '3.1 MB',
      format: 'PDF'
    },
    {
      name: 'SEO Ranking Report - Weekly',
      type: 'SEO Performance',
      generatedAt: '2024-12-12 11:20',
      size: '1.2 MB',
      format: 'CSV'
    }
  ];

  return (
    <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and download comprehensive business reports</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex flex-wrap gap-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Custom Filter
            </button>
            <button className="flex items-center px-4 py-2 border-2 border-gray-400 text-gray-800 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition-colors">
              <Download className="w-4 h-4 mr-2 text-gray-700" />
              Bulk Download
            </button>
          </div>

          {/* Report Types Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report, index) => (
                <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <report.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'ready' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status === 'ready' ? 'Ready' : 'Processing'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {report.lastGenerated}
                    </div>
                    <button 
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        report.status === 'ready'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={report.status !== 'ready'}
                    >
                      {report.status === 'ready' ? 'Generate' : 'Processing...'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.generatedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
