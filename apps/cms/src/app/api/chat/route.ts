import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError } from './_utils/auth'
import type { ApiResponse, ChatListItem } from './_types/responses'
import type { Chat, User } from '@/payload-types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ChatListItem[]>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'active'
    const type = searchParams.get('type')
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Build query
    const query: any = {}

    // For direct chats, must be a participant. For group/discussion boards, make them public to all users.
    if (type === 'group') {
      query.type = { equals: 'group' }
    } else {
      query['participants'] = { equals: user.id }
      if (type) {
        query.type = { equals: type }
      }
    }

    if (status !== 'all') {
      query.status = { equals: status }
    }

    // Fetch chats
    const chatsResult = await payload.find({
      collection: 'chats',
      where: query,
      depth: 2,
      limit,
      ...(cursor && { cursor }),
      sort: '-updatedAt'
    })

    // Fetch last messages for each chat to determine status
    const formattedChats = await Promise.all(chatsResult.docs.map(async (chat: Chat) => {
      // Get the last message to find the sender
      const lastMessages = await payload.find({
        collection: 'chat-messages',
        where: {
          chat: { equals: chat.id }
        },
        limit: 1,
        sort: '-createdAt',
        depth: 0,
        overrideAccess: true
      })
      
      const lastMessageSenderId = lastMessages.docs[0]?.sender 
        ? (typeof lastMessages.docs[0].sender === 'object' ? (lastMessages.docs[0].sender as any).id : lastMessages.docs[0].sender)
        : undefined;

      // Participants in a simple hasMany relationship are plain user objects when depth >= 1
      // Handle both plain objects (simple hasMany) and polymorphic {value} objects
      const participants = (chat.participants || [])
        .map((p: any) => {
          const userObj = p && typeof p === 'object' && p.value ? p.value : p;
          return userObj && typeof userObj === 'object' ? userObj : null;
        })
        .filter((userObj: any) => userObj && userObj.id && userObj.id !== user.id)
        .map((userObj: any) => ({
          id: userObj.id,
          name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.email,
          avatar: userObj.profilePicture,
          role: userObj.role
        }))

      // Calculate unread count (simplified - would need actual implementation)
      const unreadCount = 0

      return {
        id: chat.id,
        title: chat.title || generateChatTitle(chat, user),
        type: chat.type,
        status: (chat as any).status,
        lastMessagePreview: chat.lastMessagePreview || undefined,
        lastMessageAt: chat.lastMessageAt || undefined,
        lastMessageSenderId,
        unreadCount,
        participants,
        metadata: chat.metadata,
        createdBy: chat.createdBy ? (typeof chat.createdBy === 'object' ? (chat.createdBy as any).id : chat.createdBy) : undefined,
        isActive: (chat as any).status === 'active',
        isArchived: (chat as any).isArchived || false
      }
    }))

    return NextResponse.json({
      data: formattedChats,
      meta: {
        cursor: chatsResult.nextPage ? String(chatsResult.nextPage) : null,
        hasMore: chatsResult.hasNextPage,
        total: chatsResult.totalDocs
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })

    const body = await req.json()
    const { type, participantIds, title } = body

    // Validate required fields
    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: type, participantIds' },
        { status: 400 }
      )
    }

    // Ensure current user is included
    if (!participantIds.includes(user.id)) {
      participantIds.push(user.id)
    }

    // Validate participants exist
    const users = await payload.find({
      collection: 'users',
      where: { id: { in: participantIds } }
    })

    if (users.docs.length !== participantIds.length) {
      return NextResponse.json(
        { error: 'One or more participants not found' },
        { status: 400 }
      )
    }

    // Create chat
    const chat = await payload.create({
      collection: 'chats',
      data: {
        type,
        title,
        status: 'active',
        participants: participantIds.map((id: number) => ({
          relationTo: 'users',
          value: id
        })) as any,
        createdBy: user.id
      }
    })

    return NextResponse.json({
      data: { id: chat.id, type: chat.type, status: (chat as any).status }
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

function generateChatTitle(chat: Chat, currentUser: User): string {
  const otherParticipants = (chat.participants || [])
    .map((p: any) => {
      const userObj = p && typeof p === 'object' && p.value ? p.value : p;
      return userObj && typeof userObj === 'object' ? userObj : null;
    })
    .filter((userObj: any) => userObj && userObj.id && userObj.id !== currentUser.id)
    .map((userObj: any) => `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.email)

  if (otherParticipants.length === 1) {
    return otherParticipants[0]
  } else if (otherParticipants.length > 1) {
    return `${otherParticipants[0]} and ${otherParticipants.length - 1} others`
  }

  return 'Chat'
}
