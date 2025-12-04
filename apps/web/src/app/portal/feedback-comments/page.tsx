'use client';

import { useState } from 'react';

interface FeedbackItem {
  id: string;
  instructor: string;
  instructorRole: string;
  avatar: string;
  date: string;
  content: string;
  relatedItem: string;
  itemType: string;
  course: string;
  read: boolean;
}

const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: '1',
    instructor: 'Capt. James Wilson',
    instructorRole: 'Senior Instructor',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=0D8ABC&color=fff',
    date: '2025-12-02T14:30:00',
    content: 'Excellent work on your Passage Planning Project. Your waypoints calculation was precise. However, please pay more attention to the weather routing section next time.',
    relatedItem: 'Passage Planning Project',
    itemType: 'Project',
    course: 'Advanced Navigation',
    read: false
  },
  {
    id: '2',
    instructor: 'Chief Eng. Sarah Chen',
    instructorRole: 'Engineering Faculty',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random',
    date: '2025-11-26T09:15:00',
    content: 'Please resubmit your analysis of the Maritime Law Case Study. You missed citing the relevant conventions regarding pollution prevention.',
    relatedItem: 'Maritime Law Case Study',
    itemType: 'Assignment',
    course: 'Maritime Law',
    read: true
  },
  {
    id: '3',
    instructor: 'System',
    instructorRole: 'Automated Feedback',
    avatar: 'https://ui-avatars.com/api/?name=System&background=64748b&color=fff',
    date: '2025-11-20T14:25:00',
    content: 'You scored 93% on the Radio Communication Simulation. Great job on the distress signal procedures!',
    relatedItem: 'Radio Communication Simulation',
    itemType: 'Quiz',
    course: 'GMDSS',
    read: true
  },
  {
    id: '4',
    instructor: 'Lt. Cmdr. Mark Davis',
    instructorRole: 'Safety Instructor',
    avatar: 'https://ui-avatars.com/api/?name=Mark+Davis&background=random',
    date: '2025-11-16T16:45:00',
    content: 'Good detailed report on the Fire Fighting Drill. Your observations on the team response time were very astute.',
    relatedItem: 'Fire Fighting Drill Report',
    itemType: 'Assignment',
    course: 'Safety at Sea',
    read: true
  }
];

export default function FeedbackCommentsPage() {
  const [filter, setFilter] = useState('All');

  const filteredFeedback = MOCK_FEEDBACK.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !item.read;
    return true;
  });

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback & Comments</h1>
          <p className="text-gray-600 mt-1">Instructor feedback and assessment comments</p>
        </div>
        <div className="flex gap-2">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['All', 'Unread'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Feed View */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <div key={item.id} className={`bg-white rounded-xl border p-6 hover:shadow-md transition-all duration-200 ${
            !item.read ? 'border-blue-200 shadow-sm ring-1 ring-blue-50' : 'border-gray-200'
          }`}>
            <div className="flex items-start gap-4">
              <img 
                src={item.avatar} 
                alt={item.instructor} 
                className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {item.instructor}
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.instructorRole}
                      </span>
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700 border border-gray-100">
                  {item.content}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-700">Regarding:</span>
                    <span className="text-blue-600 font-medium">{item.relatedItem}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className={`fa ${
                      item.itemType === 'Assignment' ? 'fa-file-alt' : 
                      item.itemType === 'Quiz' ? 'fa-question-circle' : 
                      item.itemType === 'Project' ? 'fa-project-diagram' : 'fa-pencil-alt'
                    }`}></i>
                    <span>{item.itemType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="fa fa-graduation-cap"></i>
                    <span>{item.course}</span>
                  </div>
                  
                  {!item.read && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredFeedback.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <i className="fa fa-comments text-4xl mb-4 text-gray-300"></i>
            <p>No feedback messages found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
