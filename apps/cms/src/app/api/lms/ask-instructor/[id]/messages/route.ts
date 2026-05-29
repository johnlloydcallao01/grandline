import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../../../chat/_utils/auth'
import type { ChatMessage } from '@/payload-types'

type RouteContext = {
  params: Promise<{ id: string }>
}

function createLexicalContent(message: string): ChatMessage['content'] {
  return {
    root: {
      type: 'root',
      direction: null,
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
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
      ],
    },
  }
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

function isParticipant(chat: any, userId: string) {
  const participants = Array.isArray(chat?.participants) ? chat.participants : []
  return participants.some((participant: any) => {
    const resolved = participant && typeof participant === 'object' && participant.value ? participant.value : participant
    const participantId = resolved && typeof resolved === 'object' ? resolved.id : resolved
    return String(participantId) === String(userId)
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { id } = await context.params
    const body = await request.json()
    const { message } = body
    const payloadRequest = request as any
    payloadRequest.user = user

    if (!id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const chat = await payload.findByID({
      collection: 'chats',
      id,
      depth: 1,
      overrideAccess: true,
    })

    if (!chat || chat.type !== 'instructor_trainee' || !(chat.metadata as any)?.isAskInstructor) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    if (!isParticipant(chat, String(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const newMessage = await payload.create({
      collection: 'chat-messages',
      req: payloadRequest,
      user,
      overrideAccess: true,
      data: {
        chat: chat.id,
        sender: user.id,
        content: createLexicalContent(message),
        contentType: 'text',
      },
    })

    return NextResponse.json({
      id: String(newMessage.id),
      plainText: extractTextFromLexical(newMessage.content),
      senderName: 'You',
      senderRole: user.role,
      senderId: String(user.id),
      isMine: true,
      createdAt: newMessage.createdAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating ask instructor LMS reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
