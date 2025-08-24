'use client';

import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Globe,
  Lock,
  Calendar,
  User,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';

export default function PagesPage() {
  const pages = [
    {
      id: 1,
      title: 'Home',
      slug: '/',
      status: 'Published',
      visibility: 'Public',
      author: 'Admin',
      lastModified: '2024-12-10',
      views: 15420,
      template: 'home-template'
    },
    {
      id: 2,
      title: 'About Us',
      slug: '/about',
      status: 'Published',
      visibility: 'Public',
      author: 'Sarah Johnson',
      lastModified: '2024-12-08',
      views: 8934,
      template: 'page-template'
    },
    {
      id: 3,
      title: 'Services',
      slug: '/services',
      status: 'Published',
      visibility: 'Public',
      author: 'Mike Chen',
      lastModified: '2024-12-07',
      views: 12567,
      template: 'services-template'
    },
    {
      id: 4,
      title: 'Contact',
      slug: '/contact',
      status: 'Published',
      visibility: 'Public',
      author: 'Emily Davis',
      lastModified: '2024-12-06',
      views: 6789,
      template: 'contact-template'
    },
    {
      id: 5,
      title: 'Privacy Policy',
      slug: '/privacy',
      status: 'Draft',
      visibility: 'Private',
      author: 'Legal Team',
      lastModified: '2024-12-05',
      views: 0,
      template: 'legal-template'
    },
    {
      id: 6,
      title: 'Terms of Service',
      slug: '/terms',
      status: 'Review',
      visibility: 'Private',
      author: 'Legal Team',
      lastModified: '2024-12-04',
      views: 0,
      template: 'legal-template'
    }
  ];

  const pageStats = [
    { label: 'Total Pages', value: '24', change: '+3 this month' },
    { label: 'Published', value: '18', change: '+2 this week' },
    { label: 'Drafts', value: '4', change: '1 pending review' },
    { label: 'Total Views', value: '43.7K', change: '+12% this month' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'Public' ? 
      <Globe className="w-4 h-4 text-green-600" /> : 
      <Lock className="w-4 h-4 text-gray-600" />;
  };

  return (<div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                <p className="text-gray-600 mt-1">Manage your website pages and content</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pageStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          {/* Pages Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Review</option>
                  </select>
                  <select className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                    <option>All Templates</option>
                    <option>Home Template</option>
                    <option>Page Template</option>
                    <option>Services Template</option>
                    <option>Contact Template</option>
                    <option>Legal Template</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {page.slug}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Template: {page.template}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(page.status)}`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getVisibilityIcon(page.visibility)}
                          <span className="ml-2 text-sm text-gray-900">{page.visibility}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{page.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {page.lastModified}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Eye className="w-4 h-4 mr-1" />
                          {page.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="Preview">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="Visit Page">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="More">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing 1 to 6 of 24 pages
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
