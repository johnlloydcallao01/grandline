import type {
  ChatMessage,
  ChatMessageReaction,
  ChatUser,
  FormattedMessage,
  TypingIndicator,
  MessageStatus,
  UserRole
} from '../types/index.js'

// ============================================================================
// Message Formatting
// ============================================================================

export function formatMessage(
  message: ChatMessage,
  currentUserId: number
): FormattedMessage {
  const isOwn = message.senderId === currentUserId
  const sender = message.sender

  return {
    id: message.id,
    content: message.content,
    preview: generateMessagePreview(message),
    senderName: sender
      ? `${sender.firstName} ${sender.lastName}`
      : 'Unknown User',
    senderAvatar: sender?.profilePicture ?? null,
    timestamp: message.createdAt,
    formattedTime: formatTime(message.createdAt),
    formattedDate: formatDate(message.createdAt),
    isOwn,
    isEdited: message.isEdited,
    replyTo: message.replyToMessageId
      ? { id: message.replyToMessageId, preview: 'Reply preview...', senderName: 'User' }
      : null,
    reactions: formatReactions(message.reactions || [], currentUserId),
    status: 'sent' // Will be updated based on ChatMessageStatus
  }
}

export function formatReactions(
  reactions: ChatMessageReaction[],
  currentUserId: number
): { emoji: string; count: number; hasOwn: boolean }[] {
  const grouped = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, hasOwn: false }
    }
    acc[reaction.emoji].count++
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasOwn = true
    }
    return acc
  }, {} as Record<string, { emoji: string; count: number; hasOwn: boolean }>)

  return Object.values(grouped)
}

export function generateMessagePreview(message: ChatMessage, maxLength: number = 100): string {
  let preview = message.content

  // Strip HTML if present
  preview = preview.replace(/<[^>]*>/g, '')

  // Truncate
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength - 3) + '...'
  }

  return preview.trim()
}

export function updateMessageStatus(
  formattedMessage: FormattedMessage,
  status: MessageStatus,
  userId: number,
  currentUserId: number
): FormattedMessage {
  // Only update status for own messages
  if (!formattedMessage.isOwn) {
    return formattedMessage
  }

  const statusPriority: Record<string, number> = {
    'sending': 0,
    'sent': 1,
    'delivered': 2,
    'read': 3
  }

  const newStatus = status === 'read' ? 'read' : 'delivered'
  const currentPriority = statusPriority[formattedMessage.status] ?? 0
  const newPriority = statusPriority[newStatus] ?? 0

  // Only upgrade status, never downgrade
  if (newPriority > currentPriority) {
    return {
      ...formattedMessage,
      status: newStatus
    }
  }

  return formattedMessage
}

// ============================================================================
// Typing Indicator Formatting
// ============================================================================

export function formatTypingIndicator(
  typingUsers: { userId: number; user?: ChatUser; isTyping: boolean }[]
): string {
  const activeTypers = typingUsers.filter(u => u.isTyping)

  if (activeTypers.length === 0) {
    return ''
  }

  if (activeTypers.length === 1) {
    const user = activeTypers[0].user
    const name = user ? `${user.firstName}` : 'Someone'
    return `${name} is typing...`
  }

  if (activeTypers.length === 2) {
    const names = activeTypers.map(u => u.user?.firstName || 'Someone')
    return `${names[0]} and ${names[1]} are typing...`
  }

  return `${activeTypers.length} people are typing...`
}

// ============================================================================
// Timestamp Formatting
// ============================================================================

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return 'Today'
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 10) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(timestamp)
}

export function formatMessageTimeGroup(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()

  // Group by date for message lists
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)
  if (date > lastWeek) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// ============================================================================
// Chat List Formatting
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

export function formatChatListItem(
  chat: {
    id: number
    title?: string | null
    lastMessagePreview?: string | null
    lastMessageAt?: string | null
    status: string
    participants: ChatUser[]
  },
  currentUserId: number,
  unreadCount: number = 0
): ChatListItem {
  const otherParticipants = chat.participants.filter(p => p.id !== currentUserId)

  let title = chat.title
  if (!title) {
    if (otherParticipants.length === 1) {
      title = `${otherParticipants[0].firstName} ${otherParticipants[0].lastName}`
    } else if (otherParticipants.length > 1) {
      title = `${otherParticipants[0].firstName} and ${otherParticipants.length - 1} others`
    } else {
      title = 'Chat'
    }
  }

  return {
    id: chat.id,
    title,
    lastMessagePreview: chat.lastMessagePreview || 'No messages yet',
    lastMessageTime: chat.lastMessageAt
      ? formatRelativeTime(chat.lastMessageAt)
      : '',
    unreadCount,
    participants: otherParticipants.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      avatar: p.profilePicture
    })),
    isActive: chat.status === 'active'
  }
}

// ============================================================================
// User Name Formatting
// ============================================================================

export function formatUserName(user: ChatUser | undefined): string {
  if (!user) return 'Unknown User'
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

export function formatUserInitials(user: ChatUser | undefined): string {
  if (!user) return '?'
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: 'Admin',
    instructor: 'Instructor',
    trainee: 'Trainee',
    service: 'System'
  }
  return displayNames[role] || role
}
