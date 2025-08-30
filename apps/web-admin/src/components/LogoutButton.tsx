'use client'

import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@encreasl/auth'
import { LogOut } from '@/components/ui/IconWrapper'

export default function LogoutButton() {
  const router = useRouter()
  const { logout } = useAdminAuth()

  const handleLogout = async () => {
    try {
      console.log('🔄 Attempting logout...')

      // Use the auth context logout function
      await logout()

      console.log('✅ Logout successful')

      // Redirect to login page
      router.refresh()
      router.replace('/admin/login')

    } catch (err) {
      console.log('ℹ️ Logout error (proceeding anyway):', err)

      // Even if logout fails, redirect to login
      router.refresh()
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
