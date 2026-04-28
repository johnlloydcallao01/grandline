'use client';

import React, { useState, useEffect } from 'react';

type NotificationTypeId =
  | 'all'
  | 'unread'
  | 'enrollments'
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
  isLoading?: boolean;
  onMarkAsRead?: (id: number | string) => Promise<void> | void;
  onMarkAsUnread?: (id: number | string) => Promise<void> | void;
  onMarkAllAsRead?: () => Promise<void> | void;
  onDelete?: (id: number | string) => Promise<void> | void;
}

export function NotificationsPanel({ items, filters, isLoading = false, onMarkAsRead, onMarkAsUnread, onMarkAllAsRead, onDelete }: NotificationsPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<NotificationTypeId>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(items);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Sync with parent items when they change (e.g., after fetch)
  useEffect(() => {
    setNotifications(items);
    // Clear selection when items change
    setSelectedIds(new Set());
    // Exit selection mode when items change
    setIsSelectionMode(false);
  }, [items]);

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'read') return notification.read;
    if (selectedFilter === 'unread') return !notification.read;
    if (selectedFilter === 'enrollments') {
      return ['course_enrolled', 'enrollment'].includes(notification.type);
    }
    return notification.type === selectedFilter;
  });

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all filtered
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    // Clear selection when exiting selection mode
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = filteredNotifications.length > 0 && selectedIds.size === filteredNotifications.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredNotifications.length;

  // Bulk actions
  const markSelectedAsRead = async () => {
    // Call external handler for each selected item
    const promises = Array.from(selectedIds).map(async (id) => {
      if (onMarkAsRead) {
        await onMarkAsRead(id);
      }
    });
    await Promise.all(promises);
    // Note: Parent context updates the actual state
    setSelectedIds(new Set());
    // Exit selection mode after action
    setIsSelectionMode(false);
  };

  const markSelectedAsUnread = async () => {
    // Call external handler for each selected item
    const promises = Array.from(selectedIds).map(async (id) => {
      if (onMarkAsUnread) {
        await onMarkAsUnread(id);
      }
    });
    await Promise.all(promises);
    // Note: Parent context updates the actual state
    setSelectedIds(new Set());
    // Exit selection mode after action
    setIsSelectionMode(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: number | string) => {
    // Call external handler if provided
    // Parent context updates the actual state
    if (onMarkAsRead) {
      await onMarkAsRead(id);
    }
  };

  const markAsUnread = async (id: number | string) => {
    // Call external handler if provided
    // Parent context updates the actual state
    if (onMarkAsUnread) {
      await onMarkAsUnread(id);
    }
  };

  const markAllAsRead = async () => {
    // Call external handler if provided
    // Parent context updates the actual state
    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    }
  };

  const deleteNotification = async (id: number | string) => {
    // Call external handler if provided
    // Parent context updates the actual state
    if (onDelete) {
      await onDelete(id);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            {isLoading ? (
              // Header skeleton
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 text-sm mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up!'}
                </p>
              </div>
            )}
            {!isLoading && !isSelectionMode && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-[#201a7c] text-white rounded-lg text-sm font-medium hover:bg-[#1a1569] transition-colors"
              >
                Mark all read
              </button>
            )}
            {!isLoading && !isSelectionMode && (
              <button
                onClick={toggleSelectionMode}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                title="Select notifications"
              >
                <i className="fa fa-check-square-o" />
                <span>Select</span>
              </button>
            )}
            {!isLoading && isSelectionMode && selectedIds.size === 0 && (
              <button
                onClick={toggleSelectionMode}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            {!isLoading && isSelectionMode && selectedIds.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                <button
                  onClick={markSelectedAsRead}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Mark as read
                </button>
                <button
                  onClick={markSelectedAsUnread}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Mark as unread
                </button>
                <button
                  onClick={toggleSelectionMode}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          {isLoading ? (
            // Filters skeleton
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="flex space-x-2 pb-2 flex-1">
                <div className="h-9 bg-gray-200 rounded-lg w-16" />
                <div className="h-9 bg-gray-200 rounded-lg w-20" />
                <div className="h-9 bg-gray-200 rounded-lg w-24" />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Select All Checkbox - only in selection mode */}
              {isSelectionMode && (
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#201a7c] focus:ring-[#201a7c] cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Select all</span>
                </label>
              )}
              <div className="flex overflow-x-auto space-x-1 pb-2 flex-1">
                {filters.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFilter(type.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${selectedFilter === type.id
                      ? 'bg-[#201a7c] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <span>{type.label}</span>
                    {type.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${selectedFilter === type.id
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
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  {isSelectionMode && <div className="mt-2 w-4 h-4 rounded bg-gray-200 flex-shrink-0" />}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa fa-bell-slash text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {selectedFilter === 'unread'
                ? 'All notifications have been read'
                : selectedFilter === 'read'
                  ? 'No read notifications yet'
                  : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 ${!notification.read ? 'border-l-4 border-l-[#201a7c] shadow-sm' : 'hover:shadow-sm'
                  }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Checkbox for selection - only in selection mode */}
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => toggleSelect(notification.id)}
                        className="mt-2 w-4 h-4 rounded border-gray-300 text-[#201a7c] focus:ring-[#201a7c] cursor-pointer flex-shrink-0"
                      />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.iconBg}`}
                    >
                      <i className={`fa ${notification.icon} ${notification.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-600'
                              }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read ? (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                              title="Mark as read"
                            >
                              <i className="fa fa-check text-blue-600 text-xs" />
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsUnread(notification.id)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              title="Mark as unread"
                            >
                              <i className="fa fa-envelope text-gray-600 text-xs" />
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
