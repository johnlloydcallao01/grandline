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
export function Sidebar({ isOpen, onToggle: _onToggle, onScroll }: SidebarProps) {
  const pathname = usePathname();

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
                icon="wishlist"
                label="Wishlists"
                active={pathname === '/wishlists'}
                collapsed={!isOpen}
                href="/wishlists"
              />
              <SidebarItem
                icon="history"
                label="Recently Viewed"
                active={pathname === '/history'}
                collapsed={!isOpen}
                href="/history"
              />

            </div>

            {isOpen && <hr className="my-3 border-gray-200" />}

            {/* Account section */}
            <div className="space-y-1">
              {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Account</div>}
              <SidebarItem
                icon="profile"
                label="Profile"
                active={pathname === '/profile'}
                collapsed={!isOpen}
                href="/profile"
              />
              <SidebarItem
                icon="payment-history"
                label="Payment History"
                active={pathname === '/payment-history'}
                collapsed={!isOpen}
                href="/payment-history"
              />
              <SidebarItem
                icon="settings"
                label="Settings"
                active={pathname === '/settings'}
                collapsed={!isOpen}
                href="/settings"
              />

            </div>

            {isOpen && <hr className="my-3 border-gray-200" />}

            {/* Resources section */}
            <div className="space-y-1">
              {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Resources</div>}
              <SidebarItem
                icon="certificate"
                label="Certificates"
                active={pathname === '/certificates'}
                collapsed={!isOpen}
                href="/certificates"
              />
              <SidebarItem
                icon="training-materials"
                label="Training Materials"
                active={pathname === '/training-materials'}
                collapsed={!isOpen}
                href="/training-materials"
              />
              <SidebarItem
                icon="download"
                label="Downloads"
                active={pathname === '/downloads'}
                collapsed={!isOpen}
                href="/downloads"
              />
              <SidebarItem
                icon="announcement"
                label="Announcements"
                active={pathname === '/announcements'}
                collapsed={!isOpen}
                href="/announcements"
              />
            </div>

            {isOpen && <hr className="my-3 border-gray-200" />}

            {/* Support section */}
            <div className="space-y-1">
              {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Support</div>}
              <SidebarItem
                icon="support"
                label="Support"
                active={pathname === '/support'}
                collapsed={!isOpen}
                href="/support"
              />
              <SidebarItem
                icon="faqs"
                label="FAQs"
                active={pathname === '/faqs'}
                collapsed={!isOpen}
                href="/faqs"
              />
              <SidebarItem
                icon="contact-us"
                label="Contact Us"
                active={pathname === '/contact-us'}
                collapsed={!isOpen}
                href="/contact-us"
              />
              <SidebarItem
                icon="knowledge-base"
                label="Knowledge Base"
                active={pathname === '/knowledge-base'}
                collapsed={!isOpen}
                href="/knowledge-base"
              />
            </div>

            {isOpen && <hr className="my-3 border-gray-200" />}

            {/* General section */}
            <div className="space-y-1">
              {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">General</div>}
              <SidebarItem
                icon="about-us"
                label="About Us"
                active={false}
                collapsed={!isOpen}
                href="https://grandlinemaritime.com/about"
                target="_blank"
              />
              <SidebarItem
                icon="blogs"
                label="Blogs"
                active={false}
                collapsed={!isOpen}
                href="https://grandlinemaritime.com/blogs"
                target="_blank"
              />
              <SidebarItem
                icon="terms-conditions"
                label="Terms & Conditions"
                active={false}
                collapsed={!isOpen}
                href="https://grandlinemaritime.com/terms-and-conditions"
                target="_blank"
              />
              <SidebarItem
                icon="privacy-policy"
                label="Privacy Policy"
                active={false}
                collapsed={!isOpen}
                href="https://grandlinemaritime.com/privacy-policy"
                target="_blank"
              />
            </div>

          </nav>
        </div>
      </aside>
    </>
  );
}
