'use client'

import { useRouter } from 'next/navigation'
import { useNotifications } from '@/contexts/NotificationsContext'

export function NotificationBell() {
  const router = useRouter()
  const notifications = useNotifications()
  const unseenCount = notifications?.unseenCount ?? 0

  const handleClick = () => {
    notifications?.markAllAsSeen()
    router.push('/notifications' as any)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-background)] text-gray-800 dark:text-gray-200"
      aria-label="Notifications"
      aria-expanded={false}
    >
      <i className="fa fa-bell text-base" />
      {unseenCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
          {unseenCount > 9 ? '9+' : unseenCount}
        </span>
      )}
    </button>
  )
}