import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper to extract params from context
type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: ticketId } = await context.params;
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
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

    const queryParams = new URLSearchParams();
    queryParams.set('where[ticket][equals]', ticketId);
    queryParams.set('sort', 'createdAt'); // Oldest first for chat-like view
    queryParams.set('limit', '100'); // Fetch reasonable amount
    queryParams.set('depth', '1'); // Expand sender to get name/avatar

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${apiUrl}/support-ticket-messages?${queryParams.toString()}`, {
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch messages: ${res.status} ${errorText}`);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: ticketId } = await context.params;
    const body = await request.json();
    const { message, userId } = body;

    if (!ticketId || !message || !userId) {
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

    // Convert plain text to Lexical JSON structure
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

    console.log(`Sending message to ticket ${ticketId}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${apiUrl}/support-ticket-messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ticket: ticketId,
        sender: userId,
        message: lexicalMessage,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to send message:', res.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ error: 'Failed to send message', details: errorJson }, { status: res.status });
      } catch {
        return NextResponse.json({ error: 'Failed to send message', details: errorText }, { status: res.status });
      }
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
