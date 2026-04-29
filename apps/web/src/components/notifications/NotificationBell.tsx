'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationsPanel } from './NotificationsPanel';
import { useNotifications } from '@/contexts/NotificationsContext';

interface NotificationBellProps {
  /** If true, clicking bell navigates to /notifications page (mobile behavior) */
  navigateToPage?: boolean;
  /** If true, renders as a button suitable for mobile header */
  isMobile?: boolean;
}

export function NotificationBell({ navigateToPage = false, isMobile = false }: NotificationBellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Track if user has seen the notification indicator (bubble cleared on click)
  const [bubbleCleared, setBubbleCleared] = useState(false);
  const lastUnreadCountRef = useRef(0);

  // Use shared context for real-time sync (null if outside provider, e.g., auth pages)
  const context = useNotifications();

  // If no context (outside NotificationsProvider), render disabled bell
  if (!context) {
    return (
      <button
        className="relative p-2 text-gray-400 cursor-default"
        aria-label="Notifications"
        disabled
      >
        <i className="fas fa-bell text-xl" />
      </button>
    );
  }

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification
  } = context;

  const [isOpen, setIsOpen] = useState(false);
  const isNotificationsPage = pathname === '/notifications';

  // Reset bubble cleared state when new notifications arrive (unreadCount increases)
  useEffect(() => {
    if (unreadCount > lastUnreadCountRef.current) {
      // New notifications arrived, show bubble again
      setBubbleCleared(false);
    }
    lastUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Show bubble if there are unread notifications AND user hasn't cleared it by clicking
  const showBubble = unreadCount > 0 && !bubbleCleared;

  // Refresh when panel opens (desktop modal only)
  useEffect(() => {
    if (isOpen && !navigateToPage) {
      fetchNotifications();
    }
  }, [isOpen, navigateToPage, fetchNotifications]);

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

  // Handle bell click - clear bubble indicator (but don't mark as read)
  const handleBellClick = () => {
    // Clear the bubble indicator immediately on click (Facebook-like behavior)
    setBubbleCleared(true);

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
    ? 'relative w-full h-10 bg-white rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors'
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
        {/* Cleared when clicking bell, but notifications remain unread until manually marked */}
        {showBubble && (
          <span
            className={`absolute text-white font-bold rounded-full flex items-center justify-center leading-none ${isMobile
              ? '-top-1 -right-2 w-3.5 h-3.5 text-[9px]' // Mobile: moved down 2px
              : 'top-0 -right-1 w-4 h-4 text-[10px]' // Desktop: moved down 2px
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
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export for the /notifications page to use directly
export { getNotificationIcon, getTimeAgo } from '@/contexts/NotificationsContext';
