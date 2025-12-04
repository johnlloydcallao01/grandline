'use client';

import { useState } from 'react';

export default function AskInstructorPage() {
  const [activeTab, setActiveTab] = useState('my-questions');

  const instructors = [
    {
      id: 1,
      name: 'Capt. James Wilson',
      role: 'Master Mariner',
      specialty: 'Navigation & Safety',
      avatar: 'fa-anchor',
      status: 'online',
      responseTime: '< 2 hours'
    },
    {
      id: 2,
      name: 'C/E Robert Chen',
      role: 'Chief Engineer',
      specialty: 'Marine Engineering',
      avatar: 'fa-cogs',
      status: 'offline',
      responseTime: '~ 5 hours'
    },
    {
      id: 3,
      name: 'Dr. Elena Rodriguez',
      role: 'Maritime Law',
      specialty: 'Regulations & Policy',
      avatar: 'fa-gavel',
      status: 'online',
      responseTime: '< 1 hour'
    },
    {
      id: 4,
      name: '2/O Sarah Miller',
      role: 'Safety Officer',
      specialty: 'Emergency Response',
      avatar: 'fa-life-ring',
      status: 'away',
      responseTime: '~ 24 hours'
    }
  ];

  const questions = [
    {
      id: 1,
      subject: 'Question regarding gyro compass error calculation',
      preview: 'I am having trouble understanding the application of variation and deviation when...',
      instructor: 'Capt. James Wilson',
      status: 'answered',
      date: 'Oct 24, 2025',
      answerPreview: 'Great question. Remember the mnemonic "Can Dead Men Vote Twice At Elections"...'
    },
    {
      id: 2,
      subject: 'Clarification on Marpol Annex VI',
      preview: 'Does the new regulation regarding sulfur content apply to auxiliary engines in...',
      instructor: 'Dr. Elena Rodriguez',
      status: 'pending',
      date: 'Oct 26, 2025',
      answerPreview: null
    },
    {
      id: 3,
      subject: 'Main Engine Fuel Pump Timing',
      preview: 'When adjusting the VIT, what are the primary indicators I should be looking for on the...',
      instructor: 'C/E Robert Chen',
      status: 'answered',
      date: 'Oct 20, 2025',
      answerPreview: 'The VIT adjustment should be primarily based on the Pmax values relative to...'
    }
  ];

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ask Instructor</h1>
          <p className="text-gray-500 mt-1">Get direct support and guidance from maritime experts</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
          <i className="fa fa-paper-plane"></i>
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Available Instructors */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Available Instructors</h2>
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-20 ${
                instructor.status === 'online' ? 'bg-green-500' : 
                instructor.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
              
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                    <i className={`fa ${instructor.avatar} text-xl`}></i>
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    instructor.status === 'online' ? 'bg-green-500' : 
                    instructor.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{instructor.name}</h3>
                  <p className="text-xs font-medium text-blue-600">{instructor.role}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <i className="fa fa-graduation-cap w-5 text-center mr-2 text-gray-400"></i>
                  <span className="truncate">{instructor.specialty}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <i className="fa fa-clock-o w-5 text-center mr-2 text-gray-400"></i>
                  <span>Responds {instructor.responseTime}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  Message <i className="fa fa-arrow-right"></i>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Q&A Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('my-questions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-questions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Questions
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'archived'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Archived
            </button>
          </nav>
        </div>

        <div className="divide-y divide-gray-100">
          {questions.map((q) => (
            <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      q.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {q.status}
                    </span>
                    <span className="text-xs text-gray-500">{q.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{q.subject}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{q.preview}</p>
                  
                  {q.status === 'answered' && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-blue-800">
                        <i className="fa fa-reply"></i>
                        Reply from {q.instructor}
                      </div>
                      <p className="text-sm text-gray-800 italic">"{q.answerPreview}"</p>
                      <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800">
                        Read full answer
                      </button>
                    </div>
                  )}
                  
                  {q.status === 'pending' && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                      <i className="fa fa-spinner fa-spin"></i>
                      Awaiting response from {q.instructor}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 flex md:flex-col items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <i className="fa fa-ellipsis-h"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View all history</button>
        </div>
      </div>
    </div>
  );
}
