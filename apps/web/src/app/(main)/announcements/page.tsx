'use client';

import React from 'react';

export default function AnnouncementsPage() {
  const announcements = [
    {
      id: 1,
      title: 'Updated STCW 2010 Manila Amendments Training Requirements',
      content: 'Please be advised that new training requirements under the STCW 2010 Manila Amendments will come into effect starting next month. All officers are required to review the updated syllabus for ECDIS and High Voltage safety.',
      date: '2024-01-15',
      category: 'Regulation',
      importance: 'High',
      author: 'Compliance Dept.',
    },
    {
      id: 2,
      title: 'New "Cyber Security at Sea" Course Available',
      content: 'We have launched a new comprehensive course on maritime cyber security. This course covers threat identification, risk mitigation, and response protocols for shipboard systems. Enrolment is now open.',
      date: '2024-01-10',
      category: 'Course Update',
      importance: 'Medium',
      author: 'Training Director',
    },
    {
      id: 3,
      title: 'Scheduled Maintenance: LMS Platform',
      content: 'The Learning Management System will undergo scheduled maintenance on Sunday, 20th January from 0200H to 0600H UTC. Access to courses and assessments will be unavailable during this period.',
      date: '2024-01-05',
      category: 'System',
      importance: 'Low',
      author: 'IT Support',
    },
    {
      id: 4,
      title: 'Quarterly Fleet Performance Review',
      content: 'The quarterly fleet performance review meeting will be held virtually on 25th January. All senior officers are encouraged to attend. Agenda and dial-in details have been sent via email.',
      date: '2023-12-28',
      category: 'Company News',
      importance: 'Medium',
      author: 'Operations',
    },
    {
      id: 5,
      title: 'Holiday Season Greetings & Office Hours',
      content: 'Wishing all our seafarers and staff a safe and happy holiday season. Please note the adjusted office support hours during the festive period.',
      date: '2023-12-20',
      category: 'General',
      importance: 'Low',
      author: 'HR Dept.',
    },
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-500">
              Stay updated with the latest company news, regulatory changes, and course updates.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        <div className="space-y-6">
          {announcements.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
              {/* Importance Indicator Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                item.importance === 'High' ? 'bg-red-500' : 
                item.importance === 'Medium' ? 'bg-yellow-500' : 
                'bg-blue-500'
              }`}></div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImportanceColor(item.importance)}`}>
                      {item.importance} Priority
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                </div>
                <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {item.date}
                  </div>
                  <div className="mt-1 text-xs">
                    by {item.author}
                  </div>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{item.content}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                  Read full notice
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Load older announcements
          </button>
        </div>
      </div>
    </div>
  );
}
