'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type SecurityEventItem = {
  id: number;
  user: { id: number; email: string; firstName: string; lastName: string } | number;
  eventType: string;
  eventData: Record<string, unknown>;
  triggeredBy?: { id: number; email: string; firstName: string; lastName: string } | number | null;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
};

export type UserSecurityItem = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string | null;
  securityAlertsEmailEnabled?: boolean;
};

export type SecurityDashboardData = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentEventsCount: number;
  securityConfig: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
    requireTwoFA: boolean;
    passwordExpiryDays: number;
  };
};

async function fetchAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = 'Request failed.';
    if (payload && typeof payload === 'object') {
      const p = payload as Record<string, unknown>;
      if (Array.isArray(p.errors) && p.errors.length > 0) {
        errorMessage = p.errors[0].message;
      } else if (typeof p.error === 'string') {
        errorMessage = p.error;
      }
    }
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function fetchSecurityEvents(limit = 50): Promise<SecurityEventItem[]> {
  const res = await fetchAdmin<{ docs: SecurityEventItem[] }>(
    `/user-events?limit=${limit}&sort=-timestamp&depth=1`
  );
  return res.docs;
}

export async function fetchUsersSecurityStatus(): Promise<UserSecurityItem[]> {
  const res = await fetchAdmin<{ docs: UserSecurityItem[] }>(
    `/users?limit=100&depth=0`
  );
  return res.docs;
}

export async function fetchSecurityDashboard(): Promise<SecurityDashboardData> {
  const users = await fetchUsersSecurityStatus();
  const events = await fetchSecurityEvents(1);

  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    recentEventsCount: events.length,
    securityConfig: {
      maxLoginAttempts: env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || 5,
      lockoutDuration: 10,
      sessionTimeout: env.NEXT_PUBLIC_SESSION_TIMEOUT || 3600,
      requireTwoFA: env.NEXT_PUBLIC_REQUIRE_2FA || false,
      passwordExpiryDays: 90,
    },
  };
}

export async function toggleUserActiveStatus(userId: number, isActive: boolean): Promise<void> {
  await fetchAdmin(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export async function updateUserSecurityAlerts(userId: number, enabled: boolean): Promise<void> {
  await fetchAdmin(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ securityAlertsEmailEnabled: enabled }),
  });
}
