"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { usePhysicsCarousel } from './physics-carousel'

interface Participant {
  id: number
  name: string
  avatar: string
  online: boolean
}

interface Conversation {
  id: number
  name: string
  participants: Participant[]
  lastMessage: string
  time: string
  unread: number
  online: boolean
}

interface Message {
  id: number
  senderId: number
  text: string
  time: string
  date: string
  read: boolean
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1, name: 'Capt. Robert Caldwell', lastMessage: 'The navigation equipment for the upcoming voyage is ready for review', time: '2m', unread: 2, online: true,
    participants: [{ id: 101, name: 'Capt. Robert Caldwell', avatar: 'RC', online: true }]
  },
  {
    id: 2, name: 'Marine Engineering Dept', lastMessage: 'Engine maintenance schedule updated for Q3', time: '15m', unread: 0, online: false,
    participants: [
      { id: 102, name: 'John Mitchell', avatar: 'JM', online: false },
      { id: 103, name: 'David Torres', avatar: 'DT', online: true },
      { id: 104, name: 'Sarah Chen', avatar: 'SC', online: false },
    ]
  },
  {
    id: 3, name: 'Dr. Maria Santos', lastMessage: 'Thank you for the course materials. The trainees found them very helpful', time: '1h', unread: 1, online: true,
    participants: [{ id: 105, name: 'Dr. Maria Santos', avatar: 'MS', online: true }]
  },
  {
    id: 4, name: 'STCW Compliance Team', lastMessage: 'Next audit scheduled for August 15th. Please prepare documentation', time: '3h', unread: 0, online: false,
    participants: [
      { id: 106, name: 'James O\'Brien', avatar: 'JO', online: true },
      { id: 107, name: 'Lisa Park', avatar: 'LP', online: false },
      { id: 108, name: 'Ahmed Hassan', avatar: 'AH', online: false },
    ]
  },
  {
    id: 5, name: 'Henry Williams', lastMessage: 'Got it. Will finalize the report by end of day', time: 'Yesterday', unread: 0, online: false,
    participants: [{ id: 109, name: 'Henry Williams', avatar: 'HW', online: false }]
  },
  {
    id: 6, name: 'Navigation & Bridge Team', lastMessage: 'New electronic chart updates available for download', time: 'Yesterday', unread: 3, online: false,
    participants: [
      { id: 110, name: 'Michael Brown', avatar: 'MB', online: true },
      { id: 111, name: 'Chris Turner', avatar: 'CT', online: false },
    ]
  },
  {
    id: 7, name: 'HR - Emily Foster', lastMessage: 'Your leave request has been approved \u2705', time: '2d', unread: 0, online: true,
    participants: [{ id: 112, name: 'Emily Foster', avatar: 'EF', online: true }]
  },
  {
    id: 8, name: 'IT Support Desk', lastMessage: 'Ticket #4521: VPN access issue resolved. Please verify', time: '2d', unread: 0, online: false,
    participants: [
      { id: 113, name: 'Alex Rivera', avatar: 'AR', online: true },
      { id: 114, name: 'Kevin Nguyen', avatar: 'KN', online: false },
    ]
  },
]

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, senderId: 101, text: 'Good morning! I\'ve reviewed the navigation equipment list for the upcoming voyage.', time: '9:32 AM', date: 'Today', read: true },
    { id: 2, senderId: 0, text: 'Good morning Captain. What needs to be done?', time: '9:35 AM', date: 'Today', read: true },
    { id: 3, senderId: 101, text: 'The radar system on Bridge 2 needs calibration. I\'ve submitted a maintenance request.', time: '9:38 AM', date: 'Today', read: true },
    { id: 4, senderId: 0, text: 'I\'ll prioritize that. When is the voyage scheduled?', time: '9:40 AM', date: 'Today', read: true },
    { id: 5, senderId: 101, text: 'Departure is set for August 10th. We have two weeks to get everything ready.', time: '9:42 AM', date: 'Today', read: true },
    { id: 6, senderId: 0, text: 'Plenty of time. I\'ll coordinate with the engineering team.', time: '9:45 AM', date: 'Today', read: true },
    { id: 7, senderId: 101, text: 'The navigation equipment for the upcoming voyage is ready for review', time: '9:48 AM', date: 'Today', read: false },
  ],
  3: [
    { id: 1, senderId: 105, text: 'Hello! I wanted to share some feedback on the STCW Basic Safety course.', time: '2:15 PM', date: 'Today', read: true },
    { id: 2, senderId: 0, text: 'Please do! We value your input.', time: '2:18 PM', date: 'Today', read: true },
    { id: 3, senderId: 105, text: 'The trainees really enjoyed the simulation exercises. The hands-on approach was very effective.', time: '2:22 PM', date: 'Today', read: true },
    { id: 4, senderId: 0, text: 'That\'s great to hear. We put a lot of effort into those.', time: '2:25 PM', date: 'Today', read: true },
    { id: 5, senderId: 105, text: 'One suggestion though \u2014 could we add more scenarios on firefighting?', time: '2:28 PM', date: 'Today', read: true },
    { id: 6, senderId: 0, text: 'Absolutely. I\'ll discuss with the curriculum team.', time: '2:30 PM', date: 'Today', read: true },
    { id: 7, senderId: 105, text: 'Thank you for the course materials. The trainees found them very helpful', time: '2:35 PM', date: 'Today', read: false },
  ],
}

