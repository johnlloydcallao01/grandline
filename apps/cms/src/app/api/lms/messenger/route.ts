import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../chat/_utils/auth'
import { getCmsApiBaseUrl } from '../../../../utils/cms-url'

// ============================================================================
// GET /api/lms/messenger
// Returns conversations with real unread counts + user directory
// ============================================================================

interface ParticipantInfo {
  id: number
  name: string
  avatar: string | null
  online: boolean
  role: string
}

interface ConversationItem {
  id: number
  title: string
  type: string
  status: string
  lastMessagePreview?: string
  lastMessageAt?: string
  unreadCount: number
  participants: ParticipantInfo[]
  isActive: boolean
  isArchived: boolean
  lastMessageSenderId?: number
  createdBy?: number
}

interface UserDirectoryItem {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  profilePicture?: any
  isActive: boolean
}

function extractTextFromContent(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (typeof content === 'object' && content !== null) {
    const extract = (node: any): string => {
      if (!node) return ''
      if (typeof node === 'string') return node
      if (typeof node.text === 'string') return node.text
      if (Array.isArray(node.children)) {
        return node.children.map(extract).filter(Boolean).join(' ')
      }
      if (node.root) return extract(node.root)
      return ''
    }
    try {
      return extract(content).replace(/\s+/g, ' ').trim()
    } catch {
      return ''
    }
  }
  return ''
}

