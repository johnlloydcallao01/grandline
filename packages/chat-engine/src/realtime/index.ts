import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type {
  RealtimeEvent,
  RealtimeEventHandler,
  ChatTypingStatus,
  ChannelStatus,
  ChannelState,
  TypingState
} from '../types/index.js'

// ============================================================================
// Channel Name Utilities
// ============================================================================

export function getChatChannelName(chatId: number): string {
  return `chat:${chatId}`
}

export function getMessagesChannelName(chatId: number): string {
  return `chat:${chatId}:messages`
}

export function getTypingChannelName(chatId: number): string {
  return `chat:${chatId}:typing`
}

// ============================================================================
// Chat Channel Manager
// ============================================================================

export class ChatChannelManager {
  private supabase: SupabaseClient
  private channels: Map<string, RealtimeChannel> = new Map()
  private handlers: Map<string, Set<RealtimeEventHandler>> = new Map()
  private channelStates: Map<string, ChannelState> = new Map()
  private typingStates: Map<number, TypingState> = new Map()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  // ==========================================================================
  // Channel Management
  // ==========================================================================

  subscribeToChat(chatId: number, handler: RealtimeEventHandler): () => void {
    const channelName = getChatChannelName(chatId)

    // Initialize handlers set for this channel
    if (!this.handlers.has(channelName)) {
      this.handlers.set(channelName, new Set())
    }
    this.handlers.get(channelName)!.add(handler)

    // Update channel state
    this.channelStates.set(channelName, {
      status: 'connecting',
      subscribedTables: [],
    })

    // Create channel if not exists
    if (!this.channels.has(channelName)) {
      this.createChatChannel(chatId, channelName)
    }

    // Return unsubscribe function
    return () => this.unsubscribeFromChat(chatId, handler)
  }

