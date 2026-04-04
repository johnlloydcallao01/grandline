// ============================================================================
// Grandline Chat Engine - Main Exports
// ============================================================================

// Types
export type {
  // Core entities
  Chat,
  ChatUser,
  ChatParticipant,
  ChatMessage,
  ChatMessageReaction,
  ChatMessageStatus,
  ChatTypingStatus,
  UserRole,
  ChatType,
  MessageType,
  MessageStatus,

  // Events
  RealtimeEvent,
  RealtimeEventType,
  RealtimeEventHandler,
  ChatEventPayload,

  // Pagination
  PaginationOptions,
  PaginatedResult,
  MessageCursor,

  // Validation
  ValidationResult,
  ValidationOptions,

  // Chat rules
  ChatPermissions,
  ChatBusinessRules,

  // Formatting
  FormattedMessage,
  TypingIndicator,
  ChatListItem,

  // Supabase
  SupabaseClientConfig,
  ChannelStatus,
  ChannelState,
  TypingState,

  // Utilities
  Nullable,
  Optional,
  PaginationState,
} from './types/index.js'

// Validation
export {
  validateMessageContent,
  validateMessageType,
  validateReplyChain,
  validateAttachmentUrls,
  isParticipant,
  canSendToChat,
  canEditMessage,
  canDeleteMessage,
  canAddReaction,
  validateChatParticipants,
  validateNewMessage,
} from './validation/index.js'

// Formatting
export {
  formatMessage,
  formatReactions,
  generateMessagePreview,
  updateMessageStatus,
  formatTypingIndicator,
  formatTime,
  formatDate,
  formatRelativeTime,
  formatMessageTimeGroup,
  formatChatListItem,
  formatUserName,
  formatUserInitials,
  getRoleDisplayName,
} from './formatting/index.js'

// Supabase Client
export {
  createSupabaseClient,
  createClientFromEnv,
  getSupabaseClient,
  resetSupabaseClient,
} from './client/index.js'

// Realtime
export {
  ChatChannelManager,
  getChatChannelName,
  getMessagesChannelName,
  getTypingChannelName,
} from './realtime/index.js'

// Pagination
export {
  encodeCursor,
  decodeCursor,
  buildPaginationQuery,
  getCursorFromMessage,
  getNextCursor,
  getPrevCursor,
  buildPaginatedResult,
  paginateMessages,
  normalizePaginationOptions,
  createInitialPaginationState,
  appendMessages,
  prependMessages,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from './pagination/index.js'

// Re-export Supabase types for convenience
export type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
