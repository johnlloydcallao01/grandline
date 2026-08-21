'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createClientFromEnv, type SupabaseClient, type RealtimeChannel } from '@grandline/chat-engine'
import {
  deleteMyNotification,
  getMyNotifications,
  markAllAsRead as markAllAsReadAction,
  markAllAsSeen as markAllAsSeenAction,
  markNotification,
} from '@/app/actions/notifications'

export interface NotificationItem {
  id: number | string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  seen: boolean
  icon: string
  iconColor: string
  iconBg: string
  actionText?: string
  actionPath?: string
}

interface NotificationsContextType {
  notifications: NotificationItem[]
  unreadCount: number
  unseenCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: number | string) => Promise<void>
  markAsUnread: (id: number | string) => Promise<void>
  markAllAsRead: () => Promise<void>
  markAllAsSeen: () => Promise<void>
  markSelectedAsRead: (ids: (number | string)[]) => Promise<void>
  markSelectedAsUnread: (ids: (number | string)[]) => Promise<void>
  deleteNotification: (id: number | string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

function toItem(raw: any): NotificationItem {
  return {
    id: raw.id,
    type: raw.category || 'other',
    title: raw.title || 'Notification',
    message: raw.body || '',
    timestamp: raw.deliveredAt || new Date().toISOString(),
    read: !!raw.readAt,
    seen: !!raw.seenAt,
    icon: getNotificationIcon(raw.category),
    iconColor: getIconColor(raw.category),
    iconBg: getIconBg(raw.category),
    actionText: raw.link ? 'View Details' : undefined,
    actionPath: raw.link || undefined,
  }
}

export function NotificationsProvider({
  children,
  userId,
}: {
  children: React.ReactNode
  userId?: string | number
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unseenCount, setUnseenCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const supabaseRef = useRef<SupabaseClient | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const data = await getMyNotifications()
      if (!data) return

      const transformed: NotificationItem[] = (data.docs || []).map(toItem)

      setNotifications(transformed)
      setUnreadCount(data.unreadCount ?? transformed.filter((n) => !n.read).length)
      setUnseenCount(data.unseenCount ?? transformed.filter((n) => !n.seen).length)
    } catch (error) {
      console.error('[NotificationsContext] Error fetching:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  useEffect(() => {
    if (!userId) return

    try {
      supabaseRef.current = createClientFromEnv()
    } catch (error) {
      console.error('[NotificationsContext] Failed to create Supabase client:', error)
      return
    }

    const supabase = supabaseRef.current
    const channelName = `notifications:user:${userId}`

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: {
            self: true,
          },
        },
      })
      .on(
        'broadcast',
        { event: 'new_notification' },
        (payload: { payload: { notification: any } }) => {
          const newNotification = payload.payload?.notification
          if (newNotification) {
            const transformed = toItem(newNotification)
            setNotifications((prev) => [transformed, ...prev])
            setUnreadCount((prev) => prev + 1)
            setUnseenCount((prev) => prev + 1)
          }
          fetchNotifications()
        },
      )
      .on(
        'broadcast',
        { event: 'notification_read' },
        (payload: { payload: { notificationId: string } }) => {
          const notificationId = payload.payload?.notificationId
          if (notificationId) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe((status) => {
        console.log(`[NotificationsContext] Channel ${channelName} status: ${status}`)
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, fetchNotifications])

  const markAsRead = useCallback(async (id: number | string) => {
    try {
      await markNotification(id, { readAt: new Date().toISOString() })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('[NotificationsContext] Error marking as read:', error)
    }
  }, [])

  const markAsUnread = useCallback(async (id: number | string) => {
    try {
      await markNotification(id, { readAt: null })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
      setUnreadCount((prev) => prev + 1)
    } catch (error) {
      console.error('[NotificationsContext] Error marking as unread:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read)
    if (unread.length === 0) return

    try {
      await markAllAsReadAction()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('[NotificationsContext] Error marking all read:', error)
    }
  }, [notifications])

  const markAllAsSeen = useCallback(async () => {
    if (unseenCount === 0) return

    try {
      await markAllAsSeenAction()
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })))
      setUnseenCount(0)
    } catch (error) {
      console.error('[NotificationsContext] Error marking all seen:', error)
    }
  }, [unseenCount])

  const markSelectedAsRead = useCallback(async (ids: (number | string)[]) => {
    try {
      await Promise.all(ids.map((id) => markNotification(id, { readAt: new Date().toISOString() })))
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - ids.length))
    } catch (error) {
      console.error('[NotificationsContext] Error marking selected as read:', error)
    }
  }, [])

  const markSelectedAsUnread = useCallback(async (ids: (number | string)[]) => {
    try {
      await Promise.all(ids.map((id) => markNotification(id, { readAt: null })))
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: false } : n)),
      )
      setUnreadCount((prev) => prev + ids.length)
    } catch (error) {
      console.error('[NotificationsContext] Error marking selected as unread:', error)
    }
  }, [])

  const deleteNotification = useCallback(
    async (id: number | string) => {
      try {
        const ok = await deleteMyNotification(id)
        if (ok) {
          const deleted = notifications.find((n) => n.id === id)
          setNotifications((prev) => prev.filter((n) => n.id !== id))
          if (deleted && !deleted.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        }
      } catch (error) {
        console.error('[NotificationsContext] Error deleting:', error)
      }
    },
    [notifications],
  )

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        unseenCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        markAllAsSeen,
        markSelectedAsRead,
        markSelectedAsUnread,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function getNotificationIcon(category: string): string {
  const iconMap: Record<string, string> = {
    learning: 'fa-graduation-cap',
    account: 'fa-user',
    'system-update': 'fa-sync-alt',
    other: 'fa-bell',
  }
  return iconMap[category] || 'fa-bell'
}

export function getIconColor(category: string): string {
  const colorMap: Record<string, string> = {
    learning: 'text-blue-600',
    account: 'text-purple-600',
    'system-update': 'text-indigo-600',
    other: 'text-gray-600',
  }
  return colorMap[category] || 'text-gray-600'
}

export function getIconBg(category: string): string {
  const bgMap: Record<string, string> = {
    learning: 'bg-blue-100',
    account: 'bg-purple-100',
    'system-update': 'bg-indigo-100',
    other: 'bg-gray-100',
  }
  return bgMap[category] || 'bg-gray-100'
}

export function getTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export function useNotifications(): NotificationsContextType | null {
  const context = useContext(NotificationsContext)
  return context || null
}