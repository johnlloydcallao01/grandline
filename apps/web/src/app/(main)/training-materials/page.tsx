'use client';

import React, { useState } from 'react';

export default function TrainingMaterialsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Deck', 'Engine', 'Safety', 'Catering', 'Navigation'];

  const materials = [
    {
      id: 1,
      title: 'ECDIS Operation Manual',
      category: 'Navigation',
      type: 'PDF',
      size: '12.5 MB',
      date: '2023-11-10',
      image: 'bg-blue-100',
    },
    {
      id: 2,
      title: 'Marine Diesel Engines Maintenance',
      category: 'Engine',
      type: 'Video',
      size: '450 MB',
      date: '2023-10-22',
      image: 'bg-orange-100',
    },
    {
      id: 3,
      title: 'SOLAS Regulations 2024 Update',
      category: 'Safety',
      type: 'PDF',
      size: '5.2 MB',
      date: '2023-12-01',
      image: 'bg-red-100',
    },
    {
      id: 4,
      title: 'Bridge Resource Management (BRM) Guide',
      category: 'Deck',
      type: 'PDF',
      size: '8.8 MB',
      date: '2023-09-15',
      image: 'bg-cyan-100',
    },
    {
      id: 5,
      title: 'Galley Hygiene & Safety Standards',
      category: 'Catering',
      type: 'PDF',
      size: '3.4 MB',
      date: '2023-08-30',
      image: 'bg-green-100',
    },
    {
      id: 6,
      title: 'Radar Plotting Techniques',
      category: 'Navigation',
      type: 'Interactive',
      size: '120 MB',
      date: '2023-11-05',
      image: 'bg-indigo-100',
    },
  ];

  const filteredMaterials = activeTab === 'All' 
    ? materials 
    : materials.filter(m => m.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Training Materials</h1>
            <p className="mt-1 text-sm text-gray-500">
              Access course supplements, reference guides, and study materials.
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto pb-px no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        {/* Search Bar */}
        <div className="mb-8 max-w-lg">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
              placeholder="Search training materials..."
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className={`h-32 ${item.image} rounded-t-xl flex items-center justify-center`}>
                 {/* Placeholder Icons based on type */}
                 {item.type === 'PDF' && (
                   <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                   </svg>
                 )}
                 {item.type === 'Video' && (
                   <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 )}
                 {item.type === 'Interactive' && (
                   <svg className="w-12 h-12 text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                   </svg>
                 )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium text-gray-700 mr-2">{item.type}</span>
                    <span>• {item.size}</span>
                  </div>
                  <button className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
