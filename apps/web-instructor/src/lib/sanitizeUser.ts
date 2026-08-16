import type { User } from '@/types/auth';

const USER_ROLES = ['admin', 'instructor', 'trainee', 'service'] as const;

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function sanitizeProfilePicture(value: unknown): User['profilePicture'] {
  if (!value || typeof value !== 'object') return null;

  const source = value as Record<string, unknown>;
  const id = Number(source.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  return {
    id,
    filename: optionalString(source.filename) || '',
    url: optionalString(source.url) || '',
    alt: optionalString(source.alt),
    cloudinaryURL: optionalString(source.cloudinaryURL) || undefined,
  };
}

export function sanitizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;

  const source = value as Record<string, unknown>;
  const id = Number(source.id);
  const role = source.role;

  if (!Number.isInteger(id) || !USER_ROLES.includes(role as typeof USER_ROLES[number])) return null;

  return {
    id,
    email: optionalString(source.email) || '',
    firstName: optionalString(source.firstName) || '',
    lastName: optionalString(source.lastName) || '',
    middleName: optionalString(source.middleName),
    nameExtension: optionalString(source.nameExtension),
    username: optionalString(source.username),
    role: role as User['role'],
    isActive: typeof source.isActive === 'boolean' ? source.isActive : null,
    gender: optionalString(source.gender),
    civilStatus: optionalString(source.civilStatus),
    nationality: optionalString(source.nationality),
    birthDate: optionalString(source.birthDate),
    placeOfBirth: optionalString(source.placeOfBirth),
    completeAddress: optionalString(source.completeAddress),
    phone: optionalString(source.phone),
    biography: (typeof source.biography === 'string' || (source.biography && typeof source.biography === 'object'))
      ? source.biography
      : null,
    pushNotificationsEnabled: typeof source.pushNotificationsEnabled === 'boolean' ? source.pushNotificationsEnabled : null,
    securityAlertsEmailEnabled: typeof source.securityAlertsEmailEnabled === 'boolean' ? source.securityAlertsEmailEnabled : null,
    lastLogin: optionalString(source.lastLogin),
    profilePicture: sanitizeProfilePicture(source.profilePicture),
    createdAt: optionalString(source.createdAt) || '',
    updatedAt: optionalString(source.updatedAt) || '',
  };
}