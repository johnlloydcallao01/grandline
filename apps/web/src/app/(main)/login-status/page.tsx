'use client';

import React from 'react';
import { useAuth, getFullName, getUserInitials } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

/**
 * Login Status Page
 * Shows authentication status and user information
 */
export default function LoginStatusPage() {
  const router = useRouter();
  const { user, loading, error, isAuthenticated, securityAlert } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your login status...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Authentication Error</h2>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => router.push('/signin')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <h2 className="text-yellow-800 font-semibold mb-2">Access Required</h2>
            <p className="text-yellow-600 text-sm">Please sign in to view your login status.</p>
            <button
              onClick={() => router.push('/signin')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      // Clear payload-token cookie and redirect
      document.cookie = 'payload-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Alert Modal */}
      {securityAlert?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4 bg-red-50 border-red-200 border rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mr-3">
                    <i className="fa fa-shield-alt w-6 h-6 text-red-600"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">
                    {securityAlert.type === 'role-changed' ? 'Access Revoked - Role Changed' : 'Account Deactivated'}
                  </h3>
                </div>
              </div>
              <div className="text-red-700 mb-4">
                <p className="text-sm leading-relaxed">{securityAlert.message}</p>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => window.location.href = '/signin'}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-red-600 hover:bg-red-700"
                >
                  Go to Login Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="px-4 pt-8 pb-6 bg-white border-b border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Status</h1>
          <p className="text-gray-600 text-sm">View your authentication status and account information</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || 'Trainee'}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s your learning dashboard with real-time authentication protection.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {getFullName(user)}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Role:</span> <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{user.role}</span></p>
              <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></p>
            </div>
          </div>

          {/* Security Features Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Real-time role validation</p>
              <p>✅ Automatic logout on role change</p>
              <p>✅ Account status monitoring</p>
              <p>✅ Periodic security checks</p>
              <p>✅ Session management</p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                View Courses
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                Check Assignments
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm">
                View Grades
              </button>
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Authentication Test Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🔐 Authentication Test</h3>
          <p className="text-blue-800 text-sm mb-4">
            This page is protected by real-time authentication. Try changing your role in PayloadCMS to see the security system in action!
          </p>
          <div className="text-xs text-blue-600 space-y-1">
            <p>• If your role changes from &apos;trainee&apos; to another role, you&apos;ll be automatically logged out</p>
            <p>• If your account is deactivated, you&apos;ll receive a security alert</p>
            <p>• Security checks run every 60 seconds in the background</p>
          </div>
        </div>
      </main>

      {/* Bottom spacing for mobile footer */}
      <div className="pb-20"></div>
    </div>
  );
}
