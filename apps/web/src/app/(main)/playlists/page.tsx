"use client";

import React, { useState } from "react";
import Image from "@/components/ui/ImageWrapper";

// Mock data for playlists
const playlistsData = [
  {
    id: 1,
    name: "Business Strategy Essentials",
    description: "Core concepts and frameworks for strategic business planning",
    videoCount: 12,
    totalDuration: "3h 45m",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
    isPublic: true,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
    videos: [
      {
        title: "Enterprise Marketing Strategies for 2024",
        thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=112&fit=crop",
        duration: "15:42"
      },
      {
        title: "Strategic Planning Framework",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=112&fit=crop",
        duration: "22:15"
      }
    ]
  },
  {
    id: 2,
    name: "Tech Innovation & AI",
    description: "Latest developments in artificial intelligence and emerging technologies",
    videoCount: 8,
    totalDuration: "2h 30m",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    isPublic: false,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-14",
    videos: [
      {
        title: "AI in Business: Practical Applications",
        thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=112&fit=crop",
        duration: "25:45"
      },
      {
        title: "Machine Learning Fundamentals",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=112&fit=crop",
        duration: "18:30"
      }
    ]
  },
  {
    id: 3,
    name: "Leadership & Management",
    description: "Essential skills for effective leadership and team management",
    videoCount: 15,
    totalDuration: "4h 20m",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    isPublic: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-12",
    videos: [
      {
        title: "Leadership in Remote Teams",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=112&fit=crop",
        duration: "16:22"
      },
      {
        title: "Effective Communication Strategies",
        thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200&h=112&fit=crop",
        duration: "12:08"
      }
    ]
  },
  {
    id: 4,
    name: "Digital Marketing Mastery",
    description: "Comprehensive guide to modern digital marketing strategies",
    videoCount: 20,
    totalDuration: "6h 15m",
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop",
    isPublic: false,
    createdAt: "2023-12-20",
    updatedAt: "2024-01-08",
    videos: [
      {
        title: "Performance Marketing ROI Optimization",
        thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=112&fit=crop",
        duration: "14:33"
      },
      {
        title: "Advanced SEO Techniques for 2024",
        thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&h=112&fit=crop",
        duration: "19:45"
      }
    ]
  }
];

interface PlaylistCardProps {
  playlist: typeof playlistsData[0];
  onEdit: (playlist: typeof playlistsData[0]) => void;
  onDelete: (playlistId: number) => void;
  onTogglePrivacy: (playlistId: number) => void;
}

function PlaylistCard({ playlist, onEdit, onDelete, onTogglePrivacy }: PlaylistCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-gray-200">
        <Image
          src={playlist.thumbnail}
          alt={playlist.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-2xl font-bold">{playlist.videoCount}</div>
            <div className="text-sm">videos</div>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            playlist.isPublic 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {playlist.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{playlist.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{playlist.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{playlist.totalDuration}</span>
          <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Video Preview */}
        <div className="space-y-2 mb-4">
          {playlist.videos.slice(0, 2).map((video, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="relative w-16 h-9 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 line-clamp-1">{video.title}</p>
                <p className="text-xs text-gray-500">{video.duration}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onEdit(playlist)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTogglePrivacy(playlist.id)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title={playlist.isPublic ? 'Make private' : 'Make public'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {playlist.isPublic ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                )}
              </svg>
            </button>
            <button
              onClick={() => onDelete(playlist.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              title="Delete playlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState(playlistsData);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  const handleEditPlaylist = (playlist: typeof playlistsData[0]) => {
    console.log('Edit playlist:', playlist.name);
    // TODO: Implement edit functionality
  };

  const handleDeletePlaylist = (playlistId: number) => {
    if (confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    }
  };

  const handleTogglePrivacy = (playlistId: number) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId ? { ...p, isPublic: !p.isPublic } : p
    ));
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const filteredPlaylists = playlists.filter(playlist => {
    if (filter === 'public') return playlist.isPublic;
    if (filter === 'private') return !playlist.isPublic;
    return true;
  });

  return (
    <>

      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Playlists</h1>
                  <p className="text-gray-600 text-lg">Organize your learning content into curated collections</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Playlist</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({playlists.length})
                </button>
                <button
                  onClick={() => setFilter('public')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'public' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Public ({playlists.filter(p => p.isPublic).length})
                </button>
                <button
                  onClick={() => setFilter('private')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'private' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Private ({playlists.filter(p => !p.isPublic).length})
                </button>
              </div>
            </div>

            {/* Playlists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaylists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onEdit={handleEditPlaylist}
                  onDelete={handleDeletePlaylist}
                  onTogglePrivacy={handleTogglePrivacy}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredPlaylists.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists found</h3>
                <p className="text-gray-600 mb-4">Create your first playlist to organize your learning content.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Playlist
                </button>
              </div>
            )}
        </div>

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Playlist</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Enter playlist name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Enter playlist description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Make this playlist public
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement create playlist functionality
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
