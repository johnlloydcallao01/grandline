'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Header, MobileFooter } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'

/**
 * Portal Layout - Custom layout for portal pages
 * 
 * This layout provides:
 * - Same Header as main app for consistency
 * - Custom Portal Sidebar instead of main sidebar
 * - Isolated portal functionality
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)
  const pathname = usePathname()

  const isCoursePlayer =
    typeof pathname === 'string' &&
    pathname.startsWith('/portal/courses/') &&
    pathname.includes('/player')

  // Hide instant loading screen when portal loads
  useEffect(() => {
    const hideInstantLoadingScreen = () => {
      const loadingScreen = document.getElementById('instant-loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    };

    const timer = setTimeout(hideInstantLoadingScreen, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if we're on desktop and update sidebar visibility accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const isLargeScreen = window.innerWidth >= 1024 // lg breakpoint
      setIsDesktop(isLargeScreen)

      // On mobile/tablet, always keep sidebar closed
      if (!isLargeScreen) {
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isCoursePlayer) {
      return
    }
    if (isDesktop) {
      setSidebarOpen(prev => !prev)
    }
  }

  const handleSearch = (query: string) => {
    console.log('Portal search query:', query)
    // TODO: Implement portal-specific search functionality
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
        {/* Header - Same as main app for consistency */}
        {!isCoursePlayer && (
          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onSearch={handleSearch}
          />
        )}

        {/* Portal Sidebar - Custom sidebar for portal pages */}
        {!isCoursePlayer && (
          <PortalSidebar
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        )}

        {/* Main Content Area - Portal pages content */}
        <main
          className={`transition-all duration-300 bg-gray-50 ${isCoursePlayer ? '' : sidebarOpen ? 'lg:ml-60' : 'lg:ml-20'
            }`}
          style={{ backgroundColor: '#f9fafb' }}
        >
          <div className="min-h-full bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
            {children}
          </div>
        </main>

        {/* Mobile Footer - Same as main app */}
        {!isCoursePlayer && <MobileFooter />}
      </div>
    </ProtectedRoute>
  )
}

/**
 * Portal Sidebar Component - Custom sidebar for portal functionality
 */
function PortalSidebar({ isOpen, onToggle: _onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <aside
      data-sidebar="portal"
      className={`fixed left-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-40 hidden lg:block ${isOpen
          ? 'w-60 translate-x-0'
          : 'w-20 translate-x-0'
        }`}
      style={{
        height: 'calc(100vh - 4rem)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent'
      }}
    >
      <div className="p-3">
        <nav className="space-y-1">
          {/* Back Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => window.history.back()}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="fa fa-arrow-left text-gray-600"></i>
              </div>
              {isOpen && <span className="ml-3 text-gray-700">Back</span>}
            </button>
          </div>

          {/* Home Navigation */}
          <div className="space-y-1">
            {(Link as any)({
              href: "/",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-home text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Home</span>}
                </>
              )
            })}
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Portal Navigation */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Learning</div>}

            {/* Portal Dashboard */}
            {(Link as any)({
              href: "/portal/dashboard",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-tachometer-alt text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Dashboard</span>}
                </>
              )
            })}

            {/* Portal Courses */}
            {(Link as any)({
              href: "/portal/courses",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-book text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Courses</span>}
                </>
              )
            })}

            {/* Portal Instructors */}
            {(Link as any)({
              href: "/portal/instructors",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-chalkboard-teacher text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Instructors</span>}
                </>
              )
            })}
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Activities Navigation */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Activities</div>}

            {/* Assignments */}
            {(Link as any)({
              href: "/portal/assignments",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-tasks text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Assignments</span>}
                </>
              )
            })}

            {/* Quizzes & Exams */}
            {(Link as any)({
              href: "/portal/quizzes-exams",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-graduation-cap text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Quizzes & Exams</span>}
                </>
              )
            })}

            {/* Submitted Work */}
            {(Link as any)({
              href: "/portal/submitted-work",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-clipboard-check text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Submitted Work</span>}
                </>
              )
            })}

            {/* Feedback & Comments */}
            {(Link as any)({
              href: "/portal/feedback-comments",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-comment-dots text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Feedback & Comments</span>}
                </>
              )
            })}
          </div>

          {/* Interaction Navigation */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Interaction</div>}

            {/* Discussion Board */}
            {(Link as any)({
              href: "/portal/discussion-board",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-comments text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Discussion Board</span>}
                </>
              )
            })}

            {/* Ask Instructor */}
            {(Link as any)({
              href: "/portal/ask-instructor",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-question-circle text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Ask Instructor</span>}
                </>
              )
            })}

            {/* Announcements */}
            {(Link as any)({
              href: "/portal/announcements",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-bullhorn text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Announcements</span>}
                </>
              )
            })}
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* General Navigation */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">General</div>}

            {/* Settings */}
            {(Link as any)({
              href: "/portal/settings",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-cog text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Settings</span>}
                </>
              )
            })}

            {/* Requirements */}
            {(Link as any)({
              href: "/portal/requirements",
              className: `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'
                }`,
              children: (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="fa fa-list-check text-gray-600"></i>
                  </div>
                  {isOpen && <span className="ml-3 text-gray-700">Requirements</span>}
                </>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
