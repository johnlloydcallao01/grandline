'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthCookies } from '@/utils/admin-auth-cookies';
import { useAdminSessionMonitor } from '@/hooks/useAdminSessionRecovery';

/**
 * Admin Session Debug Page
 * 
 * Professional debugging interface for testing persistent admin authentication.
 * Shows admin session state, cookie information, and provides testing utilities.
 */
export default function AdminSessionDebugPage() {
  const router = useRouter();
  const { sessionInfo, refreshAdminSessionInfo } = useAdminSessionMonitor();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Refresh admin debug info
  const updateAdminDebugInfo = useCallback(() => {
    const info = {
      timestamp: new Date().toISOString(),
      cookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
      localStorage: typeof localStorage !== 'undefined' ? {
        adminAuthBackup: localStorage.getItem('admin_auth_session_backup'),
        adminAuthConfig: localStorage.getItem('admin_auth_session_config')
      } : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      sessionInfo: AdminAuthCookies.getAdminSessionInfo()
    };
    
    setDebugInfo(info);
    refreshAdminSessionInfo();
  }, [refreshAdminSessionInfo]);

  // Test admin session recovery
  const testAdminSessionRecovery = () => {
    const results: string[] = [];
    
    try {
      results.push('🔄 Testing admin session recovery...');
      
      const recovered = AdminAuthCookies.recoverAdminSession();
      results.push(`Admin recovery result: ${recovered ? '✅ Success' : '❌ Failed'}`);
      
      const isAuth = AdminAuthCookies.isAdminAuthenticated();
      results.push(`Admin authentication status: ${isAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
      
      updateAdminDebugInfo();
      
    } catch (error) {
      results.push(`❌ Admin recovery test failed: ${error}`);
    }
    
    setTestResults(results);
  };

  // Test admin logout and recovery
  const testAdminLogoutRecovery = () => {
    const results: string[] = [];
    
    try {
      results.push('🔄 Testing admin logout and recovery cycle...');
      
      // Step 1: Check initial state
      const initialAuth = AdminAuthCookies.isAdminAuthenticated();
      results.push(`Initial admin auth: ${initialAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
      
      // Step 2: Admin logout
      AdminAuthCookies.adminLogout();
      const afterLogout = AdminAuthCookies.isAdminAuthenticated();
      results.push(`After admin logout: ${afterLogout ? '❌ Still authenticated' : '✅ Logged out'}`);
      
      // Step 3: Try recovery
      const recovered = AdminAuthCookies.recoverAdminSession();
      results.push(`Admin recovery attempt: ${recovered ? '❌ Unexpected recovery' : '✅ No recovery (correct)'}`);
      
      updateAdminDebugInfo();
      
    } catch (error) {
      results.push(`❌ Admin logout test failed: ${error}`);
    }
    
    setTestResults(results);
  };

  // Clear all admin session data
  const clearAllAdminData = () => {
    AdminAuthCookies.adminLogout();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('admin_auth_session_backup');
      localStorage.removeItem('admin_auth_session_config');
    }
    updateAdminDebugInfo();
    setTestResults(['✅ All admin session data cleared']);
  };

  useEffect(() => {
    updateAdminDebugInfo();
  }, [updateAdminDebugInfo]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Session Debug Console</h1>
              <p className="text-gray-600 mt-1">Professional admin authentication testing interface</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Admin Session Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Session Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Authenticated:</span>
                <span className={`font-medium ${sessionInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {sessionInfo.isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Admin Backup:</span>
                <span className={`font-medium ${sessionInfo.hasBackup ? 'text-green-600' : 'text-gray-600'}`}>
                  {sessionInfo.hasBackup ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Role:</span>
                <span className={`font-medium ${sessionInfo.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                  {sessionInfo.role || 'N/A'}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={updateAdminDebugInfo}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh Admin Debug Info
              </button>
              <button
                onClick={testAdminSessionRecovery}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Admin Session Recovery
              </button>
              <button
                onClick={testAdminLogoutRecovery}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Test Admin Logout &amp; Recovery
              </button>
              <button
                onClick={clearAllAdminData}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear All Admin Data
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Test Results</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Debug Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Admin Testing Instructions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Admin Testing Instructions</h3>
          <div className="text-red-800 space-y-2">
            <p><strong>1. Persistent Admin Login Test:</strong> Login as admin, close browser completely, reopen → should stay logged in</p>
            <p><strong>2. Admin Session Recovery Test:</strong> Click &quot;Test Admin Session Recovery&quot; to verify backup system</p>
            <p><strong>3. Admin Logout Test:</strong> Click &quot;Test Admin Logout &amp; Recovery&quot; to verify complete cleanup</p>
            <p><strong>4. Cross-Tab Admin Test:</strong> Open multiple admin tabs, logout in one → others should detect logout</p>
            <p><strong>5. Role Validation:</strong> Ensure only admin role can access and recover sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
