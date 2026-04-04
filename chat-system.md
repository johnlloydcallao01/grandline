# Chat System Implementation Plan

## Analysis Summary

Based on deep analysis of `apps/cms`, the platform uses:

### Existing User Architecture
- **Users collection** (`collections/Users.ts`): Central identity with `role` field (`admin`, `instructor`, `trainee`, `service`), auth-enabled
- **Role-specific collections**: `Admins`, `Instructors`, `Trainees` - all link to `users` via `user` relationship
- **SupportTickets & SupportTicketMessages**: Existing pattern very similar to chat needs
- **Notifications**: Broadcast system with user targeting already in place

### Key Observations for Chat Implementation
1. All user types share the same `users` collection - perfect for role-agnostic chat
2. `SupportTicketMessages` already implements:
   - Sender/user relationships
   - Rich text content
   - Media attachments
   - Access control by role and ownership
   - Auto-updating parent timestamps
3. PayloadCMS + PostgreSQL with real-time capabilities via Supabase

---

## Phase 1: Database / Storage Layer Implementation Plan

### 1.1 Collections to Create

#### A. `chats` Collection
**File**: `apps/cms/src/collections/Chats.ts`

**Purpose**: Container for conversation threads (1:1 and group)

**Fields**:
```typescript
{
  name: 'type',
  type: 'select',
  options: [
    { label: 'Direct (1:1)', value: 'direct' },
    { label: 'Group', value: 'group' },
  ],
  defaultValue: 'direct',
  required: true,
},
{
  name: 'title', // For group chats only
  type: 'text',
  admin: {
    condition: (data) => data?.type === 'group',
  },
},
{
  name: 'participants',
  type: 'relationship',
  relationTo: 'users',
  hasMany: true,
  required: true,
  admin: {
    description: 'Users in this chat (2 for direct, 2+ for group)',
  },
},
{
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    readOnly: true,
    description: 'User who created the chat',
  },
},
{
  name: 'lastMessageAt',
  type: 'date',
  admin: {
    readOnly: true,
    description: 'Timestamp of most recent message',
  },
},
{
  name: 'lastMessagePreview',
  type: 'text',
  admin: {
    readOnly: true,
    description: 'Truncated preview of last message',
  },
},
{
  name: 'isArchived',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Soft delete/archived flag',
  },
},
{
  name: 'metadata',
  type: 'json',
  admin: {
    description: 'Additional context (courseId, contextType, etc.)',
  },
}
```

