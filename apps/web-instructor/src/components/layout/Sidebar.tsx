'use client';

import React from 'react';
import { SidebarMenuItems } from './SidebarMenuItems';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Sidebar component with navigation items for the Instructor Panel
 *
 * Responsive behavior:
 * - Mobile (<lg): behaves as a slide-in drawer. `mobileOpen` controls visibility
 *   (translate-x-0 when open, -translate-x-full when closed). A backdrop overlay
 *   is rendered behind it. Always full-width (w-64) on mobile.
 * - Desktop (lg+): always visible, collapsible between w-60 (expanded) and w-20
 *   (collapsed) based on `isOpen`.
 */
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpen, onToggle: _onToggle, onScroll, mobileOpen = false, onCloseMobile }: SidebarProps & { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // On mobile the drawer should always render expanded (labels visible).
  // On desktop, honor the collapse state.
  const expanded = isDesktop ? isOpen : true;

  return (
    <>
    {/* Mobile backdrop overlay - only visible on small screens when drawer is open */}
    {mobileOpen && (
        <div
            className="fixed inset-x-0 top-[65px] bottom-0 bg-black/50 z-40 lg:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
        />
    )}
    <aside
      data-sidebar="instructor"
      className={`fixed left-0 top-[65px] bg-[var(--card-background)] border-r border-[var(--card-border)] transition-all duration-300 overflow-y-auto z-50 lg:z-40
        w-64 h-[calc(100vh-65px)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 ${isOpen ? 'lg:w-60' : 'lg:w-20'}`}
      onScroll={onScroll}
    >
      <div className="p-3 pb-20">
        <nav className="space-y-4">
          <SidebarMenuItems isOpen={expanded} />
        </nav>
      </div>
    </aside>
    </>
  );
}
