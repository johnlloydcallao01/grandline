import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { requireAuth, handleApiError, ApiError } from '@/app/api/chat/_utils/auth'
import type { ApiResponse, TypingRequest } from '@/app/api/chat/_types/responses'

export async function POST(
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

    const body: TypingRequest = await req.json()

    // Upsert typing status
    await payload.db.upsert({
      collection: 'chat-typing-status',
      where: {
        chat: { equals: chatId },
        user: { equals: user.id }
      },
      data: {
        chat: chatId,
        user: user.id,
        isTyping: body.isTyping,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      data: { success: true }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