**Indexes**:
- `participants` (for querying user's chats)
- `lastMessageAt` (for sorting conversations)
- `type` + `participants` (for finding existing direct chats)

**Access Control**:
- Read: Only participants can read
- Create: Any authenticated user
- Update: Only participants
- Delete: Admin only (soft delete preferred)

---

#### B. `chat-messages` Collection
**File**: `apps/cms/src/collections/ChatMessages.ts`

**Purpose**: Individual messages within chats

**Fields**:
```typescript
{
  name: 'chat',
  type: 'relationship',
  relationTo: 'chats',
  required: true,
  index: true,
},
{
  name: 'sender',
  type: 'relationship',
  relationTo: 'users',
  required: true,
},
{
  name: 'content',
  type: 'richText',
  required: true,
},
{
  name: 'contentType',
  type: 'select',
  options: [
    { label: 'Text', value: 'text' },
    { label: 'Image', value: 'image' },
    { label: 'File', value: 'file' },
    { label: 'System', value: 'system' }, // For join/leave notifications
  ],
  defaultValue: 'text',
},
{
  name: 'attachments',
  type: 'relationship',
  relationTo: 'media',
  hasMany: true,
},
{
  name: 'replyTo',
  type: 'relationship',
  relationTo: 'chat-messages',
  admin: {
    description: 'Message this is replying to',
  },
},
{
  name: 'editedAt',
  type: 'date',
  admin: {
    readOnly: true,
  },
},
{
  name: 'isDeleted',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Soft delete for message removal',
  },
},
{
  name: 'reactions',
  type: 'array',
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'emoji',
      type: 'text',
      required: true,
    },
    {
      name: 'createdAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
```

**Indexes**:
- `chat` + `createdAt` (for message history pagination)
- `sender` (for moderation/admin purposes)

**Access Control** (learn from SupportTicketMessages):
- Read: Only chat participants
- Create: Only chat participants
- Update: Sender only (for editing), within time window
- Delete: Sender (soft delete) or Admin (hard delete)

**Hooks**:
```typescript
// After create: Update parent chat's lastMessageAt and preview
afterChange: [
  async ({ doc, req, operation }) => {
    if (operation === 'create' && doc.chat) {
      await req.payload.update({
        collection: 'chats',
        id: doc.chat,
        data: {
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: doc.content?.substring(0, 100) || '',
        },
      });
    }
  },
],
```

---

#### C. `chat-message-status` Collection
**File**: `apps/cms/src/collections/ChatMessageStatus.ts`

**Purpose**: Track read/delivered status per user per message

**Fields**:
```typescript
{
  name: 'message',
  type: 'relationship',
  relationTo: 'chat-messages',
  required: true,
  index: true,
},
{
  name: 'user',
  type: 'relationship',
  relationTo: 'users',
  required: true,
  index: true,
},
{
  name: 'status',
  type: 'select',
  options: [
    { label: 'Delivered', value: 'delivered' },
    { label: 'Read', value: 'read' },
  ],
  defaultValue: 'delivered',
  required: true,
},
{
  name: 'deliveredAt',
  type: 'date',
  defaultValue: () => new Date().toISOString(),
},
{
  name: 'readAt',
  type: 'date',
}
```

**Unique Constraint**: `message` + `user` combination (one status per user per message)

**Access Control**:
- Read: Own status records only (or admin)
- Create/Update: System only (via hooks/endpoints)

---

#### D. `chat-typing-status` Collection (Optional/Real-time)
**File**: `apps/cms/src/collections/ChatTypingStatus.ts`

**Purpose**: Track who is currently typing (short-lived records)

**Fields**:
```typescript
{
  name: 'chat',
  type: 'relationship',
  relationTo: 'chats',
  required: true,
  index: true,
},
{
  name: 'user',
  type: 'relationship',
  relationTo: 'users',
  required: true,
},
{
  name: 'isTyping',
  type: 'checkbox',
  defaultValue: true,
},
{
  name: 'updatedAt',
  type: 'date',
  defaultValue: () => new Date().toISOString(),
}
```

**Note**: This is primarily for Supabase Realtime; records expire after inactivity.

---

### 1.2 Schema Relationships Diagram

```
users (central identity)
  │
  ├──► chats.participants (many-to-many via relationship)
  │
  ├──► chat-messages.sender (many-to-one)
  │
  ├──► chat-message-status.user (many-to-one)
  │
  └──► chat-typing-status.user (many-to-one)

chats (conversation container)
  │
  ├──► chat-messages.chat (one-to-many)
  │
  ├──► chat-typing-status.chat (one-to-many)
  │
  └── metadata JSON for context linking

chat-messages (individual messages)
  │
  ├──► chat-message-status.message (one-to-many)
  │
  ├──► media (attachments)
  │
  └── replyTo (self-referential for threads)
```

---

### 1.3 PayloadCMS Configuration Updates

**File**: `apps/cms/src/payload.config.ts`

Add to collections array:
```typescript
collections: [
  // ... existing collections
  
  // Chat System
  Chats,
  ChatMessages,
  ChatMessageStatus,
  ChatTypingStatus, // Optional
],
```

---

### 1.4 Migration Strategy

**File**: `apps/cms/src/migrations/YYYYMMDD_create_chat_system.ts`

Use Payload's migration system:
```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Chats table
    CREATE TABLE "chats" (
      "id" serial PRIMARY KEY NOT NULL,
      "type" varchar DEFAULT 'direct' NOT NULL,
      "title" varchar,
      "created_by_id" integer,
      "last_message_at" timestamp(3) with time zone,
      "last_message_preview" varchar,
      "is_archived" boolean DEFAULT false,
      "metadata" jsonb,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Chat participants (junction table for many-to-many)
    CREATE TABLE "chats_participants" (
      "_parent_id" integer NOT NULL,
      "user_id" integer NOT NULL
    );

    -- Chat messages
    CREATE TABLE "chat_messages" (
      "id" serial PRIMARY KEY NOT NULL,
      "chat_id" integer NOT NULL,
      "sender_id" integer NOT NULL,
      "content" jsonb NOT NULL,
      "content_type" varchar DEFAULT 'text' NOT NULL,
      "reply_to_id" integer,
      "edited_at" timestamp(3) with time zone,
      "is_deleted" boolean DEFAULT false,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Chat message status
    CREATE TABLE "chat_message_status" (
      "id" serial PRIMARY KEY NOT NULL,
      "message_id" integer NOT NULL,
      "user_id" integer NOT NULL,
      "status" varchar DEFAULT 'delivered' NOT NULL,
      "delivered_at" timestamp(3) with time zone DEFAULT now(),
      "read_at" timestamp(3) with time zone,
      UNIQUE("message_id", "user_id")
    );

    -- Indexes
    CREATE INDEX "chats_participants_parent_idx" ON "chats_participants" ("_parent_id");
    CREATE INDEX "chats_participants_user_idx" ON "chats_participants" ("user_id");
    CREATE INDEX "chats_last_message_at_idx" ON "chats" ("last_message_at");
    CREATE INDEX "chat_messages_chat_created_idx" ON "chat_messages" ("chat_id", "created_at");
    CREATE INDEX "chat_message_status_message_idx" ON "chat_message_status" ("message_id");
    CREATE INDEX "chat_message_status_user_idx" ON "chat_message_status" ("user_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "chat_message_status" CASCADE;
    DROP TABLE IF EXISTS "chat_messages" CASCADE;
    DROP TABLE IF EXISTS "chats_participants" CASCADE;
    DROP TABLE IF EXISTS "chats" CASCADE;
  `);
}
```

---

### 1.5 Supabase Real-time Setup

After migration, enable real-time for these tables in Supabase Dashboard or via SQL:

```sql
-- Enable realtime for chat tables
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_typing_status;

