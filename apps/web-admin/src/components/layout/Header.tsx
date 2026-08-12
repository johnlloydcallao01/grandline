'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { HeaderProps } from '@/types'
import { ChevronDown, User, Settings } from '@/components/ui/IconWrapper'
import LogoutButton from '@/components/LogoutButton'
import { useAuth, getFullName, getUserInitials } from '@/hooks/useAuth'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { getCMSImageUrl } from '@/lib/cms'
import { SearchProvider, Search, useSearch } from '@encreasl/ui/search'
import { useAdminSearch } from '@/lib/search'
import { MessengerButton } from '@encreasl/ui/messenger-button'
import { MessengerPanel } from './MessengerPanel'

export function Header({
  sidebarOpen,
  onToggleSidebar,
  onToggleMobileSidebar,
}: HeaderProps) {
  const { dataSource, navigateToResults } = useAdminSearch()

  return (
    <SearchProvider dataSource={dataSource} onNavigateToResults={navigateToResults}>
      <HeaderInner
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
        onToggleMobileSidebar={onToggleMobileSidebar}
      />
      <Search variant="mobile" />
      <MessengerPanel />
    </SearchProvider>
  )
}

function HeaderInner({
  sidebarOpen,
  onToggleSidebar,
  onToggleMobileSidebar,
}: HeaderProps) {
  const pathname = usePathname()
  const { siteName, logoUrl } = useSiteSettings()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, isLoading, error } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    query,
    setQuery,
    setOverlayOpen,
    setDropdownOpen,
    getSuggestions,
    setMode,
    saveRecentKeyword,
    loadRecentKeywords,
    persistRecentKeyword,
    setTyping,
    navigateToResults,
  } = useSearch()

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const userDisplayName = getFullName(user)
  const userInitials = getUserInitials(user)
  const userEmail = user?.email || 'Loading...'
  const userRole = user?.role || 'Loading...'

  const profilePictureUrl = user?.profilePicture
    ? user.profilePicture.cloudinaryURL || getCMSImageUrl(user.profilePicture.url)
    : null

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
        if (query.trim().length === 0) setMode('suggestions')
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false)
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
    if (pathname === '/search') {
      const qp = new URLSearchParams(window.location.search).get('search_query') || ''
      if (qp.trim()) {
        setQuery(qp.trim())
        setMode('results')
      }
    }
  }, [pathname, setQuery, setMode])

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
    navigateToResults(v)
  }

  return (
    <header className="sticky top-0 bg-white dark:bg-[var(--background)] border-b border-[var(--card-border)] z-50">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 gap-2">
        {/* Left section */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200 transition-colors lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={onToggleSidebar}
            className={`hidden lg:inline-flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200 transition-colors ${
              sidebarOpen ? 'bg-gray-50 dark:bg-gray-900' : ''
            }`}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <Image
                src={logoUrl || '/calsiter-inc-logo.png'}
                alt={`${siteName} Logo`}
                fill
                sizes="(max-width: 640px) 40px, 48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate hidden sm:inline">
              {siteName}
            </span>
          </div>
        </div>

        {/* Center search - hidden on small screens */}
        <div className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8">
          <form ref={searchRef} onSubmit={handleSearch} className="flex">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search admin panel..."
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
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value
                  setQuery(v)
                  setTyping(true)
                  getSuggestions(v)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] bg-[var(--card-background)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setMode('suggestions')
                    loadRecentKeywords()
                    setTyping(false)
                    setDropdownOpen(true)
                    inputRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                  aria-label="Clear"
                >
                  <i className="fa fa-times"></i>
                </button>
              )}
              <Search variant="desktop" />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Mobile search icon — left of chat icon */}
          <button
            onClick={() => {
              setOverlayOpen(true)
              loadRecentKeywords()
            }}
            className="w-10 h-10 bg-[var(--card-background)] border border-[var(--card-border)] rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 lg:hidden"
            aria-label="Search"
          >
            <i className="fa fa-search text-sm"></i>
          </button>

          {/* Messenger Icon */}
          <MessengerButton />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden relative ${
                  profilePictureUrl
                    ? 'bg-transparent'
                    : 'bg-blue-600 dark:bg-blue-500 text-white font-semibold'
                }`}
              >
                {profilePictureUrl ? (
                  <Image
                    src={profilePictureUrl}
                    alt={userDisplayName}
                    fill
                    sizes="(max-width: 768px) 32px, 32px"
                    className="object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[var(--card-background)] rounded-lg shadow-lg border border-gray-200 dark:border-[var(--card-border)] py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 font-semibold">!</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-400">
                          Authentication Error
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Please refresh or re-login
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden text-lg relative ${
                          profilePictureUrl
                            ? 'bg-transparent'
                            : 'bg-blue-600 dark:bg-blue-500 text-white font-semibold'
                        }`}
                      >
                        {profilePictureUrl ? (
                          <Image
                            src={profilePictureUrl}
                            alt={userDisplayName}
                            fill
                            sizes="(max-width: 768px) 48px, 48px"
                            className="object-cover"
                          />
                        ) : (
                          userInitials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {userDisplayName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {userEmail}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <User className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    Your Profile
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Settings className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    Account Settings
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-[var(--card-border)] py-1">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
