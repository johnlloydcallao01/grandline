import React from 'react';
import Link from 'next/link';

interface ContinueLearningHeroProps {
  continueLearning: {
    id: string;
    status: string;
    lastAccessedAt: string;
    itemType: string;
    itemId: string;
  } | null;
}

export const ContinueLearningHero: React.FC<ContinueLearningHeroProps> = ({ continueLearning }) => {
  if (!continueLearning) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Continue Learning</h2>
          <p className="text-blue-100 text-sm">Pick up exactly where you left off</p>
        </div>
        <div className="hidden sm:block">
           <i className="fa fa-graduation-cap text-4xl text-blue-400 opacity-50"></i>
        </div>
      </div>
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fa fa-play text-blue-600 text-xl"></i>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900 text-lg">Last Accessed Lesson</h3>
            <p className="text-sm text-gray-500">
              Accessed on {new Date(continueLearning.lastAccessedAt).toLocaleDateString()} at {new Date(continueLearning.lastAccessedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <Link 
          href={`/portal/learn/${continueLearning.id}` as any}
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm"
        >
          Resume Now
          <i className="fa fa-arrow-right ml-2 text-sm"></i>
        </Link>
      </div>
    </div>
  );
};
