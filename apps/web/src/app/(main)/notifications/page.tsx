'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NotificationsPanel, type NotificationItem } from '@/components/notifications/NotificationsPanel';
import { useUser } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api').replace(/\/api$/, '');

// Helper: Map notification category/type to icon styles
const getNotificationIcon = (category: string, _type?: string) => {
  const iconMap: Record<string, { icon: string; iconColor: string; iconBg: string; type: string }> = {
    'learning': { icon: 'fa-graduation-cap', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', type: 'course_enrolled' },
    'account': { icon: 'fa-user', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', type: 'account' },
    'system-update': { icon: 'fa-sync-alt', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100', type: 'system_update' },
    'other': { icon: 'fa-bell', iconColor: 'text-gray-600', iconBg: 'bg-gray-100', type: 'other' },
  };
  return iconMap[category] || iconMap['other'];
};

// Helper: Format timestamp to relative time
const getTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/user-notifications?where[user][equals]=${user.id}&sort=-deliveredAt&limit=50`,
        { credentials: 'include' }
      );

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      const userNotifications = data.docs || [];

      // Transform to NotificationItem format
      const transformed: NotificationItem[] = userNotifications.map((n: any) => {
        const iconStyle = getNotificationIcon(n.category, n.sourceType);
        return {
          id: n.id,
          type: iconStyle.type,
          title: n.title,
          message: n.body,
          timestamp: getTimeAgo(n.deliveredAt),
          read: !!n.readAt,
          icon: iconStyle.icon,
          iconColor: iconStyle.iconColor,
          iconBg: iconStyle.iconBg,
          actionText: n.link ? 'View Details' : undefined,
          actionPath: n.link || undefined,
        };
      });

      setNotifications(transformed);
    } catch (error) {
      console.error('[NotificationsPage] Error fetching:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch on mount
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (id: number | string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ readAt: new Date().toISOString() }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (error) {
      console.error('[NotificationsPage] Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((n) =>
          fetch(`${API_BASE_URL}/api/user-notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ readAt: new Date().toISOString() }),
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('[NotificationsPage] Error marking all read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (id: number | string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('[NotificationsPage] Error deleting:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationsPanel
        items={notifications}
        filters={[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          {
            id: 'enrollments',
            label: 'Enrollments',
            count: notifications.filter((n) => ['course_enrolled', 'enrollment'].includes(n.type)).length,
          },
        ]}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
      />
      <div className="pb-20" />
    </div>
  );
}
