"use client"

const DEFAULT_API_BASE = "https://cms.grandlinemaritime.com"

export interface ApiFetchOptions {
  token: string
  apiBaseUrl?: string
}

async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions,
  init?: RequestInit
): Promise<T> {
  const base = options.apiBaseUrl || DEFAULT_API_BASE
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${options.token}`,
      ...init?.headers,
    },
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.error || body.message || message
    } catch { /* response body may not be JSON */ }
    throw new Error(message)
  }

  const json = await res.json()
  return json.data !== undefined ? json.data : json
}

export interface MediaObject {
  url?: string
  cloudinaryURL?: string
  secure_url?: string
  thumbnailURL?: string
}

export interface RichTextNode {
  children?: RichTextNode[]
  text?: string
}

export interface RichTextContent {
  root?: {
    children?: RichTextNode[]
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return err.message
  }
  return ""
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") return content
  if (content && typeof content === "object") {
    const richText = content as RichTextContent
    const children = richText.root?.children
    if (children) {
      return children
        .map((node) =>
          node.children?.map((child) => child.text || "").join("") || ""
        )
        .join("\n")
    }
  }
  return ""
}

function resolveSenderId(sender: unknown): number {
  if (!sender) return 0
  if (typeof sender === "number") return sender
  if (typeof sender === "object") {
    const senderId = (sender as MessageSender).id
    if (senderId) return senderId
  }
  return 0
}

function resolveSenderName(sender: unknown): string {
  if (!sender) return "Unknown"
  if (typeof sender === "object") {
    const senderInfo = sender as MessageSender
    if (senderInfo.firstName) {
      return `${senderInfo.firstName} ${senderInfo.lastName || ""}`.trim()
    }
  }
  return "Unknown"
}

function resolveSenderAvatar(sender: unknown): string | null {
  if (!sender || typeof sender !== "object") return null
  const pic = (sender as MessageSender).profilePicture
  if (!pic) return null
  if (typeof pic === "string") return pic
  if (typeof pic === "object" && pic.url) return pic.url
  return null
}

export interface ChatListItem {
  id: number
  title: string
  type: string
  status: string
  lastMessagePreview?: string
  lastMessageAt?: string
  unreadCount: number
  participants: {
    id: number
    name: string
    avatar?: string | null
    role: string
  }[]
  isActive: boolean
  isArchived: boolean
  lastMessageSenderId?: number
  createdBy?: number
}

export interface MessageSender {
  id: number
  firstName: string
  lastName: string
  profilePicture?: string | MediaObject | null
}

export interface MessageResponse {
  id: number
  chatId: number
  senderId: number
  sender?: MessageSender
  content: string | RichTextContent | null
  type: string
  replyToMessageId?: number
  attachments?: MessageAttachment[]
  reactions: { emoji: string; userId: number; createdAt: string }[]
  isEdited: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MessageAttachment extends MediaObject {
  id: number
  filename?: string
  mimeType?: string
  filesize?: number
  width?: number
  height?: number
  alt?: string
}

export interface MediaUploadResult {
  id: number
  url: string
  cloudinaryURL?: string
  mimeType?: string
  width?: number
  height?: number
  filename?: string
}

export interface MessageListResponse {
  data: MessageResponse[]
  nextCursor: number | string | null
  prevCursor: number | string | null
  hasMore: boolean
}

export interface UserListItem {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  profilePicture?: string | MediaObject | null
  isActive?: boolean
}

export interface MessengerOverview {
  conversations: ChatListItem[]
  users: UserListItem[]
}

export async function fetchMessengerOverview(
  options: ApiFetchOptions,
  search?: string
): Promise<MessengerOverview> {
  const params = new URLSearchParams()
  params.set("limit", "50")
  if (search) params.set("search", search)
  return apiFetch<MessengerOverview>(`/api/lms/messenger?${params}`, options)
}

export async function fetchChatDetail(
  chatId: number,
  options: ApiFetchOptions
): Promise<unknown> {
  return apiFetch(`/api/chat/${chatId}`, options)
}

export async function fetchMessages(
  chatId: number,
  options: ApiFetchOptions,
  cursor?: string
): Promise<MessageListResponse> {
  const params = new URLSearchParams()
  params.set("limit", "50")
  params.set("direction", "backward")
  if (cursor) params.set("cursor", cursor)
  const result = await apiFetch<MessageListResponse>(
    `/api/chat/${chatId}/messages?${params}`,
    options
  )
  // API returns newest-first (sort: -createdAt). Reverse so oldest is first
  // for proper chronological chat display (oldest at top, newest at bottom).
  return { ...result, data: [...result.data].reverse() }
}

export async function postMessage(
  chatId: number,
  content: string,
  options: ApiFetchOptions,
  replyToMessageId?: number,
  attachments?: number[]
): Promise<MessageResponse> {
  const body: Record<string, unknown> = { content, type: "text" }
  if (replyToMessageId) body.replyToMessageId = replyToMessageId
  if (attachments && attachments.length > 0) {
    body.type = "image"
    body.attachments = attachments
  }
  return apiFetch<MessageResponse>(`/api/chat/${chatId}/messages`, options, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

function resolveMediaUrl(media: unknown): string {
  if (!media) return ""
  if (typeof media === "string") return media
  const mediaObject = media as MediaObject
  const raw =
    mediaObject.cloudinaryURL ||
    mediaObject.url ||
    mediaObject.secure_url ||
    mediaObject.thumbnailURL ||
    ""
  return typeof raw === "string" ? raw : ""
}

export async function uploadImageToMedia(
  file: File,
  options: ApiFetchOptions
): Promise<MediaUploadResult> {
  const base = (options.apiBaseUrl || DEFAULT_API_BASE).replace(/\/$/, "")
  const formData = new FormData()
  formData.append("file", file)
  formData.append("alt", file.name.replace(/\.[^.]+$/, ""))

  const res = await fetch(`${base}/api/media`, {
    method: "POST",
    headers: {
      Authorization: `JWT ${options.token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    let message = `Upload failed (${res.status})`
    try {
      const body = await res.json()
      message = body.errors?.[0]?.message || body.message || body.error || message
    } catch { /* response body may not be JSON */ }
    throw new Error(message)
  }

  const json = await res.json()
  const doc = json.doc && typeof json.doc === "object" ? json.doc : json

  return {
    id: Number(doc.id),
    url: resolveMediaUrl(doc),
    cloudinaryURL: doc.cloudinaryURL,
    mimeType: doc.mimeType,
    width: doc.width,
    height: doc.height,
    filename: doc.filename,
  }
}

export async function createChat(
  options: ApiFetchOptions,
  type: string,
  participantIds: number[],
  title?: string
): Promise<{ id: number; type: string; status: string }> {
  const body: Record<string, unknown> = { type, participantIds }
  if (title) body.title = title
  return apiFetch("/api/chat", options, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function markChatRead(
  chatId: number,
  options: ApiFetchOptions
): Promise<{ success: boolean; count: number }> {
  return apiFetch(`/api/chat/${chatId}/read`, options, { method: "POST" })
}

export async function postTyping(
  chatId: number,
  isTyping: boolean,
  options: ApiFetchOptions
): Promise<void> {
  await apiFetch(`/api/chat/${chatId}/typing`, options, {
    method: "POST",
    body: JSON.stringify({ isTyping }),
  })
}

export {
  extractTextFromContent,
  resolveSenderId,
  resolveSenderName,
  resolveSenderAvatar,
  resolveMediaUrl,
}
