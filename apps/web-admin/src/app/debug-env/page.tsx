/**
 * Debug Environment Variables Page
 * Shows what environment variables are actually available
 */

'use client';

export default function DebugEnvPage() {
  // Get all NEXT_PUBLIC_ environment variables
  const publicEnvVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
    .sort(([a], [b]) => a.localeCompare(b));

  const firebaseVars = publicEnvVars.filter(([key]) => key.includes('FIREBASE'));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Environment Variables Debug</h1>
        
        {/* Firebase Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Firebase Environment Variables</h2>
          {firebaseVars.length > 0 ? (
            <div className="space-y-2">
              {firebaseVars.map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-mono text-sm text-blue-600 w-80">{key}:</span>
                  <span className="font-mono text-sm text-gray-800 break-all">
                    {value ? (key.includes('PRIVATE_KEY') ? '[REDACTED]' : value) : '❌ undefined'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">❌ No Firebase environment variables found!</p>
          )}
        </div>

        {/* All Public Variables */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All NEXT_PUBLIC_ Variables</h2>
          {publicEnvVars.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {publicEnvVars.map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-mono text-sm text-blue-600 w-80">{key}:</span>
                  <span className="font-mono text-sm text-gray-800 break-all">
                    {value ? (key.includes('PRIVATE_KEY') ? '[REDACTED]' : value) : '❌ undefined'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">❌ No NEXT_PUBLIC_ environment variables found!</p>
          )}
        </div>

        {/* Raw Process Env Check */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Direct Process.env Check</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-mono text-sm text-blue-600 w-80">NEXT_PUBLIC_FIREBASE_API_KEY:</span>
              <span className="font-mono text-sm text-gray-800">
                {typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY} - {process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '❌ undefined'}
              </span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm text-blue-600 w-80">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:</span>
              <span className="font-mono text-sm text-gray-800">
                {typeof process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN} - {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ undefined'}
              </span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm text-blue-600 w-80">NEXT_PUBLIC_FIREBASE_PROJECT_ID:</span>
              <span className="font-mono text-sm text-gray-800">
                {typeof process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID} - {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ undefined'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
