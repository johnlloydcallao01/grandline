import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError, ApiError } from '@/app/api/chat/_utils/auth'
import type { ApiResponse, MessageListResponse, MessageResponse, SendMessageRequest } from '@/app/api/chat/_types/responses'
import type { Chat, ChatMessage } from '@/payload-types'
import { canSendToChat, validateNewMessage } from '@grandline/chat-engine'

export async function GET(
  req: NextRequest,
  props: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<MessageListResponse>>> {
  try {
    const params = await props.params
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt(params.id)

    if (isNaN(chatId)) {
      throw new ApiError('Invalid chat ID', 400)
    }

    // Verify chat exists and user is participant
    const chat = await payload.findByID({
      collection: 'chats',
      id: chatId,
      depth: 1
    }) as Chat

    if (!chat) {
      throw new ApiError('Chat not found', 404)
    }

    const isParticipant = chat.participants?.some(
      (p: any) => {
        const pId = typeof p === 'object' ? (p.id || p.value?.id || p.value) : p;
        return pId === user.id;
      }
    )

    if (chat.type !== 'group' && !isParticipant) {
      throw new ApiError('You are not a participant in this chat', 403)
    }

    // Parse pagination params
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const direction = (searchParams.get('direction') || 'backward') as 'forward' | 'backward'

    // Build query
    const whereClause: any = {
      chat: { equals: chatId }
    }

    // Fetch messages
    const messagesResult = await payload.find({
      collection: 'chat-messages',
      where: whereClause,
      depth: 2,
      limit,
      sort: direction === 'forward' ? 'createdAt' : '-createdAt',
      ...(cursor && { cursor })
    })

    // Format messages
    const formattedMessages: MessageResponse[] = messagesResult.docs.map((msg: ChatMessage) => ({
      id: msg.id,
      chatId,
      senderId: typeof msg.sender === 'object' ? msg.sender.id : msg.sender,
      sender: msg.sender && typeof msg.sender === 'object' ? {
        id: msg.sender.id,
        firstName: msg.sender.firstName || '',
        lastName: msg.sender.lastName || '',
        profilePicture: msg.sender.profilePicture as any
      } : undefined,
      content: msg.content as any,
      type: (msg as any).contentType as any,
      replyToMessageId: typeof (msg as any).replyTo === 'object' ? (msg as any).replyTo?.id : (msg as any).replyTo || undefined,
      attachments: msg.attachments as any || undefined,
      reactions: (msg.reactions || []).map((r: any) => ({
        emoji: r.emoji,
        userId: r.userId,
        createdAt: r.createdAt
      })),
      isEdited: !!(msg as any).editedAt,
      editedAt: msg.editedAt || undefined,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }))

    return NextResponse.json({
      data: {
        data: formattedMessages,
        nextCursor: messagesResult.nextPage || null,
        prevCursor: messagesResult.prevPage || null,
        hasMore: messagesResult.hasNextPage
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<MessageResponse>>> {
  try {
    const params = await props.params
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt(params.id)

    if (isNaN(chatId)) {
      throw new ApiError('Invalid chat ID', 400)
    }

    // Get chat and verify participation
    const chat = await payload.findByID({
      collection: 'chats',
      id: chatId,
      depth: 1
    }) as Chat

    if (!chat) {
      throw new ApiError('Chat not found', 404)
    }

    // Validate can send to chat
    const participantCheck = canSendToChat(user.id, {
      id: chat.id,
      type: (chat as any).type,
      status: (chat as any).status,
      participants: (chat.participants || []).map((p: any) => ({
        userId: typeof p === 'object' ? (p.id || p.value?.id || p.value) : p,
        role: typeof p === 'object' ? (p.role || p.value?.role || 'trainee') : 'trainee',
        joinedAt: p.createdAt || new Date().toISOString()
      })),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      createdBy: chat.createdBy ? (typeof chat.createdBy === 'object' ? chat.createdBy.id : chat.createdBy) : 0
    })

    if (!participantCheck.valid) {
      throw new ApiError(participantCheck.error || 'Cannot send message', 403)
    }

    const body: SendMessageRequest = await req.json()

    // Extract text for validation if content is a Lexical object
    let textContent = body.content as any
    if (typeof textContent === 'object' && textContent !== null) {
      try {
        // Very basic extraction of text from Lexical root for length validation
        textContent = textContent.root?.children?.map((c: any) =>
          c.children?.map((child: any) => child.text || '').join('')
        ).join('\n') || ''
      } catch (_e) {
        textContent = JSON.stringify(textContent)
      }
    } else {
      textContent = String(textContent || '')
    }

    // Validate message
    const validation = validateNewMessage({
      content: textContent,
      type: body.type || 'text',
      replyToMessageId: body.replyToMessageId,
      attachments: body.attachments
    })

    if (!validation.valid) {
      throw new ApiError(validation.error || 'Invalid message', 400, validation.code)
    }

    // Create message
    console.log('Creating message:', { chatId, senderId: user.id, contentType: body.type });
    ; (req as any).user = user;
    const message = await payload.create({
      collection: 'chat-messages',
      req,
      user, // Pass user directly as well, which Payload 3 respects
      overrideAccess: true, // Bypass strict collection access rules
      data: {
        chat: chatId,
        sender: user.id,
        content: body.content as any,
        contentType: body.type || 'text',
        replyTo: body.replyToMessageId ? body.replyToMessageId : null,
      }
    })

    // Create read status for sender (mark as read)
    await payload.create({
      collection: 'chat-message-status',
      overrideAccess: true,
      data: {
        message: message.id,
        user: user.id,
        status: 'read',
        // timestamp field removed - doesn't exist in collection
      }
    })

    // Update chat last message
    const previewText = typeof body.content === 'string'
      ? body.content.substring(0, 100)
      : '[Message]';

    await payload.update({
      collection: 'chats',
      id: chatId,
      overrideAccess: true,
      data: {
        lastMessagePreview: previewText,
        lastMessageAt: new Date().toISOString()
      }
    })

    const response: MessageResponse = {
      id: message.id,
      chatId,
      senderId: user.id,
      sender: {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePicture: user.profilePicture as any
      },
      content: message.content as any,
      type: (message as any).contentType,
      replyToMessageId: body.replyToMessageId,
      attachments: (message as any).attachments || undefined,
      reactions: [],
      isEdited: false,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }

    return NextResponse.json({ data: response }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
