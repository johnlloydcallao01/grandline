// Test API endpoint to verify PayloadCMS API key authentication
// Based on payload-cms-api.md documentation

import { getCourses, checkApiHealth } from '../../../lib/payload-api.js';

export async function GET() {
  try {
    console.log('Testing PayloadCMS API key authentication...');
    
    // First, check API health
    const healthCheck = await checkApiHealth();
    console.log('Health check result:', healthCheck);
    
    if (healthCheck.status === 'error') {
      return Response.json({ 
        success: false, 
        error: 'API key authentication failed',
        details: healthCheck.message 
      }, { status: 401 });
    }
    
    // Try to fetch courses to verify permissions
    const courses = await getCourses({ limit: 5 });
    console.log('Successfully fetched courses:', courses.docs?.length || 0, 'courses');
    
    return Response.json({ 
      success: true, 
      message: 'PayloadCMS API key authentication successful',
      data: {
        totalCourses: courses.totalDocs,
        coursesReturned: courses.docs?.length || 0,
        sampleCourse: courses.docs?.[0] ? {
          id: courses.docs[0].id,
          title: courses.docs[0].title,
          status: courses.docs[0].status
        } : null
      },
      apiKeyStatus: 'authenticated'
    });
    
  } catch (error) {
    console.error('PayloadCMS API test failed:', error.message);
    
    return Response.json({ 
      success: false, 
      error: 'PayloadCMS API request failed',
      details: error.message,
      apiKeyStatus: 'failed'
    }, { status: 500 });
  }
}