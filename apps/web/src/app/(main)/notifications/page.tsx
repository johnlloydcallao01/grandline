'use client';

import React, { useEffect } from 'react';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useUser } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationsContext';

export default function NotificationsPage() {
  const { user } = useUser();
  const router = useRouter();

  // Use shared context for real-time sync
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationsPanel
        items={notifications}
        filters={[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'read', label: 'Read', count: notifications.filter((n) => n.read).length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          {
            id: 'enrollments',
            label: 'Enrollments',
            count: notifications.filter((n) => ['course_enrolled', 'enrollment'].includes(n.type)).length,
          },
        ]}
        isLoading={isLoading}
        onMarkAsRead={markAsRead}
        onMarkAsUnread={markAsUnread}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
      <div className="pb-20" />
    </div>
  );
}
