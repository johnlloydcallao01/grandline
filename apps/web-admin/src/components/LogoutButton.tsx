'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from '@/components/ui/IconWrapper'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Mock logout - just redirect to login page
    console.log('🔄 Mock logout initiated...')
    console.log('✅ Mock logout complete')
    
    // Redirect to login page
    console.log('🔄 Redirecting to login page...')
    router.refresh()
    router.replace('/login')
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
