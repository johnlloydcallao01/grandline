import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

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

// GET /api/lms/ask-instructor - Get ask-instructor data for a trainee
export async function GET(request: NextRequest) {
    try {
        const payload = await getPayload({ config: configPromise })
        const { searchParams } = new URL(request.url)

        const userId = searchParams.get('userId')
        const chatId = searchParams.get('chatId')
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

        if (!userId) {
            return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
        }

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
            return NextResponse.json({
                instructors: [],
                questions: [],
                question: null,
            })
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

        const instructorsMap = new Map<string, any>()

        for (const enrollment of Array.isArray(enrollments.docs) ? enrollments.docs : []) {
            const course = (enrollment as any)?.course
            if (!course || typeof course !== 'object') continue

            const instructor = course.instructor
            if (instructor && typeof instructor === 'object' && instructor.id != null) {
                instructorsMap.set(String(instructor.id), instructor)
            }

            if (Array.isArray(course.coInstructors)) {
                for (const coInstructor of course.coInstructors) {
                    if (coInstructor && typeof coInstructor === 'object' && coInstructor.id != null) {
                        instructorsMap.set(String(coInstructor.id), coInstructor)
                    }
                }
            }
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
            ; (chatWhere as any).and.push({
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
                .map(async (chat: any) => {
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

                    const participants = mapParticipants(chat.participants, String(userId))
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
                                : lastMessageSenderId && lastMessageSenderId !== String(userId)
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
                }),
        )

        const instructors = Array.from(instructorsMap.values())
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
