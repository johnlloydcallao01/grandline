import React from 'react';
import Image from 'next/image';
import { VideoCardProps } from '@/types';

/**
 * VideoCard component for displaying video information
 * 
 * @param thumbnail - URL of the video thumbnail image
 * @param title - The video title
 * @param channel - The channel name
 * @param views - View count string
 * @param time - Time since upload string
 * @param duration - Video duration string
 * @param onClick - Optional click handler
 */
export function VideoCard({
  thumbnail,
  title,
  channel,
  views,
  time,
  duration,
  onClick
}: VideoCardProps) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {duration}
        </div>
      </div>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {channel.charAt(0)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{channel}</p>
          <p className="text-sm text-gray-600">
            {views} • {time}
          </p>
        </div>
      </div>
    </div>
  );
}
