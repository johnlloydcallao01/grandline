'use client';

import React from 'react';

/**
 * History Page - Display user's recently viewed items
 * Features enterprise-level UI with polished cards and typography
 */
export default function HistoryPage() {
  // Mock history data
  const historyItems = [
    {
      id: 1,
      title: "Advanced React Development",
      category: "Programming",
      lastViewed: "2 hours ago",
      image: "/api/placeholder/300/200",
      instructor: "Sarah Johnson",
      progress: 45
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      category: "Marketing",
      lastViewed: "Yesterday",
      image: "/api/placeholder/300/200",
      instructor: "Emma Davis",
      progress: 10
    },
    {
      id: 6,
      title: "Business Analytics with Excel",
      category: "Business",
      lastViewed: "2 days ago",
      image: "/api/placeholder/300/200",
      instructor: "Robert Wilson",
      progress: 0
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-[10px]">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recently Viewed</h1>
                <p className="mt-2 text-gray-500">Continue where you left off with your learning journey</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {historyItems.length} Items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-[10px] py-8">
        {/* History Grid */}
        {historyItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="w-full bg-white/90 backdrop-blur-sm text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors shadow-sm">
                      Resume Learning
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {item.category}
                    </span>
                    <div className="flex items-center text-gray-400 text-xs">
                      <i className="fa fa-clock mr-1"></i>
                      {item.lastViewed}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-gray-600">
                      {item.instructor.charAt(0)}
                    </div>
                    {item.instructor}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="text-gray-500">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-sm transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <i className="fa fa-history text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recently viewed items</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your learning history will appear here. Start exploring courses to keep track of your progress.
            </p>
            <a 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <i className="fa fa-compass mr-2"></i>
              Explore Courses
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
