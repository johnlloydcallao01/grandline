'use client';

import React, { useState } from 'react';
import { useAdminAuth, authDebugger, getAuthReport, downloadAuthReport } from '@encreasl/auth';

/**
 * Development-only authentication debug panel
 * Provides real-time auth state inspection and debugging tools
 */
export function AuthDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const auth = useAdminAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearLogs = () => {
    authDebugger.clearLogs();
    alert('Debug logs cleared');
  };

  const handleDownloadReport = () => {
    downloadAuthReport();
  };

  const handleShowReport = () => {
    setShowReport(!showReport);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        🔍 Auth Debug {isExpanded ? '▼' : '▲'}
      </button>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-gray-900 mb-3">Authentication Debug Panel</h3>
          
          {/* Current State */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Current State</h4>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-medium">Authenticated:</span>{' '}
                <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {auth.isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Loading:</span>{' '}
                <span className={auth.isLoading ? 'text-yellow-600' : 'text-gray-600'}>
                  {auth.isLoading ? '⏳ Yes' : '✅ No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Checking Session:</span>{' '}
                <span className={auth.isCheckingSession ? 'text-yellow-600' : 'text-gray-600'}>
                  {auth.isCheckingSession ? '⏳ Yes' : '✅ No'}
                </span>
              </div>
              {auth.user && (
                <>
                  <div>
                    <span className="font-medium">User ID:</span> {auth.user.id}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {auth.user.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {auth.user.role}
                  </div>
                </>
              )}
              {auth.error && (
                <div>
                  <span className="font-medium text-red-600">Error:</span>{' '}
                  <span className="text-red-600">{auth.error.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleClearLogs}
              className="w-full bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              Clear Debug Logs
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
            >
              Download Debug Report
            </button>
            
            <button
              onClick={handleShowReport}
              className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              {showReport ? 'Hide' : 'Show'} Debug Report
            </button>

            {auth.error && (
              <button
                onClick={() => auth.clearError?.()}
                className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Clear Error
              </button>
            )}
          </div>

          {/* Debug Report */}
          {showReport && (
            <div className="mt-4 p-3 bg-gray-900 text-green-400 rounded text-xs font-mono max-h-48 overflow-y-auto">
              <pre>{getAuthReport()}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to add auth debug panel to any component
 */
export function useAuthDebugPanel() {
  return {
    AuthDebugPanel,
    isDebugMode: process.env.NODE_ENV === 'development',
  };
}
