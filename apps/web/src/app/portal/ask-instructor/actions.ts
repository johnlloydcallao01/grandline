'use server';

import { getServerToken, getServerUser } from '@/app/actions/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

function getChatAuthHeaders(token: string): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`,
    };
}

async function getAskInstructorLmsData(params: URLSearchParams) {
    const res = await fetch(`${API_BASE_URL}/lms/ask-instructor?${params.toString()}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to fetch ask instructor data: ${res.status} ${errText}`);
    }

    return res.json();
}

export async function fetchMyQuestions() {
    const user = await getServerUser();
    if (!user) throw new Error('Unauthorized');

    const params = new URLSearchParams({
        userId: String(user.id),
        limit: '50',
    });

    const data = await getAskInstructorLmsData(params);
    return data.questions || [];
}

export async function fetchAskInstructorPageData() {
    const user = await getServerUser();
    if (!user) throw new Error('Unauthorized');

    const params = new URLSearchParams({
        userId: String(user.id),
        limit: '50',
    });

    const data = await getAskInstructorLmsData(params);
    return {
        instructors: data.instructors || [],
        questions: data.questions || [],
    };
}

export async function fetchQuestionTopic(chatId: number) {
    const user = await getServerUser();
    if (!user) throw new Error('Unauthorized');

    const params = new URLSearchParams({
        userId: String(user.id),
        chatId: String(chatId),
        limit: '1',
    });

    const data = await getAskInstructorLmsData(params);
    return data.question || null;
}

export async function askNewQuestion(instructorUserId: number, subject: string, message: string, courseId?: number) {
    const token = await getServerToken();
    const user = await getServerUser();
    if (!token || !user) throw new Error('Unauthorized');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `users JWT ${token}`;
    } else if (process.env.PAYLOAD_API_KEY) {
        headers['Authorization'] = `users API-Key ${process.env.PAYLOAD_API_KEY}`;
    }

    // 1. Create the chat using the Payload REST API (correct endpoint for direct creation)
    //    participants must be an array of user IDs for the hasMany relationship
    const chatRes = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            type: 'instructor_trainee',
            title: subject,
            status: 'active',
            participants: [Number(user.id), Number(instructorUserId)],
            metadata: {
                isAskInstructor: true,
                subject,
                courseId,
                status: 'pending'
            }
        }),
    });

    if (!chatRes.ok) {
        const err = await chatRes.json();
        throw new Error(err.error || err.errors?.[0]?.message || 'Failed to create chat');
    }

    const chatData = await chatRes.json();
    // Payload REST returns { doc: {...} } on create
    const chatId = chatData.doc?.id || chatData.id;

    // Convert simple string to Payload Lexical richText JSON
    const lexicalContent = {
        root: {
            type: 'root',
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
                            version: 1
                        }
                    ]
                }
            ]
        }
    };

    // 2. Post the initial message via the custom chat messages endpoint
    const CMS_BASE_URL_FOR_MSG = API_BASE_URL.replace('/api', '');
    const msgRes = await fetch(`${CMS_BASE_URL_FOR_MSG}/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: getChatAuthHeaders(token),
        body: JSON.stringify({
            content: lexicalContent,
            type: 'text',
        }),
    });

    if (!msgRes.ok) {
        const err = await msgRes.json();
        throw new Error(err.error || err.errors?.[0]?.message || 'Failed to post initial message');
    }

    return chatData.doc;
}

export async function getQuestionMessages(chatId: number) {
    const token = await getServerToken();
    if (!token) throw new Error('Unauthorized');

    const CMS_BASE_URL_MSG = API_BASE_URL.replace('/api', '');
    const res = await fetch(`${CMS_BASE_URL_MSG}/api/chat/${chatId}/messages?direction=forward&limit=100`, {
        headers: getChatAuthHeaders(token),
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch messages');
    }

    const data = await res.json();
    // The custom /api/chat/[id]/messages endpoint returns { data: { data: [...], hasMore, ... } }
    return data?.data?.data || [];
}

export async function replyToQuestion(chatId: number, content: string) {
    const token = await getServerToken();
    if (!token) throw new Error('Unauthorized');

    const lexicalContent = {
        root: {
            type: 'root',
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
                            text: content,
                            type: 'text',
                            version: 1
                        }
                    ]
                }
            ]
        }
    };

    const CMS_BASE_URL_REPLY = API_BASE_URL.replace('/api', '');
    const res = await fetch(`${CMS_BASE_URL_REPLY}/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: getChatAuthHeaders(token),
        body: JSON.stringify({
            content: lexicalContent,
            type: 'text',
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.errors?.[0]?.message || 'Failed to post reply');
    }

    const data = await res.json();
    // The custom /api/chat/[id]/messages POST returns { data: messageObject }
    return data.data;
}
