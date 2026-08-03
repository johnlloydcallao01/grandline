"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  createSupabaseClient,
  ChatChannelManager,
  type RealtimeEvent,
} from "@grandline/chat-engine"
import {
  fetchMessages,
  fetchMessengerOverview,
  postMessage,
  createChat,
  markChatRead,
  extractTextFromContent,
  resolveMediaUrl,
  getErrorMessage,
  type ChatListItem,
  type MessageResponse,
} from "./messenger-api"

interface RealtimeMessagePayload {
  id: number
  sender?: number | string | { id: number }
  content?: unknown
  createdAt?: string
}

interface BroadcastPayload {
  type?: string
  event?: string
  payload?: {
    messageId?: number
    chatId?: number
    sender?: number | string
    content?: unknown
    type?: string
    attachments?: string[]
    createdAt?: string
  }
}

interface RealtimeChannelLike {
  on(
    event: "broadcast",
    opts: { event: string },
    callback: (payload: BroadcastPayload) => void
  ): RealtimeChannelLike
  send(args: {
    type: "broadcast"
    event: string
    payload: Record<string, unknown>
  }): Promise<"ok">
}

function getChatChannel(
  manager: ChatChannelManager | null,
  chatId: number
): RealtimeChannelLike | undefined {
  return (
    manager as unknown as { channels?: Map<string, RealtimeChannelLike> }
  ).channels?.get(`chat:${chatId}`)
}

export interface MessengerConversation {
  id: number
  name: string
  type: string
  status: string
  participants: MessengerParticipant[]
  lastMessage: string
  lastMessageAt: string | null
  unread: number
  isGroup: boolean
  pendingUserId?: number | null
}

export interface MessengerParticipant {
  id: number
  name: string
  avatar: string | null
  role: string
}

export interface MessengerMessage {
  id: number
  senderId: number
  senderName: string
  senderAvatar: string | null
  content: string
  type: string
  createdAt: string
  isOwn: boolean
  isEdited: boolean
  replyToId: number | null
  reactions: { emoji: string; userId: number }[]
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: number
  url: string
  mimeType?: string
  width?: number
  height?: number
  filename?: string
}

export interface MessengerUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  profilePicture: string | null
  initials: string
  displayName: string
}

export interface MessengerContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void

  currentUserId: number | null
  isAuthenticated: boolean
  token?: string | null
  apiBaseUrl?: string

  conversations: MessengerConversation[]
  isLoadingConversations: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  filteredConversations: MessengerConversation[]

  users: MessengerUser[]
  isLoadingUsers: boolean
  openUserChat: (userId: number) => Promise<void>

  activeConversation: MessengerConversation | null
  openConversation: (conv: MessengerConversation) => void
  closeConversation: () => void

  messages: MessengerMessage[]
  isLoadingMessages: boolean
  hasMoreMessages: boolean
  loadMoreMessages: () => Promise<void>

  sendMessage: (content: string, replyToMessageId?: number, attachments?: number[]) => Promise<void>
  createNewConversation: (
    type: string,
    participantIds: number[],
    title?: string
  ) => Promise<MessengerConversation>
  markRead: (conversationId: number) => Promise<void>

  unreadCount: number
  error: string | null
  clearError: () => void
}

const MessengerContext = createContext<MessengerContextValue | null>(null)

function mapChatToConversation(
  chat: ChatListItem
): MessengerConversation {
  return {
    id: chat.id,
    name: chat.title || "Chat",
    type: chat.type,
    status: chat.status,
    participants: chat.participants.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || null,
      role: p.role,
    })),
    lastMessage: chat.lastMessagePreview || "",
    lastMessageAt: chat.lastMessageAt || null,
    unread: chat.unreadCount || 0,
    isGroup: chat.type === "group",
  }
}

