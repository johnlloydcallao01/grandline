'use client';

export default function AnnouncementsPage() {
  const announcements = [
    {
      id: 1,
      title: 'Scheduled System Maintenance',
      category: 'system',
      priority: 'high',
      date: 'Oct 28, 2025',
      time: '08:00 AM',
      content: 'The portal will be undergoing scheduled maintenance on Saturday, Nov 1st from 0200H to 0400H UTC. During this time, course content and assessments will be unavailable.',
      author: 'IT Support',
      read: false
    },
    {
      id: 2,
      title: 'New Course Available: Advanced Fire Fighting',
      category: 'course',
      priority: 'normal',
      date: 'Oct 27, 2025',
      time: '14:30 PM',
      content: 'We are pleased to announce the launch of our new STCW Advanced Fire Fighting refresher course. This module includes updated virtual reality scenarios.',
      author: 'Training Dept',
      read: true
    },
    {
      id: 3,
      title: 'Updated Navigation Charts Library',
      category: 'resource',
      priority: 'normal',
      date: 'Oct 25, 2025',
      time: '09:15 AM',
      content: 'The digital chart library has been updated with the latest Notice to Mariners. Please sync your offline content to ensure you have the most recent data.',
      author: 'Navigation Officer',
      read: true
    },
    {
      id: 4,
      title: 'Quarterly Safety Meeting - Mandatory Attendance',
      category: 'enterprise',
      priority: 'high',
      date: 'Oct 24, 2025',
      time: '11:00 AM',
      content: 'All deck and engine officers are required to attend the virtual quarterly safety meeting scheduled for next Tuesday. Link has been sent to your registered email.',
      author: 'Safety Dept',
      read: true
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'course': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resource': return 'bg-green-100 text-green-700 border-green-200';
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'system': return 'fa-server';
      case 'course': return 'fa-graduation-cap';
      case 'resource': return 'fa-book';
      case 'enterprise': return 'fa-building';
      default: return 'fa-bell';
    }
  };

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Stay updated with the latest news and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Mark all as read
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <i className="fa fa-filter"></i>
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-xl border p-6 transition-all duration-200 ${
              !item.read 
                ? 'border-blue-200 shadow-md ring-1 ring-blue-100' 
                : 'border-gray-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${getCategoryColor(item.category)}`}>
                <i className={`fa ${getIcon(item.category)} text-lg`}></i>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  {item.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                      <i className="fa fa-exclamation-circle"></i> Urgent
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto md:ml-0">
                    {item.date} at {item.time}
                  </span>
                  {!item.read && (
                    <span className="ml-auto md:hidden w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                
                <h3 className={`text-lg font-bold mb-2 ${!item.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {item.content}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span>Posted by {item.author}</span>
                </div>
              </div>

              {!item.read && (
                <div className="hidden md:flex flex-col justify-center self-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-50"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">You've reached the end of the list</p>
        <button className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
          View Archived Announcements
        </button>
      </div>
    </div>
  );
}