-- For chat_message_status, consider if needed or handle via API polling
```

---

### 1.6 File Structure

```
apps/cms/src/
├── collections/
│   ├── Chats.ts
│   ├── ChatMessages.ts
│   ├── ChatMessageStatus.ts
│   └── ChatTypingStatus.ts
├── migrations/
│   └── YYYYMMDD_create_chat_system.ts
└── payload.config.ts (updated)
```

---

### 1.7 Implementation Checklist

- [ ] Create `Chats.ts` collection with proper access control
- [ ] Create `ChatMessages.ts` collection with hooks
- [ ] Create `ChatMessageStatus.ts` collection
- [ ] Create `ChatTypingStatus.ts` collection (optional)
- [ ] Update `payload.config.ts` to include new collections
- [ ] Generate and run migration
- [ ] Enable Supabase Realtime for chat tables
- [ ] Test access control rules
- [ ] Verify indexes are created for performance

---

## Phase 2: Shared Chat Engine (Logic Package)

### 2.1 Overview

The Shared Chat Engine is a reusable logic package that provides role-agnostic chat functionality. It abstracts all chat business logic so it can be consumed by any frontend app (trainee, instructor, admin) without duplication.

**Package Location**: `packages/chat-engine` (new package in monorepo)

### 2.2 Package Structure

```
packages/chat-engine/
├── src/
│   ├── index.ts                    # Main exports
│   ├── types/
│   │   ├── chat.ts                 # Chat-related types
│   │   ├── message.ts              # Message-related types
│   │   └── realtime.ts             # Supabase realtime types
│   ├── validation/
│   │   ├── messageValidator.ts     # Message content validation
│   │   └── chatRules.ts            # Chat business rules
│   ├── formatting/
│   │   ├── messageFormatter.ts     # Format messages for display
│   │   └── previewGenerator.ts     # Generate message previews
│   ├── supabase/
│   │   ├── client.ts               # Supabase client setup
│   │   ├── channels.ts             # Realtime channel management
│   │   └── subscriptions.ts          # Subscribe/unsubscribe helpers
│   └── pagination/
│       └── messagePagination.ts     # Cursor-based pagination
├── package.json
└── tsconfig.json
```

### 2.3 Core Components

#### A. Types (`src/types/`)

**chat.ts**:
```typescript
export interface Chat {
  id: number
  type: 'direct' | 'group'
  title?: string
  participants: User[]
  createdBy: User
  lastMessageAt?: string
  lastMessagePreview?: string
  isArchived: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateChatInput {
  type: 'direct' | 'group'
  title?: string
  participantIds: number[]
  metadata?: Record<string, any>
}

export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'instructor' | 'trainee' | 'service'
}
```

**message.ts**:
```typescript
export interface ChatMessage {
  id: number
  chatId: number
  sender: User
  content: any // RichText JSON
  contentType: 'text' | 'image' | 'file' | 'system'
  attachments?: Media[]
  replyTo?: ChatMessage
  editedAt?: string
  isDeleted: boolean
  reactions: MessageReaction[]
  createdAt: string
  updatedAt: string
}

