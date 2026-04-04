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
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Build query
    const query: any = {
      'participants.value': { equals: user.id }
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

    // Format response
    const formattedChats: ChatListItem[] = chatsResult.docs.map((chat: Chat) => {
      const participants = (chat.participants || [])
        .filter((p: any) => p.value && p.value.id !== user.id)
        .map((p: any) => ({
          id: p.value.id,
          name: `${p.value.firstName || ''} ${p.value.lastName || ''}`.trim() || p.value.email,
          avatar: p.value.profilePicture,
          role: p.value.role
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
        unreadCount,
        participants,
        isActive: (chat as any).status === 'active'
      }
    })

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
    .filter((p: any) => p.value && p.value.id !== currentUser.id)
    .map((p: any) => `${p.value.firstName || ''} ${p.value.lastName || ''}`.trim() || p.value.email)

  if (otherParticipants.length === 1) {
    return otherParticipants[0]
  } else if (otherParticipants.length > 1) {
    return `${otherParticipants[0]} and ${otherParticipants.length - 1} others`
  }

  return 'Chat'
}
