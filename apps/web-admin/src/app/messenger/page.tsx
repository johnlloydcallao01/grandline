'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth';
import { MessengerContent } from '@encreasl/ui/messenger';

export default function MessengerPage() {
  return (
    <ProtectedRoute redirectTo="/signin">
      <div className="h-screen w-screen">
        <MessengerContent variant="page" />
      </div>
    </ProtectedRoute>
  );
}