  private createChatChannel(chatId: number, channelName: string): void {
    console.log(`[ChatEngine] Creating Supabase channel: ${channelName} for chat ID ${chatId}`);
    
    const channel = this.supabase
      .channel(channelName, {
        config: {
          broadcast: {
            self: true,
          },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat=eq.${chatId}`,
        },
        (payload: { new: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          console.log(`[ChatEngine] 🟢 INSERT received on chat_messages:`, payload);
          this.emitEvent(channelName, {
            type: 'message_insert',
            payload: payload.new as any,
            table: 'chat_messages',
            schema: 'public',
            eventType: 'INSERT',
            new: payload.new,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat=eq.${chatId}`,
        },
        (payload: { new: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          console.log(`[ChatEngine] 🟡 UPDATE received on chat_messages:`, payload);
          this.emitEvent(channelName, {
            type: 'message_update',
            payload: payload.new as any,
            table: 'chat_messages',
            schema: 'public',
            eventType: 'UPDATE',
            old: payload.old,
            new: payload.new,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat=eq.${chatId}`,
        },
        (payload: { new: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          console.log(`[ChatEngine] 🔴 DELETE received on chat_messages:`, payload);
          this.emitEvent(channelName, {
            type: 'message_delete',
            payload: payload.old as any,
            table: 'chat_messages',
            schema: 'public',
            eventType: 'DELETE',
            old: payload.old,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_message_status',
        },
        (payload: { new: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          this.emitEvent(channelName, {
            type: 'status_update',
            payload: payload.new as any,
            table: 'chat_message_status',
            schema: 'public',
            eventType: 'INSERT',
            new: payload.new,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_message_status',
        },
        (payload: { new: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          this.emitEvent(channelName, {
            type: 'status_update',
            payload: payload.new as any,
            table: 'chat_message_status',
            schema: 'public',
            eventType: 'UPDATE',
            old: payload.old,
            new: payload.new,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_status',
          filter: `chat=eq.${chatId}`,
        },
        (payload: { new: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          this.emitEvent(channelName, {
            type: 'typing_update',
            payload: payload.new as any,
            table: 'chat_typing_status',
            schema: 'public',
            eventType: payload.eventType as any,
            old: payload.old,
            new: payload.new,
          })
        }
      )
      .subscribe((status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT', err?: Error) => {
        console.log(`[ChatEngine] Channel ${channelName} status changed to: ${status}`, err ? `Error: ${err.message}` : '');
        const state = this.channelStates.get(channelName)
        if (state) {
          state.status = status === 'SUBSCRIBED' ? 'connected' : status === 'CLOSED' ? 'disconnected' : 'error'
          if (status === 'SUBSCRIBED') {
            state.subscribedTables = [
              'chat_messages',
              'chat_message_status',
              'chat_typing_status',
            ]
          }
          this.channelStates.set(channelName, state)
        }
      })

    this.channels.set(channelName, channel)
  }

  private emitEvent(channelName: string, event: RealtimeEvent): void {
    const handlers = this.handlers.get(channelName)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event)
        } catch (error) {
          console.error('Error in realtime event handler:', error)
        }
      })
    }
  }

  unsubscribeFromChat(chatId: number, handler?: RealtimeEventHandler): void {
    const channelName = getChatChannelName(chatId)

    if (handler) {
      // Remove specific handler
      const handlers = this.handlers.get(channelName)
      if (handlers) {
        handlers.delete(handler)
        // If no more handlers, unsubscribe completely
        if (handlers.size === 0) {
          this.unsubscribeChannel(channelName)
        }
      }
    } else {
      // Unsubscribe all handlers for this chat
      this.unsubscribeChannel(channelName)
    }
  }

  private unsubscribeChannel(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
    this.handlers.delete(channelName)
    this.channelStates.delete(channelName)
  }

  // ==========================================================================
  // Channel Status
  // ==========================================================================

  getChannelStatus(chatId: number): ChannelState | undefined {
    return this.channelStates.get(getChatChannelName(chatId))
  }

  isSubscribed(chatId: number): boolean {
    const state = this.getChannelStatus(chatId)
    return state?.status === 'connected'
  }

  // ==========================================================================
  // Typing Indicators
  // ==========================================================================

  async sendTypingIndicator(
    chatId: number,
    userId: number,
    isTyping: boolean
  ): Promise<void> {
    const channelName = getChatChannelName(chatId)

    // Use broadcast for immediate typing feedback
    const channel = this.channels.get(channelName)
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          chatId,
          userId,
          isTyping,
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Also update database for persistence
    try {
      await this.supabase.from('chat_typing_status').upsert(
        {
          chat_id: chatId,
          user_id: userId,
          is_typing: isTyping,
          timestamp: new Date().toISOString(),
        },
        {
          onConflict: 'chat_id,user_id',
        }
      )
    } catch (error) {
      console.error('Failed to update typing status:', error)
    }
  }

  setTyping(
    chatId: number,
    userId: number,
    isTyping: boolean,
    debounceMs: number = 3000
  ): void {
    const key = chatId
    const existingState = this.typingStates.get(key)

    // Clear existing timeout
    if (existingState?.timeoutId) {
      clearTimeout(existingState.timeoutId)
    }

    // Send typing indicator
    this.sendTypingIndicator(chatId, userId, isTyping)

    // If typing, set auto-clear timeout
    if (isTyping) {
      const timeoutId = setTimeout(() => {
        this.sendTypingIndicator(chatId, userId, false)
        this.typingStates.delete(key)
      }, debounceMs)

      this.typingStates.set(key, {
        isTyping: true,
        lastTyped: Date.now(),
        timeoutId,
      })
    } else {
      this.typingStates.set(key, {
        isTyping: false,
        lastTyped: Date.now(),
      })
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  disconnect(): void {
    // Unsubscribe all channels
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.handlers.clear()
    this.channelStates.clear()

    // Clear typing timeouts
    this.typingStates.forEach((state) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId)
      }
    })
    this.typingStates.clear()
  }
}
