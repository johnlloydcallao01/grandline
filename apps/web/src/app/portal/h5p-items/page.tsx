'use client';

import { useState } from 'react';

interface H5PItem {
  id: string;
  title: string;
  type: string;
  description: string;
  course: string;
  duration: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  thumbnail: string;
}

const MOCK_H5P_ITEMS: H5PItem[] = [
  {
    id: '1',
    title: 'Interactive Video: Navigation Rules',
    type: 'Interactive Video',
    description: 'Learn the COLREGs through this interactive video scenario with embedded quizzes.',
    course: 'Advanced Navigation',
    duration: '15 mins',
    status: 'In Progress',
    progress: 45,
    thumbnail: 'fa-play-circle'
  },
  {
    id: '2',
    title: 'Engine Room Components Drag & Drop',
    type: 'Drag and Drop',
    description: 'Identify and place the correct components in the main engine diagram.',
    course: 'Marine Engineering Basics',
    duration: '10 mins',
    status: 'Not Started',
    progress: 0,
    thumbnail: 'fa-hand-rock'
  },
  {
    id: '3',
    title: 'Maritime Flags Flashcards',
    type: 'Flashcards',
    description: 'Test your knowledge of the International Code of Signals flags.',
    course: 'Maritime Communication',
    duration: '20 mins',
    status: 'Completed',
    progress: 100,
    thumbnail: 'fa-layer-group'
  },
  {
    id: '4',
    title: 'Safety Procedures Presentation',
    type: 'Course Presentation',
    description: 'Interactive slide deck covering emergency muster station procedures.',
    course: 'Safety at Sea',
    duration: '25 mins',
    status: 'Not Started',
    progress: 0,
    thumbnail: 'fa-chalkboard'
  },
  {
    id: '5',
    title: 'Bridge Simulator Scenario',
    type: 'Simulation',
    description: 'Virtual bridge scenario for harbor entry and docking procedures.',
    course: 'Bridge Resource Management',
    duration: '30 mins',
    status: 'In Progress',
    progress: 70,
    thumbnail: 'fa-gamepad'
  }
];

export default function H5PItemsPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MOCK_H5P_ITEMS.filter(item => {
    const matchesFilter = filter === 'All' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">H5P Interactive Content</h1>
          <p className="text-gray-600 mt-1">Engage with interactive learning materials and simulations</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <i className="fa fa-plus"></i>
          <span>Browse Library</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Not Started', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
            <div className="h-40 bg-gray-100 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
              <i className={`fa ${item.thumbnail} text-6xl text-gray-300`}></i>
              <div className="absolute bottom-3 right-3 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {item.duration}
              </div>
              <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-1 bg-white/90 backdrop-blur text-gray-700 text-xs font-bold rounded shadow-sm">
                  {item.type}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{item.course}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{item.description}</p>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                  <div 
                    className={`h-1.5 rounded-full ${
                      item.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                
                <button className={`w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  item.status === 'Completed'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {item.status === 'Not Started' ? (
                    <>
                      <i className="fa fa-play"></i> Start Activity
                    </>
                  ) : item.status === 'Completed' ? (
                    <>
                      <i className="fa fa-redo"></i> Review
                    </>
                  ) : (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
