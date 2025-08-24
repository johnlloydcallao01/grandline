'use client';

import {
  MessageCircle,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  Reply,
  Flag,
  User,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

export default function CommentsPage() {
  const comments = [
    {
      id: 1,
      author: 'John Smith',
      email: 'john@example.com',
      content: 'Great article! This really helped me understand SEO better. Looking forward to implementing these strategies.',
      post: 'Complete Guide to Digital Marketing in 2024',
      postSlug: '/blog/digital-marketing-guide-2024',
      status: 'approved',
      createdAt: '2024-12-10 14:30',
      replies: 2,
      flagged: false
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      email: 'sarah@company.com',
      content: 'Could you elaborate more on the social media marketing section? I\'d love to see some specific examples.',
      post: 'Social Media Marketing Trends',
      postSlug: '/blog/social-media-trends',
      status: 'pending',
      createdAt: '2024-12-10 12:15',
      replies: 0,
      flagged: false
    },
    {
      id: 3,
      author: 'Mike Wilson',
      email: 'mike@email.com',
      content: 'This is spam content with promotional links. Please remove this comment immediately.',
      post: 'SEO Best Practices for Small Businesses',
      postSlug: '/blog/seo-best-practices',
      status: 'spam',
      createdAt: '2024-12-10 09:45',
      replies: 0,
      flagged: true
    },
    {
      id: 4,
      author: 'Emily Davis',
      email: 'emily@startup.com',
      content: 'Excellent insights! We\'ve been struggling with content marketing ROI and this article provided exactly what we needed.',
      post: 'Content Marketing ROI Calculator',
      postSlug: '/blog/content-marketing-roi',
      status: 'approved',
      createdAt: '2024-12-09 16:20',
      replies: 1,
      flagged: false
    },
    {
      id: 5,
      author: 'Anonymous User',
      email: 'temp@temp.com',
      content: 'I disagree with some points mentioned here. The approach seems outdated and not suitable for modern businesses.',
      post: 'Email Marketing Automation Guide',
      postSlug: '/blog/email-automation-guide',
      status: 'pending',
      createdAt: '2024-12-09 11:30',
      replies: 0,
      flagged: true
    }
  ];

  const commentStats = [
    { label: 'Total Comments', value: '1,247', change: '+23 today' },
    { label: 'Pending Review', value: '18', change: '5 urgent' },
    { label: 'Approved', value: '1,156', change: '+15 today' },
    { label: 'Spam/Flagged', value: '73', change: '+3 today' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'spam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'spam': return <X className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (<div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
                <p className="text-gray-600 mt-1">Manage and moderate user comments</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Check className="w-4 h-4 mr-2" />
                  Bulk Approve
                </button>
                <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Bulk Delete
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {commentStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          {/* Comments Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search comments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Status</option>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Spam</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Posts</option>
                    <option>Most Commented</option>
                    <option>Recent Posts</option>
                  </select>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <div key={comment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{comment.author}</h4>
                          <span className="text-sm text-gray-500">{comment.email}</span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(comment.status)}`}>
                            {getStatusIcon(comment.status)}
                            <span className="ml-1 capitalize">{comment.status}</span>
                          </span>
                          {comment.flagged && (
                            <Flag className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {comment.createdAt}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-3">{comment.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-gray-500">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            <span className="truncate max-w-xs">{comment.post}</span>
                          </div>
                          {comment.replies > 0 && (
                            <div className="flex items-center text-gray-500">
                              <Reply className="w-4 h-4 mr-1" />
                              {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {comment.status === 'pending' && (
                            <>
                              <button className="text-green-600 hover:text-green-900" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="text-blue-600 hover:text-blue-900" title="Reply">
                            <Reply className="w-4 h-4" />
                          </button>
                          <button className="text-orange-600 hover:text-orange-900" title="Flag">
                            <Flag className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="More">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing 1 to 5 of 1,247 comments
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Approve All Pending</h4>
                <p className="text-sm text-gray-500">Approve 18 pending comments</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Delete Spam</h4>
                <p className="text-sm text-gray-500">Remove 73 spam comments</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Comment Settings</h4>
                <p className="text-sm text-gray-500">Configure moderation rules</p>
              </div>
            </div>
          </div>
        </div>
  );
}
