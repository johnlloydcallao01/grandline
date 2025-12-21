'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProps } from '@/types';
import { SidebarItem } from '@/components/ui';

/**
 * Admin Sidebar component with navigation items
 *
 * @param isOpen - Whether the sidebar is currently open
 * @param onToggle - Function to toggle sidebar state
 */
export function Sidebar({ isOpen, onToggle: _onToggle }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside 
      className={`fixed left-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-40 ${
        isOpen ? 'w-60' : 'w-20'
      }`}
      style={{
        height: 'calc(100vh - 4rem)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent'
      }}
    >
      <div className="p-3">
        <nav className="space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            <SidebarItem
              icon="dashboard"
              label="Dashboard"
              active={pathname === '/'}
              collapsed={!isOpen}
              href="/"
            />
            <SidebarItem
              icon="analytics"
              label="Analytics"
              active={pathname === '/analytics'}
              collapsed={!isOpen}
              href="/analytics"
            />
            <SidebarItem
              icon="reports"
              label="Reports"
              active={pathname === '/reports'}
              collapsed={!isOpen}
              href="/reports"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Content Management */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Content Management</div>}
            <SidebarItem
              icon="posts"
              label="Blog Posts"
              active={pathname.startsWith('/posts')}
              collapsed={!isOpen}
              href="/posts"
            />
            <SidebarItem
              icon="media"
              label="Media Library"
              active={pathname.startsWith('/media')}
              collapsed={!isOpen}
              href="/media"
            />
            <SidebarItem
              icon="pages"
              label="Pages"
              active={pathname.startsWith('/pages')}
              collapsed={!isOpen}
              href="/pages"
            />
            <SidebarItem
              icon="categories"
              label="Categories"
              active={pathname.startsWith('/categories')}
              collapsed={!isOpen}
              href="/categories"
            />
            <SidebarItem
              icon="tags"
              label="Tags"
              active={pathname.startsWith('/tags')}
              collapsed={!isOpen}
              href="/tags"
            />
            <SidebarItem
              icon="comments"
              label="Comments"
              active={pathname.startsWith('/comments')}
              collapsed={!isOpen}
              href="/comments"
            />
          </div>

        </nav>
      </div>
    </aside>
  );
}
