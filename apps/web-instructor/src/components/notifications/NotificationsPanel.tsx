'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useNotifications,
  getTimeAgo,
} from '@/contexts/NotificationsContext'

type Filter = 'all' | 'unread'

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-start gap-4 border-b border-[var(--card-border)] p-4">
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

export function NotificationsPanel() {
  const router = useRouter()
  const notifications = useNotifications()
  const [filter, setFilter] = useState<Filter>('all')

  const items = notifications?.notifications ?? []
  const unreadCount = notifications?.unreadCount ?? 0
  const isLoading = notifications?.isLoading ?? false

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => !n.read)
    return items
  }, [items, filter])

  if (!notifications) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Notifications are unavailable right now.
      </div>
    )
  }

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'You are all caught up'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => notifications.markAllAsRead()}
          disabled={unreadCount === 0}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--card-border)] bg-[var(--card-background)] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
        {isLoading && items.length === 0 ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <i className="fa fa-bell-slash mb-3 text-3xl text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'When new submissions or enrollments arrive, they will show up here.'
                : 'Notifications about submissions, enrollments, and course activity will appear here.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--card-border)]">
            {filtered.map((n) => (
              <li
                key={n.id}
                className={`group flex items-start gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                  !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (n.actionPath) {
                      router.push(n.actionPath as any)
                    }
                  }}
                  className="flex flex-1 items-start gap-4 text-left"
                  disabled={!n.actionPath}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${n.iconBg}`}
                  >
                    <i className={`fa ${n.icon} ${n.iconColor}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          n.read
                            ? 'font-medium text-gray-700 dark:text-gray-300'
                            : 'font-semibold text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-2">
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getTimeAgo(n.timestamp)}
                        </span>
                      </span>
                    </span>
                    {n.message && (
                      <span className="mt-0.5 block text-sm text-gray-500 dark:text-gray-400">
                        {n.message}
                      </span>
                    )}
                    {n.actionText && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)]">
                        {n.actionText}
                        <i className="fa fa-chevron-right text-[10px]" />
                      </span>
                    )}
                  </span>
                </button>

                <span className="flex flex-shrink-0 items-center gap-1">
                  {n.read ? (
                    <button
                      type="button"
                      onClick={() => notifications.markAsUnread(n.id)}
                      title="Mark as unread"
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      aria-label="Mark as unread"
                    >
                      <i className="fa fa-envelope-open text-sm" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => notifications.markAsRead(n.id)}
                      title="Mark as read"
                      className="rounded-full p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      aria-label="Mark as read"
                    >
                      <i className="fa fa-envelope text-sm" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => notifications.deleteNotification(n.id)}
                    title="Delete"
                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    aria-label="Delete notification"
                  >
                    <i className="fa fa-trash text-sm" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}