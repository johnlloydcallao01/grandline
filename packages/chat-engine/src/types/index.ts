// ============================================================================
// Chat Engine Types - Core entity definitions
// ============================================================================

export type UserRole = 'admin' | 'instructor' | 'trainee' | 'service'

export interface ChatUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  profilePicture?: string | null
}

export interface ChatParticipant {
  userId: number
  role: UserRole
  joinedAt: string
}

export type ChatType = 'support' | 'instructor_trainee' | 'admin_user' | 'group'

export interface Chat {
  id: number
  type: ChatType
  title?: string | null
  status: 'active' | 'archived' | 'closed'
  createdAt: string
  updatedAt: string
  lastMessageAt?: string | null
  lastMessagePreview?: string | null
  participants: ChatParticipant[]
  createdBy: number
}

export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface ChatMessageReaction {
  emoji: string
  userId: number
  createdAt: string
}

export interface ChatMessage {
  id: number
  chatId: number
  senderId: number
  sender?: ChatUser
  content: string
  type: MessageType
  replyToMessageId?: number | null
  attachments?: string[] | null
  reactions: ChatMessageReaction[]
  isEdited: boolean
  editedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type MessageStatus = 'delivered' | 'read'

export interface ChatMessageStatus {
  id: number
  messageId: number
  userId: number
  status: MessageStatus
  timestamp: string
}

export interface ChatTypingStatus {
  id: number
  chatId: number
  userId: number
  isTyping: boolean
  timestamp: string
}

// ============================================================================
// Realtime Event Types
// ============================================================================

export type RealtimeEventType =
  | 'message_insert'
  | 'message_update'
  | 'message_delete'
  | 'status_update'
  | 'typing_update'
  | 'reaction_insert'
  | 'reaction_delete'

export interface RealtimeEvent {
  type: RealtimeEventType
  payload: ChatMessage | ChatMessageStatus | ChatTypingStatus | ChatMessageReaction
  table: string
  schema: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  old?: Record<string, unknown>
  new?: Record<string, unknown>
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationOptions {
  limit: number
  cursor?: string | null
  direction: 'forward' | 'backward'
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
  prevCursor: string | null
  hasMore: boolean
  totalCount?: number
}

export type MessageCursor = {
  createdAt: string
  id: number
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean
  error?: string
  code?: string
}

export interface ValidationOptions {
  maxLength?: number
  minLength?: number
  allowedTypes?: MessageType[]
  allowEmpty?: boolean
}

// ============================================================================
// Chat Rules Types
// ============================================================================

export interface ChatPermissions {
  canSendMessage: boolean
  canEditMessage: boolean
  canDeleteMessage: boolean
  canReact: boolean
  canViewHistory: boolean
  maxMessageLength: number
  allowedFileTypes: string[]
  maxFileSize: number
}

export interface ChatBusinessRules {
  isParticipant(userId: number, chat: Chat): boolean
  canSendToChat(userId: number, chat: Chat): ValidationResult
  canEditMessage(userId: number, message: ChatMessage): ValidationResult
  canDeleteMessage(userId: number, message: ChatMessage, userRole: UserRole): ValidationResult
}

// ============================================================================
// Formatting Types
// ============================================================================

export interface FormattedMessage {
  id: number
  content: string
  preview: string
  senderName: string
  senderAvatar?: string | null
  timestamp: string
  formattedTime: string
  formattedDate: string
  isOwn: boolean
  isEdited: boolean
  replyTo?: {
    id: number
    preview: string
    senderName: string
  } | null
  reactions: {
    emoji: string
    count: number
    hasOwn: boolean
  }[]
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface TypingIndicator {
  userId: number
  userName: string
  isTyping: boolean
  timestamp: string
}

// ============================================================================
// Supabase Client Types
// ============================================================================

export interface SupabaseClientConfig {
  supabaseUrl: string
  supabaseKey: string
  options?: {
    realtime?: {
      timeout?: number
      heartbeatIntervalMs?: number
    }
  }
}

// ============================================================================
// Channel Management Types
// ============================================================================

export type ChannelStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface ChannelState {
  status: ChannelStatus
  subscribedTables: string[]
  error?: string
}

export interface TypingState {
  isTyping: boolean
  lastTyped: number
  timeoutId?: ReturnType<typeof setTimeout>
}

// ============================================================================
// Chat List Formatting Types
// ============================================================================

export interface ChatListItem {
  id: number
  title: string
  lastMessagePreview: string
  lastMessageTime: string
  unreadCount: number
  participants: { id: number; name: string; avatar?: string | null }[]
  isActive: boolean
}

// ============================================================================
// Pagination State for UI Components
// ============================================================================

export interface PaginationState {
  items: ChatMessage[]
  isLoading: boolean
  hasMore: boolean
  nextCursor: string | null
  prevCursor: string | null
  error: Error | null
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// ============================================================================
// Chat Event Payload Union Type
// ============================================================================

export type ChatEventPayload =
  | { type: 'message_insert'; payload: ChatMessage }
  | { type: 'message_update'; payload: ChatMessage }
  | { type: 'message_delete'; payload: { id: number } }
  | { type: 'status_update'; payload: ChatMessageStatus }
  | { type: 'typing_update'; payload: ChatTypingStatus }
  | { type: 'reaction_insert'; payload: { messageId: number; reaction: ChatMessageReaction } }
  | { type: 'reaction_delete'; payload: { messageId: number; userId: number; emoji: string } }

