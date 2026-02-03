'use client';

import React, { useState } from 'react';

type NotificationTypeId =
  | 'all'
  | 'unread'
  | 'learning'
  | 'account'
  | 'system_update'
  | string;

export type NotificationItem = {
  id: number | string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
  iconColor: string;
  iconBg: string;
  actionText?: string;
  actionPath?: string;
};

export type NotificationFilter = {
  id: NotificationTypeId;
  label: string;
  count: number;
};

interface NotificationsPanelProps {
  items: NotificationItem[];
  filters: NotificationFilter[];
}

export function NotificationsPanel({ items, filters }: NotificationsPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<NotificationTypeId>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(items);

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    if (selectedFilter === 'learning') {
      return [
        'course_completion',
        'assignment_due',
        'new_course',
        'reminder',
        'achievement',
      ].includes(notification.type);
    }
    if (selectedFilter === 'account') {
      return ['payment', 'certificate_issued'].includes(notification.type);
    }
    if (selectedFilter === 'system_update') {
      return notification.type === 'system_update';
    }
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number | string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: number | string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const getTimeAgo = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 text-sm mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-[#201a7c] text-white rounded-lg text-sm font-medium hover:bg-[#1a1569] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {filters.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedFilter(type.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                  selectedFilter === type.id
                    ? 'bg-[#201a7c] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{type.label}</span>
                {type.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedFilter === type.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {type.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa fa-bell-slash text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {selectedFilter === 'unread'
                ? 'All notifications have been read'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 ${
                  !notification.read ? 'border-l-4 border-l-[#201a7c] shadow-sm' : 'hover:shadow-sm'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.iconBg}`}
                    >
                      <i className={`fa ${notification.icon} ${notification.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`text-sm font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-700' : 'text-gray-600'
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                              title="Mark as read"
                            >
                              <i className="fa fa-check text-blue-600 text-xs" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 transition-colors group"
                            title="Delete notification"
                          >
                            <i className="fa fa-trash text-gray-400 group-hover:text-red-500 text-xs" />
                          </button>
                        </div>
                      </div>

                      {notification.actionText && (
                        <div className="mt-3">
                          <button className="text-sm font-medium text-[#201a7c] hover:text-[#1a1569] transition-colors">
                            {notification.actionText} →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
