import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError, ApiError } from '@/app/api/chat/_utils/auth'
import type { ApiResponse, MarkReadResponse } from '@/app/api/chat/_types/responses'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse<ApiResponse<MarkReadResponse>>> {
  try {
    const user = await requireAuth(req)
    const payload = await getPayload({ config: (await import('@/payload.config')) as any })
    const chatId = parseInt((await params).id)

    if (isNaN(chatId)) {
      throw new ApiError('Invalid chat ID', 400)
    }

    // Get unread messages (sent by others, not by current user)
    const unreadMessages = await payload.find({
      collection: 'chat-messages',
      where: {
        and: [
          { chat: { equals: chatId } },
          { sender: { not_equals: user.id } }
        ]
      },
      depth: 0,
      limit: 100
    })

    let markedCount = 0

    // Mark each message as read
    for (const message of unreadMessages.docs) {
      // Check if already marked as read by this user
      const existingStatus = await payload.find({
        collection: 'chat-message-status',
        where: {
          and: [
            { message: { equals: message.id } },
            { user: { equals: user.id } },
            { status: { equals: 'read' } }
          ]
        },
        depth: 0,
        limit: 1
      })

      if (existingStatus.docs.length === 0) {
        // Create read status
        await payload.create({
          collection: 'chat-message-status',
          data: {
            message: message.id,
            user: user.id,
            status: 'read',
            readAt: new Date().toISOString()
          }
        })
        markedCount++
      }
    }

    return NextResponse.json({
      data: {
        success: true,
        count: markedCount
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
