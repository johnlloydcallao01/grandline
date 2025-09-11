import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';

    // Build query parameters
    const params = new URLSearchParams({
      status,
      limit,
      page,
    });

    // Use the CMS API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const fullUrl = `${apiUrl}/lms/courses?${params}`;

    // Build headers with API key authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': 'users API-Key ' + process.env.CMS_API_KEY,
    };

    // Fetch from CMS API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}