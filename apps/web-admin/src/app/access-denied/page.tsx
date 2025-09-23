'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';

/**
 * Access Denied page for non-admin users
 * Displayed when authenticated users without admin role try to access admin areas
 */
export default function AccessDeniedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleSignOut = () => {
    // Clear any existing session and redirect to login
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Access Denied
        </h1>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          You don&apos;t have permission to access this area
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Admin Access Required
            </h2>
            
            <p className="text-gray-600 mb-6">
              This application is restricted to administrators only. 
              If you believe you should have access, please contact your system administrator.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Homepage
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}