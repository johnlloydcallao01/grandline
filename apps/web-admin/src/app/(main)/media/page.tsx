'use client';

import React, { useState } from 'react';
import {
  Search, Filter, Plus, MoreHorizontal,
  Image, Video, Music, FileText, File,
  Grid, List, Download, Trash2, Edit, Eye
} from '@/components/ui/IconWrapper';

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock Data
  const mediaItems = [
    { id: 1, type: 'image', name: 'Course Thumbnail - React 101.jpg', size: '1.2 MB', date: 'Oct 24, 2024', url: '/placeholder-image.jpg' },
    { id: 2, type: 'video', name: 'Intro to Hooks.mp4', size: '45.5 MB', date: 'Oct 22, 2024', duration: '12:30' },
    { id: 3, type: 'pdf', name: 'React Cheatsheet.pdf', size: '2.4 MB', date: 'Oct 20, 2024' },
    { id: 4, type: 'document', name: 'Course Outline.docx', size: '0.8 MB', date: 'Oct 18, 2024' },
    { id: 5, type: 'audio', name: 'Podcast - Ep 1.mp3', size: '15.2 MB', date: 'Oct 15, 2024', duration: '34:10' },
    { id: 6, type: 'image', name: 'Instructor Profile.png', size: '3.1 MB', date: 'Oct 10, 2024' },
    { id: 7, type: 'video', name: 'Advanced API Integration.mp4', size: '120.5 MB', date: 'Oct 05, 2024', duration: '45:00' },
    { id: 8, type: 'pdf', name: 'Assignment Guidelines.pdf', size: '1.1 MB', date: 'Oct 01, 2024' },
  ];

  const tabs = [
    { id: 'all', label: 'All Media' },
    { id: 'video', label: 'Videos' },
    { id: 'image', label: 'Images' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'document', label: 'Documents' },
    { id: 'audio', label: 'Audio Files' },
  ];

  const filteredItems = activeTab === 'all'
    ? mediaItems
    : mediaItems.filter(item => item.type === activeTab);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-8 w-8 text-blue-500" />;
      case 'image': return <Image className="h-8 w-8 text-purple-500" />;
      case 'audio': return <Music className="h-8 w-8 text-pink-500" />;
      case 'pdf': return <File className="h-8 w-8 text-red-500" />; // simplistic mapping
      case 'document': return <FileText className="h-8 w-8 text-blue-400" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage and organize your course assets</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Upload New
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="aspect-video bg-gray-50 flex items-center justify-center relative border-b border-gray-100">
                {getIcon(item.type)}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 bg-white/90 rounded-md shadow-sm hover:bg-white text-gray-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate pr-2" title={item.name}>{item.name}</h3>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.size}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
                        {getIcon(item.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
