'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from '@/components/ui/IconWrapper'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      console.log('✅ PayloadCMS logout successful')
      
      // Refresh server components and redirect
      router.refresh()
      router.replace('/admin/login')
    } catch (err) {
      console.error('❌ PayloadCMS logout failed:', err)
      // Even if logout fails, redirect to login page
      router.replace('/admin/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
    >
      <LogOut className="w-4 h-4 mr-3 text-red-500" />
      Sign Out
    </button>
  )
}