export interface MessageReaction {
  userId: number
  emoji: string
  createdAt: string
}

export interface CreateMessageInput {
  chatId: number
  content: any
  contentType?: 'text' | 'image' | 'file' | 'system'
  attachmentIds?: number[]
  replyToId?: number
}

export interface MessageStatus {
  messageId: number
  userId: number
  status: 'delivered' | 'read'
  deliveredAt: string
  readAt?: string
}
```

**realtime.ts**:
```typescript
export interface RealtimeConfig {
  supabaseUrl: string
  supabaseKey: string
}

export interface ChatChannel {
  chatId: number
  channel: any // Supabase RealtimeChannel
}

export type ChatEventType = 
  | 'message_insert'
  | 'message_update'
  | 'message_delete'
  | 'typing_start'
  | 'typing_stop'
  | 'reaction_add'
  | 'reaction_remove'
  | 'status_change'

export interface ChatEvent {
  type: ChatEventType
  payload: any
  timestamp: string
}
```

#### B. Validation (`src/validation/`)

**messageValidator.ts**:
```typescript
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export const validateMessageContent = (
  content: any,
  maxLength?: number
): ValidationResult => {
  const errors: string[] = []
  
  // Check content exists
  if (!content) {
    errors.push('Content is required')
  }
  
  // Check content type (rich text or string)
  if (typeof content === 'string') {
    if (content.trim().length === 0) {
      errors.push('Content cannot be empty')
    }
    if (maxLength && content.length > maxLength) {
      errors.push(`Content exceeds maximum length of ${maxLength} characters`)
    }
  }
  
  // TODO: Add prohibited content filtering
  // TODO: Add attachment validation
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

export const validateChatParticipants = (
  participantIds: number[],
  chatType: 'direct' | 'group'
): ValidationResult => {
  const errors: string[] = []
  
  if (!participantIds || participantIds.length === 0) {
    errors.push('At least one participant is required')
  }
  
  if (chatType === 'direct' && participantIds.length !== 2) {
    errors.push('Direct chats must have exactly 2 participants')
  }
  
  if (chatType === 'group' && participantIds.length < 2) {
    errors.push('Group chats must have at least 2 participants')
  }
  
  // Check for duplicates
  const uniqueIds = new Set(participantIds)
  if (uniqueIds.size !== participantIds.length) {
    errors.push('Duplicate participants are not allowed')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
```

**chatRules.ts**:
```typescript
export interface ChatRules {
  maxParticipants: number
  maxMessageLength: number
  allowReactions: boolean
  allowReplies: boolean
  allowEditDuration: number // minutes
  ephemeralDuration?: number // minutes, undefined = permanent
}

export const DEFAULT_CHAT_RULES: ChatRules = {
  maxParticipants: 50,
  maxMessageLength: 4000,
  allowReactions: true,
  allowReplies: true,
  allowEditDuration: 15, // Can edit for 15 minutes
}

export const DIRECT_CHAT_RULES: ChatRules = {
  ...DEFAULT_CHAT_RULES,
  maxParticipants: 2,
}

export const canEditMessage = (
  message: { senderId: number; createdAt: string; editedAt?: string },
  currentUserId: number,
  rules: ChatRules
): boolean => {
  // Only sender can edit
  if (message.senderId !== currentUserId) return false
  
  // Check edit window
  const createdAt = new Date(message.createdAt)
  const now = new Date()
  const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60
  
  return diffMinutes <= rules.allowEditDuration
}

export const canDeleteMessage = (
  message: { senderId: number },
  currentUserId: number,
  currentUserRole: string
): boolean => {
  // Sender can delete their own messages
  if (message.senderId === currentUserId) return true
  
  // Admins can delete any message
  if (currentUserRole === 'admin') return true
  
  return false
}
```

#### C. Formatting (`src/formatting/`)

**messageFormatter.ts**:
```typescript
export interface FormattedMessage {
  id: number
  text: string // Plain text extracted from rich content
  html?: string // Optional HTML rendering
  sender: {
    id: number
    name: string
    avatar?: string
  }
  timestamp: string
  isEdited: boolean
  isDeleted: boolean
  replyTo?: FormattedMessage
  reactions: Array<{
    emoji: string
    count: number
    userReacted: boolean
  }>
}

export const formatMessage = (
  message: any,
  currentUserId: number
): FormattedMessage => {
  // Extract plain text from rich content
  const text = extractTextFromRichContent(message.content)
  
  // Format sender name
  const senderName = message.sender?.firstName && message.sender?.lastName
    ? `${message.sender.firstName} ${message.sender.lastName}`
    : message.sender?.email || 'Unknown'
  
  // Aggregate reactions
  const reactionMap = new Map<string, { count: number; userReacted: boolean }>()
  if (message.reactions) {
    for (const reaction of message.reactions) {
      const existing = reactionMap.get(reaction.emoji)
      if (existing) {
        existing.count++
        if (reaction.user.id === currentUserId) {
          existing.userReacted = true
        }
      } else {
        reactionMap.set(reaction.emoji, {
          count: 1,
          userReacted: reaction.user.id === currentUserId,
        })
      }
    }
  }
  
  return {
    id: message.id,
    text: message.isDeleted ? '[Message deleted]' : text,
    sender: {
      id: message.sender.id,
      name: senderName,
      avatar: message.sender.profilePicture?.url,
    },
    timestamp: message.createdAt,
    isEdited: !!message.editedAt,
    isDeleted: message.isDeleted,
    replyTo: message.replyTo ? formatMessage(message.replyTo, currentUserId) : undefined,
    reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userReacted: data.userReacted,
    })),
  }
}

