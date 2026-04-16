'use client';

import React from 'react';
import { SidebarMenuItems } from './SidebarMenuItems';

interface OverlaySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Overlay Sidebar component that appears as a popup from the left
 * Contains the same navigation items as the main sidebar
 */
export function OverlaySidebar({ isOpen, onClose }: OverlaySidebarProps) {
  // Close overlay when pressing Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Close overlay when clicking outside the sidebar
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector('[data-overlay-sidebar]');
      const toggleButton = document.querySelector('[aria-label*="sidebar"]'); // Find the toggle button
      
      if (isOpen && sidebar && !sidebar.contains(e.target as Node) && 
          toggleButton && !toggleButton.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Sidebar */}
      <aside
        data-overlay-sidebar
        className={`fixed left-0 top-16 bg-white border-r border-gray-200 transition-transform duration-300 overflow-y-auto z-50 w-60 shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          height: 'calc(100vh - 4rem)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}
      >
        <div className="p-3">
          <nav className="space-y-1">
            <SidebarMenuItems isOpen={true} onItemClick={onClose} />
          </nav>
        </div>
      </aside>
    </>
  );
}