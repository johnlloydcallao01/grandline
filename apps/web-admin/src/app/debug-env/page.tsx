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



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Environment Variables Debug</h1>
        


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



        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/signin" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
