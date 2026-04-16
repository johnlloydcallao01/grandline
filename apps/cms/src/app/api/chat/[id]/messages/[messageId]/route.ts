import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError, ApiError } from '@/app/api/chat/_utils/auth'
import type { ApiResponse, MessageResponse, EditMessageRequest } from '@/app/api/chat/_types/responses'
import type { ChatMessage } from '@/payload-types'
import { canEditMessage, canDeleteMessage, validateMessageContent } from '@grandline/chat-engine'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<MessageResponse>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt((await params).id)
    const messageId = parseInt((await params).messageId)

    if (isNaN(chatId) || isNaN(messageId)) {
      throw new ApiError('Invalid ID', 400)
    }

    // Get existing message
    const message = await payload.findByID({
      collection: 'chat-messages',
      id: messageId,
      depth: 1
    }) as ChatMessage

    if (!message) {
      throw new ApiError('Message not found', 404)
    }

    if (typeof message.chat === 'object' && message.chat.id !== chatId) {
      throw new ApiError('Message does not belong to this chat', 400)
    }

    // Check edit permissions
    const editCheck = canEditMessage(user.id, {
      id: message.id,
      chatId,
      senderId: typeof message.sender === 'object' ? message.sender.id : message.sender,
      content: message.content as any,
      type: (message as any).contentType as any,
      replyToMessageId: null,
      attachments: null,
      reactions: [],
      isEdited: !!message.editedAt,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    })

    if (!editCheck.valid) {
      throw new ApiError(editCheck.error || 'Cannot edit message', 403, editCheck.code)
    }

    const body: EditMessageRequest = await req.json()

    // Validate new content
    const validation = validateMessageContent(body.content)
    if (!validation.valid) {
      throw new ApiError(validation.error || 'Invalid content', 400, validation.code)
    }

    // Update message
    await payload.update({
      collection: 'chat-messages',
      id: messageId,
      data: {
        content: body.content as any,
        editedAt: new Date().toISOString()
      }
    })

    // Refetch updated message
    const updated = await payload.findByID({
      collection: 'chat-messages',
      id: messageId,
      depth: 1
    }) as ChatMessage

    const response: MessageResponse = {
      id: updated.id,
      chatId,
      senderId: typeof message.sender === 'object' ? message.sender.id : message.sender,
      content: updated.content as any,
      type: (updated as any).contentType,
      replyToMessageId: typeof (updated as any).replyTo === 'object' ? (updated as any).replyTo?.id : (updated as any).replyTo || undefined,
      attachments: (message as any).attachments || undefined,
      reactions: (updated.reactions || []).map((r: any) => ({
        emoji: r.emoji,
        userId: r.userId,
        createdAt: r.createdAt
      })),
      isEdited: true,
      editedAt: new Date().toISOString(),
      createdAt: (updated as any).createdAt,
      updatedAt: (updated as any).updatedAt
    }

    return NextResponse.json({ data: response })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt((await params).id)
    const messageId = parseInt((await params).messageId)

    if (isNaN(chatId) || isNaN(messageId)) {
      throw new ApiError('Invalid ID', 400)
    }

    // Get existing message
    const message = await payload.findByID({
      collection: 'chat-messages',
      id: messageId,
      depth: 1
    }) as ChatMessage

    if (!message) {
      throw new ApiError('Message not found', 404)
    }

    // Check delete permissions
    const deleteCheck = canDeleteMessage(user.id, {
      id: message.id,
      chatId,
      senderId: typeof message.sender === 'object' ? message.sender.id : message.sender,
      content: message.content as any,
      type: (message as any).contentType as any,
      replyToMessageId: null,
      attachments: null,
      reactions: [],
      isEdited: !!message.editedAt,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }, user.role as any)

    if (!deleteCheck.valid) {
      throw new ApiError(deleteCheck.error || 'Cannot delete message', 403, deleteCheck.code)
    }

    // Delete message (hard delete)
    await payload.delete({
      collection: 'chat-messages',
      id: messageId
    })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    return handleApiError(error)
  }
}
