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
    if (filter === 'My Submissions') return item.sourceType === 'feedback-submissions';
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
    <div className="w-full px-[10px] py-6 bg-[var(--background)] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback & Comments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Instructor feedback and assessment comments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-[#201a7c] dark:text-[#5c54e0] hover:text-[#1a1569] dark:hover:text-[#6a62f5] font-medium disabled:opacity-50 transition-colors"
            disabled={loading || feedbackItems.every(i => i.read)}
          >
            Mark all as read
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={handleMarkAllAsUnread}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium disabled:opacity-50 transition-colors"
            disabled={loading || feedbackItems.every(i => !i.read)}
          >
            Mark all as unread
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['All', 'Read', 'Unread', 'My Submissions'].map((status) => {
          const isActive = filter === status;
          const isMySubmissions = status === 'My Submissions';
          return (
            <button
              key={status}
              onClick={() => handleTabChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${isActive
                  ? isMySubmissions
                    ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-sm'
                    : 'bg-[#201a7c] dark:bg-[#3028a3] text-white shadow-sm'
                  : 'bg-[var(--card-background)] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-[var(--card-border)]'
                }`}
            >
              {isMySubmissions && <i className="fa fa-comment-dots"></i>}
              {status}
            </button>
          );
        })}
      </div>

      {/* Feed View */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                    </div>
                    <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg mb-3"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeedback.map((item) => {
          const isFeedbackSubmission = item.sourceType === 'feedback-submissions';

          if (isFeedbackSubmission) {
            // Special distinct card design for feedback submissions
            const responseCount = item.responses ? Object.keys(item.responses).length : 0;
            return (
              <div
                key={`${item.sourceType}-${item.id}`}
                onClick={() => handleItemClick(item)}
                className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 dark:bg-emerald-800/30 rounded-bl-full opacity-50"></div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <i className="fa fa-comment-dots text-white text-xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                          Your Feedback Submission
                        </h3>
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <i className="fa fa-check-circle mr-1"></i>
                          Submitted
                        </span>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap ml-2 bg-white dark:bg-emerald-950/50 px-2 py-1 rounded-full shadow-sm">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-emerald-950/30 rounded-lg p-4 mb-3 text-sm text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                      <p className="font-medium mb-2">{item.formTitle}</p>
                      <p className="text-emerald-600 dark:text-emerald-400">{item.content}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-lg">
                        <i className="fa fa-list-check text-emerald-600 dark:text-emerald-400"></i>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">{responseCount} Responses</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <i className="fa fa-graduation-cap"></i>
                        <span className="font-medium">{item.course}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>View Details</span>
                        <i className="fa fa-arrow-right"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Default card design for instructor feedback
          return (
            <div
              key={`${item.sourceType}-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`rounded-xl border p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${item.read ? 'bg-[var(--card-background)] border-[var(--card-border)]' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 shadow-sm'
                }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.avatar}
                  alt={item.instructor}
                  className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {item.instructor}
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                          {item.instructorRole}
                        </span>
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={`${item.read ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-[var(--card-background)]'} rounded-lg p-3 mb-3 text-sm text-gray-700 dark:text-gray-300 border ${item.read ? 'border-gray-100 dark:border-gray-800' : 'border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                    {item.content}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Regarding:</span>
                      <span className="text-[#201a7c] dark:text-[#5c54e0] font-medium">{item.relatedItem}</span>
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#201a7c]/10 dark:bg-[#3028a3]/30 text-[#201a7c] dark:text-[#5c54e0] border border-[#201a7c]/20 dark:border-[#3028a3]/50">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && filteredFeedback.length === 0 && (
          <div className={`p-12 text-center rounded-xl border ${filter === 'My Submissions' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-[var(--card-background)] border-[var(--card-border)]'}`}>
            <i className={`fa ${filter === 'My Submissions' ? 'fa-comment-dots' : 'fa-comments'} text-4xl mb-4 ${filter === 'My Submissions' ? 'text-emerald-400 dark:text-emerald-600' : 'text-gray-300 dark:text-gray-600'}`}></i>
            <p className={filter === 'My Submissions' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
              {filter === 'My Submissions'
                ? 'You have not submitted any course feedback yet. Complete a course to submit feedback!'
                : 'No feedback messages found.'}
            </p>
            {filter === 'My Submissions' && (
              <button
                onClick={() => router.push('/portal/courses')}
                className="mt-4 px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
              >
                Go to Courses
              </button>
            )}
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
