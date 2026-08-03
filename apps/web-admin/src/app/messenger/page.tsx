'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth';
import { MessengerContent } from '@encreasl/ui/messenger';
import { MessengerProvider } from '@encreasl/ui/messenger-context';
import { useAuth } from '@/hooks/useAuth';

export default function MessengerPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const messengerApiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

  return (
    <ProtectedRoute redirectTo="/signin">
      <MessengerProvider token={token} userId={user?.id} apiBaseUrl={messengerApiBase}>
        <div className="h-dvh w-full">
          <MessengerContent variant="page" onClose={() => router.back()} />
        </div>
      </MessengerProvider>
    </ProtectedRoute>
  );
}
