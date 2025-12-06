import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side API route for fetching courses
 * This route handles authentication with PayloadCMS API key server-side
 * to avoid exposing the API key to client-side code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = searchParams.get('limit') || '8';
    const page = searchParams.get('page') || '1';
    const categoryId = searchParams.get('categoryId') || '';

    // Build query parameters for PayloadCMS API
    const params = new URLSearchParams({
      status,
      limit,
      page,
    });
    if (categoryId) {
      params.set('where[category][contains]', categoryId);
    }

    // Build headers with API key authentication (server-side only)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) {
      console.error('PAYLOAD_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    headers['Authorization'] = `users API-Key ${apiKey}`;

    // Fetch from PayloadCMS API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const response = await fetch(`${apiUrl}/courses?${params}`, {
      headers,
      // Add cache control for better performance
      next: { revalidate: 300 }, // 5 minutes cache
    });

    if (!response.ok) {
      console.error(`PayloadCMS API error: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data with proper CORS headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in courses API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
