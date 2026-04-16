'use client';

import React from 'react';
import { SidebarProps } from '@/types';
import { SidebarMenuItems } from './SidebarMenuItems';

/**
 * Sidebar component with navigation items
 *
 * @param isOpen - Whether the sidebar is currently open
 * @param onToggle - Function to toggle sidebar state
 * @param onScroll - Optional function to handle scroll events for position persistence
 */
export function Sidebar({ isOpen, onToggle: _onToggle, onScroll }: SidebarProps) {
  return (
    <>
      <aside
        data-sidebar="main"
        className={`fixed left-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-40 hidden lg:block ${isOpen
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
            <SidebarMenuItems isOpen={isOpen} />
          </nav>
        </div>
      </aside>
    </>
  );
}
