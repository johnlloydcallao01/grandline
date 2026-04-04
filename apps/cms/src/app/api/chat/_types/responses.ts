export interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
  meta?: {
    cursor?: number | string | null
    hasMore?: boolean
    total?: number
  }
}

export interface ChatListItem {
  id: number
  title: string
  type: string
  status: string
  lastMessagePreview?: string
  lastMessageAt?: string
  unreadCount: number
  participants: {
    id: number
    name: string
    avatar?: string | null
    role: string
  }[]
  isActive: boolean
}

export interface ChatDetailResponse {
  id: number
  type: string
  title?: string
  status: string
  createdAt: string
  updatedAt: string
  lastMessageAt?: string
  lastMessagePreview?: string
  participants: {
    id: number
    email: string
    firstName: string
    lastName: string
    role: string
    profilePicture?: number | object | null
  }[]
  createdBy: number
}

export interface MessageResponse {
  id: number
  chatId: number
  senderId: number
  sender?: {
    id: number
    firstName: string
    lastName: string
    profilePicture?: number | object | null
  }
  content: string
  type: string
  replyToMessageId?: number
  attachments?: string[]
  reactions: {
    emoji: string
    userId: number
    createdAt: string
  }[]
  isEdited: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MessageListResponse {
  data: MessageResponse[]
  nextCursor: number | string | null
  prevCursor: number | string | null
  hasMore: boolean
}

export interface SendMessageRequest {
  content: string
  type?: 'text' | 'image' | 'file' | 'system'
  replyToMessageId?: number
  attachments?: string[]
}

export interface EditMessageRequest {
  content: string
}

export interface TypingRequest {
  isTyping: boolean
}

export interface MarkReadResponse {
  success: boolean
  count: number
}
