"use client";

import React, { useState } from "react";
import { VideoCard } from "@/components/ui";

// Mock data for liked videos
const likedVideos = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
    title: "Enterprise Marketing Strategies for 2024",
    channel: "Business Growth Academy",
    views: "1.2M views",
    time: "3 days ago",
    duration: "15:42",
    likedAt: "2024-01-15T14:30:00Z",
    category: "Marketing",
    rating: 5
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    title: "Data Analytics Dashboard Best Practices",
    channel: "Tech Insights Pro",
    views: "856K views",
    time: "1 week ago",
    duration: "22:15",
    likedAt: "2024-01-14T16:45:00Z",
    category: "Technology",
    rating: 5
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    title: "Building Scalable E-commerce Platforms",
    channel: "Development Masters",
    views: "2.1M views",
    time: "2 weeks ago",
    duration: "18:30",
    likedAt: "2024-01-13T10:20:00Z",
    category: "Development",
    rating: 4
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
    title: "Customer Retention Strategies That Work",
    channel: "Growth Hacker Hub",
    views: "743K views",
    time: "4 days ago",
    duration: "12:08",
    likedAt: "2024-01-12T09:15:00Z",
    category: "Business",
    rating: 5
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    title: "AI in Business: Practical Applications",
    channel: "Future Tech Channel",
    views: "1.8M views",
    time: "1 day ago",
    duration: "25:45",
    likedAt: "2024-01-11T20:30:00Z",
    category: "Technology",
    rating: 5
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    title: "Leadership in Remote Teams",
    channel: "Leadership Excellence",
    views: "924K views",
    time: "5 days ago",
    duration: "16:22",
    likedAt: "2024-01-10T13:45:00Z",
    category: "Leadership",
    rating: 4
  },
  {
    id: 7,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    title: "Digital Transformation Success Stories",
    channel: "Enterprise Solutions",
    views: "1.5M views",
    time: "1 week ago",
    duration: "20:15",
    likedAt: "2024-01-09T11:20:00Z",
    category: "Business",
    rating: 5
  },
  {
    id: 8,
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop",
    title: "Performance Marketing ROI Optimization",
    channel: "Marketing Metrics",
    views: "687K views",
    time: "3 days ago",
    duration: "14:33",
    likedAt: "2024-01-08T15:10:00Z",
    category: "Marketing",
    rating: 4
  },
  {
    id: 9,
    thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=225&fit=crop",
    title: "Advanced SEO Techniques for 2024",
    channel: "Digital Marketing Pro",
    views: "1.3M views",
    time: "2 days ago",
    duration: "19:45",
    likedAt: "2024-01-07T12:30:00Z",
    category: "Marketing",
    rating: 5
  }
];

interface LikedVideoCardProps {
  video: typeof likedVideos[0];
  onUnlike: (videoId: number) => void;
  onAddToPlaylist: (videoId: number) => void;
}

function LikedVideoCard({ video, onUnlike, onAddToPlaylist }: LikedVideoCardProps) {
  const formatLikedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Liked yesterday";
    if (diffDays <= 7) return `Liked ${diffDays} days ago`;
    return `Liked ${date.toLocaleDateString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <VideoCard
            thumbnail={video.thumbnail}
            title={video.title}
            channel={video.channel}
            views={video.views}
            time={video.time}
            duration={video.duration}
            onClick={() => console.log('Video clicked:', video.title)}
          />
          
          {/* Like indicator */}
          <div className="absolute top-2 left-2 bg-red-600 text-white p-1 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              video.category === 'Marketing' ? 'bg-blue-100 text-blue-800' :
              video.category === 'Technology' ? 'bg-green-100 text-green-800' :
              video.category === 'Business' ? 'bg-purple-100 text-purple-800' :
              video.category === 'Leadership' ? 'bg-orange-100 text-orange-800' :
              video.category === 'Development' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {video.category}
            </span>
            <div className="flex items-center space-x-1">
              {renderStars(video.rating)}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {formatLikedDate(video.likedAt)}
          </p>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => onAddToPlaylist(video.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Add to playlist</span>
            </button>
            <button
              onClick={() => onUnlike(video.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              title="Unlike video"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LikedVideosPage() {
  const [videos, setVideos] = useState(likedVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  const handleUnlike = (videoId: number) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  const handleAddToPlaylist = (videoId: number) => {
    console.log('Add to playlist:', videoId);
    // TODO: Implement add to playlist functionality
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredAndSortedVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
      const matchesRating = ratingFilter === 0 || video.rating >= ratingFilter;
      return matchesSearch && matchesCategory && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.likedAt).getTime() - new Date(b.likedAt).getTime();
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  const averageRating = videos.length > 0 
    ? (videos.reduce((sum, video) => sum + video.rating, 0) / videos.length).toFixed(1)
    : '0';

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Liked Videos - Your Favorite Content | Calsiter</title>
        <meta name="description" content="Browse your liked videos and discover your favorite educational content. Rate, organize, and revisit the videos that inspired your learning journey." />
        <meta name="keywords" content="liked videos, favorite content, video ratings, educational favorites, learning collection" />
        <meta property="og:title" content="Liked Videos - Your Favorite Content | Calsiter" />
        <meta property="og:description" content="Browse your liked videos and discover your favorite educational content. Rate, organize, and revisit the videos that inspired your learning." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Liked Videos - Your Favorite Content | Calsiter" />
        <meta name="twitter:description" content="Browse your liked videos and discover your favorite educational content. Rate, organize, and revisit the videos that inspired your learning." />
      </head>

      <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Liked Videos</h1>
                  <p className="text-gray-600 text-lg">
                    {videos.length} videos • {averageRating} ⭐ average rating
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-red-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{videos.length} Liked</span>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search liked videos..."
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
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Recently Liked</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedVideos.map((video) => (
                <LikedVideoCard
                  key={video.id}
                  video={video}
                  onUnlike={handleUnlike}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedVideos.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || categoryFilter !== 'all' || ratingFilter > 0 ? 'No videos found' : 'No liked videos'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || categoryFilter !== 'all' || ratingFilter > 0
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Start liking videos to build your collection of favorite content.'
                  }
                </p>
              </div>
            )}

            {/* Stats */}
            {videos.length > 0 && (
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">{videos.length}</div>
                  <div className="text-sm text-gray-600">Liked Videos</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">{averageRating}⭐</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{categories.length - 1}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{videos.filter(v => v.rating === 5).length}</div>
                  <div className="text-sm text-gray-600">5-Star Videos</div>
                </div>
              </div>
            )}
          </div>
    </>
  );
}
