'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationsPanel, type NotificationItem } from './NotificationsPanel';
import { useUser } from '@/hooks/useAuth';

interface NotificationBellProps {
  /** If true, clicking bell navigates to /notifications page (mobile behavior) */
  navigateToPage?: boolean;
  /** If true, renders as a button suitable for mobile header */
  isMobile?: boolean;
}

// Helper: Map notification category/type to icon styles
const getNotificationIcon = (category: string, _sourceType?: string) => {
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

export function NotificationBell({ navigateToPage = false, isMobile = false }: NotificationBellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [, setIsLoading] = useState(false);

  const isNotificationsPage = pathname === '/notifications';

  // Fetch notifications via local API proxy
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`, {
        credentials: 'same-origin',
      });

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
      setUnreadCount(transformed.filter((n) => !n.read).length);
    } catch (error) {
      console.error('[NotificationBell] Error fetching:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Refresh when panel opens (desktop modal only)
  useEffect(() => {
    if (isOpen && !navigateToPage && user?.id) {
      fetchNotifications();
    }
  }, [isOpen, navigateToPage, user?.id, fetchNotifications]);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single as read
  const handleMarkAsRead = async (id: number | string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ readAt: new Date().toISOString() }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NotificationBell] Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
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
      console.error('[NotificationBell] Error marking all read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (id: number | string) => {
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
      console.error('[NotificationBell] Error deleting:', error);
    }
  };

  // Handle bell click
  const handleBellClick = () => {
    if (navigateToPage) {
      // Mobile: navigate to full page
      router.push('/notifications');
    } else {
      // Desktop: toggle modal
      if (isNotificationsPage) return;
      setIsOpen((prev) => !prev);
    }
  };

  // Bell button classes
  const bellClasses = isMobile
    ? 'w-full h-10 bg-white rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors'
    : `relative w-10 h-10 rounded-md flex items-center justify-center transition-colors ${isNotificationsPage ? 'bg-[#e6e5f7]' : 'bg-white hover:bg-gray-50'
    }`;

  const iconClasses = isMobile
    ? 'fas fa-bell text-gray-600 text-lg'
    : `fas fa-bell text-lg ${isNotificationsPage ? 'text-[#201a7c]' : 'text-gray-600'}`;

  return (
    <div className="relative" ref={notificationsRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className={bellClasses}
        aria-label="Notifications"
        aria-expanded={!navigateToPage && isOpen}
        disabled={!navigateToPage && isNotificationsPage}
      >
        <i className={iconClasses}></i>

        {/* Unread Badge - Using same red as wishlist heart (#ab3b43) */}
        {unreadCount > 0 && (
          <span
            className={`absolute text-white text-xs font-bold rounded-full flex items-center justify-center ${isMobile
              ? 'top-0.5 right-2 w-4 h-4 text-[10px]' // Mobile: closer to centered icon
              : '-top-1 -right-1 w-5 h-5' // Desktop: at edge of fixed-size button
              }`}
            style={{ backgroundColor: '#ab3b43' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop Modal Dropdown */}
      {!navigateToPage && !isNotificationsPage && isOpen && (
        <div className="absolute right-0 mt-3 w-[420px] max-w-[95vw] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="max-h-[80vh] overflow-y-auto">
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
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export for the /notifications page to use directly
export { getNotificationIcon, getTimeAgo };
