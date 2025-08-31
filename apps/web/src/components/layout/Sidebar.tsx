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
            ? 'w-60 translate-x-0'
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
            <SidebarItem
              icon="user"
              label="Login Status"
              active={pathname === '/login-status'}
              collapsed={!isOpen}
              href="/login-status"
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




        </nav>
      </div>
    </aside>
    </>
  );
}
