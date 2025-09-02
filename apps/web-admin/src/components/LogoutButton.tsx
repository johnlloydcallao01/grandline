'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from '@/components/ui/IconWrapper'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      console.log('🔄 Professional admin logout initiated...')

      // Use professional admin cookie manager for complete logout
      const { AdminAuthCookies } = await import('@/utils/admin-auth-cookies');
      AdminAuthCookies.adminLogout();

      // Then attempt the API logout (this may fail with "No User" but that's OK)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log('📡 Admin logout API response status:', response.status)

        if (response.ok) {
          console.log('✅ PayloadCMS admin logout API successful')
        } else {
          const errorData = await response.text()
          console.log('ℹ️ PayloadCMS admin logout API response:', response.status, errorData)

          // "No User" error is expected if session was already cleared
          if (response.status === 400 && errorData.includes('No User')) {
            console.log('✅ Admin session already cleared (No User is expected)')
          }
        }
      } catch (apiErr) {
        console.log('ℹ️ PayloadCMS admin logout API failed (this is OK):', apiErr)
      }

      console.log('✅ Professional admin logout complete')
    } catch (error) {
      console.error('❌ Admin logout error:', error);
      // Fallback to manual cookie clearing
      document.cookie = 'payload-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }

    // Always redirect to login page - logout is complete
    console.log('🔄 Admin logout complete, redirecting to login page...')
    router.refresh()
    router.replace('/admin/login')
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
