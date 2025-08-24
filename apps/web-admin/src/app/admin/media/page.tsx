'use client';

import {
  Upload,
  Search,
  Grid,
  List,
  Filter,
  Download,
  Trash2,
  Edit,
  Image,
  Video,
  FileText,
  Music,
  MoreHorizontal,
  Calendar
} from 'lucide-react';

export default function MediaLibraryPage() {
  const mediaItems = [
    {
      id: 1,
      name: 'hero-banner-marketing.jpg',
      type: 'image',
      size: '2.4 MB',
      dimensions: '1920x1080',
      uploadedAt: '2024-12-10',
      url: '/placeholder-image.jpg',
      alt: 'Marketing hero banner'
    },
    {
      id: 2,
      name: 'product-demo-video.mp4',
      type: 'video',
      size: '45.2 MB',
      duration: '3:24',
      uploadedAt: '2024-12-09',
      url: '/placeholder-video.mp4',
      alt: 'Product demonstration video'
    },
    {
      id: 3,
      name: 'company-presentation.pdf',
      type: 'document',
      size: '8.7 MB',
      pages: '24 pages',
      uploadedAt: '2024-12-08',
      url: '/placeholder-document.pdf',
      alt: 'Company presentation slides'
    },
    {
      id: 4,
      name: 'background-music.mp3',
      type: 'audio',
      size: '5.1 MB',
      duration: '2:45',
      uploadedAt: '2024-12-07',
      url: '/placeholder-audio.mp3',
      alt: 'Background music track'
    },
    {
      id: 5,
      name: 'team-photo-2024.jpg',
      type: 'image',
      size: '3.8 MB',
      dimensions: '2400x1600',
      uploadedAt: '2024-12-06',
      url: '/placeholder-team.jpg',
      alt: 'Team photo 2024'
    },
    {
      id: 6,
      name: 'infographic-seo.png',
      type: 'image',
      size: '1.2 MB',
      dimensions: '800x2000',
      uploadedAt: '2024-12-05',
      url: '/placeholder-infographic.png',
      alt: 'SEO infographic'
    }
  ];



  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-green-600" aria-label="Image file" />;
      case 'video': return <Video className="w-8 h-8 text-purple-600" />;
      case 'document': return <FileText className="w-8 h-8 text-orange-600" />;
      case 'audio': return <Music className="w-8 h-8 text-blue-600" />;
      default: return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  return (<div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                <p className="text-gray-600 mt-1">Manage your images, videos, and documents</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </button>
            </div>
          </div>



          {/* Controls */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search media files..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                    <option>All Types</option>
                    <option>Images</option>
                    <option>Videos</option>
                    <option>Documents</option>
                    <option>Audio</option>
                  </select>
                  <button className="flex items-center px-4 py-2 border-2 border-gray-400 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition-colors text-gray-900">
                    <Filter className="w-4 h-4 mr-2 text-gray-700" />
                    Filter
                  </button>
                  <div className="flex border-2 border-gray-400 rounded-lg">
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700">
                      <Grid className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-2 hover:bg-gray-100 rounded-r-lg text-gray-700 hover:text-gray-900">
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {mediaItems.map((item) => (
                  <div key={item.id} className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    {/* File Preview */}
                    <div className="flex justify-center mb-3">
                      {item.type === 'image' ? (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          {getFileIcon(item.type)}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.size}</p>
                      {item.dimensions && (
                        <p className="text-xs text-gray-400">{item.dimensions}</p>
                      )}
                      {item.duration && (
                        <p className="text-xs text-gray-400">{item.duration}</p>
                      )}
                      {item.pages && (
                        <p className="text-xs text-gray-400">{item.pages}</p>
                      )}
                      <div className="flex items-center justify-center text-xs text-gray-400 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item.uploadedAt}
                      </div>
                    </div>

                    {/* Actions (shown on hover) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button className="p-1 bg-white rounded shadow-md hover:bg-gray-100 border border-gray-300">
                          <Download className="w-3 h-3 text-gray-700 hover:text-gray-900" />
                        </button>
                        <button className="p-1 bg-white rounded shadow-md hover:bg-gray-100 border border-gray-300">
                          <Edit className="w-3 h-3 text-blue-600 hover:text-blue-800" />
                        </button>
                        <button className="p-1 bg-white rounded shadow-md hover:bg-red-50 border border-gray-300">
                          <Trash2 className="w-3 h-3 text-red-600 hover:text-red-800" />
                        </button>
                        <button className="p-1 bg-white rounded shadow-md hover:bg-gray-100 border border-gray-300">
                          <MoreHorizontal className="w-3 h-3 text-gray-700 hover:text-gray-900" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </div>
          </div>


        </div>
  );
}
