'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';

// --- Types ---

interface Ticket {
    id: string;
    subject: string;
    status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string;
}

interface Message {
    id: string;
    message: any; // Lexical JSON
    sender: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
    } | string;
    createdAt: string;
    isInternal?: boolean;
}

// --- Helpers ---

function extractTextFromLexical(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;

    let text = '';

    if (node.root) {
        return extractTextFromLexical(node.root);
    }

    if (node.text) {
        text += node.text;
    }

    if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
            text += extractTextFromLexical(child);
            if (child.type === 'paragraph' || child.type === 'heading' || child.type === 'list-item') {
                text += '\n';
            }
        });
    }

    return text.trim();
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusColor(status: string) {
    switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'waiting_for_user': return 'bg-purple-100 text-purple-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'critical': return 'text-red-600 font-bold';
        case 'high': return 'text-orange-600 font-medium';
        case 'medium': return 'text-blue-600';
        case 'low': return 'text-gray-500';
        default: return 'text-gray-500';
    }
}

// --- Component ---

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useUser();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');

    const fetchTicketDetails = useCallback(async () => {
        if (!user) return;
        try {
            const [ticketRes, messagesRes] = await Promise.all([
                fetch(`/api/support-tickets/${id}`),
                fetch(`/api/support-tickets/${id}/messages`)
            ]);

            if (ticketRes.ok) {
                const ticketData = await ticketRes.json();
                setTicket(ticketData);
            } else {
                console.error('Failed to fetch ticket');
            }

            if (messagesRes.ok) {
                const messagesData = await messagesRes.json();
                setMessages(messagesData.docs || []);
            } else {
                console.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchTicketDetails();
        } else if (!authLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [isAuthenticated, user, authLoading, fetchTicketDetails, router]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !ticket || !replyMessage.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/support-tickets/${ticket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: replyMessage,
                    userId: user.id,
                }),
            });

            if (res.ok) {
                setReplyMessage('');
                await fetchTicketDetails();
            } else {
                alert('Failed to send message.');
            }
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setIsSending(false);
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h2>
                    <Link href="/support" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Back to Support
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="w-full px-[10px]">
                    <div className="py-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage your support tickets and inquiries
                            </p>
                        </div>
                        <Link
                            href="/support"
                            className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Back to Tickets
                        </Link>
                    </div>
                </div>
            </div>

            <div className="w-full px-[10px] py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Message Thread */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                    {ticket.status.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500">No messages yet.</div>
                                ) : messages.map((msg) => {
                                    const isMe = typeof msg.sender === 'object' ? String(msg.sender.id) === String(user?.id) : String(msg.sender) === String(user?.id);
                                    const senderName = typeof msg.sender === 'object'
                                        ? (msg.sender.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Support Agent')
                                        : 'Unknown';

                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-center space-x-2 mb-1 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                <span className="text-sm font-medium text-gray-900">{isMe ? 'You' : senderName}</span>
                                                <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                                            </div>
                                            <div className={`rounded-lg p-4 max-w-[85%] ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                                }`}>
                                                <div className="whitespace-pre-wrap text-sm">
                                                    {extractTextFromLexical(msg.message)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply Box */}
                            {ticket.status !== 'closed' && (
                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                    <form onSubmit={handleSendReply}>
                                        <div className="flex gap-4">
                                            <textarea
                                                required
                                                rows={2}
                                                className="flex-1 rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                placeholder="Type your reply here..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSending || !replyMessage.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 self-end h-full"
                                            >
                                                {isSending ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {ticket.status === 'closed' && (
                                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-500">
                                    This ticket is closed. Please create a new ticket if you need further assistance.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Ticket Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{ticket.subject}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Ticket ID</label>
                                    <p className="text-sm font-mono text-gray-600 mt-1">#{String(ticket.id).slice(0, 8)}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                                    <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.category.replace(/_/g, ' ')}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                                    <p className={`text-sm font-medium mt-1 ${getPriorityColor(ticket.priority)} capitalize`}>
                                        {ticket.priority}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                                    <p className="text-sm text-gray-900 mt-1">{formatDate(ticket.createdAt)}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Last Activity</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {ticket.lastMessageAt ? formatDate(ticket.lastMessageAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
