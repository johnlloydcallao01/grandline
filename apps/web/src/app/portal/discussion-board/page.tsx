'use client';

import { useState } from 'react';

export default function DiscussionBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'navigation', name: 'Navigation & Charts' },
    { id: 'safety', name: 'Safety Procedures' },
    { id: 'engineering', name: 'Marine Engineering' },
    { id: 'general', name: 'General Discussion' }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Clarification on COLREGs Rule 15',
      author: 'Cadet John Doe',
      avatar: 'fa-user',
      category: 'navigation',
      replies: 12,
      views: 345,
      lastActivity: '2 hours ago',
      isPinned: true,
      tags: ['Rules of the Road', 'Exam Prep']
    },
    {
      id: 2,
      title: 'Engine Room Watchkeeping Protocols',
      author: '3/E Sarah Smith',
      avatar: 'fa-user-circle',
      category: 'engineering',
      replies: 8,
      views: 210,
      lastActivity: '5 hours ago',
      isPinned: false,
      tags: ['Watchkeeping', 'Safety']
    },
    {
      id: 3,
      title: 'Best practices for celestial navigation sights',
      author: '2/O Mike Johnson',
      avatar: 'fa-anchor',
      category: 'navigation',
      replies: 24,
      views: 560,
      lastActivity: '1 day ago',
      isPinned: false,
      tags: ['Celestial Nav', 'Practical']
    },
    {
      id: 4,
      title: 'Fire Drill Procedures - Update',
      author: 'Capt. James Wilson',
      avatar: 'fa-star',
      category: 'safety',
      replies: 5,
      views: 890,
      lastActivity: '2 days ago',
      isPinned: true,
      tags: ['Drills', 'Safety', 'Mandatory']
    },
    {
      id: 5,
      title: 'Study group for upcoming License Exam',
      author: 'Cadet Emily Chen',
      avatar: 'fa-book',
      category: 'general',
      replies: 45,
      views: 1200,
      lastActivity: '3 hours ago',
      isPinned: false,
      tags: ['Study Group', 'Exams']
    }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discussion Board</h1>
          <p className="text-gray-500 mt-1">Engage with peers and instructors on maritime topics</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <i className="fa fa-plus"></i>
          <span>New Topic</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search topics, tags, or questions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Discussions</p>
              <h3 className="text-3xl font-bold mt-1">1,248</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fa fa-comments text-xl"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-100 flex items-center gap-2">
            <i className="fa fa-arrow-up"></i>
            <span>12 new today</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Members</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">356</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="fa fa-users text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 flex items-center gap-2">
            <i className="fa fa-circle text-[10px]"></i>
            <span>45 online now</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Your Contribution</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">28</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <i className="fa fa-star text-purple-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <span>Top 10% of contributors</span>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Recent Topics</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <select className="border-none bg-transparent font-medium text-gray-900 focus:ring-0 cursor-pointer">
              <option>Newest</option>
              <option>Most Active</option>
              <option>Unanswered</option>
            </select>
          </div>
        </div>

        {filteredDiscussions.map((discussion) => (
          <div key={discussion.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <i className={`fa ${discussion.avatar} text-gray-500 text-xl`}></i>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {discussion.isPinned && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide flex items-center gap-1">
                      <i className="fa fa-thumbtack"></i> Pinned
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                    discussion.category === 'navigation' ? 'bg-indigo-100 text-indigo-700' :
                    discussion.category === 'safety' ? 'bg-red-100 text-red-700' :
                    discussion.category === 'engineering' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {categories.find(c => c.id === discussion.category)?.name}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-4">
                  {discussion.title}
                </h3>
                
                <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">{discussion.author}</span>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{discussion.lastActivity}</span>
                  <div className="flex items-center gap-2 ml-auto md:ml-0">
                    {discussion.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded border border-gray-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2 min-w-[100px]">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{discussion.replies}</div>
                    <div className="text-xs text-gray-500">Replies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{discussion.views}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile stats */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between md:hidden text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <i className="fa fa-comment-o"></i> {discussion.replies}
                </span>
                <span className="flex items-center gap-1">
                  <i className="fa fa-eye"></i> {discussion.views}
                </span>
              </div>
              <span>Last active {discussion.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
          Load More Topics
        </button>
      </div>
    </div>
  );
}
