'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFeedbackComments, markAsRead, markAllAsRead, markAllAsUnread, type FeedbackItem } from './actions';

function FeedbackCommentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read the filter from the URL query param 'tab', default to 'All'
  const filter = searchParams.get('tab') || 'All';

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const items = await getFeedbackComments();
        setFeedbackItems(items);
      } catch (error) {
        console.error('Failed to load feedback comments:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, []);

  const filteredFeedback = feedbackItems.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !item.read;
    if (filter === 'Read') return item.read;
    return true;
  });

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead(feedbackItems);
    if (success) {
      setFeedbackItems(prev => prev.map(item => ({ ...item, read: true })));
    }
  };

  const handleMarkAllAsUnread = async () => {
    const success = await markAllAsUnread(feedbackItems);
    if (success) {
      setFeedbackItems(prev => prev.map(item => ({ ...item, read: false })));
    }
  };

  const handleItemClick = async (item: FeedbackItem) => {
    // If it's unread, optimistically mark it as read
    if (!item.read) {
      // Optimistic update
      setFeedbackItems(prev => prev.map(i => i.id === item.id && i.sourceType === item.sourceType ? { ...i, read: true } : i));

      // Call the server action in the background (fire and forget so it doesn't block navigation)
      markAsRead(item.id, item.sourceType).then((success) => {
        if (!success) {
          // Revert if failed
          setFeedbackItems(prev => prev.map(i => i.id === item.id && i.sourceType === item.sourceType ? { ...i, read: false } : i));
        }
      });
    }

    // Immediately redirect to the relevant detail page using Next.js router
    if (item.linkUrl && item.linkUrl !== '#') {
      router.push(item.linkUrl as any);
    }
  };

  const handleTabChange = (status: string) => {
    // Update the URL without a full page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', status);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback & Comments</h1>
          <p className="text-gray-600 mt-1">Instructor feedback and assessment comments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
            disabled={loading || feedbackItems.every(i => i.read)}
          >
            Mark all as read
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleMarkAllAsUnread}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 transition-colors"
            disabled={loading || feedbackItems.every(i => !i.read)}
          >
            Mark all as unread
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['All', 'Read', 'Unread'].map((status) => (
          <button
            key={status}
            onClick={() => handleTabChange(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
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
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-16 bg-gray-100 rounded-lg mb-3"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeedback.map((item) => (
          <div
            key={`${item.sourceType}-${item.id}`}
            onClick={() => handleItemClick(item)}
            className={`rounded-xl border p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${item.read ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 shadow-sm'
              }`}
          >
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

                <div className={`${item.read ? 'bg-gray-50' : 'bg-white'} rounded-lg p-3 mb-3 text-sm text-gray-700 border ${item.read ? 'border-gray-100' : 'border-gray-200 shadow-sm'}`}>
                  {item.content}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-700">Regarding:</span>
                    <span className="text-blue-600 font-medium">{item.relatedItem}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className={`fa ${item.itemType === 'Assignment' ? 'fa-file-alt' :
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

        {!loading && filteredFeedback.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <i className="fa fa-comments text-4xl mb-4 text-gray-300"></i>
            <p>No feedback messages found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedbackCommentsPage() {
  return (
    <Suspense fallback={
      <div className="w-full px-[10px] py-6 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#201a7c] border-t-transparent" />
      </div>
    }>
      <FeedbackCommentsContent />
    </Suspense>
  );
}
