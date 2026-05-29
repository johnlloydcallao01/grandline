import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../../../chat/_utils/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

function extractTextFromLexical(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node

  if (node.root) {
    return extractTextFromLexical(node.root)
  }

  let text = ''

  if (typeof node.text === 'string') {
    text += node.text
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      text += extractTextFromLexical(child)
      if (['paragraph', 'heading', 'list-item'].includes(child?.type)) {
        text += '\n'
      }
    }
  }

  return text.trim()
}

function mapParticipants(participants: any[] | null | undefined, currentUserId: string) {
  return (Array.isArray(participants) ? participants : [])
    .map((participant: any) => {
      const user = participant && typeof participant === 'object' && participant.value ? participant.value : participant
      return user && typeof user === 'object' ? user : null
    })
    .filter((user: any) => user && String(user.id) !== currentUserId)
    .map((user: any) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Instructor',
      role: user.role,
      avatar: user.profilePicture || null,
    }))
}

function isParticipant(chat: any, userId: string) {
  const participants = Array.isArray(chat?.participants) ? chat.participants : []
  return participants.some((participant: any) => {
    const resolved = participant && typeof participant === 'object' && participant.value ? participant.value : participant
    const participantId = resolved && typeof resolved === 'object' ? resolved.id : resolved
    return String(participantId) === String(userId)
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const chat = await payload.findByID({
      collection: 'chats',
      id,
      depth: 2,
      overrideAccess: true,
    })

    if (!chat || chat.type !== 'instructor_trainee' || !(chat.metadata as any)?.isAskInstructor) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (!isParticipant(chat, String(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await payload.find({
      collection: 'chat-messages',
      where: {
        chat: {
          equals: id,
        },
      },
      depth: 2,
      limit: 100,
      sort: 'createdAt',
      overrideAccess: true,
    })

    const participants = mapParticipants(chat.participants, String(user.id))
    const instructor = participants[0]
    const shapedMessages = messages.docs.map((message: any) => {
      const sender = message.sender
      const senderId = typeof sender === 'object' ? sender?.id : sender
      const senderName = String(senderId) === String(user.id)
        ? 'You'
        : `${sender?.firstName || ''} ${sender?.lastName || ''}`.trim() || sender?.email || instructor?.name || 'Instructor'

      return {
        id: String(message.id),
        plainText: extractTextFromLexical(message.content),
        senderName,
        senderRole: typeof sender === 'object' ? sender?.role : undefined,
        senderId: senderId ? String(senderId) : undefined,
        isMine: String(senderId) === String(user.id),
        createdAt: message.createdAt,
      }
    })

    const question = {
      id: chat.id,
      subject: (chat.metadata as any)?.subject || chat.title || 'Question',
      instructor: instructor?.name || 'Instructor',
      instructorParticipant: instructor || null,
      status: chat.isArchived || chat.status === 'archived'
        ? 'archived'
        : ((chat.metadata as any)?.status || 'pending'),
      createdAt: chat.createdAt || null,
      lastMessageAt: chat.lastMessageAt || null,
    }

    return NextResponse.json({
      question,
      messages: shapedMessages,
    })
  } catch (error) {
    console.error('Error fetching ask instructor LMS thread:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
