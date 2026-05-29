'use server';

import { revalidatePath } from 'next/cache';
import { getServerToken, getServerUser } from '@/app/actions/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export interface AskInstructorQuestion {
    id: string;
    subject: string;
    preview: string;
    instructor: string;
    instructorParticipant?: any;
    status: 'pending' | 'answered' | 'archived';
    date?: string;
    createdAt?: string | null;
    lastMessageAt?: string | null;
}

export interface AskInstructorThreadMessage {
    id: string;
    plainText: string;
    senderName: string;
    senderRole?: string;
    senderId?: string;
    isMine: boolean;
    createdAt: string;
}

export interface AskInstructorThreadData {
    question: {
        id: string;
        subject: string;
        instructor: string;
        instructorParticipant?: any;
        status: 'pending' | 'answered' | 'archived';
        createdAt?: string | null;
        lastMessageAt?: string | null;
    };
    messages: AskInstructorThreadMessage[];
}

async function getAskInstructorHeaders() {
    const token = await getServerToken();

    if (!token) {
        throw new Error('Unauthorized');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`,
    };
}

async function getAskInstructorLmsData(params: URLSearchParams) {
    const headers = await getAskInstructorHeaders();
    const res = await fetch(`${API_BASE_URL}/lms/ask-instructor?${params.toString()}`, {
        headers,
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

export async function askNewQuestion(instructorUserId: number, subject: string, message: string, courseId?: number) {
    const headers = await getAskInstructorHeaders();
    const chatRes = await fetch(`${API_BASE_URL}/lms/ask-instructor`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            instructorUserId,
            subject,
            message,
            courseId,
        }),
    });

    if (!chatRes.ok) {
        const errText = await chatRes.text().catch(() => 'Unknown error');
        throw new Error(`Failed to create ask instructor question: ${chatRes.status} ${errText}`);
    }

    const chatData = await chatRes.json();
    revalidatePath('/portal/ask-instructor');
    return chatData.doc;
}

export async function fetchAskInstructorThread(chatId: number): Promise<AskInstructorThreadData | null> {
    const headers = await getAskInstructorHeaders();
    const res = await fetch(`${API_BASE_URL}/lms/ask-instructor/${chatId}/thread`, {
        headers,
        cache: 'no-store',
    });

    if (res.status === 404 || res.status === 403) {
        return null;
    }

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch ask instructor thread: ${res.status} ${errText}`);
    }

    return res.json();
}

export async function replyToQuestion(chatId: number, content: string) {
    const headers = await getAskInstructorHeaders();
    const res = await fetch(`${API_BASE_URL}/lms/ask-instructor/${chatId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            message: content,
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Failed to post ask instructor reply: ${res.status} ${errText}`);
    }

    revalidatePath('/portal/ask-instructor');
    revalidatePath(`/portal/ask-instructor/${chatId}`);

    const data = await res.json();
    return data;
}