const extractTextFromRichContent = (content: any): string => {
  if (typeof content === 'string') return content
  
  // Handle Lexical editor JSON structure
  if (content?.root?.children) {
    return content.root.children
      .map((child: any) => child.text || '')
      .join(' ')
      .trim()
  }
  
  return ''
}
```

**previewGenerator.ts**:
```typescript
export const generateChatPreview = (
  lastMessage: any,
  maxLength: number = 50
): string => {
  if (!lastMessage) return 'No messages yet'
  
  if (lastMessage.isDeleted) return 'Message deleted'
  
  const text = extractTextFromRichContent(lastMessage.content)
  
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Today - show time only
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
```

#### D. Supabase Realtime (`src/supabase/`)

**client.ts**:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { RealtimeConfig } from '../types/realtime'

export const createSupabaseClient = (config: RealtimeConfig) => {
  return createClient(config.supabaseUrl, config.supabaseKey)
}
```

**channels.ts**:
```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChatChannel, ChatEvent, ChatEventType } from '../types/realtime'

export class ChatChannelManager {
  private channels: Map<number, any> = new Map()
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  subscribeToChat(
    chatId: number,
    onEvent: (event: ChatEvent) => void
  ): () => void {
    // Check if already subscribed
    if (this.channels.has(chatId)) {
      console.warn(`Already subscribed to chat ${chatId}`)
      return () => this.unsubscribeFromChat(chatId)
    }

    const channel = this.supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          onEvent({
            type: 'message_insert',
            payload: payload.new,
            timestamp: new Date().toISOString(),
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          onEvent({
            type: 'message_update',
            payload: payload.new,
            timestamp: new Date().toISOString(),
          })
        }
      )
      .subscribe()

    this.channels.set(chatId, channel)

    return () => this.unsubscribeFromChat(chatId)
  }

  unsubscribeFromChat(chatId: number): void {
    const channel = this.channels.get(chatId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(chatId)
    }
  }

  unsubscribeFromAll(): void {
    for (const [chatId] of this.channels) {
      this.unsubscribeFromChat(chatId)
    }
  }

  // Typing indicators
  async sendTypingStatus(chatId: number, userId: number, isTyping: boolean): Promise<void> {
    await this.supabase.from('chat_typing_status').upsert({
      chat_id: chatId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    })
  }

  subscribeToTypingStatus(
    chatId: number,
    onTypingChange: (userId: number, isTyping: boolean) => void
  ): () => void {
    const channel = this.supabase
      .channel(`typing:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_status',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.new) {
            onTypingChange(payload.new.user_id, payload.new.is_typing)
          }
        }
      )
      .subscribe()

    return () => this.supabase.removeChannel(channel)
  }
}
```

#### E. Pagination (`src/pagination/`)

**messagePagination.ts**:
```typescript
export interface PaginationCursor {
  messageId: number
  createdAt: string
}

export interface PaginatedMessages {
  messages: any[]
  nextCursor?: PaginationCursor
  hasMore: boolean
}

export interface PaginationOptions {
  limit: number
  cursor?: PaginationCursor
  direction: 'newer' | 'older'
}

export const DEFAULT_PAGE_SIZE = 20

