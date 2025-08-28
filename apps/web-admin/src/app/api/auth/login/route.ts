import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Web-admin login proxy initiated...');
    console.log('📧 Email:', email);

    // Forward the request to PayloadCMS
    const cmsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📡 CMS response status:', cmsResponse.status);

    const result = await cmsResponse.json();

    if (!cmsResponse.ok) {
      return NextResponse.json(
        { error: result.message || 'Login failed' },
        { status: cmsResponse.status }
      );
    }

    // Create response with the same data
    const response = NextResponse.json(result);

    // Forward any cookies from PayloadCMS
    const setCookieHeader = cmsResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    console.log('✅ Login successful, forwarding response');
    return response;

  } catch (error) {
    console.error('❌ Login proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