function resolveAvatar(profilePicture: any, requestUrl?: string): string | null {
  if (!profilePicture) return null
  if (typeof profilePicture === 'string') return profilePicture
  if (typeof profilePicture === 'object') {
    const raw =
      profilePicture.cloudinaryURL ||
      profilePicture.url ||
      profilePicture.secure_url ||
      null
    if (!raw) return null
    if (typeof raw !== 'string') return null
    if (raw.startsWith('http')) return raw.replace(/[`'"]/g, '')
    const baseUrl = getCmsApiBaseUrl(requestUrl).replace(/\/api$/, '')
    return `${baseUrl}${raw}`
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const userId = String(user.id)

    // ─── 1. Fetch user's messenger conversations (dedicated 1:1 messenger type only) ───
    // ALL users (including admins) only see conversations they participate in.
    // Messenger is private between the two chatters — never leak to others.
    const chatsResult = await payload.find({
      collection: 'chats',
      where: {
        and: [
          { type: { equals: 'messenger' } },
          { status: { equals: 'active' } },
          { participants: { equals: userId } },
        ],
      },
      depth: 2,
      limit,
      sort: '-lastMessageAt',
      overrideAccess: true,
    })

    const chatIds = chatsResult.docs.map((c: any) => c.id)

    // ─── 2. Batch fetch all messages across all chats (to know which have any) ───
    const chatsWithMessages = new Set<number>()
    let otherMessagesByChat = new Map<number, number[]>()
    if (chatIds.length > 0) {
      const allMessages = await payload.find({
        collection: 'chat-messages',
        where: { chat: { in: chatIds } },
        select: { id: true, chat: true, sender: true },
        limit: 10000,
        overrideAccess: true,
      })

      for (const msg of allMessages.docs) {
        const chatId = typeof msg.chat === 'object' ? (msg.chat as any).id : msg.chat
        chatsWithMessages.add(chatId)
        if (String(msg.sender) !== String(userId)) {
          if (!otherMessagesByChat.has(chatId)) otherMessagesByChat.set(chatId, [])
          otherMessagesByChat.get(chatId)!.push(msg.id)
        }
      }
    }

    // Filter out chats with no messages (Facebook-style: only show conversations that have messages)
    const chatsWithMsgs = chatsResult.docs.filter((c: any) => chatsWithMessages.has(c.id))

    // ─── 3. Batch fetch read statuses ───
    const readMessageIds = new Set<number>()
    const allOtherIds = Array.from(otherMessagesByChat.values()).flat()
    if (allOtherIds.length > 0) {
      const readStatuses = await payload.find({
        collection: 'chat-message-status',
        where: {
          and: [
            { message: { in: allOtherIds } },
            { user: { equals: userId } },
            { status: { equals: 'read' } },
          ],
        },
        select: { message: true },
        limit: 5000,
        overrideAccess: true,
      })

      for (const s of readStatuses.docs) {
        const msgId = typeof s.message === 'object' ? (s.message as any).id : s.message
        readMessageIds.add(msgId)
      }
    }

    // ─── 4. Compute unread per chat ───
    const unreadByChat = new Map<number, number>()
    for (const [chatId, msgIds] of otherMessagesByChat) {
      const readCount = msgIds.filter((id) => readMessageIds.has(id)).length
      unreadByChat.set(chatId, msgIds.length - readCount)
    }

    // ─── 5. Format conversations ───
    const conversations: ConversationItem[] = await Promise.all(
      chatsWithMsgs.map(async (chat: any) => {
        // Resolve participants
        const participantsRaw = Array.isArray(chat.participants) ? chat.participants : []
        const participants: ParticipantInfo[] = participantsRaw
          .map((p: any) => {
            const userObj = p && typeof p === 'object' && p.value ? p.value : p
            return userObj && typeof userObj === 'object' && userObj.id ? userObj : null
          })
          .filter((u: any) => u && String(u.id) !== userId)
          .map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
            avatar: resolveAvatar(u.profilePicture, request.url),
            online: false,
            role: u.role || 'trainee',
          }))

        const displayName =
          participants.length > 0
            ? participants[0].name
            : chat.title || 'Chat'

        // Get last message
        const lastMsgs = await payload.find({
          collection: 'chat-messages',
          where: { chat: { equals: chat.id } },
          limit: 1,
          sort: '-createdAt',
          depth: 1,
          overrideAccess: true,
        })
        const lastMsg = lastMsgs.docs[0]
        const lastMessageText = lastMsg
          ? extractTextFromContent(lastMsg.content) || ((lastMsg as any).contentType === 'image' ? '[Image]' : (lastMsg as any).contentType === 'file' ? '[File]' : '[Message]')
          : chat.lastMessagePreview || ''
        const lastMessageTime = lastMsg?.createdAt || chat.lastMessageAt || ''

        return {
          id: chat.id,
          title: displayName,
          type: chat.type || 'direct',
          status: chat.status || 'active',
          lastMessagePreview: lastMessageText.substring(0, 80),
          lastMessageAt: lastMessageTime,
          unreadCount: unreadByChat.get(chat.id) || 0,
          participants,
          isActive: (chat.status || 'active') === 'active',
          isArchived: (chat as any).isArchived || false,
          lastMessageSenderId: lastMsg?.sender
            ? (typeof lastMsg.sender === 'object' ? (lastMsg.sender as any).id : lastMsg.sender)
            : undefined,
          createdBy: chat.createdBy ? (typeof chat.createdBy === 'object' ? (chat.createdBy as any).id : chat.createdBy) : undefined,
        }
      })
    )

    // Sort: unread first, then by lastMessageAt
    conversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1
      return (b.lastMessageAt || '').localeCompare(a.lastMessageAt || '')
    })

    // ─── 6. Fetch user directory (for carousel / new chat) ───
    const usersResult = await payload.find({
      collection: 'users',
      limit: 200,
      depth: 1,
      overrideAccess: true,
      ...(search && {
        where: {
          or: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
          ],
        },
      }),
    })

    const users: UserDirectoryItem[] = usersResult.docs
      .filter((u: any) => String(u.id) !== userId)
      .map((u: any) => ({
        id: u.id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        role: u.role || 'trainee',
        profilePicture: resolveAvatar(u.profilePicture, request.url),
        isActive: true,
      }))

    return NextResponse.json({
      data: { conversations, users },
    })
  } catch (error: any) {
    console.error('[LMS Messenger] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    )
  }
}
