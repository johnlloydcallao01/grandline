'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

/**
 * Authentication Test Page
 * 
 * Professional testing interface to verify authentication is working correctly.
 * Shows detailed authentication state and provides testing utilities.
 */
export default function AuthTestPage() {
  const { user, loading, isAuthenticated, error } = useAuth();
  const router = useRouter();
  const [cookieInfo, setCookieInfo] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Update cookie info
    setCookieInfo(document.cookie);
  }, []);

  const runAuthTest = () => {
    const results: string[] = [];
    
    results.push('🔍 AUTHENTICATION TEST RESULTS:');
    results.push('');
    results.push(`Loading: ${loading ? '⏳ Yes' : '✅ No'}`);
    results.push(`Authenticated: ${isAuthenticated ? '✅ Yes' : '❌ No'}`);
    results.push(`User exists: ${user ? '✅ Yes' : '❌ No'}`);
    results.push(`Error: ${error || '✅ None'}`);
    results.push('');
    
    if (user) {
      results.push('👤 USER DETAILS:');
      results.push(`Name: ${user.firstName} ${user.lastName}`);
      results.push(`Email: ${user.email}`);
      results.push(`Role: ${user.role}`);
      results.push(`Active: ${user.isActive ? '✅ Yes' : '❌ No'}`);
      results.push('');
    }
    
    results.push('🍪 COOKIE INFORMATION:');
    const cookies = document.cookie.split('; ');
    const payloadToken = cookies.find(c => c.startsWith('payload-token='));
    results.push(`Payload Token: ${payloadToken ? '✅ Present' : '❌ Missing'}`);
    results.push(`All Cookies: ${document.cookie || 'None'}`);
    
    setTestResults(results);
  };

  const clearCookies = () => {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    setTestResults(['✅ All cookies cleared. Refresh page to see effect.']);
    setCookieInfo('');
  };

  const logout = () => {
    clearCookies();
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Authentication Test</h1>
              <p className="text-gray-600 mt-1">Verify authentication system is working correctly</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Loading:</span>
                <span className={`font-medium ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {loading ? '⏳ Yes' : '✅ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Authenticated:</span>
                <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Loaded:</span>
                <span className={`font-medium ${user ? 'text-green-600' : 'text-red-600'}`}>
                  {user ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              {error && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Error:</span>
                  <span className="font-medium text-red-600">❌ {error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
            <div className="space-y-3">
              <button
                onClick={runAuthTest}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Run Authentication Test
              </button>
              <button
                onClick={() => setCookieInfo(document.cookie)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Refresh Cookie Info
              </button>
              <button
                onClick={clearCookies}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All Cookies
              </button>
            </div>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium">{user.role}</span>
              </div>
              <div>
                <span className="text-gray-600">Active:</span>
                <span className={`ml-2 font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {testResults.join('\n')}
              </pre>
            </div>
          </div>
        )}

        {/* Cookie Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cookie Information</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {cookieInfo || 'No cookies found'}
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Login Test:</strong> If you can see this page, authentication is working!</p>
            <p><strong>2. Cookie Test:</strong> Click &ldquo;Run Authentication Test&rdquo; to see detailed status</p>
            <p><strong>3. Persistence Test:</strong> Refresh the page - you should stay logged in</p>
            <p><strong>4. Logout Test:</strong> Click &ldquo;Logout&rdquo; to test the logout flow</p>
          </div>
        </div>
      </div>
    </div>
  );
}
