'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { askNewQuestion, type AskInstructorQuestion } from './actions';

export default function AskInstructorPageClient({
  initialInstructors,
  initialQuestions,
  preselectedInstructorId,
}: {
  initialInstructors: any[];
  initialQuestions: AskInstructorQuestion[];
  preselectedInstructorId?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-questions');
  const [mounted, setMounted] = useState(false);
  const [instructors] = useState<any[]>(initialInstructors);
  const [questions, setQuestions] = useState<AskInstructorQuestion[]>(initialQuestions);
  const [showAskModal, setShowAskModal] = useState(Boolean(preselectedInstructorId));
  const [selectedInstructor, setSelectedInstructor] = useState(preselectedInstructorId || '');
  const [questionSubject, setQuestionSubject] = useState('');
  const [questionMessage, setQuestionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showAskModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showAskModal]);

  const filteredQuestions = useMemo(() => (
    questions.filter((question) =>
      activeTab === 'archived' ? question.status === 'archived' : question.status !== 'archived'
    )
  ), [activeTab, questions]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructor || !questionSubject || !questionMessage) return;

    try {
      setIsSubmitting(true);
      let targetUserId = selectedInstructor;
      const instructorObj = instructors.find((instructor) =>
        String(instructor.userId || '') === selectedInstructor ||
        String(instructor.id) === selectedInstructor ||
        String(instructor.user?.id || instructor.user) === selectedInstructor
      );

      if (instructorObj) {
        targetUserId = String(instructorObj.userId || instructorObj.user?.id || instructorObj.user || selectedInstructor);
      }

      const newQuestion = await askNewQuestion(Number(targetUserId), questionSubject, questionMessage);

      setShowAskModal(false);
      setQuestionSubject('');
      setQuestionMessage('');
      setQuestions((current) => [newQuestion, ...current]);
      router.push(`/portal/ask-instructor/${newQuestion.id}` as any);
      router.refresh();
    } catch (error: any) {
      console.error('Error creating question:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Failed to Send',
        message: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModalForInstructor = (instructorUserId: string) => {
    setSelectedInstructor(String(instructorUserId));
    setShowAskModal(true);
  };

  return (
    <div className="w-full px-[10px] py-6 bg-[var(--background)] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ask Instructor</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Get direct support and guidance from maritime experts</p>
        </div>
        <button
          onClick={() => {
            setSelectedInstructor('');
            setShowAskModal(true);
          }}
          className="bg-[#201a7c] dark:bg-[#3028a3] text-white px-6 py-2.5 rounded-lg hover:bg-[#1a1563] dark:hover:bg-[#3b32c4] transition-colors flex items-center gap-2 shadow-sm font-medium"
        >
          <i className="fa fa-paper-plane"></i>
          <span>Ask a Question</span>
        </button>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Instructors</h2>
        </div>

        {instructors.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-[var(--card-background)] p-4 rounded-xl border border-[var(--card-border)]">
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
                <div key={instructor.id} className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] p-5 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-20 bg-green-500"></div>

                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden">
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#201a7c] dark:group-hover:text-[#5c54e0] transition-colors line-clamp-1">{name}</h3>
                      <p className="text-xs font-medium text-[#201a7c] dark:text-[#5c54e0] line-clamp-1">{role}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 flex-1">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <i className="fa fa-envelope w-5 text-center mr-2 text-gray-400 dark:text-gray-500"></i>
                      <span className="truncate">{instructor.contactEmail || user.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                      onClick={() => {
                        const fallbackId = String(instructor.userId || instructor.user?.id || instructor.id);
                        openModalForInstructor(fallbackId);
                      }}
                      className="text-xs font-medium text-[#201a7c] dark:text-[#5c54e0] hover:text-[#1a1563] dark:hover:text-[#6a62f5] transition-colors flex items-center gap-1 cursor-pointer z-10"
                    >
                      Message <i className="fa fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[var(--card-background)] rounded-xl border border-[var(--card-border)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--card-border)]">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('my-questions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my-questions'
                ? 'border-[#201a7c] text-[#201a7c] dark:border-[#5c54e0] dark:text-[#5c54e0]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Active Questions
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'archived'
                ? 'border-[#201a7c] text-[#201a7c] dark:border-[#5c54e0] dark:text-[#5c54e0]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Archived
            </button>
          </nav>
        </div>

        <div className="divide-y divide-[var(--card-border)]">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No questions found in this category.
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <Link href={`/portal/ask-instructor/${question.id}` as any} key={question.id} className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${question.status === 'answered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        question.status === 'archived' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                        {question.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{question.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#201a7c] dark:group-hover:text-[#5c54e0] transition-colors">{question.subject}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{question.preview}</p>

                    {question.status === 'answered' && (
                      <div className="bg-[#201a7c]/5 dark:bg-[#3028a3]/20 rounded-lg p-3 border border-[#201a7c]/10 dark:border-[#3028a3]/30 inline-block">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#201a7c] dark:text-[#5c54e0]">
                          <i className="fa fa-reply"></i>
                          New Reply from {question.instructor}
                        </div>
                      </div>
                    )}

                    {question.status === 'pending' && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 italic">
                        <i className="fa fa-spinner fa-spin"></i>
                        Awaiting response from {question.instructor}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex md:flex-col items-center gap-2">
                    <div className="p-2 text-gray-400 group-hover:text-[#201a7c] dark:group-hover:text-[#5c54e0] transition-colors">
                      <i className="fa fa-chevron-right"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {mounted && showAskModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-[var(--background)] md:bg-black/50 flex flex-col md:items-start md:justify-center md:p-6 md:pt-12 overflow-hidden" style={{ margin: 0 }}>
          <div className="bg-[var(--card-background)] w-full h-full flex flex-col md:h-auto md:max-h-[85vh] md:rounded-xl md:max-w-2xl md:shadow-2xl overflow-hidden md:mx-auto">
            <div className="p-3 md:px-6 md:py-4 flex items-center justify-between border-b border-[var(--card-border)] shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAskModal(false)} className="md:hidden w-8 h-8 rounded-full bg-[var(--card-background)] border border-[var(--card-border)] shadow-md flex items-center justify-center shrink-0">
                  <i className="fa fa-arrow-left text-gray-600 dark:text-gray-300"></i>
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ask Instructor</h2>
              </div>
              <button onClick={() => setShowAskModal(false)} className="hidden md:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 shrink-0 ml-2">
                <i className="fa fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleAskQuestion} className="h-full flex flex-col">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Instructor</label>
                  <select
                    className="w-full border border-[var(--card-border)] rounded-lg p-2 focus:ring-2 focus:ring-[#201a7c] focus:outline-none bg-[var(--background)] text-gray-900 dark:text-gray-100"
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select an instructor --</option>
                    {instructors.map((instructor) => {
                      const user = instructor.user || {};
                      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Instructor';
                      const keyId = String(instructor.userId || user.id || instructor.id);
                      return <option key={keyId} value={keyId}>{name} ({instructor.specialization || 'Instructor'})</option>;
                    })}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border border-[var(--card-border)] bg-[var(--background)] text-gray-900 dark:text-gray-100 rounded-lg p-2 focus:ring-2 focus:ring-[#201a7c] focus:outline-none"
                    value={questionSubject}
                    onChange={(e) => setQuestionSubject(e.target.value)}
                    placeholder="Briefly summarize your question..."
                    required
                  />
                </div>
                <div className="mb-6 flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    className="w-full border border-[var(--card-border)] bg-[var(--background)] text-gray-900 dark:text-gray-100 rounded-lg p-2 min-h-[150px] flex-1 focus:ring-2 focus:ring-[#201a7c] focus:outline-none resize-none"
                    value={questionMessage}
                    onChange={(e) => setQuestionMessage(e.target.value)}
                    placeholder="Provide details about your question..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)] shrink-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedInstructor || !questionSubject || !questionMessage}
                    className="bg-[#201a7c] dark:bg-[#3028a3] text-white px-6 py-2 rounded-lg hover:bg-[#1a1563] dark:hover:bg-[#3b32c4] font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
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

      {mounted && feedbackModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[var(--card-background)] rounded-xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feedbackModal.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              {feedbackModal.type === 'success' ? (
                <i className="fa fa-check text-2xl"></i>
              ) : (
                <i className="fa fa-times text-2xl"></i>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{feedbackModal.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
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
