'use client';

import { Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Hash,
  TrendingUp,
  Calendar,
  FileText,
  MoreHorizontal } from '@/components/ui/IconWrapper';

export default function TagsPage() {
  const tags = [
    { id: 1, name: 'SEO', slug: 'seo', postCount: 28, color: '#10B981', trending: true, createdAt: '2024-01-15' },
    { id: 2, name: 'Marketing', slug: 'marketing', postCount: 24, color: '#3B82F6', trending: true, createdAt: '2024-01-20' },
    { id: 3, name: 'Content Strategy', slug: 'content-strategy', postCount: 18, color: '#8B5CF6', trending: false, createdAt: '2024-02-01' },
    { id: 4, name: 'Social Media', slug: 'social-media', postCount: 15, color: '#F59E0B', trending: true, createdAt: '2024-02-10' },
    { id: 5, name: 'Analytics', slug: 'analytics', postCount: 12, color: '#EF4444', trending: false, createdAt: '2024-02-15' },
    { id: 6, name: 'Email Marketing', slug: 'email-marketing', postCount: 10, color: '#6366F1', trending: false, createdAt: '2024-03-01' },
    { id: 7, name: 'PPC', slug: 'ppc', postCount: 8, color: '#EC4899', trending: false, createdAt: '2024-03-05' },
    { id: 8, name: 'Conversion', slug: 'conversion', postCount: 6, color: '#14B8A6', trending: true, createdAt: '2024-03-10' },
    { id: 9, name: 'Branding', slug: 'branding', postCount: 5, color: '#F97316', trending: false, createdAt: '2024-03-15' },
    { id: 10, name: 'ROI', slug: 'roi', postCount: 4, color: '#84CC16', trending: false, createdAt: '2024-03-20' }
  ];

  const tagStats = [
    { label: 'Total Tags', value: '45', change: '+8 this month' },
    { label: 'Trending Tags', value: '12', change: '+3 this week' },
    { label: 'Most Used', value: 'SEO', change: '28 posts' },
    { label: 'Avg Posts/Tag', value: '8.2', change: '+1.5 this month' }
  ];

  const trendingTags = tags.filter(tag => tag.trending).slice(0, 5);
  const popularTags = [...tags].sort((a, b) => b.postCount - a.postCount).slice(0, 8);

  return (<div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
                <p className="text-gray-600 mt-1">Manage content tags and keywords</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                New Tag
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {tagStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <Tag className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tags List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tags..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>All Tags</option>
                        <option>Trending</option>
                        <option>Most Used</option>
                        <option>Recently Added</option>
                      </select>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Sort by Usage</option>
                        <option>Sort by Name</option>
                        <option>Sort by Date</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tag
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {tags.map((tag) => (
                        <tr key={tag.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: tag.color }}
                              ></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {tag.name}
                                  {tag.trending && (
                                    <TrendingUp className="w-4 h-4 ml-2 text-green-600" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Hash className="w-3 h-3 mr-1" />
                                  {tag.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <FileText className="w-4 h-4 mr-1" />
                              {tag.postCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tag.trending ? (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center w-fit">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {tag.createdAt}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900" title="Edit">
                                <Edit className="w-4 h-4" />
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
                      Showing 1 to 10 of 45 tags
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Add Tag */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Tag</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tag name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tag-slug"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
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
                    Create Tag
                  </button>
                </form>
              </div>

              {/* Trending Tags */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Trending Tags
                </h3>
                <div className="space-y-3">
                  {trendingTags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{tag.postCount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags Cloud */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: tag.color + '20', 
                        color: tag.color,
                        border: `1px solid ${tag.color}40`
                      }}
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {tag.name}
                      <span className="ml-1 text-xs opacity-75">({tag.postCount})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
