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
              active={pathname === '/admin'}
              collapsed={!isOpen}
              href="/admin"
            />
            <SidebarItem
              icon="analytics"
              label="Analytics"
              active={pathname === '/admin/analytics'}
              collapsed={!isOpen}
              href="/admin/analytics"
            />
            <SidebarItem
              icon="reports"
              label="Reports"
              active={pathname === '/admin/reports'}
              collapsed={!isOpen}
              href="/admin/reports"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Content Management */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Content Management</div>}
            <SidebarItem
              icon="posts"
              label="Blog Posts"
              active={pathname.startsWith('/admin/posts')}
              collapsed={!isOpen}
              href="/admin/posts"
            />
            <SidebarItem
              icon="media"
              label="Media Library"
              active={pathname.startsWith('/admin/media')}
              collapsed={!isOpen}
              href="/admin/media"
            />
            <SidebarItem
              icon="pages"
              label="Pages"
              active={pathname.startsWith('/admin/pages')}
              collapsed={!isOpen}
              href="/admin/pages"
            />
            <SidebarItem
              icon="categories"
              label="Categories"
              active={pathname.startsWith('/admin/categories')}
              collapsed={!isOpen}
              href="/admin/categories"
            />
            <SidebarItem
              icon="tags"
              label="Tags"
              active={pathname.startsWith('/admin/tags')}
              collapsed={!isOpen}
              href="/admin/tags"
            />
            <SidebarItem
              icon="comments"
              label="Comments"
              active={pathname.startsWith('/admin/comments')}
              collapsed={!isOpen}
              href="/admin/comments"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* E-commerce */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">E-commerce</div>}
            <SidebarItem
              icon="orders"
              label="Orders"
              active={pathname.startsWith('/admin/orders')}
              collapsed={!isOpen}
              href="/admin/orders"
            />
            <SidebarItem
              icon="products"
              label="Products"
              active={pathname.startsWith('/admin/products')}
              collapsed={!isOpen}
              href="/admin/products"
            />
            <SidebarItem
              icon="inventory"
              label="Inventory"
              active={pathname.startsWith('/admin/inventory')}
              collapsed={!isOpen}
              href="/admin/inventory"
            />
            <SidebarItem
              icon="customers"
              label="Customers"
              active={pathname.startsWith('/admin/customers')}
              collapsed={!isOpen}
              href="/admin/customers"
            />
            <SidebarItem
              icon="payments"
              label="Payments"
              active={pathname.startsWith('/admin/payments')}
              collapsed={!isOpen}
              href="/admin/payments"
            />
            <SidebarItem
              icon="shipping"
              label="Shipping"
              active={pathname.startsWith('/admin/shipping')}
              collapsed={!isOpen}
              href="/admin/shipping"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Marketing */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Marketing</div>}
            <SidebarItem
              icon="campaigns"
              label="Campaigns"
              active={pathname.startsWith('/admin/campaigns')}
              collapsed={!isOpen}
              href="/admin/campaigns"
            />
            <SidebarItem
              icon="email"
              label="Email Marketing"
              active={pathname.startsWith('/admin/email')}
              collapsed={!isOpen}
              href="/admin/email"
            />
            <SidebarItem
              icon="social"
              label="Social Media"
              active={pathname.startsWith('/admin/social')}
              collapsed={!isOpen}
              href="/admin/social"
            />
            <SidebarItem
              icon="seo"
              label="SEO"
              active={pathname.startsWith('/admin/seo')}
              collapsed={!isOpen}
              href="/admin/seo"
            />
            <SidebarItem
              icon="ads"
              label="Advertising"
              active={pathname.startsWith('/admin/ads')}
              collapsed={!isOpen}
              href="/admin/ads"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* User Management */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">User Management</div>}
            <SidebarItem
              icon="users"
              label="Users"
              active={pathname.startsWith('/admin/users')}
              collapsed={!isOpen}
              href="/admin/users"
            />
            <SidebarItem
              icon="team"
              label="Team"
              active={pathname.startsWith('/admin/team')}
              collapsed={!isOpen}
              href="/admin/team"
            />
            <SidebarItem
              icon="roles"
              label="Roles"
              active={pathname.startsWith('/admin/roles')}
              collapsed={!isOpen}
              href="/admin/roles"
            />
            <SidebarItem
              icon="permissions"
              label="Permissions"
              active={pathname.startsWith('/admin/permissions')}
              collapsed={!isOpen}
              href="/admin/permissions"
            />
          </div>






        </nav>
      </div>
    </aside>
  );
}
