'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '@/components/ui';

interface SidebarMenuItemsProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

export function SidebarMenuItems({ isOpen, onItemClick }: SidebarMenuItemsProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Main Navigation */}
      <div className="space-y-1">
        <SidebarItem
          icon="home"
          label="Home"
          active={pathname === '/'}
          collapsed={!isOpen}
          href="/"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="wishlist"
          label="Wishlists"
          active={pathname === '/wishlists'}
          collapsed={!isOpen}
          href="/wishlists"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="history"
          label="Recently Viewed"
          active={pathname === '/history'}
          collapsed={!isOpen}
          href="/history"
          onClick={onItemClick}
        />
      </div>

      {isOpen && <hr className="my-3 border-[var(--card-border)]" />}

      {/* Resources section */}
      <div className="space-y-1">
        {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Resources</div>}
        <SidebarItem
          icon="certificate"
          label="Certificates"
          active={pathname === '/certificates'}
          collapsed={!isOpen}
          href="/certificates"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="training-materials"
          label="Training Materials"
          active={pathname === '/training-materials'}
          collapsed={!isOpen}
          href="/training-materials"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="download"
          label="Downloads"
          active={pathname === '/downloads'}
          collapsed={!isOpen}
          href="/downloads"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="announcement"
          label="Announcements"
          active={pathname === '/announcements'}
          collapsed={!isOpen}
          href="/announcements"
          onClick={onItemClick}
        />
      </div>

      {isOpen && <hr className="my-3 border-[var(--card-border)]" />}

      {/* Support section */}
      <div className="space-y-1">
        {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Support</div>}
        <SidebarItem
          icon="support"
          label="Support"
          active={pathname === '/support'}
          collapsed={!isOpen}
          href="/support"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="faqs"
          label="FAQs"
          active={pathname === '/faqs'}
          collapsed={!isOpen}
          href="/faqs"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="contact-us"
          label="Contact Us"
          active={pathname === '/contact-us'}
          collapsed={!isOpen}
          href="/contact-us"
          onClick={onItemClick}
        />
      </div>

      {isOpen && <hr className="my-3 border-[var(--card-border)]" />}

      {/* General section */}
      <div className="space-y-1">
        {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">General</div>}
        <SidebarItem
          icon="about-us"
          label="About Us"
          active={pathname === '/about'}
          collapsed={!isOpen}
          href="/about"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="blogs"
          label="Blogs"
          active={pathname === '/blogs' || pathname.startsWith('/blogs/')}
          collapsed={!isOpen}
          href="/blogs"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="terms-conditions"
          label="Terms & Conditions"
          active={pathname === '/terms-and-conditions'}
          collapsed={!isOpen}
          href="/terms-and-conditions"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="privacy-policy"
          label="Privacy Policy"
          active={pathname === '/privacy-policy'}
          collapsed={!isOpen}
          href="/privacy-policy"
          onClick={onItemClick}
        />
      </div>
    </>
  );
}
