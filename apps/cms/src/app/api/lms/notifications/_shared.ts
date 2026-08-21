import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../_utils/service-api-key'

export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config: configPromise })
}

// Shared auth boundary for the admin, templates, and user-inbox notification
// endpoints.
export function requireServiceAuth(request: NextRequest): NextResponse | null {
  if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// Normalization previously done by the frontend actions. Keeps the response
// shape consistent for every consumer of the notification endpoints.
export function normalizeNotification(doc: any) {
  const template = doc?.template
  const actor = doc?.actor
  return {
    id: Number(doc.id),
    title: doc.title || '',
    category: doc.category || 'other',
    body: doc.body ?? null,
    template:
      template && typeof template === 'object'
        ? { id: Number(template.id), name: template.name, code: template.code }
        : template
          ? Number(template)
          : null,
    origin: doc.origin || 'manual',
    audienceType: doc.audienceType || 'all-users',
    audienceRole: doc.audienceRole ?? null,
    audienceUsers: Array.isArray(doc.audienceUsers)
      ? doc.audienceUsers.map((u: any) =>
          u && typeof u === 'object'
            ? {
                id: Number(u.id),
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
              }
            : Number(u),
        )
      : null,
    segmentDefinition: doc.segmentDefinition ?? null,
    sourceType: doc.sourceType ?? null,
    sourceId: doc.sourceId ?? null,
    actor:
      actor && typeof actor === 'object'
        ? { id: Number(actor.id), email: actor.email, firstName: actor.firstName, lastName: actor.lastName }
        : actor
          ? Number(actor)
          : null,
    metadata: doc.metadata ?? null,
    scheduledAt: doc.scheduledAt ?? null,
    expiresAt: doc.expiresAt ?? null,
    status: doc.status || 'draft',
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

export function normalizeTemplate(doc: any) {
  return {
    id: Number(doc.id),
    name: doc.name || '',
    code: doc.code || '',
    category: doc.category || 'learning',
    titleTemplate: doc.titleTemplate || '',
    bodyTemplate: doc.bodyTemplate ?? null,
    defaultLink: doc.defaultLink ?? null,
    channels: Array.isArray(doc.channels) ? doc.channels : null,
    automatic: doc.automatic ?? false,
    manual: doc.manual ?? true,
    metadataSchema: doc.metadataSchema ?? null,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

// Server-owned aggregate counts computed over the full matching set (respecting
// search and any filters), not just the current page.
export function computeNotificationStats(docs: any[]) {
  return {
    total: docs.length,
    draft: docs.filter((d: any) => d.status === 'draft').length,
    scheduled: docs.filter((d: any) => d.status === 'scheduled').length,
    sent: docs.filter((d: any) => d.status === 'sent').length,
    cancelled: docs.filter((d: any) => d.status === 'cancelled').length,
  }
}

export function computeTemplateStats(docs: any[]) {
  return {
    total: docs.length,
    automated: docs.filter((d: any) => d.automatic).length,
    withEmail: docs.filter((d: any) => Array.isArray(d.channels) && d.channels.includes('email')).length,
    manual: docs.filter((d: any) => d.manual).length,
  }
}

export function normalizeUserNotification(doc: any) {
  return {
    id: Number(doc.id),
    user: doc.user && typeof doc.user === 'object' ? Number(doc.user.id) : Number(doc.user),
    notification:
      doc.notification && typeof doc.notification === 'object'
        ? Number(doc.notification.id)
        : Number(doc.notification),
    category: doc.category || 'other',
    title: doc.title || 'Notification',
    body: doc.body ?? null,
    link: doc.link ?? null,
    metadata: doc.metadata ?? null,
    deliveredAt: doc.deliveredAt ?? null,
    readAt: doc.readAt ?? null,
    seenAt: doc.seenAt ?? null,
    channel: doc.channel ?? null,
    archived: doc.archived ?? null,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}