function mapMessageToMessenger(
  msg: MessageResponse,
  currentUserId: number
): MessengerMessage {
  const senderName = msg.sender
    ? `${msg.sender.firstName} ${msg.sender.lastName || ""}`.trim()
    : "Unknown"
  const senderAvatar =
    msg.sender?.profilePicture &&
    typeof msg.sender.profilePicture === "object" &&
    msg.sender.profilePicture.url
      ? msg.sender.profilePicture.url
      : null

  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName,
    senderAvatar,
    content: extractTextFromContent(msg.content),
    type: msg.type || "text",
    createdAt: msg.createdAt,
    isOwn: msg.senderId === currentUserId,
    isEdited: msg.isEdited,
    replyToId: msg.replyToMessageId || null,
    reactions: msg.reactions || [],
    attachments: (msg.attachments || []).map((a) => ({
      id: Number(a.id ?? 0),
      url: resolveMediaUrl(a),
      mimeType: a.mimeType,
      width: a.width,
      height: a.height,
      filename: a.filename,
    })),
  }
}

function dedupMessages(msgs: MessengerMessage[]): MessengerMessage[] {
  const seen = new Set<number>()
  return msgs.filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
}

let tempIdSeed = 900000000

export function MessengerProvider({
  children,
  token,
  userId,
  apiBaseUrl,
}: {
  children: React.ReactNode
  token?: string | null
  userId?: number | null
  apiBaseUrl?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<MessengerConversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversation, setActiveConversation] =
    useState<MessengerConversation | null>(null)
  const [messages, setMessages] = useState<MessengerMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<MessengerUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const messagesCursorRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const activeConversationRef = useRef<MessengerConversation | null>(null)
  const channelManagerRef = useRef<ChatChannelManager | null>(null)
  const supabaseClientRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null)
  const channelManagerReadyRef = useRef(false)
  const [channelManagerReady, setChannelManagerReady] = useState(false)

  const currentUserId = userId ?? null
  const isAuthenticated = !!token && !!userId

  const apiOpts = useMemo(
    () => (token ? { token, apiBaseUrl } : { token: "", apiBaseUrl }),
    [token, apiBaseUrl]
  )

  const clearError = useCallback(() => setError(null), [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  // Keep a ref of the active conversation so realtime handlers can always
  // access the latest value without re-subscribing.
  activeConversationRef.current = activeConversation

  // Initialize the Supabase realtime client once (mirrors discussion-board).
  useEffect(() => {
    if (channelManagerReadyRef.current) return

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) {
        console.warn(
          "[Messenger] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY, realtime disabled"
        )
        return
      }

      const supabaseClient = createSupabaseClient({
        supabaseUrl: url,
        supabaseKey: key,
      })
      supabaseClientRef.current = supabaseClient
      channelManagerRef.current = new ChatChannelManager(supabaseClient)
      channelManagerReadyRef.current = true
      setChannelManagerReady(true)
    } catch (e) {
      console.error("[Messenger] Failed to initialize realtime client", e)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setConversations([])
      setUsers([])
      setUnreadCount(0)
      return
    }

    let cancelled = false
    setIsLoadingConversations(true)
    setIsLoadingUsers(true)

    fetchMessengerOverview(apiOpts)
      .then((overview) => {
        if (cancelled) return
        const mappedConvs = overview.conversations.map((c) =>
          mapChatToConversation(c)
        )
        setConversations(mappedConvs)
        setUnreadCount(mappedConvs.reduce((s, c) => s + c.unread, 0))

        const mappedUsers = overview.users
          .filter((u) => u.id !== userId)
          .map((u) => {
            const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email
            return {
              id: u.id,
              firstName: u.firstName || "",
              lastName: u.lastName || "",
              email: u.email,
              role: u.role,
              profilePicture:
                typeof u.profilePicture === "string"
                  ? u.profilePicture
                  : u.profilePicture && typeof u.profilePicture === "object" && u.profilePicture.url
                    ? u.profilePicture.url
                    : null,
              initials: name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              displayName: name,
            }
          })
        setUsers(mappedUsers)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load messenger data")
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingConversations(false)
          setIsLoadingUsers(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, token, userId, apiOpts])

  const openConversation = useCallback(
    (conv: MessengerConversation) => {
      setActiveConversation(conv)
      setMessages([])
      messagesCursorRef.current = null
      setHasMoreMessages(false)

      if (!isAuthenticated || !token) return
      // Tentative conversations (not yet persisted) have no messages to fetch
      if (conv.pendingUserId || conv.id < 0) {
        setHasMoreMessages(false)
        return
      }

      setIsLoadingMessages(true)
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      fetchMessages(conv.id, apiOpts)
        .then((result) => {
          const mapped = result.data.map((m) =>
            mapMessageToMessenger(m, currentUserId!)
          )
          setMessages(dedupMessages(mapped))
          setHasMoreMessages(result.hasMore)
          messagesCursorRef.current = result.nextCursor
            ? String(result.nextCursor)
            : null
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError(err.message || "Failed to load messages")
          }
        })
        .finally(() => setIsLoadingMessages(false))

      if (conv.unread > 0) {
        markChatRead(conv.id, apiOpts).catch(() => {})
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conv.id ? { ...c, unread: 0 } : c
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - conv.unread))
      }
    },
    [isAuthenticated, token, currentUserId, apiOpts]
  )

  const closeConversation = useCallback(() => {
    setActiveConversation(null)
    setMessages([])
    messagesCursorRef.current = null
  }, [])

  // Realtime subscription for the active conversation.
  // Mirrors discussion-board pattern EXACTLY: postgres_changes + broadcast listener.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const conv = activeConversation
    if (
      conv &&
      channelManagerRef.current &&
      channelManagerReady
    ) {
      // Skip tentative (not-yet-persisted) conversations.
      if (conv.pendingUserId || conv.id < 0) return

      console.log(`[Messenger] Subscribing to chat ${conv.id}`)
      console.log("[Messenger] ChannelManager ready:", channelManagerReady)
      console.log("[Messenger] ChannelManager instance:", channelManagerRef.current ? "exists" : "null")

      // 1) postgres_changes listener (database changes)
      unsubscribe = channelManagerRef.current.subscribeToChat(
        conv.id,
        (event: RealtimeEvent) => {
          console.log(`[Messenger] 🔔 Realtime Event Received:`, event.type, event)

          if (event.type === "message_insert") {
            console.log("[Messenger] Message insert payload:", event.payload)
                const newMsg = event.payload as RealtimeMessagePayload
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) {
                console.log(`[Messenger] Message ${newMsg.id} already exists, skipping`)
                return prev
              }
              console.log("[Messenger] New message detected, refetching messages...")
              setTimeout(() => {
                if (activeConversationRef.current?.id === conv.id) {
                  fetchMessages(conv.id, apiOpts).then((result) => {
                    const mapped = result.data.map((m) =>
                      mapMessageToMessenger(m, currentUserId!)
                    )
                    setMessages(dedupMessages(mapped))
                  })
                }
              }, 100)
              return prev
            })
          } else if (event.type === "message_update") {
            const updated = event.payload as RealtimeMessagePayload
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updated.id
                  ? { ...m, content: extractTextFromContent(updated.content), isEdited: true }
                  : m
              )
            )
          } else if (event.type === "message_delete") {
            const deleted = event.payload as RealtimeMessagePayload
            setMessages((prev) => prev.filter((m) => m.id !== deleted.id))
          } else if (event.type === "status_update") {
            console.log("[Messenger] Status update:", event.payload)
          }
        }
      )

      // 2) Broadcast listener for cross-tab / immediate updates.
      //    This is the PRIMARY mechanism for instant delivery, exactly
      //    matching the discussion-board pattern.
      const channel = getChatChannel(channelManagerRef.current, conv.id)
      if (channel) {
        console.log("[Messenger] Setting up broadcast listener for new_message")
        channel.on("broadcast", { event: "new_message" }, (payload: BroadcastPayload) => {
          console.log("[Messenger] 📡 Broadcast received:", payload)
          setTimeout(() => {
            if (activeConversationRef.current?.id === conv.id) {
              fetchMessages(conv.id, apiOpts).then((result) => {
                const mapped = result.data.map((m) =>
                  mapMessageToMessenger(m, currentUserId!)
                )
                setMessages(dedupMessages(mapped))
              })
            }
          }, 100)
        })
      }
    }

    return () => {
      if (unsubscribe) unsubscribe()
      // The broadcast listener is attached to the same channel object managed
      // by subscribeToChat. When unsubscribe() removes the last handler,
      // ChatChannelManager calls removeChannel() which tears down everything
      // including the broadcast listener.
    }
  }, [activeConversation, channelManagerReady, currentUserId, apiOpts])

  // Global realtime subscription for the SIDEBAR (conversation list).
  // Listens to ALL messenger chats the user participates in, updating the
  // lastMessage preview, timestamp, and unread badge in real time.
  //
  // We subscribe once per distinct set of chat IDs (chatIdsKey) so that
  // unread/preview updates don't tear down the channel.
  const chatIdsKey = useMemo(
    () =>
      conversations
        .filter((c) => !c.pendingUserId && c.id > 0)
        .map((c) => c.id)
        .sort((a, b) => a - b)
        .join(","),
    [conversations]
  )

  useEffect(() => {
    if (!channelManagerReady || !channelManagerRef.current) return

    const chatIds = chatIdsKey
      ? chatIdsKey.split(",").map(Number)
      : []

    if (chatIds.length === 0) return

    console.log("[Messenger] Subscribing sidebar to chats:", chatIds)

    const unsubscribes: (() => void)[] = []
    const channels: RealtimeChannelLike[] = []

    const updateSidebar = (chatId: number, preview: string, createdAt: string) => {
      const isActiveChat = activeConversationRef.current?.id === chatId
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c
          return {
            ...c,
            lastMessage: preview,
            lastMessageAt: createdAt,
            unread: isActiveChat ? 0 : c.unread + 1,
          }
        })
      )
      setUnreadCount((prev) => (isActiveChat ? prev : prev + 1))
    }

    chatIds.forEach((chatId) => {
      // 1) postgres_changes via subscribeToChat (same as discussion-board)
      const unsub = channelManagerRef.current!.subscribeToChat(chatId, (event) => {
        if (event.type === "message_insert") {
          const newMsg = event.payload as RealtimeMessagePayload
          const senderId = newMsg.sender
          const isOwnMessage = String(senderId) === String(currentUserId)
          console.log("[Messenger] 📬 Sidebar postgres insert:", { chatId, senderId, isOwnMessage })
          if (isOwnMessage) return
          const preview = extractTextFromContent(newMsg.content) || "[Message]"
          updateSidebar(chatId, preview, newMsg.createdAt ?? "")
        }
      })
      unsubscribes.push(unsub)

      // 2) broadcast listener for new_message (PRIMARY instant mechanism)
      const channel = getChatChannel(channelManagerRef.current, chatId)
      if (channel) {
        channel.on("broadcast", { event: "new_message" }, (payload: BroadcastPayload) => {
          const bc = payload?.payload || {}
          const senderId = bc.sender
          const isOwnMessage = String(senderId) === String(currentUserId)
          console.log("[Messenger] 📡 Sidebar broadcast received:", bc, { isOwnMessage })
          if (isOwnMessage) return
          const preview = extractTextFromContent(bc.content) || "[Message]"
          updateSidebar(chatId, preview, bc.createdAt ?? "")
        })
        channels.push(channel)
      }
    })

    return () => {
      unsubscribes.forEach((u) => u())
      // Channels are torn down by subscribeToChat's unsubscribe when the last
      // handler is removed, which also removes the broadcast listeners.
    }
  }, [chatIdsKey, channelManagerReady, currentUserId, apiOpts])

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMoreMessages || !isAuthenticated || !token)
      return
    const cursor = messagesCursorRef.current
    if (!cursor) return

    try {
      const result = await fetchMessages(activeConversation.id, apiOpts, cursor)
      const mapped = result.data.map((m) =>
        mapMessageToMessenger(m, currentUserId!)
      )
      setMessages((prev) => dedupMessages([...mapped, ...prev]))
      setHasMoreMessages(result.hasMore)
      messagesCursorRef.current = result.nextCursor
        ? String(result.nextCursor)
        : null
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load more messages")
    }
  }, [activeConversation, hasMoreMessages, isAuthenticated, token, currentUserId, apiOpts])

  const sendMessage = useCallback(
    async (content: string, replyToMessageId?: number, attachments?: number[]) => {
      if (!activeConversation || !isAuthenticated || !token) return
      const hasAttachments = attachments && attachments.length > 0
      const trimmed = content.trim()
      if (!trimmed && !hasAttachments) return

      const tempId = --tempIdSeed
      const optimistic: MessengerMessage = {
        id: tempId,
        senderId: currentUserId!,
        senderName: "You",
        senderAvatar: null,
        content: trimmed,
        type: hasAttachments ? "image" : "text",
        createdAt: new Date().toISOString(),
        isOwn: true,
        isEdited: false,
        replyToId: replyToMessageId || null,
        reactions: [],
        attachments: undefined,
      }

      setMessages((prev) => [...prev, optimistic])

      try {
        let chatId = activeConversation.id

        // If this is a tentative (not-yet-persisted) conversation,
        // create the real chat now, before sending the first message.
        if (activeConversation.pendingUserId) {
          const created = await createChat(
            apiOpts,
            "messenger",
            [activeConversation.pendingUserId]
          )
          chatId = created.id

          // Immediately subscribe to the new chat so we don't miss the
          // postgres_changes INSERT event that fires on postMessage below.
          if (channelManagerRef.current) {
            channelManagerRef.current.subscribeToChat(chatId, (event) => {
              if (event.type === "message_insert") {
            const newMsg = event.payload as RealtimeMessagePayload
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id)) return prev
                  setTimeout(() => {
                    if (activeConversationRef.current?.id === chatId) {
                      fetchMessages(chatId, apiOpts).then((result) => {
                        setMessages(dedupMessages(result.data.map((m) =>
                          mapMessageToMessenger(m, currentUserId!)
                        )))
                      })
                    }
                  }, 100)
                  return prev
                })
              }
            })
          }
        }

        const real = await postMessage(
          chatId,
          trimmed,
          apiOpts,
          replyToMessageId,
          attachments
        )
        const mapped = mapMessageToMessenger(real, currentUserId!)
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? mapped : m))
        )

        if (activeConversation.pendingUserId) {
          const realConv: MessengerConversation = {
            ...activeConversation,
            id: chatId,
            lastMessage: trimmed || "[Image]",
            lastMessageAt: new Date().toISOString(),
            pendingUserId: null,
          }
          setActiveConversation(realConv)
          setConversations((prev) => [realConv, ...prev])
        } else {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? { ...c, lastMessage: trimmed || "[Image]", lastMessageAt: new Date().toISOString() }
                : c
            )
          )
        }

        // Broadcast to other tabs/devices via Supabase (exactly matches
        // discussion-board pattern — this is the PRIMARY instant-delivery mechanism)
        if (channelManagerRef.current) {
          console.log(`[Messenger] Broadcasting new message to chat:${chatId}`)
          try {
            const channel = getChatChannel(channelManagerRef.current, chatId)
            if (channel) {
              await channel.send({
                type: "broadcast",
                event: "new_message",
                payload: {
                  messageId: real.id,
                  chatId,
                  sender: currentUserId,
                  content: trimmed,
                  type: hasAttachments ? "image" : "text",
                  attachments: real.attachments?.map((a) => resolveMediaUrl(a)),
                  createdAt: real.createdAt,
                },
              })
              console.log("[Messenger] Broadcast sent successfully")
            }
          } catch (broadcastError) {
            console.error("[Messenger] Broadcast failed:", broadcastError)
          }
        }
      } catch (err: unknown) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setError(getErrorMessage(err) || "Failed to send message")
      }
    },
    [activeConversation, isAuthenticated, token, currentUserId, apiOpts]
  )

  const createNewConversation = useCallback(
    async (
      type: string,
      participantIds: number[],
      title?: string
    ): Promise<MessengerConversation> => {
      if (!isAuthenticated || !token) throw new Error("Not authenticated")
      const result = await createChat(apiOpts, type, participantIds, title)
      const conv: MessengerConversation = {
        id: result.id,
        name: title || "New Chat",
        type: result.type,
        status: result.status,
        participants: participantIds.map((pid) => ({
          id: pid,
          name: "",
          avatar: null,
          role: "trainee",
        })),
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
        unread: 0,
        isGroup: type === "group",
      }
      setConversations((prev) => [conv, ...prev])
      return conv
    },
    [isAuthenticated, token, apiOpts]
  )

  const markRead = useCallback(
    async (conversationId: number) => {
      if (!isAuthenticated || !token) return
      try {
        await markChatRead(conversationId, apiOpts)
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c
            return { ...c, unread: 0 }
          })
        )
        setUnreadCount((prev) => {
          const conv = conversations.find((c) => c.id === conversationId)
          return prev - (conv?.unread || 0)
        })
      } catch { /* mark-read failure is non-critical */ }
    },
    [isAuthenticated, token, apiOpts, conversations]
  )

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    )
  }, [conversations, searchQuery])

  const openUserChat = useCallback(
    async (targetUserId: number) => {
      if (!isAuthenticated || !token) return

      const existing = conversations.find(
        (c) =>
          !c.isGroup &&
          c.participants.some((p) => p.id === targetUserId)
      )
      if (existing) {
        openConversation(existing)
        return
      }

      const targetUser = users.find((u) => u.id === targetUserId)
      if (!targetUser) return

      // Open a tentative conversation (not persisted to DB yet).
      // The chat is created on the first real message send.
      const tentative: MessengerConversation = {
        id: -targetUserId,
        name: targetUser.displayName,
        type: "messenger",
        status: "active",
        participants: [
          {
            id: targetUser.id,
            name: targetUser.displayName,
            avatar: targetUser.profilePicture,
            role: targetUser.role,
          },
        ],
        lastMessage: "",
        lastMessageAt: null,
        unread: 0,
        isGroup: false,
        pendingUserId: targetUserId,
      }
      openConversation(tentative)
    },
    [isAuthenticated, token, conversations, users, openConversation]
  )

  const value = useMemo<MessengerContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      currentUserId,
      isAuthenticated,
      token,
      apiBaseUrl,
      conversations,
      isLoadingConversations,
      searchQuery,
      setSearchQuery,
      filteredConversations,
      users,
      isLoadingUsers,
      openUserChat,
      activeConversation,
      openConversation,
      closeConversation,
      messages,
      isLoadingMessages,
      hasMoreMessages,
      loadMoreMessages,
      sendMessage,
      createNewConversation,
      markRead,
      unreadCount,
      error,
      clearError,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      currentUserId,
      isAuthenticated,
      token,
      apiBaseUrl,
      conversations,
      isLoadingConversations,
      searchQuery,
      filteredConversations,
      users,
      isLoadingUsers,
      openUserChat,
      activeConversation,
      openConversation,
      closeConversation,
      messages,
      isLoadingMessages,
      hasMoreMessages,
      loadMoreMessages,
      sendMessage,
      createNewConversation,
      markRead,
      unreadCount,
      error,
      clearError,
    ]
  )

  return (
    <MessengerContext.Provider value={value}>
      {children}
    </MessengerContext.Provider>
  )
}

export function useMessenger(): MessengerContextValue {
  const context = useContext(MessengerContext)
  if (!context) {
    throw new Error("useMessenger must be used within a MessengerProvider")
  }
  return context
}
