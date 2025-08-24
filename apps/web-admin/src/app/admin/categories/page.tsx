'use client';

import {
  Folder,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileText,
  Hash,
  Calendar,
  User
} from 'lucide-react';

export default function CategoriesPage() {
  const categories = [
    {
      id: 1,
      name: 'Digital Marketing',
      slug: 'digital-marketing',
      description: 'Articles about digital marketing strategies and trends',
      postCount: 24,
      parent: null,
      color: '#3B82F6',
      createdAt: '2024-01-15',
      createdBy: 'Admin'
    },
    {
      id: 2,
      name: 'SEO',
      slug: 'seo',
      description: 'Search engine optimization tips and guides',
      postCount: 18,
      parent: 'Digital Marketing',
      color: '#10B981',
      createdAt: '2024-01-20',
      createdBy: 'Sarah Johnson'
    },
    {
      id: 3,
      name: 'Content Marketing',
      slug: 'content-marketing',
      description: 'Content creation and marketing strategies',
      postCount: 15,
      parent: 'Digital Marketing',
      color: '#8B5CF6',
      createdAt: '2024-02-01',
      createdBy: 'Mike Chen'
    },
    {
      id: 4,
      name: 'Social Media',
      slug: 'social-media',
      description: 'Social media marketing and management',
      postCount: 12,
      parent: null,
      color: '#F59E0B',
      createdAt: '2024-02-10',
      createdBy: 'Emily Davis'
    },
    {
      id: 5,
      name: 'Facebook Marketing',
      slug: 'facebook-marketing',
      description: 'Facebook advertising and marketing strategies',
      postCount: 8,
      parent: 'Social Media',
      color: '#EF4444',
      createdAt: '2024-02-15',
      createdBy: 'David Wilson'
    },
    {
      id: 6,
      name: 'Analytics',
      slug: 'analytics',
      description: 'Web analytics and data analysis',
      postCount: 10,
      parent: null,
      color: '#6366F1',
      createdAt: '2024-03-01',
      createdBy: 'Lisa Brown'
    }
  ];

  const categoryStats = [
    { label: 'Total Categories', value: '18', change: '+3 this month' },
    { label: 'Parent Categories', value: '6', change: '+1 this week' },
    { label: 'Subcategories', value: '12', change: '+2 this month' },
    { label: 'Total Posts', value: '87', change: '+15 this week' }
  ];

  return (<div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-600 mt-1">Organize your content with categories and subcategories</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categoryStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <Folder className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Categories List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                      />
                    </div>
                    <select className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                      <option>All Categories</option>
                      <option>Parent Only</option>
                      <option>Subcategories Only</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                <div className="text-sm text-gray-500">{category.slug}</div>
                                {category.description && (
                                  <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <FileText className="w-4 h-4 mr-1" />
                              {category.postCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.parent ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                {category.parent}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {category.createdAt}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <User className="w-3 h-3 mr-1" />
                              {category.createdBy}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900" title="View Posts">
                                <Eye className="w-4 h-4" />
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
              </div>
            </div>

            {/* Quick Add Category */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Category</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                      placeholder="category-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <select className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                      <option value="">None (Parent Category)</option>
                      <option value="1">Digital Marketing</option>
                      <option value="4">Social Media</option>
                      <option value="6">Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of the category"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        defaultValue="#3B82F6"
                      />
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue="#3B82F6"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Category
                  </button>
                </form>
              </div>

              {/* Category Hierarchy */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Hierarchy</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium">Digital Marketing (24)</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Hash className="w-3 h-3 mr-2" />
                      SEO (18)
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Hash className="w-3 h-3 mr-2" />
                      Content Marketing (15)
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="font-medium">Social Media (12)</span>
                  </div>
                  <div className="ml-6">
                    <div className="flex items-center text-gray-600">
                      <Hash className="w-3 h-3 mr-2" />
                      Facebook Marketing (8)
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="font-medium">Analytics (10)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
