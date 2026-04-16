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
          onClick={onItemClick}
        />
        <SidebarItem
          icon="faqs"
          label="FAQs"
          active={false}
          collapsed={!isOpen}
          href="https://www.grandlinemaritime.com/faqs"
          target="_blank"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="contact-us"
          label="Contact Us"
          active={false}
          collapsed={!isOpen}
          href="https://www.grandlinemaritime.com/contact-us"
          target="_blank"
          onClick={onItemClick}
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
          onClick={onItemClick}
        />
        <SidebarItem
          icon="blogs"
          label="Blogs"
          active={false}
          collapsed={!isOpen}
          href="https://grandlinemaritime.com/blogs"
          target="_blank"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="terms-conditions"
          label="Terms & Conditions"
          active={false}
          collapsed={!isOpen}
          href="https://grandlinemaritime.com/terms-and-conditions"
          target="_blank"
          onClick={onItemClick}
        />
        <SidebarItem
          icon="privacy-policy"
          label="Privacy Policy"
          active={false}
          collapsed={!isOpen}
          href="https://grandlinemaritime.com/privacy-policy"
          target="_blank"
          onClick={onItemClick}
        />
      </div>
    </>
  );
}
