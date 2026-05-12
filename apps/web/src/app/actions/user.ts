'use server';

import type { User } from '@/types/auth';
import { getServerToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

export async function updateUserProfile(userId: number, data: any): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const token = await getServerToken();
    if (!token) {
      return { success: false, error: 'Unauthorized' };
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.errors?.[0]?.message || result.message || 'Failed to update profile' };
    }

    return { success: true, user: result.doc };
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    return { success: false, error: error.message || 'Network error occurred' };
  }
}

export async function getTraineeRecord(userId: number): Promise<{ success: boolean; trainee?: any; error?: string }> {
  try {
    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) return { success: false, error: 'Server configuration error: Missing API Key' };

    const response = await fetch(`${API_BASE_URL}/trainees?where[user][equals]=${userId}&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${apiKey}`
      },
      cache: 'no-store'
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: 'Failed to fetch trainee record' };

    if (result.docs && result.docs.length > 0) {
      return { success: true, trainee: result.docs[0] };
    }
    return { success: false, error: 'Trainee record not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTraineeRecord(traineeId: number, data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getServerToken();
    if (!token) return { success: false, error: 'Unauthorized' };

    const response = await fetch(`${API_BASE_URL}/trainees/${traineeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.errors?.[0]?.message || result.message || 'Failed to update trainee record' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmergencyContactRecord(
  userId: number
): Promise<{ success: boolean; emergencyContact?: any; error?: string; notFound?: boolean }> {
  try {
    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) return { success: false, error: 'Server configuration error: Missing API Key' };

    const response = await fetch(`${API_BASE_URL}/emergency-contacts?where[user][equals]=${userId}&limit=1&sort=-updatedAt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${apiKey}`
      },
      cache: 'no-store'
    });

    const result = await response.json();
    if (!response.ok) return { success: false, error: 'Failed to fetch emergency contact record' };

    if (result.docs && result.docs.length > 0) {
      return { success: true, emergencyContact: result.docs[0] };
    }

    return { success: false, error: 'Emergency contact record not found', notFound: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertEmergencyContactRecord(
  userId: number,
  data: any
): Promise<{ success: boolean; emergencyContact?: any; error?: string }> {
  try {
    const apiKey = process.env.PAYLOAD_API_KEY;
    if (!apiKey) return { success: false, error: 'Server configuration error: Missing API Key' };

    const existingRecord = await getEmergencyContactRecord(userId);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`
    };

    if (existingRecord.success && existingRecord.emergencyContact?.id) {
      const response = await fetch(`${API_BASE_URL}/emergency-contacts/${existingRecord.emergencyContact.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.errors?.[0]?.message || result.message || 'Failed to update emergency contact record' };
      }

      return { success: true, emergencyContact: result.doc };
    }

    if (!existingRecord.notFound) {
      return { success: false, error: existingRecord.error || 'Failed to verify existing emergency contact record' };
    }

    const response = await fetch(`${API_BASE_URL}/emergency-contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user: userId,
        ...data,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.errors?.[0]?.message || result.message || 'Failed to create emergency contact record' };
    }

    return { success: true, emergencyContact: result.doc };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
