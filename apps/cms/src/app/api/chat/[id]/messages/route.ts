import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError, ApiError } from '@/app/api/chat/_utils/auth'
import type { ApiResponse, MessageListResponse, MessageResponse, SendMessageRequest } from '@/app/api/chat/_types/responses'
import type { Chat, ChatMessage } from '@/payload-types'
import { canSendToChat, validateNewMessage, validateMessageType, validateReplyChain } from '@grandline/chat-engine'

function createLexicalContent(message: string): ChatMessage['content'] {
  return {
    root: {
      type: 'root',
      direction: null,
      format: '',
      indent: 0,
      version: 1,
      children: message.trim()
        ? [
            {
              type: 'paragraph',
              direction: null,
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: message,
                  type: 'text',
                  version: 1,
                },
              ],
            },
          ]
        : [
            // Canonical empty paragraph (Payload stores this when a richText
            // field is emptied) — an empty text node is rejected by Lexical.
            {
              type: 'paragraph',
              direction: null,
              format: '',
              indent: 0,
              version: 1,
              children: [],
            },
          ],
    },
  }
}

function toLexicalContent(content: any): ChatMessage['content'] {
  if (!content) return createLexicalContent('')
  if (typeof content === 'string') return createLexicalContent(content)
  return content
}

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
        return String(pId) === String(user.id);
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
    const messageType = body.type || 'text'

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

    // Validate type
    const typeValidation = validateMessageType(messageType)
    if (!typeValidation.valid) {
      throw new ApiError(typeValidation.error || 'Invalid message type', 400, typeValidation.code)
    }

    // Validate message (image/file messages may have empty content when attachments are present)
    const hasAttachments = Array.isArray(body.attachments) && body.attachments.length > 0
    const isMediaMessage = messageType === 'image' || messageType === 'file'
    const validation = validateNewMessage(
      {
        content: textContent,
        type: messageType,
        replyToMessageId: body.replyToMessageId,
        attachments: hasAttachments ? undefined : body.attachments
      },
      hasAttachments && isMediaMessage ? { allowEmpty: true } : undefined
    )

    if (!validation.valid) {
      throw new ApiError(validation.error || 'Invalid message', 400, validation.code)
    }

    // Validate reply chain explicitly (kept separate because media messages may have empty content)
    if (body.replyToMessageId) {
      const replyValidation = validateReplyChain(body.replyToMessageId)
      if (!replyValidation.valid) {
        throw new ApiError(replyValidation.error || 'Invalid reply', 400, replyValidation.code)
      }
    }

    // Resolve attachment media IDs → existing media docs. Only images allowed for image messages.
    let attachmentMediaIds: number[] = []
    if (hasAttachments) {
      const rawAttachments = body.attachments ?? []
      attachmentMediaIds = rawAttachments
        .map((a: any) => parseInt(a, 10))
        .filter((id: number) => Number.isInteger(id) && id > 0)

      if (attachmentMediaIds.length !== rawAttachments.length || attachmentMediaIds.length > 10) {
        throw new ApiError('Invalid attachments. Up to 10 valid media IDs allowed.', 400, 'INVALID_ATTACHMENTS_FORMAT')
      }

      const mediaResult = await payload.find({
        collection: 'media',
        where: { id: { in: attachmentMediaIds } },
        limit: attachmentMediaIds.length,
        overrideAccess: true,
      })
      const existing = new Set(mediaResult.docs.map((m: any) => m.id))
      if (existing.size !== attachmentMediaIds.length) {
        throw new ApiError('One or more attachment media items not found', 400, 'INVALID_ATTACHMENT')
      }

      if (messageType === 'image') {
        const isImage = (m: any) => (m.mimeType || '').startsWith('image/')
        if (!mediaResult.docs.every(isImage)) {
          throw new ApiError('Image messages can only include image attachments', 400, 'INVALID_ATTACHMENT_TYPE')
        }
      }
    }

    // Create message
    console.log('Creating message:', { chatId, senderId: user.id, contentType: messageType, attachments: attachmentMediaIds });
    ; (req as any).user = user;
    const message = await payload.create({
      collection: 'chat-messages',
      req,
      user, // Pass user directly as well, which Payload 3 respects
      overrideAccess: true, // Bypass strict collection access rules
      data: {
        chat: chatId,
        sender: user.id,
        content: toLexicalContent(body.content),
        contentType: messageType,
        replyTo: body.replyToMessageId ? body.replyToMessageId : null,
        ...(attachmentMediaIds.length > 0 ? { attachments: attachmentMediaIds } : {}),
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

    // Update parent chat metadata status and last message preview
    // Get parent chat to find creator
    const parentChat = await payload.findByID({
      collection: 'chats',
      id: chatId,
      depth: 0,
      overrideAccess: true
    })

    if (parentChat) {
      const creatorId = typeof parentChat.createdBy === 'object' ? (parentChat.createdBy as any).id : parentChat.createdBy;
      const isCreator = String(user.id) === String(creatorId);
      
      let previewText = textContent.trim();
      if (previewText.length > 80) {
        previewText = previewText.substring(0, 80).trim() + '...';
      } else if (!previewText) {
        previewText = messageType === 'image' ? '[Image]' : messageType === 'file' ? '[File]' : '[Message]';
      }

      await payload.update({
        collection: 'chats',
        id: chatId,
        overrideAccess: true,
        data: {
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: previewText,
          metadata: {
            ...(parentChat.metadata as any || {}),
            status: isCreator ? 'pending' : 'answered'
          }
        }
      })
    }


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
