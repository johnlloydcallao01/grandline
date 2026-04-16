'use server';

import { getServerToken, getServerUser } from '@/app/actions/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export async function getDiscussionTopics() {
  const token = await getServerToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_BASE_URL}/chat?type=group&limit=50`, {
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch discussion topics');
  }

  const data = await res.json();
  return data.data; 
}

export async function getTopicMessages(topicId: number) {
  const token = await getServerToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_BASE_URL}/chat/${topicId}/messages?direction=forward&limit=100`, {
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await res.json();
  return data.data.data; 
}

export async function createDiscussionTopic(title: string, content: string, category: string) {
  const token = await getServerToken();
  const user = await getServerUser();
  if (!token || !user) throw new Error('Unauthorized');

  // 1. Create the group chat using Payload's default REST API to match schema exactly
  const chatRes = await fetch(`${API_BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'group',
      title,
      status: 'active',
      participants: [Number(user.id)], 
      metadata: {
        isDiscussionBoard: true,
        category
      }
    }),
  });

  if (!chatRes.ok) {
    const err = await chatRes.json();
    throw new Error(err.error || err.errors?.[0]?.message || 'Failed to create discussion topic');
  }

  const chatData = await chatRes.json();
  const chatId = chatData.doc.id; // Payload default API returns the doc inside 'doc'

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
              text: content,
              type: 'text',
              version: 1
            }
          ]
        }
      ]
    }
  };

  // 2. Post the initial message
  const msgRes = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
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

export async function replyToTopic(topicId: number, content: string) {
  const token = await getServerToken();
  if (!token) throw new Error('Unauthorized');

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
              text: content,
              type: 'text',
              version: 1
            }
          ]
        }
      ]
    }
  };

  const res = await fetch(`${API_BASE_URL}/chat/${topicId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
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
  return data.data;
}

export async function fetchCourseCategories() {
  const { getCourseCategories } = await import('@encreasl/ui/course-categories-server');
  return getCourseCategories(50);
}
