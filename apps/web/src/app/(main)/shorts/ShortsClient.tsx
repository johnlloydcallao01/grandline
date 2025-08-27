"use client";

import React, { useState } from "react";
import Image from "@/components/ui/ImageWrapper";

// Mock data for shorts
const shortsData = [
  {
    id: 1,
    title: "5 Marketing Strategies That Actually Work",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop",
    channel: "Business Growth Academy",
    views: "1.2M",
    duration: "0:45",
    category: "Marketing"
  },
  {
    id: 2,
    title: "AI Tools Every Business Owner Needs",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop",
    channel: "Tech Insights Pro",
    views: "856K",
    duration: "0:52",
    category: "Technology"
  },
  {
    id: 3,
    title: "Scale Your E-commerce in 60 Seconds",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
    channel: "E-commerce Masters",
    views: "2.1M",
    duration: "1:00",
    category: "Business"
  },
  {
    id: 4,
    title: "Customer Retention Hack",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=600&fit=crop",
    channel: "Growth Hacker Hub",
    views: "743K",
    duration: "0:38",
    category: "Business"
  },
  {
    id: 5,
    title: "Leadership Tip: Remote Teams",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    channel: "Leadership Excellence",
    views: "924K",
    duration: "0:55",
    category: "Leadership"
  },
  {
    id: 6,
    title: "Digital Marketing ROI Secrets",
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=600&fit=crop",
    channel: "Marketing Metrics",
    views: "687K",
    duration: "0:42",
    category: "Marketing"
  }
];

interface ShortCardProps {
  short: typeof shortsData[0];
  onClick: () => void;
}

function ShortCard({ short, onClick }: ShortCardProps) {
  return (
    <div 
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative aspect-[9/16] bg-gray-200">
        <Image
          src={short.thumbnail}
          alt={short.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {short.duration}
        </div>
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          Shorts
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
          {short.title}
        </h3>
        <p className="text-xs text-gray-600 mb-1">{short.channel}</p>
        <p className="text-xs text-gray-500">{short.views} views</p>
      </div>
    </div>
  );
}

export function ShortsClient() {
  const [selectedShort, setSelectedShort] = useState<typeof shortsData[0] | null>(null);

  const handleShortClick = (short: typeof shortsData[0]) => {
    setSelectedShort(short);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shorts</h1>
          <p className="text-gray-600 text-lg">Quick, actionable business and tech insights in bite-sized videos</p>
        </div>

        {/* Shorts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {shortsData.map((short) => (
            <ShortCard
              key={short.id}
              short={short}
              onClick={() => handleShortClick(short)}
            />
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-2">Marketing Tips</h3>
              <p className="text-sm opacity-90">Quick marketing strategies</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-2">Tech Insights</h3>
              <p className="text-sm opacity-90">Latest technology trends</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-2">Business Growth</h3>
              <p className="text-sm opacity-90">Scale your business</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-2">Leadership</h3>
              <p className="text-sm opacity-90">Management best practices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for selected short */}
      {selectedShort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedShort.title}</h3>
                <button
                  onClick={() => setSelectedShort(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="aspect-[9/16] bg-gray-200 rounded-lg mb-4 relative">
                <Image
                  src={selectedShort.thumbnail}
                  alt={selectedShort.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{selectedShort.channel}</p>
                <p className="text-sm text-gray-500">{selectedShort.views} views • {selectedShort.duration}</p>
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Watch Now
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
