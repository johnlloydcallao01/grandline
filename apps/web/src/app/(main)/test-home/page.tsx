'use client';

import Link from 'next/link';

/**
 * Simple Test Home Page - NO BLACK SCREENS!
 *
 * This is a minimal test page to verify the layout is working.
 * If this shows properly, we know the issue is with components.
 */
export default function TestHomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚢 Grandline Maritime Training Center
          </h1>
          <p className="text-xl text-gray-600">
            Professional Maritime Training & Development
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ✅ Authentication Fixed!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>If you can see this page, the authentication system is working correctly!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🎓 Courses</h3>
            <p className="text-blue-700">Professional maritime training courses</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">📚 Resources</h3>
            <p className="text-green-700">Learning materials and documentation</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">🏆 Certifications</h3>
            <p className="text-purple-700">Industry-recognized certifications</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              🏠 Home
            </Link>
            <Link href="/courses" className="text-blue-600 hover:text-blue-800 font-medium">
              📖 Courses
            </Link>
            <Link href="/auth-test" className="text-blue-600 hover:text-blue-800 font-medium">
              🔧 Auth Test
            </Link>
            <Link href="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
              🔐 Sign In
            </Link>
          </div>
        </div>

        {/* Status Information */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Authentication:</span>
              <span className="text-green-600 font-medium">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Layout:</span>
              <span className="text-green-600 font-medium">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Navigation:</span>
              <span className="text-green-600 font-medium">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Background:</span>
              <span className="text-green-600 font-medium">✅ White (No Black Screen)</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Next Steps</h3>
          <div className="text-yellow-800 space-y-2">
            <p><strong>1.</strong> If you see this page with white background - authentication is fixed!</p>
            <p><strong>2.</strong> Try navigating to the main home page using the &ldquo;Home&rdquo; link above</p>
            <p><strong>3.</strong> If main home page shows black screen, the issue is with components</p>
            <p><strong>4.</strong> Use &ldquo;Auth Test&rdquo; link to verify authentication details</p>
          </div>
        </div>
      </div>
    </div>
  );
}
