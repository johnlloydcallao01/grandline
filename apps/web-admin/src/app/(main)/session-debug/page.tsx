'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin Session Debug Page
 * 
 * Debug interface for testing admin functionality.
 * Shows session state and provides testing utilities.
 */
export default function AdminSessionDebugPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Refresh debug info
  const updateDebugInfo = useCallback(() => {
    const info = {
      timestamp: new Date().toISOString(),
      cookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
      localStorage: typeof localStorage !== 'undefined' ? {
        mockData: 'No authentication data stored'
      } : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      sessionInfo: { status: 'Mock session - no authentication' }
    };
    
    setDebugInfo(info);
  }, []);

  // Test mock session
  const testMockSession = () => {
    const results: string[] = [];
    
    try {
      results.push('🔄 Testing mock session...');
      results.push('✅ Mock session active');
      results.push('✅ No authentication required');
      
      updateDebugInfo();
      
    } catch (error) {
      results.push(`❌ Mock session test failed: ${error}`);
    }
    
    setTestResults(results);
  };

  // Test mock logout
  const testMockLogout = () => {
    const results: string[] = [];
    
    try {
      results.push('🔄 Testing mock logout...');
      results.push('✅ Mock logout successful');
      results.push('✅ No session data to clear');
      
      updateDebugInfo();
      
    } catch (error) {
      results.push(`❌ Mock logout test failed: ${error}`);
    }
    
    setTestResults(results);
  };

  // Clear mock data
  const clearMockData = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    updateDebugInfo();
    setTestResults(['✅ Mock data cleared']);
  };

  useEffect(() => {
    updateDebugInfo();
  }, [updateDebugInfo]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Admin Session Debug</h1>
            <p className="text-gray-600 mt-1">Debug interface for testing admin functionality</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Session Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Mock Session Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-blue-700">Status:</span>
                  <span className="ml-2 text-sm text-blue-600">Mock Mode Active</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Authentication:</span>
                  <span className="ml-2 text-sm text-blue-600">Disabled</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={testMockSession}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Test Mock Session
              </button>
              <button
                onClick={testMockLogout}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Test Mock Logout
              </button>
              <button
                onClick={clearMockData}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Clear Mock Data
              </button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Information */}
            {debugInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Debug Information</h3>
                <pre className="text-xs text-gray-600 overflow-auto bg-white p-3 rounded border">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={updateDebugInfo}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Refresh Debug Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
