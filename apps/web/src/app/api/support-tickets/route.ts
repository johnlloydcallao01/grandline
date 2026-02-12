import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

    // Auth strategy: Prefer user token (cookie), fallback to API Key
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('payload-token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (payloadToken) {
      headers['Authorization'] = `JWT ${payloadToken}`;
    } else if (process.env.PAYLOAD_API_KEY) {
      headers['Authorization'] = `users API-Key ${process.env.PAYLOAD_API_KEY}`;
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const params = new URLSearchParams();
    params.set('where[user][equals]', userId);
    if (status && status !== 'all') {
      params.set('where[status][equals]', status);
    }
    params.set('sort', '-lastMessageAt'); // Sort by most recent activity
    params.set('limit', limit);
    params.set('page', page);

    const res = await fetch(`${apiUrl}/support-tickets?${params.toString()}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, category, priority, message, userId } = body;

    if (!subject || !category || !userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

    // Auth strategy: Prefer user token (cookie), fallback to API Key
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('payload-token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (payloadToken) {
      headers['Authorization'] = `JWT ${payloadToken}`;
    } else if (process.env.PAYLOAD_API_KEY) {
      headers['Authorization'] = `users API-Key ${process.env.PAYLOAD_API_KEY}`;
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 1. Create the ticket
    console.log(`Creating ticket at ${apiUrl}/support-tickets`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const ticketRes = await fetch(`${apiUrl}/support-tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject,
        category,
        priority: priority || 'medium',
        status: 'open',
        user: userId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!ticketRes.ok) {
      const errorText = await ticketRes.text();
      console.error('Failed to create ticket:', ticketRes.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ error: 'Failed to create ticket', details: errorJson }, { status: ticketRes.status });
      } catch {
        return NextResponse.json({ error: 'Failed to create ticket', details: errorText }, { status: ticketRes.status });
      }
    }

    const ticket = await ticketRes.json();
    console.log('Ticket created:', ticket.doc.id);

    // 2. Create the initial message
    const lexicalMessage = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: message,
                type: "text",
                version: 1
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          }
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    };

    console.log('Creating initial message...');
    const messageController = new AbortController();
    const messageTimeoutId = setTimeout(() => messageController.abort(), 15000);

    const messageRes = await fetch(`${apiUrl}/support-ticket-messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ticket: ticket.doc.id,
        sender: userId,
        message: lexicalMessage,
        isInternal: false,
      }),
      signal: messageController.signal,
    });
    clearTimeout(messageTimeoutId);

    if (!messageRes.ok) {
      const errorText = await messageRes.text();
      console.error('Failed to create message:', messageRes.status, errorText);
      // Note: Ticket was created but message failed. We still return the ticket but with a warning?
      // Or we just fail. Ideally we should rollback (delete ticket), but for now let's just return error.
      return NextResponse.json({ error: 'Ticket created but failed to add message', ticket: ticket.doc, details: errorText }, { status: 201 });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
