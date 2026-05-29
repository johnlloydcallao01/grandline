import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { requireAuth } from '../../chat/_utils/auth'
import type { ChatMessage } from '@/payload-types'

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
      email: user.email || null,
      specialization: user.specialization || null,
      user,
    }))
}

function normalizeInstructorRecord(instructor: any) {
  if (!instructor || typeof instructor !== 'object') return null

  const user = instructor.user && typeof instructor.user === 'object'
    ? instructor.user
    : null

  return {
    id: instructor.id,
    specialization: instructor.specialization || null,
    contactEmail: instructor.contactEmail || user?.email || null,
    user,
    userId: user?.id != null ? String(user.id) : null,
  }
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

async function getInstructorContext(payload: any, userId: string) {
  const traineesForUser = await payload.find({
    collection: 'trainees',
    where: {
      user: { equals: userId },
    } as Where,
    limit: 1,
    overrideAccess: true,
  })

  const trainee = Array.isArray(traineesForUser.docs) ? traineesForUser.docs[0] : null

  if (!trainee || (trainee as any).id == null) {
    return {
      trainee: null,
      instructorsByInstructorId: new Map<string, any>(),
      instructorsByUserId: new Map<string, any>(),
    }
  }

  const enrollments = await payload.find({
    collection: 'course-enrollments',
    where: {
      student: { equals: String((trainee as any).id) },
    },
    depth: 4,
    limit: 200,
    sort: '-enrolledAt',
    overrideAccess: true,
  })

  const instructorsByInstructorId = new Map<string, any>()
  const instructorsByUserId = new Map<string, any>()

  for (const enrollment of Array.isArray(enrollments.docs) ? enrollments.docs : []) {
    const course = (enrollment as any)?.course
    if (!course || typeof course !== 'object') continue

    const instructor = course.instructor
    if (instructor && typeof instructor === 'object' && instructor.id != null) {
      const normalized = normalizeInstructorRecord(instructor)
      if (normalized) {
        instructorsByInstructorId.set(String(normalized.id), normalized)
        if (normalized.userId) {
          instructorsByUserId.set(String(normalized.userId), normalized)
        }
      }
    }

    if (Array.isArray(course.coInstructors)) {
      for (const coInstructor of course.coInstructors) {
        if (coInstructor && typeof coInstructor === 'object' && coInstructor.id != null) {
          const normalized = normalizeInstructorRecord(coInstructor)
          if (normalized) {
            instructorsByInstructorId.set(String(normalized.id), normalized)
            if (normalized.userId) {
              instructorsByUserId.set(String(normalized.userId), normalized)
            }
          }
        }
      }
    }
  }

  return {
    trainee,
    instructorsByInstructorId,
    instructorsByUserId,
  }
}

async function formatAskInstructorQuestion(payload: any, chat: any, currentUserId: string) {
  const lastMessages = await payload.find({
    collection: 'chat-messages',
    where: {
      chat: { equals: chat.id },
    },
    limit: 1,
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
  })

  const lastMessage = lastMessages.docs?.[0] as any
  const lastMessageSenderId = lastMessage?.sender
    ? String(typeof lastMessage.sender === 'object' ? lastMessage.sender.id : lastMessage.sender)
    : null

  const participants = mapParticipants(chat.participants, String(currentUserId))
  const otherParticipant = participants[0]

  return {
    id: chat.id,
    subject: chat.metadata?.subject || chat.title || 'Question',
    preview: chat.lastMessagePreview || 'No messages yet...',
    instructor: otherParticipant?.name || 'Instructor',
    instructorParticipant: otherParticipant || null,
    status:
      chat.isArchived || chat.status === 'archived'
        ? 'archived'
        : lastMessageSenderId && lastMessageSenderId !== String(currentUserId)
          ? 'answered'
          : chat.metadata?.status || 'pending',
    date: new Date(chat.lastMessageAt || chat.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    createdAt: chat.createdAt || null,
    lastMessageAt: chat.lastMessageAt || null,
  }
}

// GET /api/lms/ask-instructor - Get ask-instructor data for a trainee
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const requestedUserId = searchParams.get('userId')
    const chatId = searchParams.get('chatId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    if (requestedUserId && String(requestedUserId) !== String(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = String(user.id)
    const { trainee, instructorsByInstructorId } = await getInstructorContext(payload, userId)

    if (!trainee) {
      return NextResponse.json({
        instructors: [],
        questions: [],
        question: null,
      })
    }

    const chatWhere: Where = {
      and: [
        {
          participants: { equals: userId },
        },
        {
          type: { equals: 'instructor_trainee' },
        },
      ],
    }

    if (chatId) {
      ;(chatWhere as any).and.push({
        id: { equals: chatId },
      })
    }

    const chats = await payload.find({
      collection: 'chats',
      where: chatWhere,
      depth: 2,
      limit,
      sort: '-updatedAt',
      overrideAccess: true,
    })

    const formattedQuestions = await Promise.all(
      (Array.isArray(chats.docs) ? chats.docs : [])
        .filter((chat: any) => chat?.metadata?.isAskInstructor)
        .map((chat: any) => formatAskInstructorQuestion(payload, chat, userId)),
    )

    const instructors = Array.from(instructorsByInstructorId.values())
    const question = chatId ? formattedQuestions[0] || null : null

    return NextResponse.json({
      instructors,
      questions: formattedQuestions,
      question,
    })
  } catch (error) {
    console.error('Error fetching ask instructor LMS data:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const payloadRequest = request as any
    payloadRequest.user = user

    const { instructorUserId, subject, message, courseId } = body

    if (!instructorUserId || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { instructorsByUserId, instructorsByInstructorId } = await getInstructorContext(payload, String(user.id))
    const targetInstructor =
      instructorsByUserId.get(String(instructorUserId)) ||
      instructorsByInstructorId.get(String(instructorUserId))

    if (!targetInstructor) {
      return NextResponse.json({ error: 'Instructor is not available for this trainee' }, { status: 403 })
    }

    if (!targetInstructor.userId) {
      return NextResponse.json({ error: 'Instructor user account is missing' }, { status: 500 })
    }

    const chat = await payload.create({
      collection: 'chats',
      req: payloadRequest,
      user,
      overrideAccess: true,
      data: {
        type: 'instructor_trainee',
        title: subject,
        status: 'active',
        participants: [user.id, Number(targetInstructor.userId)],
        createdBy: user.id,
        metadata: {
          isAskInstructor: true,
          subject,
          courseId: courseId ?? null,
          status: 'pending',
          instructorId: targetInstructor.id,
          instructorUserId: Number(targetInstructor.userId),
        },
      },
    })

    await payload.create({
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

    const createdChat = await payload.findByID({
      collection: 'chats',
      id: chat.id,
      depth: 2,
      overrideAccess: true,
    })

    const question = await formatAskInstructorQuestion(payload, createdChat, String(user.id))

    return NextResponse.json({ doc: question }, { status: 201 })
  } catch (error) {
    console.error('Error creating ask instructor LMS question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
