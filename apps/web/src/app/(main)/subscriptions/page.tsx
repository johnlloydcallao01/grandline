"use client";

import React, { useState } from "react";
import { VideoCard } from "@/components/ui";
import Image from "@/components/ui/ImageWrapper";

// Mock data for subscribed channels
const subscribedChannels = [
  {
    id: 1,
    name: "Business Growth Academy",
    avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=face",
    subscribers: "2.3M",
    isVerified: true,
    latestVideo: {
      title: "Enterprise Marketing Strategies for 2024",
      thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
      views: "1.2M views",
      time: "3 days ago",
      duration: "15:42"
    }
  },
  {
    id: 2,
    name: "Tech Insights Pro",
    avatar: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=face",
    subscribers: "1.8M",
    isVerified: true,
    latestVideo: {
      title: "Data Analytics Dashboard Best Practices",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
      views: "856K views",
      time: "1 week ago",
      duration: "22:15"
    }
  },
  {
    id: 3,
    name: "Development Masters",
    avatar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&crop=face",
    subscribers: "3.1M",
    isVerified: true,
    latestVideo: {
      title: "Building Scalable E-commerce Platforms",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
      views: "2.1M views",
      time: "2 weeks ago",
      duration: "18:30"
    }
  },
  {
    id: 4,
    name: "Growth Hacker Hub",
    avatar: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=100&h=100&fit=crop&crop=face",
    subscribers: "1.5M",
    isVerified: false,
    latestVideo: {
      title: "Customer Retention Strategies That Work",
      thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
      views: "743K views",
      time: "4 days ago",
      duration: "12:08"
    }
  },
  {
    id: 5,
    name: "Future Tech Channel",
    avatar: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=face",
    subscribers: "2.7M",
    isVerified: true,
    latestVideo: {
      title: "AI in Business: Practical Applications",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
      views: "1.8M views",
      time: "1 day ago",
      duration: "25:45"
    }
  },
  {
    id: 6,
    name: "Leadership Excellence",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    subscribers: "1.2M",
    isVerified: true,
    latestVideo: {
      title: "Leadership in Remote Teams",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
      views: "924K views",
      time: "5 days ago",
      duration: "16:22"
    }
  }
];

interface ChannelCardProps {
  channel: typeof subscribedChannels[0];
  onUnsubscribe: (channelId: number) => void;
}

function ChannelCard({ channel, onUnsubscribe }: ChannelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={channel.avatar}
              alt={channel.name}
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
            {channel.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              {channel.name}
            </h3>
            <p className="text-sm text-gray-600">{channel.subscribers} subscribers</p>
          </div>
        </div>
        <button
          onClick={() => onUnsubscribe(channel.id)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Subscribed
        </button>
      </div>
      
      {/* Latest Video */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-600 mb-3">Latest video:</p>
        <VideoCard
          thumbnail={channel.latestVideo.thumbnail}
          title={channel.latestVideo.title}
          channel={channel.name}
          views={channel.latestVideo.views}
          time={channel.latestVideo.time}
          duration={channel.latestVideo.duration}
          onClick={() => console.log('Video clicked:', channel.latestVideo.title)}
        />
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [channels, setChannels] = useState(subscribedChannels);
  const [filter, setFilter] = useState<'all' | 'verified' | 'recent'>('all');

  const handleUnsubscribe = (channelId: number) => {
    setChannels(channels.filter(channel => channel.id !== channelId));
  };

  const filteredChannels = channels.filter(channel => {
    if (filter === 'verified') return channel.isVerified;
    if (filter === 'recent') {
      const recentDays = ['1 day ago', '2 days ago', '3 days ago', '4 days ago'];
      return recentDays.includes(channel.latestVideo.time);
    }
    return true;
  });

  return (
    <>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
              <p className="text-gray-600 text-lg">Stay updated with your favorite channels and creators</p>
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
                  All ({channels.length})
                </button>
                <button
                  onClick={() => setFilter('verified')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'verified' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Verified ({channels.filter(c => c.isVerified).length})
                </button>
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'recent' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Recent uploads
                </button>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onUnsubscribe={handleUnsubscribe}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredChannels.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No channels found</h3>
                <p className="text-gray-600">Try adjusting your filter or subscribe to more channels.</p>
              </div>
            )}
      </div>
    </>
  );
}
