import React from 'react';

interface PendingWork {
  id: string;
  status: string;
  type: 'assignment';
  title: string;
  dueDate: string;
}

interface PendingWorkFeedProps {
  work: PendingWork[];
}

export const PendingWorkFeed: React.FC<PendingWorkFeedProps> = ({ work }) => {
  // Sort by due date (oldest first/overdue first)
  const sortedWork = [...work].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date).getTime() < Date.now();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Pending Work</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {work.length} Tasks
          </span>
        </div>
      </div>
      <div className="p-6">
        {work.length > 0 ? (
          <div className="space-y-4">
            {sortedWork.map((item) => {
              const overdue = isOverdue(item.dueDate);
              const isRevision = item.status === 'returned_for_revision';
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      overdue || isRevision ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      <i className={`fa ${isRevision ? 'fa-reply-all' : overdue ? 'fa-exclamation-circle' : 'fa-clock'} text-xl`}></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <div className="flex items-center mt-0.5">
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded ${
                          isRevision ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                        {item.dueDate && (
                           <span className={`text-xs ml-2 ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                             {overdue ? 'Overdue' : 'Due'}: {new Date(item.dueDate).toLocaleDateString()}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                      <i className="fa fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa fa-check-circle text-green-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">You're all caught up!</h3>
            <p className="text-gray-500">No pending assignments or revisions at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
