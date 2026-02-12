'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  
  // Handle root/children traversal
  if (node.root) {
    return extractTextFromLexical(node.root);
  }
  
  if (node.text) {
    text += node.text;
  }
  
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => {
      text += extractTextFromLexical(child);
      // Add newline for block elements
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

// --- Components ---

export default function SupportPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create Ticket Form State
  const [createForm, setCreateForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
  });

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState('');

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/support-tickets?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.docs || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch Messages for a Ticket
  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/support-tickets/${ticketId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.docs || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTickets();
    }
  }, [isAuthenticated, user, fetchTickets]);

  // Handle Ticket Selection
  const handleTicketClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView('detail');
    await fetchMessages(ticket.id);
  };

  // Handle Create Ticket
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          userId: user.id,
        }),
      });

      if (res.ok) {
        await fetchTickets();
        setView('list');
        setCreateForm({ subject: '', category: 'general', priority: 'medium', message: '' });
      } else {
        alert('Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket', error);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !replyMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/support-tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage,
          userId: user.id,
        }),
      });

      if (res.ok) {
        setReplyMessage('');
        await fetchMessages(selectedTicket.id);
        // Refresh ticket list to update lastMessageAt
        fetchTickets(); 
      } else {
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error('Error sending message', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Views ---

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access the support center.</p>
          <Link href="/signin" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your support tickets and inquiries
              </p>
            </div>
            {view === 'list' && (
              <button
                onClick={() => setView('create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
              </button>
            )}
            {view !== 'list' && (
              <button
                onClick={() => setView('list')}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back to Tickets
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: Ticket List */}
        {view === 'list' && (
          <div className="space-y-6">
            {/* Quick Stats / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Tickets</h3>
                <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
                <p className="text-sm text-gray-500 mt-1">Total tickets submitted</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Open Issues</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Tickets currently active</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Need immediate help?</h3>
                 <p className="text-sm text-gray-500 mb-4">Check our Knowledge Base for quick answers.</p>
                 <Link href="/knowledge-base" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                   Visit Knowledge Base &rarr;
                 </Link>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
              </div>
              
              {loading && tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
                  <p className="mt-2 text-gray-500 mb-6">You haven't submitted any support tickets yet.</p>
                  <button
                    onClick={() => setView('create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create your first ticket
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                            <div className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.category.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.lastMessageAt ? formatDate(ticket.lastMessageAt) : formatDate(ticket.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleTicketClick(ticket)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: Create Ticket */}
        {view === 'create' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Create New Ticket</h2>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Briefly describe your issue"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({...createForm, subject: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      required
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={createForm.category}
                      onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="course_content">Course Content</option>
                      <option value="account">Account Management</option>
                      <option value="enrollment">Enrollment</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="priority"
                      required
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={createForm.priority}
                      onChange={(e) => setCreateForm({...createForm, priority: e.target.value})}
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Standard issue</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="critical">Critical - System down / Blocking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide detailed information about your issue..."
                    value={createForm.message}
                    onChange={(e) => setCreateForm({...createForm, message: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: Ticket Detail */}
        {view === 'detail' && selectedTicket && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Message Thread */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-500">Loading conversation...</div>
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
                        <div className={`rounded-lg p-4 max-w-[85%] ${
                          isMe 
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
                {selectedTicket.status !== 'closed' && (
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
                          disabled={loading || !replyMessage.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 self-end h-full"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {selectedTicket.status === 'closed' && (
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
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.subject}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Ticket ID</label>
                    <p className="text-sm font-mono text-gray-600 mt-1">#{String(selectedTicket.id).slice(0, 8)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{selectedTicket.category.replace(/_/g, ' ')}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                    <p className={`text-sm font-medium mt-1 ${getPriorityColor(selectedTicket.priority)} capitalize`}>
                      {selectedTicket.priority}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedTicket.createdAt)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Last Activity</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedTicket.lastMessageAt ? formatDate(selectedTicket.lastMessageAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
