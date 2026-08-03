"use client"

import { MessengerIcon } from "./messenger-icons"
import { useMessenger } from "./messenger-context"

export interface MessengerButtonProps {
  onClick?: () => void
  badge?: number
  className?: string
  label?: string
}

export function MessengerButton({ onClick, badge, className = "", label }: MessengerButtonProps) {
  const { open, unreadCount } = useMessenger()
  const count = badge ?? unreadCount

  return (
    <button
      type="button"
      onClick={onClick ?? open}
      aria-label={label ?? (count > 0 ? `Messenger, ${count} unread messages` : "Messenger")}
      className={`relative inline-flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
    >
      <MessengerIcon className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-900"
          aria-hidden="true"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}
