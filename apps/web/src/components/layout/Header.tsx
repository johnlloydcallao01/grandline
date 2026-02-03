'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from "@/components/ui/ImageWrapper";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { HeaderProps } from '@/types';
import { useUser, useLogout } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/auth';
import { SearchProvider } from '@/contexts/SearchContext';
import { useSearch } from '@/hooks/useSearch';
import { DesktopSearchDropdown } from '@/components/search/DesktopSearchDropdown';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';

/**
 * Header component with navigation, search, and user controls
 * 
 * @param sidebarOpen - Whether the sidebar is currently open
 * @param onToggleSidebar - Function to toggle sidebar state
 * @param onSearch - Optional search handler function
 */
export function Header({ sidebarOpen, onToggleSidebar, onSearch }: HeaderProps) {
  return (
    <SearchProvider>
      <HeaderInner sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} onSearch={onSearch} />
      <MobileSearchOverlay />
    </SearchProvider>
  )
}

function HeaderInner({ sidebarOpen, onToggleSidebar, onSearch }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const isNotificationsPage = pathname === '/notifications'
  const { user, displayName } = useUser()
  const { logout, isLoggingOut } = useLogout()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { query, setQuery, setOverlayOpen, setDropdownOpen, getSuggestions, setMode, saveRecentKeyword, loadRecentKeywords, persistRecentKeyword, setTyping } = useSearch()

  const mockNotifications = [
    {
      id: 1,
      type: 'course_completion',
      title: 'Course Completed!',
      message: 'Congratulations! You have successfully completed "STCW Basic Safety Training"',
      timestamp: '2 hours ago',
      read: false,
      icon: 'fa-graduation-cap',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      actionText: 'View Certificate',
      actionPath: '/certificates',
    },
    {
      id: 2,
      type: 'assignment_due',
      title: 'Assignment Due Soon',
      message: 'Your assignment for "Advanced Bridge Management" is due in 2 days',
      timestamp: '4 hours ago',
      read: false,
      icon: 'fa-clock',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      actionText: 'Complete Assignment',
      actionPath: '/assignments',
    },
    {
      id: 3,
      type: 'new_course',
      title: 'New Course Available',
      message: 'Check out the new "Maritime Cybersecurity" course now available',
      timestamp: '1 day ago',
      read: true,
      icon: 'fa-plus-circle',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      actionText: 'View Course',
      actionPath: '/courses',
    },
    {
      id: 4,
      type: 'certificate_issued',
      title: 'Certificate Issued',
      message: 'Your IMO certificate for "Maritime Security Awareness" has been issued',
      timestamp: '2 days ago',
      read: true,
      icon: 'fa-certificate',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      actionText: 'Download Certificate',
      actionPath: '/certificates',
    },
    {
      id: 5,
      type: 'system_update',
      title: 'System Update',
      message: 'New features have been added to improve your learning experience',
      timestamp: '3 days ago',
      read: true,
      icon: 'fa-sync-alt',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      actionText: 'Learn More',
      actionPath: '/updates',
    },
    {
      id: 6,
      type: 'reminder',
      title: 'Study Reminder',
      message: 'Don\'t forget to continue your "Engine Room Operations" course',
      timestamp: '5 days ago',
      read: true,
      icon: 'fa-bell',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      actionText: 'Continue Learning',
      actionPath: '/portal',
    },
    {
      id: 7,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You\'ve earned the "Safety Expert" badge for completing 5 safety courses',
      timestamp: '1 week ago',
      read: true,
      icon: 'fa-trophy',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      actionText: 'View Achievements',
      actionPath: '/achievements',
    },
    {
      id: 8,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment for "Cargo Handling & Stowage" course has been processed',
      timestamp: '1 week ago',
      read: true,
      icon: 'fa-credit-card',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      actionText: 'View Receipt',
      actionPath: '/billing',
    },
  ]

  const handleMyPortalClick = () => {
    router.push('/portal')
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileDropdownOpen(false)
      window.location.href = 'https://grandlinemaritime.com'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
        if (query.trim().length === 0) setMode('suggestions')
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false)
        setIsNotificationsOpen(false)
        setDropdownOpen(false)
        if (query.trim().length === 0) setMode('suggestions')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [query, setDropdownOpen, setMode])

  useEffect(() => {
    const handleScroll = () => {
      const isDesktop = window.innerWidth >= 1024
      if (isDesktop) {
        setIsHeaderVisible(true)
        return
      }
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      }
      setLastScrollY(currentScrollY)
    }
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024
      if (isDesktop) {
        setIsHeaderVisible(true)
      }
    }
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [lastScrollY])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ clearQuery?: boolean }>).detail
      if (detail?.clearQuery) {
        setQuery('')
      }
      setTyping(false)
      setOverlayOpen(true)
      loadRecentKeywords()
      setMode('suggestions')
    }
    window.addEventListener('gl:open-search-overlay', handler as EventListener)
    return () => {
      window.removeEventListener('gl:open-search-overlay', handler as EventListener)
    }
  }, [setOverlayOpen, loadRecentKeywords, setMode, setTyping, setQuery])

  useEffect(() => {
    if (pathname === '/results') {
      const qp = (searchParams.get('search_query') || '').trim()
      if (qp) {
        setQuery(qp)
        setMode('results')
      }
    }
  }, [pathname, searchParams, setQuery, setMode])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = query.trim()
    setTyping(false)
    if (v.length < 2) {
      setDropdownOpen(true)
      setMode('suggestions')
      loadRecentKeywords()
      return
    }
    saveRecentKeyword(query)
    await persistRecentKeyword(query)
    setDropdownOpen(false)
    router.push(`/results?search_query=${encodeURIComponent(v)}` as any)
    if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <header className={`lg:sticky lg:top-0 fixed top-0 left-0 right-0 bg-white z-50 lg:transition-none transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : 'lg:translate-y-0 -translate-y-full'
      }`}>
      {pathname !== '/results' && (
        <div className="lg:hidden flex items-center px-3 py-1.5 space-x-1 sm:space-x-2 h-14">
          <div className="w-[80%] flex items-center justify-start">
            {React.createElement(Image, { src: '/calsiter-inc-logo.png', alt: 'Calsiter Inc Logo', width: 210, height: 56, className: 'h-14 w-auto', priority: true })}
          </div>
          <button
            onClick={() => router.push('/notifications')}
            className="w-[10%] h-10 bg-white rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-bell text-gray-600 text-lg"></i>
          </button>
          <button onClick={() => { setOverlayOpen(true); loadRecentKeywords(); }} className="w-[10%] h-10 bg-white rounded-md flex items-center justify-center">
            <i className="fa fa-search text-gray-600 text-lg"></i>
          </button>
        </div>
      )}

      <div className="hidden lg:flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className={`p-2 hover:bg-gray-100 rounded-full text-gray-800 transition-colors ${sidebarOpen ? 'bg-gray-50' : ''}`} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} aria-expanded={sidebarOpen}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          {React.createElement(Image, { src: '/calsiter-inc-logo.png', alt: 'Calsiter Inc Logo', width: 270, height: 72, className: 'h-16 w-auto', priority: true })}
        </div>

        <div className="flex flex-1 max-w-2xl mx-8">
          <form ref={searchRef} onSubmit={handleSearch} className="flex w-full">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search"
                value={query}
                onFocus={() => {
                  setTyping(false)
                  setDropdownOpen(true)
                  const hasQuery = query.trim().length > 0
                  loadRecentKeywords()
                  setMode('suggestions')
                  if (hasQuery) {
                    getSuggestions(query)
                  }
                }}
                onChange={e => {
                  const v = (e.target as HTMLInputElement).value
                  setQuery(v)
                  setTyping(true)
                  getSuggestions(v)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] text-gray-900 placeholder-gray-500"
              />
              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setMode('suggestions'); loadRecentKeywords(); setTyping(false); setDropdownOpen(true); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                  aria-label="Clear"
                >
                  <i className="fa fa-times"></i>
                </button>
              )}
              <DesktopSearchDropdown />
            </div>
            <button type="submit" className="px-6 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 text-gray-700 focus:outline-none" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                if (isNotificationsPage) return
                setIsNotificationsOpen((prev) => !prev)
              }}
              className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                isNotificationsPage ? 'bg-[#e6e5f7]' : 'bg-white hover:bg-gray-50'
              }`}
              aria-label="Notifications"
              aria-expanded={!isNotificationsPage && isNotificationsOpen}
            >
              <i
                className={`fas fa-bell text-lg ${
                  isNotificationsPage ? 'text-[#201a7c]' : 'text-gray-600'
                }`}
              ></i>
            </button>
            {!isNotificationsPage && isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[420px] max-w-[95vw] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="max-h-[80vh] overflow-y-auto">
                  <NotificationsPanel
                    items={mockNotifications}
                    filters={[
                      { id: 'all', label: 'All', count: mockNotifications.length },
                      {
                        id: 'unread',
                        label: 'Unread',
                        count: mockNotifications.filter((n) => !n.read).length,
                      },
                      {
                        id: 'learning',
                        label: 'Learning',
                        count: mockNotifications.filter((n) =>
                          ['course_completion', 'assignment_due', 'new_course', 'reminder', 'achievement'].includes(
                            n.type,
                          ),
                        ).length,
                      },
                      {
                        id: 'account',
                        label: 'Account',
                        count: mockNotifications.filter((n) =>
                          ['payment', 'certificate_issued'].includes(n.type),
                        ).length,
                      },
                      {
                        id: 'system_update',
                        label: 'System Updates',
                        count: mockNotifications.filter((n) => n.type === 'system_update').length,
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
          {!pathname.startsWith('/portal') && (
            <button onClick={handleMyPortalClick} className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: '#fff', color: '#201a7c', boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)' }} onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = '0 0 15px rgba(32, 26, 124, 0.25)' }} onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              My Portal
            </button>
          )}
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Profile menu" aria-expanded={isProfileDropdownOpen}>
              <UserAvatar size="md" showOnlineStatus />
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <UserAvatar size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      {user?.role && (<div className="flex items-center mt-1"><span className="text-xs text-blue-600 font-medium capitalize">{user.role}</span></div>)}
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profile Settings</button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Account Settings</button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2zM4 7h12V5H4v2z" /></svg>Notifications</button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Help & Support</button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                    {isLoggingOut ? (
                      <svg className="w-4 h-4 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    ) : (
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    )}
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
