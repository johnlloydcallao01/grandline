'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from '@/components/ui/IconWrapper';

export default function HomePage() {
  const router = useRouter();

  // Redirect to admin posts page
  useEffect(() => {
    router.push('/posts');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Admin</h2>
        <p className="text-gray-600">Please wait while we redirect you to the admin panel...</p>
      </div>
    </div>
  );
}

