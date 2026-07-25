'use client';

import React from 'react';
import { SidebarMenuItems } from './SidebarMenuItems';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <button
        type="button"
        onClick={onToggle}
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Close sidebar overlay"
      />

      <aside
        data-sidebar="instructor"
        className={`fixed left-0 z-40 overflow-y-auto border-r border-[var(--card-border)] bg-[var(--card-background)] transition-all duration-300 ${
          isOpen
            ? 'w-60 translate-x-0'
            : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
        style={{
          top: '4rem',
          height: 'calc(100vh - 4rem)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--card-border) transparent',
        }}
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