const MOCK_USERS = [
  { id: 1, name: 'Robert Caldwell', initials: 'RC', online: true },
  { id: 2, name: 'Maria Santos', initials: 'MS', online: true },
  { id: 3, name: 'John Mitchell', initials: 'JM', online: false },
  { id: 4, name: 'David Torres', initials: 'DT', online: true },
  { id: 5, name: 'Sarah Chen', initials: 'SC', online: false },
  { id: 6, name: 'James O\'Brien', initials: 'JO', online: true },
  { id: 7, name: 'Emily Foster', initials: 'EF', online: true },
  { id: 8, name: 'Alex Rivera', initials: 'AR', online: true },
  { id: 9, name: 'Lisa Park', initials: 'LP', online: false },
  { id: 10, name: 'Ahmed Hassan', initials: 'AH', online: true },
  { id: 11, name: 'Kevin Nguyen', initials: 'KN', online: false },
  { id: 12, name: 'Michael Brown', initials: 'MB', online: true },
]

const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
]

function getColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function formatRelativeTime(dateStr: string): string {
  if (dateStr === 'Today') return ''
  if (dateStr === 'Yesterday') return 'Yesterday'
  return dateStr
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CheckCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  )
}

function SmileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

interface UserCarouselProps {
  onUserSelect?: (userName: string) => void
}

