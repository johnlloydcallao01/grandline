import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError, ApiError } from '@/app/api/chat/_utils/auth'
import type { ApiResponse, ChatDetailResponse } from '@/app/api/chat/_types/responses'
import type { Chat } from '@/payload-types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<ChatDetailResponse>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt((await params).id)

    if (isNaN(chatId)) {
      throw new ApiError('Invalid chat ID', 400)
    }

    // Fetch chat with participants
    const chat = await payload.findByID({
      collection: 'chats',
      id: chatId,
      depth: 2
    }) as Chat

    if (!chat) {
      throw new ApiError('Chat not found', 404)
    }

    // Verify user is participant
    const isParticipant = chat.participants?.some(
      (p: any) => p.value && p.value.id === user.id
    )

    if (chat.type !== 'group' && !isParticipant) {
      throw new ApiError('You are not a participant in this chat', 403)
    }

    // Format response
    const response: ChatDetailResponse = {
      id: chat.id,
      type: chat.type,
      title: chat.title || undefined,
      status: (chat as any).status,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessageAt: chat.lastMessageAt || undefined,
      lastMessagePreview: chat.lastMessagePreview || undefined,
      participants: (chat.participants || []).map((p: any) => ({
        id: p.value.id,
        email: p.value.email,
        firstName: p.value.firstName || '',
        lastName: p.value.lastName || '',
        role: p.value.role,
        profilePicture: p.value.profilePicture
      })),
      createdBy: chat.createdBy ? (typeof chat.createdBy === 'object' ? chat.createdBy.id : chat.createdBy) : 0
    }

    return NextResponse.json({ data: response })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<Partial<ChatDetailResponse>>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt((await params).id)

    if (isNaN(chatId)) {
      throw new ApiError('Invalid chat ID', 400)
    }

    const chat = await payload.findByID({
      collection: 'chats',
      id: chatId,
      depth: 1
    }) as Chat

    if (!chat) {
      throw new ApiError('Chat not found', 404)
    }

    // Only creator or admin can update chat
    const isCreator = chat.createdBy && (typeof chat.createdBy === 'object'
      ? chat.createdBy.id === user.id
      : chat.createdBy === user.id)

    if (!isCreator && user.role !== 'admin') {
      throw new ApiError('Only chat creator or admin can update', 403)
    }

    const body = await req.json()
    const { title, status } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (status !== undefined) updateData.status = status

    const updated = await payload.update({
      collection: 'chats',
      id: chatId,
      data: updateData
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        title: updated.title || undefined,
        status: (updated as any).status
      }
    })
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

    if (isNaN(chatId)) {
      throw new ApiError('Invalid chat ID', 400)
    }

    const chat = await payload.findByID({
      collection: 'chats',
      id: chatId,
      depth: 1
    }) as Chat

    if (!chat) {
      throw new ApiError('Chat not found', 404)
    }

    // Only admin can delete chats
    if (user.role !== 'admin') {
      throw new ApiError('Only admin can delete chats', 403)
    }

    await payload.delete({
      collection: 'chats',
      id: chatId
    })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    return handleApiError(error)
  }
}
