'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { NotificationItem } from '@/components/notifications/NotificationsPanel';

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number | string) => Promise<void>;
  markAsUnread: (id: number | string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markSelectedAsRead: (ids: (number | string)[]) => Promise<void>;
  markSelectedAsUnread: (ids: (number | string)[]) => Promise<void>;
  deleteNotification: (id: number | string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children, userId }: { children: React.ReactNode; userId?: string | number }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`, {
        credentials: 'same-origin',
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      const userNotifications = data.docs || [];

      // Transform to NotificationItem format
      const transformed: NotificationItem[] = userNotifications.map((n: any) => ({
        id: n.id,
        type: n.category || 'other',
        title: n.title,
        message: n.body,
        timestamp: n.deliveredAt,
        read: !!n.readAt,
        icon: getNotificationIcon(n.category),
        iconColor: getIconColor(n.category),
        iconBg: getIconBg(n.category),
        actionText: n.link ? 'View Details' : undefined,
        actionPath: n.link || undefined,
      }));

      setNotifications(transformed);
      setUnreadCount(transformed.filter((n) => !n.read).length);
    } catch (error) {
      console.error('[NotificationsContext] Error fetching:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (id: number | string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ readAt: new Date().toISOString() }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NotificationsContext] Error marking as read:', error);
    }
  }, []);

  const markAsUnread = useCallback(async (id: number | string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ readAt: null }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('[NotificationsContext] Error marking as unread:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((n) =>
          fetch(`/api/notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ readAt: new Date().toISOString() }),
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationsContext] Error marking all read:', error);
    }
  }, [notifications]);

  const markSelectedAsRead = useCallback(async (ids: (number | string)[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/notifications/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ readAt: new Date().toISOString() }),
          })
        )
      );

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('[NotificationsContext] Error marking selected as read:', error);
    }
  }, []);

  const markSelectedAsUnread = useCallback(async (ids: (number | string)[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/notifications/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ readAt: null }),
          })
        )
      );

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + ids.length);
    } catch (error) {
      console.error('[NotificationsContext] Error marking selected as unread:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number | string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (res.ok) {
        const deleted = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (deleted && !deleted.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('[NotificationsContext] Error deleting:', error);
    }
  }, [notifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        markSelectedAsRead,
        markSelectedAsUnread,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// Re-export helper functions for backwards compatibility
export function getNotificationIcon(category: string): string {
  const iconMap: Record<string, string> = {
    learning: 'fa-graduation-cap',
    account: 'fa-user',
    'system-update': 'fa-sync-alt',
    other: 'fa-bell',
  };
  return iconMap[category] || 'fa-bell';
}

export function getIconColor(category: string): string {
  const colorMap: Record<string, string> = {
    learning: 'text-blue-600',
    account: 'text-purple-600',
    'system-update': 'text-indigo-600',
    other: 'text-gray-600',
  };
  return colorMap[category] || 'text-gray-600';
}

export function getIconBg(category: string): string {
  const bgMap: Record<string, string> = {
    learning: 'bg-blue-100',
    account: 'bg-purple-100',
    'system-update': 'bg-indigo-100',
    other: 'bg-gray-100',
  };
  return bgMap[category] || 'bg-gray-100';
}

// Helper: Format timestamp to relative time
export function getTimeAgo(timestamp: string): string {
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
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
