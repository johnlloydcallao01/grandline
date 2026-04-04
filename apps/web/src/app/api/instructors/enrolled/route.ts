import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
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

    // 1. Get the trainee record for this user
    const traineeRes = await fetch(`${apiUrl}/trainees?where[user][equals]=${userId}&limit=1`, { 
      headers, 
      cache: 'no-store' 
    });
    
    if (!traineeRes.ok) {
      throw new Error(`Failed to fetch trainee: ${traineeRes.status}`);
    }
    
    const traineeData = await traineeRes.json();
    const trainee = traineeData.docs?.[0];

    if (!trainee) {
      return NextResponse.json({ instructors: [] });
    }

    // 2. Get course enrollments for this trainee (depth=4 to get course -> instructor -> user -> profilePicture)
    const enrollmentsRes = await fetch(`${apiUrl}/course-enrollments?where[student][equals]=${trainee.id}&limit=100&depth=4`, { 
      headers, 
      cache: 'no-store' 
    });

    if (!enrollmentsRes.ok) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentsRes.status}`);
    }

    const enrollmentsData = await enrollmentsRes.json();
    
    // 3. Extract unique instructors
    const instructorsMap = new Map();
    
    for (const enrollment of enrollmentsData.docs || []) {
      const course = enrollment.course;
      if (!course) continue;

      if (course.instructor && typeof course.instructor === 'object') {
        const instructor = course.instructor;
        if (!instructorsMap.has(instructor.id)) {
          instructorsMap.set(instructor.id, instructor);
        }
      }

      if (course.coInstructors && Array.isArray(course.coInstructors)) {
        for (const coInstructor of course.coInstructors) {
          if (coInstructor && typeof coInstructor === 'object') {
            if (!instructorsMap.has(coInstructor.id)) {
              instructorsMap.set(coInstructor.id, coInstructor);
            }
          }
        }
      }
    }

    const instructors = Array.from(instructorsMap.values());

    return NextResponse.json({ instructors }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error('Error fetching enrolled instructors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
