'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { askNewQuestion } from './actions';

export default function AskInstructorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-questions');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [instructors, setInstructors] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  // Modal State
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [questionSubject, setQuestionSubject] = useState('');
  const [questionMessage, setQuestionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    if (showAskModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showAskModal]);

  useEffect(() => {
    setMounted(true);
    let active = true;

    const loadData = async () => {
      setLoading(true);

      // 1. Fetch questions using pure CSR
      try {
        let userToken: string | null = null;
        let userIdParam: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            userToken = localStorage.getItem('grandline_auth_token_trainee');
            const raw = localStorage.getItem('grandline_auth_user_trainee');
            if (raw) {
              const parsed = JSON.parse(raw) as { id?: string | number } | null;
              const value = parsed && parsed.id;
              if (value !== undefined && value !== null) {
                userIdParam = String(value);
              }
            }
          } catch {
            // ignore
          }
        }

        if (userToken && userIdParam) {
          const CMS_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace('/api', '');
          // Use the custom /api/chat endpoint which returns { data: [...], meta: {...} }
          const qRes = await fetch(`${CMS_URL}/api/chat?type=instructor_trainee&status=all&limit=50&_t=${Date.now()}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `JWT ${userToken}`
            },
            cache: 'no-store'
          });

          if (qRes.ok) {
            const data = await qRes.json();
            // data.data is the chats array from the custom endpoint
            const filtered = (data.data || []).filter((chat: any) => chat.metadata?.isAskInstructor);
            const mapped = filtered.map((chat: any) => {
              const otherParticipant = chat.participants?.find((p: any) => String(p.id) !== String(userIdParam));
              return {
                id: chat.id,
                subject: chat.metadata?.subject || chat.title || 'Question',
                preview: chat.lastMessagePreview || 'No messages yet...',
                instructor: otherParticipant?.name || 'Instructor',
                status: chat.isArchived || chat.status === 'archived' ? 'archived' : 
                  (chat.lastMessageSenderId && String(chat.lastMessageSenderId) !== String(userIdParam) ? 'answered' : (chat.metadata?.status || 'pending')),
                date: new Date(chat.lastMessageAt || chat.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                answerPreview: null
              };
            });
            if (active) setQuestions(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      }

      // 2. Fetch instructors using proven client logic EXACTLY as /portal/instructors
      try {
        let userIdParam: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('grandline_auth_user_trainee');
            if (raw) {
              const parsed = JSON.parse(raw) as { id?: string | number } | null;
              const value = parsed && parsed.id;
              if (value !== undefined && value !== null) {
                userIdParam = String(value);
              }
            }
          } catch {
            // ignore
          }
        }

        if (!userIdParam) {
          console.warn('No userIdParam found in localStorage');
          if (active) setLoading(false);
          return;
        }

        console.log('userIdParam extracted:', userIdParam);

        const res = await fetch(`/api/instructors/enrolled?userId=${userIdParam}`, {
          cache: 'no-store',
        });

        console.log('API Response status:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('API Returned data:', data);
          if (active) {
            setInstructors(data.instructors || []);
          }
        } else {
          console.error('Failed to fetch instructors from API:', await res.text());
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructor || !questionSubject || !questionMessage) return;

    try {
      setIsSubmitting(true);
      // Find the instructor to pass its user ID
      const courseId = undefined; // No direct course linking since an instructor can have multiple

      // Get the correct user ID from the selected dropdown value
      let targetUserId = selectedInstructor;
      const instructorObj = instructors.find(i => String(i.id) === selectedInstructor || String(i.user?.id || i.user) === selectedInstructor);

      if (instructorObj) {
        const u = instructorObj.user || {};
        targetUserId = String(u.id || u);
      }

      const newChat = await askNewQuestion(Number(targetUserId), questionSubject, questionMessage, courseId);

      setShowAskModal(false);
      setQuestionSubject('');
      setQuestionMessage('');

      // Navigate to thread
      router.push(`/portal/ask-instructor/${newChat.id}` as any);
    } catch (error: any) {
      console.error('Error creating question:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Failed to Send',
        message: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModalForInstructor = (instructorUserId: string) => {
    setSelectedInstructor(String(instructorUserId));
    setShowAskModal(true);
  };

  const filteredQuestions = questions.filter(q =>
    activeTab === 'archived' ? q.status === 'archived' : q.status !== 'archived'
  );

  return (
    <div className="w-full px-[10px] py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ask Instructor</h1>
          <p className="text-gray-500 mt-1">Get direct support and guidance from maritime experts</p>
        </div>
        <button
          onClick={() => {
            setSelectedInstructor('');
            setShowAskModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
        >
          <i className="fa fa-paper-plane"></i>
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Available Instructors */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Instructors</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse flex flex-col h-[180px]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                     <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end">
                   <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-200">
            You are not enrolled in any courses with assigned instructors.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {instructors.map((instructor) => {
              const user = instructor.user || {};
              const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Instructor';

              let image = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
              if (user.profilePicture && typeof user.profilePicture === 'object') {
                if (user.profilePicture.cloudinaryURL) {
                  image = user.profilePicture.cloudinaryURL.replace(/[`'"]/g, '').trim();
                } else if (user.profilePicture.url) {
                  image = user.profilePicture.url.startsWith('http')
                    ? user.profilePicture.url
                    : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://cms.grandlinemaritime.com'}${user.profilePicture.url}`;
                }
              }
              const role = instructor.specialization || 'Instructor';

              return (
                <div key={instructor.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-20 bg-green-500"></div>

                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 overflow-hidden">
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{name}</h3>
                      <p className="text-xs font-medium text-blue-600 line-clamp-1">{role}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 flex-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <i className="fa fa-envelope w-5 text-center mr-2 text-gray-400"></i>
                      <span className="truncate">{instructor.contactEmail || user.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                    <button
                      onClick={() => {
                        const user = instructor.user || {};
                        const uId = String(user.id || user);
                        const fallbackId = uId !== '[object Object]' ? uId : String(instructor.id);
                        openModalForInstructor(fallbackId);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer z-10"
                    >
                      Message <i className="fa fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Q&A Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('my-questions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my-questions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Active Questions
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'archived'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Archived
            </button>
          </nav>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="w-full">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-5 bg-gray-200 rounded-full w-20" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="h-8 bg-gray-100 rounded-lg w-48" />
                    </div>
                    <div className="flex-shrink-0 flex md:flex-col items-center gap-2">
                       <div className="h-6 w-6 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No questions found in this category.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <Link href={`/portal/ask-instructor/${q.id}` as any} key={q.id} className="block p-6 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${q.status === 'answered' ? 'bg-green-100 text-green-700' :
                        q.status === 'archived' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {q.status}
                      </span>
                      <span className="text-xs text-gray-500">{q.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{q.subject}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{q.preview}</p>

                    {q.status === 'answered' && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 inline-block">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-800">
                          <i className="fa fa-reply"></i>
                          New Reply from {q.instructor}
                        </div>
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
                    <div className="p-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <i className="fa fa-chevron-right"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Ask Modal */}
      {mounted && showAskModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-white md:bg-black/50 flex flex-col md:items-start md:justify-center md:p-6 md:pt-12 overflow-hidden" style={{ margin: 0 }}>
          <div className="bg-white w-full h-full flex flex-col md:h-auto md:max-h-[85vh] md:rounded-xl md:max-w-2xl md:shadow-2xl overflow-hidden md:mx-auto">
            <div className="p-3 md:px-6 md:py-4 flex items-center justify-between border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAskModal(false)} className="md:hidden w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center shrink-0">
                  <i className="fa fa-arrow-left"></i>
                </button>
                <h2 className="text-xl font-bold text-gray-900">Ask Instructor</h2>
              </div>
              <button onClick={() => setShowAskModal(false)} className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0 ml-2">
                <i className="fa fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleAskQuestion} className="h-full flex flex-col">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Instructor</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select an instructor --</option>
                    {instructors.map(i => {
                      const user = i.user || {};
                      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Instructor';
                      const userId = String(user.id || user);
                      // Make sure we have a valid key by falling back to i.id
                      const keyId = userId && userId !== '[object Object]' ? userId : String(i.id);
                      return <option key={keyId} value={keyId}>{name} ({i.specialization || 'Instructor'})</option>;
                    })}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={questionSubject}
                    onChange={(e) => setQuestionSubject(e.target.value)}
                    placeholder="Briefly summarize your question..."
                    required
                  />
                </div>
                <div className="mb-6 flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 min-h-[150px] flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    value={questionMessage}
                    onChange={(e) => setQuestionMessage(e.target.value)}
                    placeholder="Provide details about your question..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedInstructor || !questionSubject || !questionMessage}
                    className="bg-[#201a7c] text-white px-6 py-2 rounded-lg hover:bg-[#1a1563] font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i>
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Send Question'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

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