export const buildPaginationQuery = (
  chatId: number,
  options: PaginationOptions
) => {
  const { limit, cursor, direction } = options
  
  let query = {
    chat_id: chatId,
  }
  
  if (cursor) {
    if (direction === 'older') {
      // Get messages older than cursor
      query = {
        ...query,
        created_at: { lt: cursor.createdAt },
      }
    } else {
      // Get messages newer than cursor
      query = {
        ...query,
        created_at: { gt: cursor.createdAt },
      }
    }
  }
  
  return {
    query,
    limit: limit + 1, // Fetch one extra to check if there are more
    orderBy: { column: 'created_at', direction: direction === 'older' ? 'desc' : 'asc' },
  }
}

export const processPaginatedResults = (
  messages: any[],
  limit: number
): PaginatedMessages => {
  const hasMore = messages.length > limit
  
  if (hasMore) {
    messages.pop() // Remove the extra message
  }
  
  const lastMessage = messages[messages.length - 1]
  
  return {
    messages,
    nextCursor: hasMore && lastMessage ? {
      messageId: lastMessage.id,
      createdAt: lastMessage.created_at,
    } : undefined,
    hasMore,
  }
}
```

### 2.4 Package Configuration

**package.json**:
```json
{
  "name": "@grandline/chat-engine",
  "version": "1.0.0",
  "description": "Shared chat engine for Grandline LMS",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.5 Usage Examples

```typescript
// In any frontend app (trainee, instructor, admin)
import { 
  ChatChannelManager, 
  validateMessageContent,
  formatMessage,
  createSupabaseClient 
} from '@grandline/chat-engine'

// Initialize
const supabase = createSupabaseClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
})

const chatManager = new ChatChannelManager(supabase)

// Subscribe to chat
const unsubscribe = chatManager.subscribeToChat(123, (event) => {
  switch (event.type) {
    case 'message_insert':
      const formatted = formatMessage(event.payload, currentUser.id)
      addMessageToUI(formatted)
      break
    case 'message_update':
      updateMessageInUI(event.payload)
      break
  }
})

// Send message
const validation = validateMessageContent(messageText)
if (validation.valid) {
  await api.post('/chats/123/messages', { content: messageText })
}

// Cleanup
unsubscribe()
```

### 2.6 Implementation Checklist

- [ ] Create `packages/chat-engine` directory structure
- [ ] Define all TypeScript types
- [ ] Implement message validation logic
- [ ] Implement chat business rules
- [ ] Create message formatting utilities
- [ ] Set up Supabase client configuration
- [ ] Implement realtime channel management
- [ ] Add typing indicator support
- [ ] Implement cursor-based pagination
- [ ] Add package.json and tsconfig.json
- [ ] Build and verify no TypeScript errors
- [ ] Test package exports

---

## Next Phase Preview

---

## Phase 3: Backend API Endpoints

### 3.1 Overview

Phase 3 implements REST API endpoints in the CMS (Payload) to handle chat operations. These endpoints serve as the bridge between the frontend apps and the database, enforcing business rules through the chat-engine validation layer.

**Architecture:**
- **Location**: `apps/cms/src/app/api/chat/` (Next.js App Router)
- **Pattern**: RESTful endpoints with role-based access control
- **Validation**: Uses `@grandline/chat-engine` validation functions
- **Response Format**: Standardized JSON with cursor-based pagination support

### 3.2 API Endpoint Structure

```
apps/cms/src/app/api/chat/
├── route.ts                    # GET /api/chat - List user's chats
├── [id]/
│   ├── route.ts               # GET /api/chat/:id - Get chat details
│   ├── messages/
│   │   └── route.ts           # GET/POST /api/chat/:id/messages
│   │   └── [messageId]/
│   │       └── route.ts       # PATCH/DELETE /api/chat/:id/messages/:messageId
│   ├── participants/
│   │   └── route.ts           # GET/POST /api/chat/:id/participants
│   ├── typing/
│   │   └── route.ts           # POST /api/chat/:id/typing
│   └── read/
│       └── route.ts           # POST /api/chat/:id/read
└── webhooks/
    └── supabase/
        └── route.ts           # POST /api/chat/webhooks/supabase
```

### 3.3 Core Endpoints Implementation

#### 3.3.1 List Chats (GET /api/chat)

**Purpose**: Returns paginated list of chats for the authenticated user

**Query Parameters:**
- `status`: 'active' | 'archived' | 'all' (default: 'active')
- `type`: ChatType filter (optional)
- `cursor`: Pagination cursor (optional)
- `limit`: Number of results (default: 20, max: 50)

**Response:**
```typescript
{
  data: ChatListItem[],
  nextCursor: string | null,
  hasMore: boolean
}
```

**Implementation:**
```typescript
// apps/cms/src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { formatChatListItem } from '@grandline/chat-engine'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })
  const user = await payload.auth({ headers: req.headers })
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'active'
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  // Query chats where user is participant
  const chats = await payload.find({
    collection: 'chats',
    where: {
      status: { equals: status === 'all' ? undefined : status },
      'participants.users_id': { contains: user.id }
    },
    depth: 2,
    limit,
    ...(cursor && { cursor })
  })

  const formatted = chats.docs.map(chat => 
    formatChatListItem(chat, user.id)
  )

  return NextResponse.json({
    data: formatted,
    nextCursor: chats.nextPage,
    hasMore: chats.hasNextPage
  })
}
```

#### 3.3.2 Get Chat Details (GET /api/chat/:id)

**Purpose**: Returns full chat with participant details

**Response:**
```typescript
{
  id: number,
  type: ChatType,
  title: string,
  status: string,
  participants: ChatUser[],
  createdAt: string,
  lastMessage?: ChatMessage
}
```

#### 3.3.3 List Messages (GET /api/chat/:id/messages)

**Purpose**: Returns paginated messages with cursor-based pagination

**Query Parameters:**
- `cursor`: Message cursor for pagination
- `limit`: Results per page (default: 50)
- `direction`: 'forward' | 'backward' (default: 'backward' - newer first)

**Implementation:**
```typescript
// apps/cms/src/app/api/chat/[id]/messages/route.ts
import { paginateMessages, buildPaginationQuery } from '@grandline/chat-engine'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const chatId = parseInt(params.id)
  const { searchParams } = new URL(req.url)
  
  const paginationOptions = {
    cursor: searchParams.get('cursor'),
    limit: parseInt(searchParams.get('limit') || '50'),
    direction: (searchParams.get('direction') || 'backward') as 'forward' | 'backward'
  }

  const messages = await payload.find({
    collection: 'chat-messages',
    where: { chat_id: { equals: chatId } },
    sort: '-createdAt',
    depth: 1
  })

  const paginated = paginateMessages(messages.docs, paginationOptions)

  return NextResponse.json({
    data: paginated.data,
    nextCursor: paginated.nextCursor,
    prevCursor: paginated.prevCursor,
    hasMore: paginated.hasMore
  })
}
```

#### 3.3.4 Send Message (POST /api/chat/:id/messages)

**Purpose**: Creates a new message with validation

**Request Body:**
```typescript
{
  content: string,
  type: 'text' | 'image' | 'file',
  replyToMessageId?: number,
  attachments?: string[]
}
```

**Validation Flow:**
1. Check user is chat participant (`canSendToChat`)
2. Validate message content (`validateMessageContent`)
3. Validate reply chain if applicable (`validateReplyChain`)
4. Create message via Payload
5. Trigger Supabase realtime update (automatic via DB)

**Implementation:**
```typescript
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const chatId = parseInt(params.id)
  const payload = await getPayload({ config })
  const user = await payload.auth({ headers: req.headers })
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get chat and validate participation
  const chat = await payload.findByID({ collection: 'chats', id: chatId })
  const participantCheck = canSendToChat(user.id, chat)
  if (!participantCheck.valid) {
    return NextResponse.json({ error: participantCheck.error }, { status: 403 })
  }

  const body = await req.json()
  
  // Validate message
  const validation = validateNewMessage(body)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error, code: validation.code }, { status: 400 })
  }

  // Create message
  const message = await payload.create({
    collection: 'chat-messages',
    data: {
      chat: chatId,
      sender: user.id,
      content: body.content,
      type: body.type || 'text',
      replyToMessage: body.replyToMessageId || null,
      attachments: body.attachments || [],
      isEdited: false
    }
  })

  // Create read status for sender
  await payload.create({
    collection: 'chat-message-status',
    data: {
      message: message.id,
      user: user.id,
      status: 'read',
      timestamp: new Date().toISOString()
    }
  })

  return NextResponse.json({ data: message }, { status: 201 })
}
```

#### 3.3.5 Edit Message (PATCH /api/chat/:id/messages/:messageId)

**Purpose**: Edits existing message within time window

**Request Body:**
```typescript
{
  content: string
}
```

**Validation:**
- Must be message sender (`canEditMessage`)
- Within edit time window (default: 30 minutes)
- Content validation

#### 3.3.6 Delete Message (DELETE /api/chat/:id/messages/:messageId)

**Purpose**: Soft or hard delete based on role

**Validation:**
- Sender can delete within time window
- Admins/instructors can delete any message

### 3.4 Read Status Endpoints

#### 3.4.1 Mark Messages as Read (POST /api/chat/:id/read)

**Purpose**: Marks all messages in chat as read for current user

**Implementation:**
```typescript
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const chatId = parseInt(params.id)
  const user = await payload.auth({ headers: req.headers })
  
  // Get unread messages
  const messages = await payload.find({
    collection: 'chat-messages',
    where: {
      chat_id: { equals: chatId },
      sender_id: { not_equals: user.id } // Not sent by current user
    }
  })

  // Create read status for each
  for (const message of messages.docs) {
    await payload.create({
      collection: 'chat-message-status',
      data: {
        message: message.id,
        user: user.id,
        status: 'read',
        timestamp: new Date().toISOString()
      }
    })
  }

  return NextResponse.json({ success: true, count: messages.docs.length })
}
```

### 3.5 Typing Indicator Endpoints

#### 3.5.1 Update Typing Status (POST /api/chat/:id/typing)

**Purpose**: Updates typing indicator for current user

**Request Body:**
```typescript
{
  isTyping: boolean
}
```

**Behavior:**
- Upserts typing status record
- Auto-expires after timeout (handled by frontend debouncing)
- Triggers Supabase realtime update

### 3.6 Webhook Handlers

#### 3.6.1 Supabase Realtime Webhook (POST /api/chat/webhooks/supabase)

**Purpose**: Handles Supabase database change events for server-side processing

**Use Cases:**
- Send push notifications on new messages
- Update chat search index
- Analytics/logging
- Email notifications for offline users

**Implementation:**
```typescript
// apps/cms/src/app/api/chat/webhooks/supabase/route.ts
export async function POST(req: NextRequest) {
  const payload = await req.json()
  const { type, table, record, old_record } = payload

  switch (table) {
    case 'chat_messages':
      if (type === 'INSERT') {
        await handleNewMessage(record)
      }
      break
    case 'chat_message_status':
      if (type === 'INSERT' && record.status === 'read') {
        await handleMessageRead(record)
      }
      break
  }

  return NextResponse.json({ received: true })
}

async function handleNewMessage(message: any) {
  // Send push notification to participants
  // Update unread counts
  // Log analytics
}
```

### 3.7 Middleware & Utilities

#### 3.7.1 Authentication Middleware

```typescript
// apps/cms/src/app/api/chat/_utils/auth.ts
export async function requireAuth(req: NextRequest): Promise<User | Response> {
  const payload = await getPayload({ config })
  const user = await payload.auth({ headers: req.headers })
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return user
}
```

#### 3.7.2 Error Handler

```typescript
// apps/cms/src/app/api/chat/_utils/errors.ts
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
  
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

### 3.8 API Response Types

```typescript
// apps/cms/src/app/api/chat/_types/responses.ts
export interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
  meta?: {
    cursor?: string
    hasMore?: boolean
    total?: number
  }
}

