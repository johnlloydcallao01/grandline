'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePhysicsCarousel } from '@encreasl/ui/physics-carousel';
import {
  getDiscussionTopics,
  createDiscussionTopic,
  fetchCourseCategories
} from './actions';

export default function DiscussionBoardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([
    { id: 'all', name: 'All Topics' }
  ]);
  const [loading, setLoading] = useState(true);

  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('general');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);

  const {
    translateX,
    isDragging,
    hasDragged,
    onStart,
    onMove,
    onEnd,
  } = usePhysicsCarousel({
    containerRef: carouselContainerRef,
    trackRef: carouselTrackRef,
    measureDeps: [categories.length],
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showNewTopicModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showNewTopicModal]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch topics and categories in parallel
      const [topicsData, categoriesData] = await Promise.all([
        getDiscussionTopics(),
        fetchCourseCategories()
      ]);

      setTopics(topicsData || []);

      // Format categories
      if (categoriesData && categoriesData.length > 0) {
        const formattedCategories = [
          { id: 'all', name: 'All Topics' },
          ...categoriesData.map((cat: any) => ({
            id: cat.slug || String(cat.id),
            name: cat.name
          })),
          { id: 'general', name: 'General Discussion' } // Keep general as fallback
        ];
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicContent) return;

    try {
      setIsSubmitting(true);
      const newTopic = await createDiscussionTopic(newTopicTitle, newTopicContent, newTopicCategory);
      setShowNewTopicModal(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      router.push(`/portal/discussion-board/${newTopic.id}`);
    } catch (error: any) {
      console.error('Error creating topic:', error);
      setFeedbackModal({ isOpen: true, type: 'error', title: 'Failed to Create Topic', message: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };



  const filteredTopics = topics.filter(topic => {
    const category = topic.metadata?.category || 'general';
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    const matchesSearch = topic.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discussion Board</h1>
          <p className="text-gray-500 mt-1">Engage with peers and instructors on maritime topics</p>
        </div>
        <button
          onClick={() => setShowNewTopicModal(true)}
          className="bg-[#201a7c] text-white px-4 py-2 rounded-lg hover:bg-[#1a1563] transition-colors flex items-center gap-2 shadow-sm"
        >
          <i className="fa fa-plus"></i>
          <span>New Topic</span>
        </button>
      </div>

      {mounted && showNewTopicModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-white md:bg-black/50 flex flex-col md:items-start md:justify-center md:p-6 md:pt-12 overflow-hidden" style={{ margin: 0 }}>
          <div className="bg-white w-full h-full flex flex-col md:h-auto md:max-h-[85vh] md:rounded-xl md:max-w-4xl md:shadow-2xl overflow-hidden md:mx-auto">
            <div className="p-3 md:px-6 md:py-4 flex items-center justify-between border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                {/* Mobile Back Button */}
                <button onClick={() => setShowNewTopicModal(false)} className="md:hidden w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center shrink-0">
                  <i className="fa fa-arrow-left"></i>
                </button>
                <h2 className="text-xl font-bold text-gray-900">Create New Topic</h2>
              </div>
              {/* Desktop Close Button */}
              <button onClick={() => setShowNewTopicModal(false)} className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0 ml-2">
                <i className="fa fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleCreateTopic} className="h-full flex flex-col">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Enter a descriptive title..."
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-6 flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Message</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 min-h-[150px] flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    placeholder="What would you like to discuss?"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowNewTopicModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#201a7c] text-white px-6 py-2 rounded-lg hover:bg-[#1a1563] font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i>
                        <span>Posting...</span>
                      </>
                    ) : (
                      'Post Topic'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-72 lg:w-80 relative flex-shrink-0">
            <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            ref={carouselContainerRef}
            className="flex-1 w-full overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
            onMouseDown={(e) => onStart(e.clientX)}
            onMouseMove={(e) => isDragging && onMove(e.clientX)}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={(e) => onStart(e.touches[0].clientX)}
            onTouchMove={(e) => isDragging && onMove(e.touches[0].clientX)}
            onTouchEnd={onEnd}
          >
            <div
              ref={carouselTrackRef}
              className="flex gap-2 w-max"
              style={{
                transform: `translate3d(${translateX}px, 0, 0)`,
                transitionDuration: isDragging ? "0ms" : undefined,
              }}
            >
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={(e) => {
                    if (hasDragged) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setSelectedCategory(category.id);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse block">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3 mt-1">
                    <div className="h-4 bg-gray-200 rounded-full w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            <p>No discussion topics found. Be the first to start one!</p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const categoryObj = categories.find(c => c.id === (topic.metadata?.category || 'general'));
            return (
              <Link
                href={`/portal/discussion-board/${topic.id}`}
                key={topic.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group block"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <i className="fa fa-comments text-blue-500 text-xl"></i>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                        {categoryObj?.name || 'General'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-4">
                      {topic.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          {topic.createdBy?.firstName} {topic.createdBy?.lastName}
                        </span>
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>Last active: {topic.lastMessageAt ? new Date(topic.lastMessageAt).toLocaleDateString() : 'Just now'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Feedback Modal */}
      {mounted && feedbackModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feedbackModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {feedbackModal.type === 'success' ? (
                <i className="fa fa-check text-2xl"></i>
              ) : (
                <i className="fa fa-times text-2xl"></i>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feedbackModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
