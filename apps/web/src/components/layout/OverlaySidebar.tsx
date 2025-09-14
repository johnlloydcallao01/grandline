'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '@/components/ui';

interface OverlaySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Overlay Sidebar component that appears as a popup from the left
 * Contains the same navigation items as the main sidebar
 */
export function OverlaySidebar({ isOpen, onClose }: OverlaySidebarProps) {
  const pathname = usePathname();

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
            {/* Main Navigation */}
            <div className="space-y-1">
              <SidebarItem
                icon="home"
                label="Home"
                active={pathname === '/'}
                collapsed={false}
                href="/"
                onClick={onClose}
              />
            </div>

            <hr className="my-3 border-gray-200" />

            {/* Account section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-900">Account</div>
              <SidebarItem
                icon="user"
                label="Login Status"
                active={pathname === '/login-status'}
                collapsed={false}
                href="/login-status"
                onClick={onClose}
              />
            </div>

            <hr className="my-3 border-gray-200" />

            {/* Explore section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-900">Explore</div>
              <SidebarItem 
                icon="trending" 
                label="Trending" 
                collapsed={false} 
                href="/trending" 
                onClick={onClose}
              />
              <SidebarItem 
                icon="music" 
                label="Music" 
                collapsed={false} 
                href="/music" 
                onClick={onClose}
              />
              <SidebarItem 
                icon="gaming" 
                label="Gaming" 
                collapsed={false} 
                href="/gaming" 
                onClick={onClose}
              />
              <SidebarItem 
                icon="news" 
                label="News" 
                collapsed={false} 
                href="/news" 
                onClick={onClose}
              />
              <SidebarItem 
                icon="sports" 
                label="Sports" 
                collapsed={false} 
                href="/sports" 
                onClick={onClose}
              />
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}