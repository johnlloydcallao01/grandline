'use server';

import { revalidatePath } from 'next/cache';
import { getServerToken, getServerUser } from '@/app/actions/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SupportTicketSummary {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
}

export interface SupportTicketMessageView {
  id: string;
  plainText: string;
  senderName: string;
  senderRole?: string;
  senderId?: string;
  isMine: boolean;
  createdAt: string;
}

export interface SupportThreadData {
  ticket: SupportTicketSummary;
  messages: SupportTicketMessageView[];
}

interface CreateSupportTicketInput {
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  message: string;
}

async function getSupportAuthHeaders() {
  const token = await getServerToken();

  if (!token) {
    throw new Error('Unauthorized');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  };
}

function normalizeTicket(ticket: any): SupportTicketSummary {
  return {
    id: String(ticket.id),
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastMessageAt: ticket.lastMessageAt ?? null,
  };
}

export async function fetchSupportTickets(): Promise<SupportTicketSummary[]> {
  const user = await getServerUser();

  if (!user) {
    return [];
  }

  const headers = await getSupportAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/lms/support-tickets?limit=50`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch support tickets: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return Array.isArray(data.docs) ? data.docs.map(normalizeTicket) : [];
}

export async function createSupportTicket(input: CreateSupportTicketInput): Promise<SupportTicketSummary> {
  const headers = await getSupportAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/lms/support-tickets`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create support ticket: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const createdTicket = data.doc ?? data;

  revalidatePath('/support');

  return normalizeTicket(createdTicket);
}

export async function fetchSupportThread(ticketId: string): Promise<SupportThreadData | null> {
  const user = await getServerUser();

  if (!user) {
    return null;
  }

  const headers = await getSupportAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/lms/support-tickets/${ticketId}/thread`, {
    headers,
    cache: 'no-store',
  });

  if (res.status === 404 || res.status === 403) {
    return null;
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch support thread: ${res.status} ${errorText}`);
  }

  const data = await res.json();

  return {
    ticket: normalizeTicket(data.ticket),
    messages: Array.isArray(data.messages) ? data.messages : [],
  };
}

export async function replyToSupportTicket(ticketId: string, message: string): Promise<SupportTicketMessageView> {
  const headers = await getSupportAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/lms/support-tickets/${ticketId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Failed to send support reply: ${res.status} ${errorText}`);
  }

  revalidatePath('/support');
  revalidatePath(`/support/${ticketId}`);

  return {
    id: '',
    plainText: message,
    senderName: 'You',
    senderRole: 'trainee',
    senderId: undefined,
    isMine: true,
    createdAt: new Date().toISOString(),
  };
}
