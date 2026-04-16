'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient, ChatChannelManager } from '@grandline/chat-engine';
import { getDiscussionTopics, getTopicMessages, replyToTopic } from '../actions';

export default function DiscussionThreadPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.id);

  const [activeTopic, setActiveTopic] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

  const channelManagerRef = useRef<ChatChannelManager | null>(null);
  const [mounted, setMounted] = useState(false);

  const [channelManagerReady, setChannelManagerReady] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations during Fast Refresh or strict mode
    if (channelManagerRef.current) {
      setChannelManagerReady(true);
      return;
    }

    setMounted(true);
    
    // Initialize ChatChannelManager when component mounts on client
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Supabase URL or Key is missing from environment variables');
      }
      
      console.log('[DiscussionBoard] Initializing Supabase client...', url);
      const supabaseClient = createSupabaseClient({
        supabaseUrl: url,
        supabaseKey: key
      });
      channelManagerRef.current = new ChatChannelManager(supabaseClient);
      setChannelManagerReady(true);
      console.log('[DiscussionBoard] ChatChannelManager initialized successfully');
    } catch (e) {
      console.error('Failed to initialize Supabase client for real-time chat', e);
    }
    
    // Cleanup on unmount to prevent memory leaks during hot reload
    return () => {
      // Note: we don't unsubscribe here because we want to keep the connection
      // alive between re-renders. The actual unsubscription happens in the 
      // activeTopic useEffect below when the component fully unmounts or topic changes.
    };
  }, []);

  const fetchTopicData = async () => {
    try {
      // First, get all topics to find the active one
      // In a real app, you'd have a specific endpoint `getDiscussionTopic(id)`
      const topics = await getDiscussionTopics();
      const topic = topics.find((t: any) => t.id === topicId);
      
      if (topic) {
        setActiveTopic(topic);
        await fetchTopicMessages(topicId);
      } else {
        router.push('/portal/discussion-board'); // Topic not found
      }
    } catch (error) {
      console.error('Error fetching topic data:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchTopicMessages = async (id: number) => {
    try {
      const data = await getTopicMessages(id);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchTopicData();
    }
  }, [topicId]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (activeTopic && channelManagerRef.current && channelManagerReady) {
      console.log(`[DiscussionBoard] Subscribing to chat ID: ${activeTopic.id}`);
      // Subscribe to real-time events for the active topic
      unsubscribe = channelManagerRef.current.subscribeToChat(activeTopic.id, (event) => {
        console.log(`[DiscussionBoard] Realtime Event Received:`, event.type);
        if (event.type === 'message_insert') {
          setMessages((prevMessages) => {
            // Check if we already have this message (e.g. from optimistic update)
            if (prevMessages.some((msg) => msg.id === (event.payload as any).id)) {
              console.log(`[DiscussionBoard] Message ${(event.payload as any).id} already exists, skipping`);
              return prevMessages;
            }
            
            console.log(`[DiscussionBoard] New message detected, refetching topic messages...`);
            // Refetch to get populated relationships (user details)
            setTimeout(() => {
              fetchTopicMessages(activeTopic.id);
            }, 100);
            
            return prevMessages;
          });
        } else if (event.type === 'message_delete') {
          setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== (event.payload as any).id));
        }
      });
    }

    return () => {
      if (unsubscribe) {
        console.log(`[DiscussionBoard] Unsubscribing from chat`);
        unsubscribe();
      }
    };
  }, [activeTopic]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent || !activeTopic) return;
    
    try {
      setIsSubmitting(true);
      const newMessage = await replyToTopic(activeTopic.id, replyContent);
      setReplyContent('');
      
      // Optimistically append our own message
      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.id === newMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
      
    } catch (error: any) {
      console.error('Error posting reply:', error);
      setFeedbackModal({ isOpen: true, type: 'error', title: 'Failed to Post Reply', message: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to extract text if Lexical JSON
  const extractText = (content: any) => {
    if (typeof content === 'string') return content;
    try {
      if (content?.root?.children) {
        return content.root.children.map((c: any) => c.children?.map((child: any) => child.text).join('')).join('\n');
      }
    } catch (_e) {
      return JSON.stringify(content);
    }
    return '';
  };

  if (loadingMessages) {
    return (
      <div className="w-full px-[10px] py-6 animate-pulse">
        <div className="w-32 h-6 bg-gray-200 rounded mb-4" />
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>

        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activeTopic) {
    return null;
  }

  return (
    <div className="w-full px-[10px] py-6">
      <Link 
        href="/portal/discussion-board"
        className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-gray-900"
      >
        <i className="fa fa-arrow-left"></i> Back to Discussions
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeTopic.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Posted by {activeTopic.createdBy?.firstName} {activeTopic.createdBy?.lastName}</span>
          <span>•</span>
          <span>{new Date(activeTopic.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
            No messages yet. Be the first to reply!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {msg.sender?.firstName} {msg.sender?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {extractText(msg.content)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Post a Reply</h3>
        <form onSubmit={handleReply}>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] mb-4"
            placeholder="Write your reply here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={!replyContent.trim() || isSubmitting}
              className="bg-[#201a7c] text-white px-6 py-2 rounded-lg hover:bg-[#1a1563] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  <span>Posting...</span>
                </>
              ) : (
                'Post Reply'
              )}
            </button>
          </div>
        </form>
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