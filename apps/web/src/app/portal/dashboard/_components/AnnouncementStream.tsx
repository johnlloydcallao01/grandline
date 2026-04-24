import React from 'react';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  courseId: string;
}

interface AnnouncementStreamProps {
  announcements: Announcement[];
}

export const AnnouncementStream: React.FC<AnnouncementStreamProps> = ({ announcements }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
          <Link href={"/portal/announcements" as any} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
      </div>
      <div className="p-6">
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className={`p-4 rounded-xl border-l-4 transition-all hover:bg-gray-50 ${
                ann.pinned ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center mb-1">
                  {ann.pinned && (
                    <i className="fa fa-thumbtack text-blue-500 text-xs mr-2"></i>
                  )}
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{ann.title}</h3>
                </div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa fa-bullhorn text-gray-300 text-xl"></i>
            </div>
            <p className="text-sm text-gray-500">No announcements for your courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};
