import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing instructor ID' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
    const apiKey = process.env.PAYLOAD_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`
    };

    // Fetch the instructor with depth=2 to get the user and profile picture
    const instructorRes = await fetch(`${apiUrl}/instructors/${id}?depth=2`, {
      headers,
      cache: 'no-store'
    });

    if (!instructorRes.ok) {
      if (instructorRes.status === 404) {
        return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
      }
      throw new Error(`Failed to fetch instructor: ${instructorRes.status}`);
    }

    const instructor = await instructorRes.json();

    // Fetch courses taught by this instructor
    const coursesRes = await fetch(`${apiUrl}/courses?where[instructor][equals]=${id}&limit=10&depth=2`, {
      headers,
      cache: 'no-store'
    });

    let courses = [];
    if (coursesRes.ok) {
      const coursesData = await coursesRes.json();
      courses = coursesData.docs || [];
    }

    return NextResponse.json({ instructor, courses }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error('Error fetching instructor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
