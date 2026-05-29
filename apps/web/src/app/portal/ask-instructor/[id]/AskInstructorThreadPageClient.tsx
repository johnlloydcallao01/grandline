'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { replyToQuestion, type AskInstructorThreadData } from '../actions';

export default function AskInstructorThreadPageClient({ initialThread }: { initialThread: AskInstructorThreadData }) {
  const router = useRouter();
  const [thread, setThread] = useState(initialThread);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { question, messages } = thread;

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      const newMessage = await replyToQuestion(Number(question.id), replyContent);
      setReplyContent('');
      setThread((current) => ({
        ...current,
        question: {
          ...current.question,
          status: 'pending',
          lastMessageAt: newMessage.createdAt,
        },
        messages: [...current.messages, newMessage],
      }));
      scrollToBottom();
      router.refresh();
    } catch (error: any) {
      console.error('Error posting reply:', error);
      setFeedbackModal({ isOpen: true, type: 'error', title: 'Failed to Post Reply', message: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-[10px] py-6 h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto">
      <Link
        href="/portal/ask-instructor"
        className="mb-4 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 shrink-0 font-medium"
      >
        <i className="fa fa-arrow-left"></i> Back to Questions
      </Link>

      <div className="bg-[var(--card-background)] rounded-t-xl border-t border-x border-[var(--card-border)] p-4 shadow-sm shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{question.subject}</h1>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-gray-500 dark:text-gray-400">With: <span className="font-medium text-gray-900 dark:text-gray-200">{question.instructor}</span></span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${question.status === 'answered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              question.status === 'archived' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}>
              {question.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[var(--background)] border-x border-[var(--card-border)] overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-[var(--card-background)] rounded-xl border border-[var(--card-border)]">
            Start the conversation. Send your first message below.
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.isMine ? 'justify-end' : 'justify-start'}`}>
              {!message.isMine && (
                <div className="w-8 h-8 rounded-full bg-[#201a7c]/10 dark:bg-[#3028a3]/30 flex items-center justify-center text-[#201a7c] dark:text-[#5c54e0] font-bold shrink-0 text-xs">
                  {message.senderName?.[0] || 'I'}
                </div>
              )}

              <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${message.isMine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    {message.senderName}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className={`p-3 md:p-4 rounded-2xl shadow-sm whitespace-pre-wrap text-sm ${message.isMine
                  ? 'bg-[#201a7c] dark:bg-[#3028a3] text-white rounded-tr-sm'
                  : 'bg-[var(--card-background)] border border-[var(--card-border)] text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                  {message.plainText}
                </div>
              </div>

              {message.isMine && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold shrink-0 text-xs">
                  You
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[var(--card-background)] rounded-b-xl border border-[var(--card-border)] p-4 shadow-sm shrink-0">
        <form onSubmit={handleReply} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              className="w-full border border-[var(--card-border)] rounded-xl p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#201a7c] focus:border-transparent min-h-[50px] max-h-[150px] resize-y bg-[var(--background)] text-gray-900 dark:text-gray-100"
              placeholder="Type your message..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!replyContent.trim() || isSubmitting}
            className="w-12 h-12 shrink-0 bg-[#201a7c] dark:bg-[#3028a3] text-white rounded-full hover:bg-[#1a1563] dark:hover:bg-[#3b32c4] transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            {isSubmitting ? (
              <i className="fa fa-spinner fa-spin"></i>
            ) : (
              <i className="fa fa-paper-plane relative -left-0.5"></i>
            )}
          </button>
        </form>
        <div className="text-[10px] text-gray-400 mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>

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
