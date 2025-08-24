"use client";

import React, { useState } from "react";
import { VideoCard } from "@/components/ui";

// Mock data for watch later videos
const watchLaterVideos = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
    title: "Enterprise Marketing Strategies for 2024",
    channel: "Business Growth Academy",
    views: "1.2M views",
    time: "3 days ago",
    duration: "15:42",
    addedAt: "2024-01-15T14:30:00Z",
    category: "Marketing"
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    title: "Data Analytics Dashboard Best Practices",
    channel: "Tech Insights Pro",
    views: "856K views",
    time: "1 week ago",
    duration: "22:15",
    addedAt: "2024-01-14T16:45:00Z",
    category: "Technology"
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    title: "Building Scalable E-commerce Platforms",
    channel: "Development Masters",
    views: "2.1M views",
    time: "2 weeks ago",
    duration: "18:30",
    addedAt: "2024-01-13T10:20:00Z",
    category: "Development"
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
    title: "Customer Retention Strategies That Work",
    channel: "Growth Hacker Hub",
    views: "743K views",
    time: "4 days ago",
    duration: "12:08",
    addedAt: "2024-01-12T09:15:00Z",
    category: "Business"
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    title: "AI in Business: Practical Applications",
    channel: "Future Tech Channel",
    views: "1.8M views",
    time: "1 day ago",
    duration: "25:45",
    addedAt: "2024-01-11T20:30:00Z",
    category: "Technology"
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    title: "Leadership in Remote Teams",
    channel: "Leadership Excellence",
    views: "924K views",
    time: "5 days ago",
    duration: "16:22",
    addedAt: "2024-01-10T13:45:00Z",
    category: "Leadership"
  },
  {
    id: 7,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    title: "Digital Transformation Success Stories",
    channel: "Enterprise Solutions",
    views: "1.5M views",
    time: "1 week ago",
    duration: "20:15",
    addedAt: "2024-01-09T11:20:00Z",
    category: "Business"
  },
  {
    id: 8,
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop",
    title: "Performance Marketing ROI Optimization",
    channel: "Marketing Metrics",
    views: "687K views",
    time: "3 days ago",
    duration: "14:33",
    addedAt: "2024-01-08T15:10:00Z",
    category: "Marketing"
  }
];

interface WatchLaterVideoCardProps {
  video: typeof watchLaterVideos[0];
  onRemove: (videoId: number) => void;
  onMoveToPlaylist: (videoId: number) => void;
}

function WatchLaterVideoCard({ video, onRemove, onMoveToPlaylist }: WatchLaterVideoCardProps) {
  const formatAddedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Added yesterday";
    if (diffDays <= 7) return `Added ${diffDays} days ago`;
    return `Added ${date.toLocaleDateString()}`;
  };

  return (
    <div className="group relative">
      <div className="flex space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex-shrink-0">
          <VideoCard
            thumbnail={video.thumbnail}
            title={video.title}
            channel={video.channel}
            views={video.views}
            time={video.time}
            duration={video.duration}
            onClick={() => console.log('Video clicked:', video.title)}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                video.category === 'Marketing' ? 'bg-blue-100 text-blue-800' :
                video.category === 'Technology' ? 'bg-green-100 text-green-800' :
                video.category === 'Business' ? 'bg-purple-100 text-purple-800' :
                video.category === 'Leadership' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {video.category}
              </span>
              <p className="text-sm text-gray-600 mb-1">
                {formatAddedDate(video.addedAt)}
              </p>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onMoveToPlaylist(video.id)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                title="Add to playlist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(video.id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                title="Remove from Watch Later"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchLaterPage() {
  const [videos, setVideos] = useState(watchLaterVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');

  const handleRemoveFromWatchLater = (videoId: number) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  const handleMoveToPlaylist = (videoId: number) => {
    console.log('Move to playlist:', videoId);
    // TODO: Implement move to playlist functionality
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all videos from Watch Later? This action cannot be undone.')) {
      setVideos([]);
    }
  };

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredAndSortedVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      }
      if (sortBy === 'duration') {
        const getDurationInSeconds = (duration: string) => {
          const [minutes, seconds] = duration.split(':').map(Number);
          return minutes * 60 + seconds;
        };
        return getDurationInSeconds(b.duration) - getDurationInSeconds(a.duration);
      }
      return 0;
    });

  const totalDuration = videos.reduce((total, video) => {
    const [minutes, seconds] = video.duration.split(':').map(Number);
    return total + minutes * 60 + seconds;
  }, 0);

  const formatTotalDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Watch Later - Save Videos for Later Viewing | Calsiter</title>
        <meta name="description" content="Save videos to watch later and organize your learning queue. Build your personal collection of educational content to view when you have time." />
        <meta name="keywords" content="watch later, saved videos, learning queue, video bookmarks, educational content" />
        <meta property="og:title" content="Watch Later - Save Videos for Later Viewing | Calsiter" />
        <meta property="og:description" content="Save videos to watch later and organize your learning queue. Build your personal collection of educational content." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Watch Later - Save Videos for Later Viewing | Calsiter" />
        <meta name="twitter:description" content="Save videos to watch later and organize your learning queue. Build your personal collection of educational content." />
      </head>

      <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Watch Later</h1>
                  <p className="text-gray-600 text-lg">
                    {videos.length} videos • {formatTotalDuration(totalDuration)} total
                  </p>
                </div>
                {videos.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search saved videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'duration')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="duration">Longest First</option>
                </select>
              </div>
            </div>

            {/* Videos List */}
            <div className="space-y-4">
              {filteredAndSortedVideos.map((video) => (
                <WatchLaterVideoCard
                  key={video.id}
                  video={video}
                  onRemove={handleRemoveFromWatchLater}
                  onMoveToPlaylist={handleMoveToPlaylist}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedVideos.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || categoryFilter !== 'all' ? 'No videos found' : 'No saved videos'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || categoryFilter !== 'all' 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Start saving videos to watch later by clicking the "Watch Later" button on any video.'
                  }
                </p>
              </div>
            )}

            {/* Quick Stats */}
            {videos.length > 0 && (
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{videos.length}</div>
                  <div className="text-sm text-gray-600">Total Videos</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{formatTotalDuration(totalDuration)}</div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.ceil(totalDuration / 60 / 25)} {/* Assuming 25 min average session */}
                  </div>
                  <div className="text-sm text-gray-600">Est. Sessions</div>
                </div>
              </div>
            )}
          </div>
    </>
  );
}
