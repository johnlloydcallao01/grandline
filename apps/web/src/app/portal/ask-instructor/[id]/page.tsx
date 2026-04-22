'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient, ChatChannelManager } from '@grandline/chat-engine';
import { getQuestionMessages, replyToQuestion } from '../actions';

export default function AskInstructorThreadPage() {
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (channelManagerRef.current) {
            setChannelManagerReady(true);
            return;
        }

        setMounted(true);

        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!url || !key) {
                throw new Error('Supabase URL or Key is missing from environment variables');
            }

            console.log('[AskInstructor] Initializing Supabase client...', url);
            const supabaseClient = createSupabaseClient({
                supabaseUrl: url,
                supabaseKey: key
            });
            channelManagerRef.current = new ChatChannelManager(supabaseClient);
            setChannelManagerReady(true);
            console.log('[AskInstructor] ChatChannelManager initialized successfully');
        } catch (e) {
            console.error('Failed to initialize Supabase client for real-time chat', e);
        }
    }, []);

    const fetchTopicData = async () => {
        try {
            let userToken: string | null = null;
            let userIdParam: string | null = null;
            if (typeof window !== 'undefined') {
                userToken = localStorage.getItem('grandline_auth_token_trainee');
                const raw = localStorage.getItem('grandline_auth_user_trainee');
                if (raw) {
                    const parsed = JSON.parse(raw) as { id?: string | number } | null;
                    if (parsed && parsed.id) userIdParam = String(parsed.id);
                }
            }

            if (!userToken || !userIdParam) {
                router.push('/portal/ask-instructor');
                return;
            }

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
            const CMS_URL = API_BASE_URL.replace('/api', '');
            // Use the custom /api/chat endpoint which returns { data: [...], meta: {...} }
            const qRes = await fetch(`${CMS_URL}/api/chat?type=instructor_trainee&limit=50&_t=${Date.now()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${userToken}`
                },
                cache: 'no-store'
            });

            if (!qRes.ok) throw new Error('Failed to fetch topics');
            
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
                    status: chat.metadata?.status || 'pending',
                    date: new Date(chat.lastMessageAt || chat.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    answerPreview: null
                };
            });

            const topic = mapped.find((t: any) => t.id === topicId);

            if (topic) {
                setActiveTopic(topic);
                await fetchTopicMessages(topicId);
            } else {
                router.push('/portal/ask-instructor'); // Topic not found
            }
        } catch (error) {
            console.error('Error fetching topic data:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const fetchTopicMessages = async (id: number) => {
        try {
            const data = await getQuestionMessages(id);
            setMessages(data || []);
            scrollToBottom();
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
            console.log(`[AskInstructor] Subscribing to chat ID: ${activeTopic.id}`);
            unsubscribe = channelManagerRef.current.subscribeToChat(activeTopic.id, (event) => {
                console.log(`[AskInstructor] Realtime Event Received:`, event.type);
                if (event.type === 'message_insert') {
                    setMessages((prevMessages) => {
                        if (prevMessages.some((msg) => msg.id === (event.payload as any).id)) {
                            return prevMessages;
                        }

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
                console.log(`[AskInstructor] Unsubscribing from chat`);
                unsubscribe();
            }
        };
    }, [activeTopic, channelManagerReady]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !activeTopic) return;

        try {
            setIsSubmitting(true);
            const newMessage = await replyToQuestion(activeTopic.id, replyContent);
            setReplyContent('');

            setMessages((prevMessages) => {
                if (prevMessages.some((msg) => msg.id === newMessage.id)) {
                    return prevMessages;
                }
                return [...prevMessages, newMessage];
            });

            scrollToBottom();
        } catch (error: any) {
            console.error('Error posting reply:', error);
            setFeedbackModal({ isOpen: true, type: 'error', title: 'Failed to Post Reply', message: error.message || 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
            <div className="w-full px-[10px] py-6 h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto animate-pulse">
                {/* Back Link Skeleton */}
                <div className="w-32 h-5 bg-gray-200 rounded mb-4 shrink-0" />

                {/* Header Skeleton */}
                <div className="bg-white rounded-t-xl border-t border-x border-gray-200 p-4 shadow-sm shrink-0 flex items-center justify-between">
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                </div>

                {/* Messages Area Skeleton */}
                <div className="flex-1 bg-gray-50 border-x border-gray-200 overflow-y-auto p-4 md:p-6 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            {i % 2 !== 0 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                            )}
                            <div className={`max-w-[70%] flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                                <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                                <div className={`p-4 rounded-2xl w-48 md:w-64 h-16 ${
                                    i % 2 !== 0 
                                    ? 'bg-gray-200 rounded-tl-sm' 
                                    : 'bg-blue-200 rounded-tr-sm'
                                }`} />
                            </div>
                            {i % 2 === 0 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area Skeleton */}
                <div className="bg-white rounded-b-xl border border-gray-200 p-4 shadow-sm shrink-0">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 bg-gray-100 rounded-xl h-[50px]" />
                        <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                    </div>
                </div>
            </div>
        );
    }

    if (!activeTopic) {
        return null;
    }

    return (
        <div className="w-full px-[10px] py-6 h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto">
            <Link
                href="/portal/ask-instructor"
                className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 shrink-0 font-medium"
            >
                <i className="fa fa-arrow-left"></i> Back to Questions
            </Link>

            <div className="bg-white rounded-t-xl border-t border-x border-gray-200 p-4 shadow-sm shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{activeTopic.subject}</h1>
                    <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-gray-500">With: <span className="font-medium text-gray-900">{activeTopic.instructor}</span></span>
                        <span className="text-gray-300">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${activeTopic.status === 'answered' ? 'bg-green-100 text-green-700' :
                            activeTopic.status === 'archived' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {activeTopic.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-gray-50 border-x border-gray-200 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                        Start the conversation. Send your first message below.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isInstructor = `${msg.sender?.firstName || ''} ${msg.sender?.lastName || ''}`.trim() === activeTopic.instructor;

                        return (
                            <div key={msg.id} className={`flex gap-3 ${isInstructor ? 'justify-start' : 'justify-end'}`}>
                                {isInstructor && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 text-xs">
                                        {msg.sender?.firstName?.[0] || 'I'}
                                    </div>
                                )}

                                <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isInstructor ? 'items-start' : 'items-end'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[11px] text-gray-500 font-medium">
                                            {isInstructor ? activeTopic.instructor : 'You'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className={`p-3 md:p-4 rounded-2xl shadow-sm whitespace-pre-wrap text-sm ${isInstructor
                                        ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                        : 'bg-blue-600 text-white rounded-tr-sm'
                                        }`}>
                                        {extractText(msg.content)}
                                    </div>
                                </div>

                                {!isInstructor && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-xs">
                                        You
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-b-xl border border-gray-200 p-4 shadow-sm shrink-0">
                <form onSubmit={handleReply} className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            className="w-full border border-gray-300 rounded-xl p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] max-h-[150px] resize-y bg-gray-50"
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
                        className="w-12 h-12 shrink-0 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
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