export interface MessageListResponse {
  data: FormattedMessage[]
  nextCursor: string | null
  prevCursor: string | null
  hasMore: boolean
}

export interface ChatListResponse {
  data: ChatListItem[]
  nextCursor: string | null
  hasMore: boolean
}
```

### 3.9 Implementation Checklist

- [ ] Create `apps/cms/src/app/api/chat/` directory structure
- [ ] Implement `GET /api/chat` - List chats endpoint
- [ ] Implement `GET /api/chat/:id` - Get chat details
- [ ] Implement `GET /api/chat/:id/messages` - List messages with pagination
- [ ] Implement `POST /api/chat/:id/messages` - Send message with validation
- [ ] Implement `PATCH /api/chat/:id/messages/:messageId` - Edit message
- [ ] Implement `DELETE /api/chat/:id/messages/:messageId` - Delete message
- [ ] Implement `POST /api/chat/:id/read` - Mark as read
- [ ] Implement `POST /api/chat/:id/typing` - Typing indicator
- [ ] Implement `POST /api/chat/webhooks/supabase` - Webhook handler
- [ ] Add authentication middleware
- [ ] Add error handling utilities
- [ ] Test all endpoints with different roles
- [ ] Document API with examples

---

## Next Phase Preview

**Phase 4**: Frontend Integration
- React hooks for real-time subscriptions
- Chat UI components
- Integration with trainee/instructor/admin apps

