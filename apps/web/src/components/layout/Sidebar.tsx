'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProps } from '@/types';
import { SidebarItem } from '@/components/ui';

/**
 * Sidebar component with navigation items
 *
 * @param isOpen - Whether the sidebar is currently open
 * @param onToggle - Function to toggle sidebar state
 * @param onScroll - Optional function to handle scroll events for position persistence
 */
export function Sidebar({ isOpen, onToggle, onScroll }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        data-sidebar="main"
        className={`fixed left-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-40 hidden lg:block ${
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-20 translate-x-0'
        }`}
        style={{
          height: 'calc(100vh - 4rem)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}
        onScroll={onScroll}
      >
      <div className="p-3">
        <nav className="space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            <SidebarItem
              icon="home"
              label="Home"
              active={pathname === '/'}
              collapsed={!isOpen}
              href="/"
            />
            <SidebarItem
              icon="shorts"
              label="Shorts"
              active={pathname === '/shorts'}
              collapsed={!isOpen}
              href="/shorts"
            />
            <SidebarItem
              icon="subscriptions"
              label="Subscriptions"
              active={pathname === '/subscriptions'}
              collapsed={!isOpen}
              href="/subscriptions"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* You section */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">You</div>}
            <SidebarItem
              icon="history"
              label="History"
              active={pathname === '/history'}
              collapsed={!isOpen}
              href="/history"
            />
            <SidebarItem
              icon="playlists"
              label="Playlists"
              active={pathname === '/playlists'}
              collapsed={!isOpen}
              href="/playlists"
            />
            <SidebarItem
              icon="watch-later"
              label="Watch later"
              active={pathname === '/watch-later'}
              collapsed={!isOpen}
              href="/watch-later"
            />
            <SidebarItem
              icon="liked"
              label="Liked videos"
              active={pathname === '/liked-videos'}
              collapsed={!isOpen}
              href="/liked-videos"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Explore section */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Explore</div>}
            <SidebarItem icon="trending" label="Trending" collapsed={!isOpen} href="/trending" />
            <SidebarItem icon="music" label="Music" collapsed={!isOpen} href="/music" />
            <SidebarItem icon="gaming" label="Gaming" collapsed={!isOpen} href="/gaming" />
            <SidebarItem icon="news" label="News" collapsed={!isOpen} href="/news" />
            <SidebarItem icon="sports" label="Sports" collapsed={!isOpen} href="/sports" />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Business Tools */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Business Tools</div>}
            <SidebarItem icon="analytics" label="Analytics" collapsed={!isOpen} href="/analytics" />
            <SidebarItem icon="dashboard" label="Dashboard" collapsed={!isOpen} href="/dashboard" />
            <SidebarItem icon="reports" label="Reports" collapsed={!isOpen} href="/reports" />
            <SidebarItem icon="marketing" label="Marketing Hub" collapsed={!isOpen} href="/marketing" />
            <SidebarItem icon="ecommerce" label="E-commerce" collapsed={!isOpen} href="/ecommerce" />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Management */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Management</div>}
            <SidebarItem icon="team" label="Team Management" collapsed={!isOpen} href="/team" />
            <SidebarItem icon="projects" label="Projects" collapsed={!isOpen} href="/projects" />
            <SidebarItem icon="calendar" label="Calendar" collapsed={!isOpen} href="/calendar" />
            <SidebarItem icon="tasks" label="Tasks" collapsed={!isOpen} href="/tasks" />
            <SidebarItem icon="workflow" label="Workflow" collapsed={!isOpen} href="/workflow" />
          </div>


        </nav>
      </div>
    </aside>
    </>
  );
}
