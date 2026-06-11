'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useDashboard } from '@/components/InstructorDashboard';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
}

function NavItem({ icon, label, href, active, collapsed }: NavItemProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href as any)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--primary)] text-white shadow-lg shadow-[#3127a4]/30'
          : 'text-slate-300 hover:bg-white/8 hover:text-white'
      }`}
    >
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
        active ? 'bg-white/10' : ''
      }`}>
        {icon}
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen: isOpen, toggleSidebar: onToggle } = useDashboard();

  return (
    <>
      {/* Mobile overlay */}
      <button
        type="button"
        onClick={onToggle}
        className={`fixed inset-0 z-30 bg-slate-950/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Close sidebar overlay"
      />

      <aside
        data-sidebar="instructor"
        className={`fixed left-0 z-40 overflow-y-auto border-r border-white/10 bg-slate-950/95 backdrop-blur transition-all duration-300 ${
          isOpen
            ? 'w-60 translate-x-0'
            : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
        style={{
          top: '4rem',
          height: 'calc(100vh - 4rem)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#334155 transparent',
        }}
      >
        <div className="p-3 pb-20">
          <nav className="space-y-4">

            {/* Dashboard & Analytics */}
            <div className="space-y-1">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dashboard & Analytics
                </div>
              )}
              <NavItem
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                }
                label="Overview"
                href="/"
                active={pathname === '/' || pathname === '/dashboard'}
                collapsed={!isOpen}
              />
            </div>

            {isOpen && <hr className="border-white/10" />}

            {/* Course Management */}
            <div className="space-y-1">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Course Management
                </div>
              )}
              <NavItem
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                label="Courses"
                href="/courses"
                active={pathname?.startsWith('/courses')}
                collapsed={!isOpen}
              />
              <NavItem
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                label="Assessments"
                href="/assessments"
                active={pathname?.startsWith('/assessments')}
                collapsed={!isOpen}
              />
            </div>

            {isOpen && <hr className="border-white/10" />}

            {/* People */}
            <div className="space-y-1">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  People
                </div>
              )}
              <NavItem
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                label="Students"
                href="/students"
                active={pathname?.startsWith('/students')}
                collapsed={!isOpen}
              />
            </div>

            {isOpen && <hr className="border-white/10" />}

            {/* Schedule */}
            <div className="space-y-1">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Schedule
                </div>
              )}
              <NavItem
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                label="Schedule"
                href="/schedule"
                active={pathname?.startsWith('/schedule')}
                collapsed={!isOpen}
              />
            </div>

          </nav>
        </div>
      </aside>
    </>
  );
}
