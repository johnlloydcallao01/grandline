'use client';

import React, { useState } from 'react';

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
  cookies?: string;
  headers?: Record<string, string>;
  status?: number;
  endpoint?: string;
  ok?: boolean;
  data?: unknown;
}

export default function DebugAuthPage() {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testDirectLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🔍 Testing direct PayloadCMS login...');
      
      const response = await fetch('https://grandline-cms.vercel.app/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: 'admin@example.com', // Replace with actual admin email
          password: 'password123'     // Replace with actual admin password
        }),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`   ${key}: ${value}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);

      setResult({
        success: response.ok,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
        cookies: document.cookie,
      });

    } catch (error) {
      console.error('❌ Test failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cookies: document.cookie,
      });
    } finally {
      setLoading(false);
    }
  };

  const testMeEndpoint = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Testing /users/me endpoint...');
      
      const response = await fetch('https://grandline-cms.vercel.app/api/users/me', {
        credentials: 'include',
      });

      console.log('📊 Me Response status:', response.status);
      const data = await response.json();
      console.log('📊 Me Response data:', data);

      setResult({
        success: response.ok,
        endpoint: '/users/me',
        status: response.status,
        ok: response.ok,
        data: data,
        cookies: document.cookie,
      });

    } catch (error) {
      console.error('❌ Me test failed:', error);
      setResult({
        success: false,
        endpoint: '/users/me',
        error: error instanceof Error ? error.message : 'Unknown error',
        cookies: document.cookie,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PayloadCMS Auth Debug</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testDirectLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Direct Login'}
          </button>
          
          <button
            onClick={testMeEndpoint}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test /users/me'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Cookies:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {document.cookie || 'No cookies found'}
          </pre>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Test Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
