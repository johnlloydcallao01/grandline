"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { createPortal } from "react-dom"
import { usePhysicsCarousel } from "./physics-carousel"
import {
  getColor,
  getInitials,
  formatRelativeTime,
  formatMessageTime,
  formatDateSeparator,
  areSameDay,
} from "./messenger-data"
import {
  SearchIcon,
  ArrowLeftIcon,
  XIcon,
  CheckIcon,
  CheckCheckIcon,
  PaperclipIcon,
  SmileIcon,
  SendIcon,
} from "./messenger-icons"
import {
  useMessenger,
  type MessengerMessage,
} from "./messenger-context"
import { uploadImageToMedia, getErrorMessage } from "./messenger-api"

function OnlineIndicator({ online }: { online: boolean }) {
  if (!online) return null
  return (
    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-[var(--card-background)]" />
  )
}

interface AvatarProps {
  name: string
  avatar?: string | null
  size?: number
  isGroup?: boolean
}

function Avatar({ name, avatar, size = 40, isGroup = false }: AvatarProps) {
  const style = { width: size, height: size }

  if (avatar) {
    return (
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={name}
          style={style}
          className="rounded-full object-cover"
        />
        {isGroup && (
          <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-white dark:bg-gray-800 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center">
            <span className="text-[10px]">👥</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative shrink-0">
      <div
        style={style}
        className={`rounded-full flex items-center justify-center text-white text-sm font-semibold ${getColor(name)}`}
      >
        {isGroup ? "👥" : getInitials(name)}
      </div>
    </div>
  )
}

interface UserCarouselProps {
  onUserSelect?: (userName: string) => void
}

function UserCarousel({ onUserSelect }: UserCarouselProps) {
  const { users, isLoadingUsers, openUserChat } = useMessenger()
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [hoveredUser, setHoveredUser] = useState<number | null>(null)

  const {
    translateX,
    isDragging,
    hasDragged,
    onStart,
    onMove,
    onEnd,
    scrollBy,
  } = usePhysicsCarousel({
    containerRef: containerRef as RefObject<HTMLElement | null>,
    trackRef: trackRef as RefObject<HTMLElement | null>,
    momentumMultiplier: 200,
    rubberBandFactor: 0.3,
    dragThreshold: 5,
    measureDeps: [users.length],
  })

  const handleUserClick = useCallback(
    (userId: number) => {
      if (hasDragged) return
      openUserChat(userId)
      onUserSelect?.("")
    },
    [hasDragged, openUserChat, onUserSelect]
  )

  const handleContainerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollBy(80)
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollBy(-80)
      } else if (event.key === "Home") {
        event.preventDefault()
        scrollBy(-10000)
      } else if (event.key === "End") {
        event.preventDefault()
        scrollBy(10000)
      }
    },
    [scrollBy]
  )

  if (isLoadingUsers && users.length === 0) {
    return (
      <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
        <div className="px-4 py-3 flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0 animate-pulse" style={{ width: 64 }}>
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="w-10 h-2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (users.length === 0) return null

  return (
    <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
      <div
        ref={containerRef}
        role="group"
        aria-label="Active users"
        tabIndex={0}
        className="overflow-hidden px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => isDragging && onMove(e.clientX)}
        onMouseUp={() => isDragging && onEnd()}
        onMouseLeave={() => isDragging && onEnd()}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => isDragging && onMove(e.touches[0].clientX)}
        onTouchEnd={() => isDragging && onEnd()}
        onKeyDown={handleContainerKeyDown}
        style={{ touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          ref={trackRef}
          role="list"
          aria-label="Users you can message"
          className="flex gap-3 select-none"
          style={{
            transform: `translateX(${translateX}px)`,
            willChange: "transform",
          }}
        >
          {users.map((user) => (
            <div
              key={user.id}
              role="listitem"
              className="flex flex-col items-center gap-1 shrink-0"
              style={{ width: 64 }}
            >
              <button
                type="button"
                aria-label={`Open conversation with ${user.displayName}`}
                onClick={() => handleUserClick(user.id)}
                onMouseEnter={() => setHoveredUser(user.id)}
                onMouseLeave={() => setHoveredUser(null)}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="relative">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.displayName}
                      className={`w-12 h-12 rounded-full object-cover transition-transform ${hoveredUser === user.id ? "scale-105" : ""}`}
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-transform ${getColor(user.displayName)} ${hoveredUser === user.id ? "scale-105" : ""}`}
                    >
                      {user.initials}
                    </div>
                  )}
                </div>
              </button>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate w-full text-center leading-tight">
                {user.firstName || user.displayName.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MessengerShellProps {
  variant: "modal" | "page"
  onClose?: () => void
}

function ConversationSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function MessageSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-4 py-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 ${i % 2 === 0 ? "w-1/3" : "w-1/2"}`}
          />
        </div>
      ))}
    </div>
  )
}

function ConversationOptionsButton({ onDelete }: { onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  const handleDeleteClick = () => {
    setMenuOpen(false)
    setConfirmText("")
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (confirmText !== "Delete") return
    setIsDeleting(true)
    try {
      await onDelete()
      setShowConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Conversation options"
          aria-expanded={menuOpen}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-[var(--card-background)] border border-[var(--card-border)] rounded-lg shadow-lg z-50 py-1">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <span className="text-base">🗑️</span>
              Delete Conversation
            </button>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Delete Conversation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will permanently delete this conversation and all its messages. This cannot be undone.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Type <span className="font-semibold text-gray-900 dark:text-gray-100">Delete</span> to confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && confirmText === "Delete" && !isDeleting) {
                  handleConfirmDelete()
                }
              }}
              placeholder='Type "Delete"'
              autoFocus
              className="w-full px-3 py-2 mt-2 mb-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false)
                  setConfirmText("")
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={confirmText !== "Delete" || isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MessengerShell({ variant, onClose }: MessengerShellProps) {
  const {
    filteredConversations,
    isLoadingConversations,
    searchQuery,
    setSearchQuery,
    activeConversation,
    openConversation,
    closeConversation,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    sendMessage,
    deleteConversation,
    error,
    clearError,
    token,
    apiBaseUrl,
  } = useMessenger()

  const [messageText, setMessageText] = useState("")
  const [replyTo, setReplyTo] = useState<MessengerMessage | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingImages, setPendingImages] = useState<
    { id: number; file: File; previewUrl: string }[]
  >([])
  const pendingImagesIdRef = useRef(0)
  const isSendingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const clearPendingImages = useCallback(() => {
    setPendingImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      return []
    })
  }, [])

  const handleSend = useCallback(async () => {
    if (isSendingRef.current) return
    const text = messageText.trim()
    if (!activeConversation) return
    if (!text && pendingImages.length === 0) return
    const replyId = replyTo?.id

    isSendingRef.current = true
    setIsUploading(true)
    setUploadError(null)

    try {
      if (pendingImages.length === 0) {
        await sendMessage(text, replyId)
        setMessageText("")
        setReplyTo(null)
        return
      }

      if (!token) return
      const uploaded = await Promise.all(
        pendingImages.map((p) =>
          uploadImageToMedia(p.file, { token, apiBaseUrl })
        )
      )
      const ids = uploaded.map((u) => u.id)
      await sendMessage(text, replyId, ids)
      setMessageText("")
      setReplyTo(null)
      clearPendingImages()
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err) || "Failed to send")
    } finally {
      isSendingRef.current = false
      setIsUploading(false)
    }
  }, [messageText, activeConversation, replyTo, pendingImages, token, apiBaseUrl, sendMessage, clearPendingImages])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      e.target.value = ""
      if (!files.length) return
      const images = files.filter((f) => f.type.startsWith("image/"))
      if (!images.length) return

      const next = images.map((file) => ({
        id: ++pendingImagesIdRef.current,
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      setPendingImages((prev) => [...prev, ...next])
    },
    []
  )

  const removePendingImage = useCallback((id: number) => {
    setPendingImages((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" })
  }, [activeConversation?.id, messages.length])

  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el || !hasMoreMessages || isLoadingMessages) return
    const handleScroll = () => {
      if (el.scrollTop < 50) {
        loadMoreMessages()
      }
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages])

  const conversationListPanel = (
    <div className="flex flex-col min-h-0 h-full">
        <div
          className={`flex items-center gap-2 px-4 border-b border-gray-200 dark:border-[var(--card-border)] shrink-0 ${variant === "page" ? "h-16" : "py-3"}`}
        >
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={variant === "modal" ? "Close messenger" : "Go back"}
              className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Messenger
          </h2>
        </div>

      <div className="px-4 py-2 border-b border-gray-200 dark:border-[var(--card-border)]">
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-full">
          <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 p-0"
          />
        </div>
      </div>

      <UserCarousel />

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-4 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
            <button
              onClick={clearError}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoadingConversations ? (
          <ConversationSkeleton />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500 px-4">
            <p>{searchQuery ? "No conversations found" : "No conversations yet"}</p>
            {!searchQuery && (
              <p className="text-xs mt-1">
                Start a new conversation to begin messaging
              </p>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => openConversation(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left ${activeConversation?.id === conv.id ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            >
              <div className="relative shrink-0">
                <Avatar
                  name={conv.name}
                  avatar={conv.participants?.[0]?.avatar || null}
                  isGroup={conv.isGroup}
                />
                <OnlineIndicator online={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {conv.name}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                    {formatRelativeTime(conv.lastMessageAt || "")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                  {conv.unread > 0 && (
                    <span className="shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {conv.unread > 9 ? "9+" : conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )

  const chatPanel = activeConversation ? (
    <div className="relative flex flex-col min-h-0 h-full">
      <div
        className={`flex items-center gap-3 px-4 border-b border-gray-200 dark:border-[var(--card-border)] shrink-0 ${variant === "page" ? "h-16" : "py-3"}`}
      >
        {variant === "modal" ? (
          <button
            type="button"
            onClick={closeConversation}
            aria-label="Back to conversations"
            className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={closeConversation}
            aria-label="Back to conversations"
            className="lg:hidden p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <Avatar
          name={activeConversation.name}
          avatar={activeConversation.participants?.[0]?.avatar || null}
          size={32}
          isGroup={activeConversation.isGroup}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {activeConversation.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {activeConversation.isGroup
              ? `${activeConversation.participants.length} participants`
              : activeConversation.participants[0]?.role || "Member"}
          </p>
        </div>
        <ConversationOptionsButton
          onDelete={() => deleteConversation(activeConversation.id)}
        />
      </div>

      {replyTo && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Replying to {replyTo.senderName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50 dark:bg-gray-900/50"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
            No messages yet. Say hello!
          </div>
        ) : (
          <>
            {hasMoreMessages && (
              <div className="flex justify-center py-2">
                <button
                  onClick={loadMoreMessages}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Load earlier messages
                </button>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isOwn = msg.isOwn
              const showDate =
                idx === 0 ||
                !areSameDay(messages[idx - 1].createdAt, msg.createdAt)
              const showSender =
                !isOwn &&
                (idx === 0 || messages[idx - 1].senderId !== msg.senderId)

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center py-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%]">
                      {showSender && !isOwn && (
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 ml-1">
                          {msg.senderName}
                        </p>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700"
                        }`}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={`${msg.content ? "mb-2" : ""} grid grid-cols-2 gap-1`}>
                            {msg.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`rounded-lg overflow-hidden block ${msg.attachments!.length === 1 ? "col-span-2 max-w-[320px]" : ""}`}
                              >
                                <img
                                  src={att.url}
                                  alt={att.filename || "Image"}
                                  className="w-full object-cover"
                                  loading="lazy"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        {msg.content && <p>{msg.content}</p>}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? "" : "text-gray-400"}`}
                        >
                          <span
                            className={`text-[10px] ${isOwn ? "text-blue-200" : "text-gray-400"}`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </span>
                          {isOwn &&
                            (msg.isEdited ? (
                              <CheckCheckIcon className="w-3.5 h-3.5 text-blue-300" />
                            ) : (
                              <CheckIcon className="w-3.5 h-3.5 text-blue-200" />
                            ))}
                        </div>
                      </div>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 ml-1">
                          {msg.reactions.map((r, ri) => (
                            <span
                              key={ri}
                              className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-1.5 py-0.5 border border-gray-200 dark:border-gray-700"
                            >
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isUploading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg border border-gray-200 dark:border-gray-700">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Uploading image...</span>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-200 dark:border-[var(--card-border)] shrink-0">
        {pendingImages.length > 0 && (
          <div className="flex items-center gap-2 pb-2 overflow-x-auto">
            {pendingImages.map((p) => (
              <div
                key={p.id}
                className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden group"
              >
                <img
                  src={p.previewUrl}
                  alt={p.file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove ${p.file.name}`}
                  onClick={() => removePendingImage(p.id)}
                  disabled={isUploading}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 disabled:opacity-50"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {uploadError && (
          <p className="px-1 pb-2 text-xs text-red-500">{uploadError}</p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors shrink-0 disabled:opacity-50"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="flex-1 flex items-center gap-1.5 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-full">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isUploading) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            className="flex-1 min-w-0 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 p-0"
          />
          <button
            type="button"
            aria-label="Add emoji"
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors shrink-0"
            >
              <SmileIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={isUploading}
            aria-label="Send message"
            className={`p-2 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
              messageText.trim() || pendingImages.length > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }`}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
      Select a conversation to start messaging
    </div>
  )

  if (variant === "page") {
    const hasActiveChat = Boolean(activeConversation)

    return (
      <div className="flex h-full w-full bg-white dark:bg-[var(--card-background)]">
        <div
          className={`${
            hasActiveChat ? "hidden" : "flex w-full"
          } flex-col lg:flex lg:flex-col lg:w-[30%] lg:min-w-[320px] lg:max-w-[420px] lg:shrink-0 lg:border-r lg:border-gray-200 lg:dark:border-[var(--card-border)]`}
        >
          {conversationListPanel}
        </div>
        <div
          className={`${
            hasActiveChat ? "flex w-full" : "hidden"
          } flex-col lg:flex lg:flex-1 lg:min-w-0`}
        >
          {chatPanel}
        </div>
      </div>
    )
  }

  return <>{activeConversation ? chatPanel : conversationListPanel}</>
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return prefersReducedMotion
}

interface ModalMessengerCoreProps {
  isOpen: boolean
  onClose: () => void
}

function ModalMessengerCore({ isOpen, onClose }: ModalMessengerCoreProps) {
  const [mounted, setMounted] = useState(false)
  const [animate, setAnimate] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    const wasOpen = wasOpenRef.current
    wasOpenRef.current = isOpen

    if (!wasOpen && isOpen) {
      setMounted(true)
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      if (prefersReducedMotion) {
        setAnimate(true)
      } else {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setAnimate(true))
        )
      }
    } else if (wasOpen && !isOpen) {
      setAnimate(false)
      const exitTimer = window.setTimeout(() => {
        setMounted(false)
        previouslyFocusedRef.current?.focus()
        previouslyFocusedRef.current = null
      }, prefersReducedMotion ? 0 : 300)
      return () => window.clearTimeout(exitTimer)
    }
  }, [isOpen, prefersReducedMotion])

  useEffect(() => {
    if (!mounted || !isOpen) return
    const frame = requestAnimationFrame(() => panelRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [mounted, isOpen])

  useEffect(() => {
    if (!mounted || !isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mounted, isOpen])

  useEffect(() => {
    if (!mounted || !isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mounted, isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${
        animate
          ? "bg-black/40"
          : "bg-transparent pointer-events-none"
      } ${prefersReducedMotion ? "transition-none" : ""}`}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Messenger"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`flex h-full w-full max-w-sm flex-col bg-white shadow-2xl outline-none dark:bg-[var(--card-background)] transition-transform duration-300 ease-in-out ${
          animate ? "translate-x-0" : "translate-x-full"
        } ${prefersReducedMotion ? "transition-none" : ""}`}
      >
        <MessengerShell variant="modal" onClose={onClose} />
      </div>
    </div>,
    document.body
  )
}

export function ModalMessenger() {
  const { isOpen, close } = useMessenger()
  return <ModalMessengerCore isOpen={isOpen} onClose={close} />
}

export function PageMessenger({ onClose }: { onClose?: () => void }) {
  return <MessengerShell variant="page" onClose={onClose} />
}

export interface MessengerContentProps {
  variant: "modal" | "page"
  isOpen?: boolean
  onClose?: () => void
}

export function MessengerContent({
  variant,
  isOpen,
  onClose,
}: MessengerContentProps) {
  if (variant === "modal") {
    return (
      <ModalMessengerCore
        isOpen={isOpen ?? false}
        onClose={onClose ?? (() => undefined)}
      />
    )
  }
  return <PageMessenger onClose={onClose} />
}

export {
  MessengerProvider,
  useMessenger,
} from "./messenger-context"
export type { MessengerContextValue } from "./messenger-context"
export { MessengerButton } from "./messenger-button"
export type { MessengerButtonProps } from "./messenger-button"
