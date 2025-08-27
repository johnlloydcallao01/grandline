"use client";

import React, { useState } from "react";
import { VideoCard } from "@/components/ui";

// Mock data for watch history
const watchHistory = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
    title: "Enterprise Marketing Strategies for 2024",
    channel: "Business Growth Academy",
    views: "1.2M views",
    time: "3 days ago",
    duration: "15:42",
    watchedAt: "2024-01-15T14:30:00Z",
    watchProgress: 85 // percentage watched
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    title: "Data Analytics Dashboard Best Practices",
    channel: "Tech Insights Pro",
    views: "856K views",
    time: "1 week ago",
    duration: "22:15",
    watchedAt: "2024-01-14T16:45:00Z",
    watchProgress: 100
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    title: "Building Scalable E-commerce Platforms",
    channel: "Development Masters",
    views: "2.1M views",
    time: "2 weeks ago",
    duration: "18:30",
    watchedAt: "2024-01-13T10:20:00Z",
    watchProgress: 45
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
    title: "Customer Retention Strategies That Work",
    channel: "Growth Hacker Hub",
    views: "743K views",
    time: "4 days ago",
    duration: "12:08",
    watchedAt: "2024-01-12T09:15:00Z",
    watchProgress: 100
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    title: "AI in Business: Practical Applications",
    channel: "Future Tech Channel",
    views: "1.8M views",
    time: "1 day ago",
    duration: "25:45",
    watchedAt: "2024-01-11T20:30:00Z",
    watchProgress: 30
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    title: "Leadership in Remote Teams",
    channel: "Leadership Excellence",
    views: "924K views",
    time: "5 days ago",
    duration: "16:22",
    watchedAt: "2024-01-10T13:45:00Z",
    watchProgress: 75
  },
  {
    id: 7,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    title: "Digital Transformation Success Stories",
    channel: "Enterprise Solutions",
    views: "1.5M views",
    time: "1 week ago",
    duration: "20:15",
    watchedAt: "2024-01-09T11:20:00Z",
    watchProgress: 100
  },
  {
    id: 8,
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop",
    title: "Performance Marketing ROI Optimization",
    channel: "Marketing Metrics",
    views: "687K views",
    time: "3 days ago",
    duration: "14:33",
    watchedAt: "2024-01-08T15:10:00Z",
    watchProgress: 60
  }
];

interface HistoryVideoCardProps {
  video: typeof watchHistory[0];
  onRemove: (videoId: number) => void;
}

function HistoryVideoCard({ video, onRemove }: HistoryVideoCardProps) {
  const formatWatchedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative">
      <div className="flex space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative flex-shrink-0">
          <VideoCard
            thumbnail={video.thumbnail}
            title={video.title}
            channel={video.channel}
            views={video.views}
            time={video.time}
            duration={video.duration}
            onClick={() => console.log('Video clicked:', video.title)}
          />
          {/* Watch Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1 rounded-b-lg overflow-hidden">
            <div 
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${video.watchProgress}%` }}
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Watched {formatWatchedDate(video.watchedAt)}
              </p>
              <p className="text-xs text-gray-500">
                {video.watchProgress === 100 ? 'Completed' : `${video.watchProgress}% watched`}
              </p>
            </div>
            <button
              onClick={() => onRemove(video.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
              title="Remove from history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState(watchHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const handleRemoveFromHistory = (videoId: number) => {
    setHistory(history.filter(video => video.id !== videoId));
  };

  const handleClearAllHistory = () => {
    if (confirm('Are you sure you want to clear your entire watch history? This action cannot be undone.')) {
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.channel.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'completed') return matchesSearch && video.watchProgress === 100;
    if (filter === 'in-progress') return matchesSearch && video.watchProgress < 100;
    return matchesSearch;
  });

  return (
    <>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Watch History</h1>
                  <p className="text-gray-600 text-lg">Track your learning journey and continue where you left off</p>
                </div>
                <button
                  onClick={handleClearAllHistory}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Clear All History
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your history..."
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'completed' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilter('in-progress')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'in-progress' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  In Progress
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
              {filteredHistory.map((video) => (
                <HistoryVideoCard
                  key={video.id}
                  video={video}
                  onRemove={handleRemoveFromHistory}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No videos found' : 'No watch history'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filter.' 
                    : 'Start watching videos to build your history.'
                  }
                </p>
              </div>
            )}
      </div>
    </>
  );
}
