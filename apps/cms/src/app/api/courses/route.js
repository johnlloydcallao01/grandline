// Example API endpoint using PayloadCMS API key authentication
// This demonstrates how to use the payload-api service in your application

import { getCourses, getCourse } from '../../../lib/payload-api.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('id');
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';
    const status = searchParams.get('status') || 'published';
    
    if (courseId) {
      // Fetch single course
      const course = await getCourse(courseId);
      return Response.json({ 
        success: true, 
        data: course,
        message: 'Course fetched successfully'
      });
    } else {
      // Fetch multiple courses with filters
      const courses = await getCourses({
        limit: parseInt(limit),
        page: parseInt(page),
        where: {
          status: {
            equals: status
          }
        }
      });
      
      return Response.json({ 
        success: true, 
        data: courses.docs,
        pagination: {
          totalDocs: courses.totalDocs,
          limit: courses.limit,
          page: courses.page,
          totalPages: courses.totalPages,
          hasNextPage: courses.hasNextPage,
          hasPrevPage: courses.hasPrevPage
        },
        message: `Fetched ${courses.docs.length} courses successfully`
      });
    }
    
  } catch (error) {
    console.error('Courses API error:', error.message);
    
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch courses',
      details: error.message
    }, { status: 500 });
  }
}

// Example POST endpoint for creating courses (if API key has create permissions)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return Response.json({ 
        success: false, 
        error: 'Title is required' 
      }, { status: 400 });
    }
    
    const { createCourse } = await import('../../../lib/payload-api.js');
    const newCourse = await createCourse(body);
    
    return Response.json({ 
      success: true, 
      data: newCourse,
      message: 'Course created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create course error:', error.message);
    
    // Handle specific PayloadCMS errors
    if (error.message.includes('401')) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - API key may not have create permissions'
      }, { status: 401 });
    }
    
    return Response.json({ 
      success: false, 
      error: 'Failed to create course',
      details: error.message
    }, { status: 500 });
  }
}