import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// Supabase Realtime Notifications - Server-side broadcaster
// ============================================================================

let serviceClient: SupabaseClient | null = null

/**
 * Get Supabase service role client for server-side operations
 * Uses service role key to bypass RLS and broadcast events
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error(
        'Missing Supabase environment variables. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      )
    }

    serviceClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return serviceClient
}

/**
 * Broadcast a notification event to a specific user via Supabase Realtime
 * This allows instant notification delivery without polling
 */
export async function broadcastNotification(
  userId: string | number,
  notification: {
    id: string | number
    title: string
    body: string
    category: string
    link?: string
    metadata?: Record<string, any>
    deliveredAt: string
  }
): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()

    // Broadcast to user's private notification channel
    // Format: 'notifications:user:{userId}'
    const channelName = `notifications:user:${userId}`

    console.log(`[SupabaseNotifications] Broadcasting to ${channelName}`, notification)

    // Use Supabase broadcast to send realtime event
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true,
        },
      },
    })

    // Subscribe and then broadcast
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'new_notification',
          payload: {
            type: 'new_notification',
            notification,
            timestamp: new Date().toISOString(),
          },
        })

        // Cleanup after sending
        setTimeout(() => {
          supabase.removeChannel(channel)
        }, 1000)
      }
    })

    console.log(`[SupabaseNotifications] Successfully broadcast notification ${notification.id} to user ${userId}`)
  } catch (error) {
    console.error('[SupabaseNotifications] Failed to broadcast:', error)
    // Don't throw - notification creation should not fail if broadcast fails
  }
}

/**
 * Mark notification as read broadcast
 * Notifies all clients to update unread count
 */
export async function broadcastNotificationRead(
  userId: string | number,
  notificationId: string | number
): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()
    const channelName = `notifications:user:${userId}`

    const channel = supabase.channel(channelName)

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'notification_read',
          payload: {
            type: 'notification_read',
            notificationId: String(notificationId),
            timestamp: new Date().toISOString(),
          },
        })

        setTimeout(() => {
          supabase.removeChannel(channel)
        }, 1000)
      }
    })
  } catch (error) {
    console.error('[SupabaseNotifications] Failed to broadcast read status:', error)
  }
}