function UserCarousel({ onUserSelect }: UserCarouselProps) {
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
  } = usePhysicsCarousel({
    containerRef: containerRef as React.RefObject<HTMLElement | null>,
    trackRef: trackRef as React.RefObject<HTMLElement | null>,
    momentumMultiplier: 200,
    rubberBandFactor: 0.3,
    dragThreshold: 5,
  })

  const handleUserClick = useCallback(
    (userName: string) => {
      if (hasDragged) return
      onUserSelect?.(userName)
    },
    [hasDragged, onUserSelect]
  )

  return (
    <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
      <div
        ref={containerRef}
        className="overflow-hidden px-4 py-3"
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => isDragging && onMove(e.clientX)}
        onMouseUp={() => isDragging && onEnd()}
        onMouseLeave={() => isDragging && onEnd()}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => isDragging && onMove(e.touches[0].clientX)}
        onTouchEnd={() => isDragging && onEnd()}
        style={{ touchAction: 'pan-y', cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          ref={trackRef}
          className="flex gap-3 select-none"
          style={{
            transform: `translateX(${translateX}px)`,
            willChange: 'transform',
          }}
        >
          {MOCK_USERS.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center gap-1 shrink-0"
              style={{ width: 64 }}
              onClick={() => handleUserClick(user.name)}
              onMouseEnter={() => setHoveredUser(user.id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-transform ${
                    getColor(user.name)
                  } ${hoveredUser === user.id ? 'scale-105' : ''}`}
                >
                  {user.initials}
                </div>
                {user.online && (
                  <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-[var(--card-background)]" />
                )}
              </div>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate w-full text-center leading-tight">
                {user.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export interface MessengerContentProps {
  variant: 'modal' | 'page'
  isOpen?: boolean
  onClose?: () => void
}

export function MessengerContent({ variant, isOpen, onClose }: MessengerContentProps) {
  const [mounted, setMounted] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [activeChat, setActiveChat] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variant !== 'modal') return
    if (isOpen) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    } else {
      setAnimate(false)
      const timer = window.setTimeout(() => {
        setMounted(false)
        setActiveChat(null)
        setSearchQuery('')
      }, 300)
      return () => window.clearTimeout(timer)
    }
  }, [isOpen, variant])

  const openChat = useCallback((conv: Conversation) => {
    setActiveChat(conv)
  }, [])

  const backToList = useCallback(() => {
    setActiveChat(null)
  }, [])

  const messages = activeChat ? (MOCK_MESSAGES[activeChat.id] || []) : []
  const groupInitials = activeChat?.name.split(' ').map(w => w[0]).join('').slice(0, 2) || ''

  const filteredConversations = MOCK_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const conversationListPanel = (
    <div className="flex flex-col min-h-0 h-full">
      <div className={`flex items-center justify-between px-4 border-b border-gray-200 dark:border-[var(--card-border)] shrink-0 ${variant === 'page' ? 'h-16' : 'py-3'}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messenger</h2>
        {variant === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
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

      <UserCarousel onUserSelect={(name) => {
        const conv = MOCK_CONVERSATIONS.find(c =>
          c.name.toLowerCase().includes(name.toLowerCase())
        )
        if (conv) setActiveChat(conv)
      }} />

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.participants.length > 1
            const initials = isGroup
              ? conv.name.split(' ').map(w => w[0]).join('').slice(0, 2)
              : conv.participants[0].avatar

            return (
              <button
                key={conv.id}
                onClick={() => openChat(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left ${
                  activeChat?.id === conv.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getColor(conv.name)}`}>
                    {initials}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-[var(--card-background)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{conv.name}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">{conv.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )

  const chatPanel = activeChat ? (
    <div className="flex flex-col min-h-0 h-full">
      <div className={`flex items-center gap-3 px-4 border-b border-gray-200 dark:border-[var(--card-border)] shrink-0 ${variant === 'page' ? 'h-16' : 'py-3'}`}>
        {variant === 'modal' && (
          <button
            onClick={backToList}
            className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getColor(activeChat.name)}`}>
          {activeChat.participants.length === 1 ? activeChat.participants[0].avatar : groupInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{activeChat.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {activeChat.participants.length === 1
              ? (activeChat.online ? 'Active now' : 'Offline')
              : `${activeChat.participants.length} participants`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <PhoneIcon className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <VideoIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === 0
          const showDate = idx === 0 || messages[idx - 1].date !== msg.date
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center py-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                    {formatRelativeTime(msg.date) || msg.date}
                  </span>
                </div>
              )}
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? '' : 'text-gray-400'}`}>
                    <span className={`text-[10px] ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</span>
                    {isOwn && (
                      msg.read
                        ? <CheckCheckIcon className="w-3.5 h-3.5 text-blue-300" />
                        : <CheckIcon className="w-3.5 h-3.5 text-blue-200" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-[var(--card-border)] shrink-0">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors shrink-0">
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-1.5 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-full">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 p-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && messageText.trim()) {
                  setMessageText('')
                }
              }}
            />
            <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors shrink-0">
              <SmileIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { if (messageText.trim()) setMessageText('') }}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              messageText.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
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

  if (variant === 'modal') {
    if (!mounted) return null
    return createPortal(
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${
          animate ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex w-full max-w-sm flex-col bg-white dark:bg-[var(--card-background)] shadow-2xl transition-all duration-300 ease-in-out ${
            animate ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {activeChat ? chatPanel : conversationListPanel}
        </div>
      </div>,
      document.body
    )
  }

  return (
    <div className="flex h-full w-full bg-white dark:bg-[var(--card-background)]">
      <div className="w-[30%] min-w-[320px] max-w-[420px] border-r border-gray-200 dark:border-[var(--card-border)] shrink-0">
        {conversationListPanel}
      </div>
      <div className="flex-1 min-w-0">
        {chatPanel}
      </div>
    </div>
  )
}
