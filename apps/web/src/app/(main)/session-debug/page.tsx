'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCookies } from '@/utils/auth-cookies';
import { useSessionMonitor } from '@/hooks/useSessionRecovery';

/**
 * Session Debug Page
 * 
 * Professional debugging interface for testing persistent authentication.
 * Shows session state, cookie information, and provides testing utilities.
 */
export default function SessionDebugPage() {
  const router = useRouter();
  const { sessionInfo, refreshSessionInfo } = useSessionMonitor();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Refresh debug info
  const updateDebugInfo = useCallback(() => {
    const info = {
      timestamp: new Date().toISOString(),
      cookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
      localStorage: typeof localStorage !== 'undefined' ? {
        authBackup: localStorage.getItem('auth_session_backup'),
        authConfig: localStorage.getItem('auth_session_config')
      } : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      sessionInfo: AuthCookies.getSessionInfo()
    };

    setDebugInfo(info);
    refreshSessionInfo();
  }, [refreshSessionInfo]);

  // Test session recovery
  const testSessionRecovery = () => {
    const results: string[] = [];
    
    try {
      results.push('🔄 Testing session recovery...');
      
      const recovered = AuthCookies.recoverSession();
      results.push(`Recovery result: ${recovered ? '✅ Success' : '❌ Failed'}`);
      
      const isAuth = AuthCookies.isAuthenticated();
      results.push(`Authentication status: ${isAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
      
      updateDebugInfo();
      
    } catch (error) {
      results.push(`❌ Recovery test failed: ${error}`);
    }
    
    setTestResults(results);
  };

  // Test logout and recovery
  const testLogoutRecovery = () => {
    const results: string[] = [];
    
    try {
      results.push('🔄 Testing logout and recovery cycle...');
      
      // Step 1: Check initial state
      const initialAuth = AuthCookies.isAuthenticated();
      results.push(`Initial auth: ${initialAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
      
      // Step 2: Logout
      AuthCookies.logout();
      const afterLogout = AuthCookies.isAuthenticated();
      results.push(`After logout: ${afterLogout ? '❌ Still authenticated' : '✅ Logged out'}`);
      
      // Step 3: Try recovery
      const recovered = AuthCookies.recoverSession();
      results.push(`Recovery attempt: ${recovered ? '❌ Unexpected recovery' : '✅ No recovery (correct)'}`);
      
      updateDebugInfo();
      
    } catch (error) {
      results.push(`❌ Logout test failed: ${error}`);
    }
    
    setTestResults(results);
  };

  // Clear all session data
  const clearAllData = () => {
    AuthCookies.logout();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    updateDebugInfo();
    setTestResults(['✅ All session data cleared']);
  };

  useEffect(() => {
    updateDebugInfo();
  }, [updateDebugInfo]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Session Debug Console</h1>
              <p className="text-gray-600 mt-1">Professional authentication testing interface</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to App
            </button>
          </div>
        </div>

        {/* Session Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Authenticated:</span>
                <span className={`font-medium ${sessionInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {sessionInfo.isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Backup:</span>
                <span className={`font-medium ${sessionInfo.hasBackup ? 'text-green-600' : 'text-gray-600'}`}>
                  {sessionInfo.hasBackup ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backup Expiry:</span>
                <span className="font-medium text-gray-900">
                  {sessionInfo.backupExpiry ? new Date(sessionInfo.backupExpiry).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={updateDebugInfo}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Debug Info
              </button>
              <button
                onClick={testSessionRecovery}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Session Recovery
              </button>
              <button
                onClick={testLogoutRecovery}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Test Logout & Recovery
              </button>
              <button
                onClick={clearAllData}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

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

        {/* Debug Information */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Persistent Login Test:</strong> Login, close browser completely, reopen → should stay logged in</p>
            <p><strong>2. Session Recovery Test:</strong> Click &quot;Test Session Recovery&quot; to verify backup system</p>
            <p><strong>3. Logout Test:</strong> Click &quot;Test Logout &amp; Recovery&quot; to verify complete cleanup</p>
            <p><strong>4. Cross-Tab Test:</strong> Open multiple tabs, logout in one → others should detect logout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
