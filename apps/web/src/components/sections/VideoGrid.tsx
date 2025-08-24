import React from 'react';
import { VideoGridProps, VideoCardProps } from '@/types';
import { VideoCard } from '@/components/ui';
import { VideoCardSkeleton } from '@/components/ui/Skeleton';

// Default video data
const defaultVideos: VideoCardProps[] = [
  {
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop",
    title: "Enterprise Marketing Strategies for 2024",
    channel: "Encreasl Business",
    views: "1.2M views",
    time: "3 days ago",
    duration: "15:42"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    title: "Data Analytics Dashboard Best Practices",
    channel: "Tech Insights",
    views: "856K views",
    time: "1 week ago",
    duration: "22:15"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    title: "Building Scalable E-commerce Platforms",
    channel: "Development Pro",
    views: "2.1M views",
    time: "2 weeks ago",
    duration: "18:30"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
    title: "Customer Retention Strategies That Work",
    channel: "Growth Hacker",
    views: "743K views",
    time: "4 days ago",
    duration: "12:08"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    title: "AI in Business: Practical Applications",
    channel: "Future Tech",
    views: "1.8M views",
    time: "1 day ago",
    duration: "25:45"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
    title: "Leadership in Remote Teams",
    channel: "Management Today",
    views: "924K views",
    time: "5 days ago",
    duration: "16:22"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    title: "Digital Transformation Success Stories",
    channel: "Enterprise Solutions",
    views: "1.5M views",
    time: "1 week ago",
    duration: "20:15"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop",
    title: "Performance Marketing ROI Optimization",
    channel: "Marketing Metrics",
    views: "687K views",
    time: "3 days ago",
    duration: "14:33"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=225&fit=crop",
    title: "Advanced SEO Techniques for 2024",
    channel: "Digital Marketing Pro",
    views: "1.3M views",
    time: "2 days ago",
    duration: "19:45"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=225&fit=crop",
    title: "Cloud Infrastructure Best Practices",
    channel: "DevOps Masters",
    views: "987K views",
    time: "1 week ago",
    duration: "23:12"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=225&fit=crop",
    title: "Product Management Fundamentals",
    channel: "Product School",
    views: "756K views",
    time: "4 days ago",
    duration: "17:28"
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=225&fit=crop",
    title: "Financial Planning for Startups",
    channel: "Startup Finance",
    views: "1.1M views",
    time: "6 days ago",
    duration: "21:35"
  }
];

/**
 * VideoGrid component - PERFORMANCE OPTIMIZED
 *
 * Demonstrates CORRECT skeleton screen usage following Google's Core Web Vitals best practices:
 * - Static content renders immediately (no artificial delays)
 * - Skeleton screens only appear for REAL dynamic content loading
 * - Optimal LCP performance by avoiding unnecessary render delays
 *
 * @param videos - Array of video data (optional, uses default if not provided)
 * @param isLoading - Only true when actually loading dynamic data from API/database
 */
export function VideoGrid({
  videos = defaultVideos,
  isLoading = false // Only true when there's REAL loading happening
}: VideoGridProps & { isLoading?: boolean }) {

  // CORRECT: Only show skeleton when there's REAL loading happening
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // CORRECT: Static content renders immediately without delays
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <VideoCard
            key={`${video.title}-${index}`}
            {...video}
            onClick={() => {
              // Handle video click - could navigate to video page
              console.log('Video clicked:', video.title);
            }}
          />
        ))}
      </div>
    </div>
  );
}
