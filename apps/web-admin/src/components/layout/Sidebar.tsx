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

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* E-commerce */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">E-commerce</div>}
            <SidebarItem
              icon="orders"
              label="Orders"
              active={pathname.startsWith('/orders')}
              collapsed={!isOpen}
              href="/orders"
            />
            <SidebarItem
              icon="products"
              label="Products"
              active={pathname.startsWith('/products')}
              collapsed={!isOpen}
              href="/products"
            />
            <SidebarItem
              icon="inventory"
              label="Inventory"
              active={pathname.startsWith('/inventory')}
              collapsed={!isOpen}
              href="/inventory"
            />
            <SidebarItem
              icon="customers"
              label="Customers"
              active={pathname.startsWith('/customers')}
              collapsed={!isOpen}
              href="/customers"
            />
            <SidebarItem
              icon="payments"
              label="Payments"
              active={pathname.startsWith('/payments')}
              collapsed={!isOpen}
              href="/payments"
            />
            <SidebarItem
              icon="shipping"
              label="Shipping"
              active={pathname.startsWith('/shipping')}
              collapsed={!isOpen}
              href="/shipping"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* Marketing */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">Marketing</div>}
            <SidebarItem
              icon="campaigns"
              label="Campaigns"
              active={pathname.startsWith('/campaigns')}
              collapsed={!isOpen}
              href="/campaigns"
            />
            <SidebarItem
              icon="email"
              label="Email Marketing"
              active={pathname.startsWith('/email')}
              collapsed={!isOpen}
              href="/email"
            />
            <SidebarItem
              icon="social"
              label="Social Media"
              active={pathname.startsWith('/social')}
              collapsed={!isOpen}
              href="/social"
            />
            <SidebarItem
              icon="seo"
              label="SEO"
              active={pathname.startsWith('/seo')}
              collapsed={!isOpen}
              href="/seo"
            />
            <SidebarItem
              icon="ads"
              label="Advertising"
              active={pathname.startsWith('/ads')}
              collapsed={!isOpen}
              href="/ads"
            />
          </div>

          {isOpen && <hr className="my-3 border-gray-200" />}

          {/* User Management */}
          <div className="space-y-1">
            {isOpen && <div className="px-3 py-2 text-sm font-medium text-gray-900">User Management</div>}
            <SidebarItem
              icon="users"
              label="Users"
              active={pathname.startsWith('/users')}
              collapsed={!isOpen}
              href="/users"
            />
            <SidebarItem
              icon="team"
              label="Team"
              active={pathname.startsWith('/team')}
              collapsed={!isOpen}
              href="/team"
            />
            <SidebarItem
              icon="roles"
              label="Roles"
              active={pathname.startsWith('/roles')}
              collapsed={!isOpen}
              href="/roles"
            />
            <SidebarItem
              icon="permissions"
              label="Permissions"
              active={pathname.startsWith('/permissions')}
              collapsed={!isOpen}
              href="/permissions"
            />
          </div>




        </nav>
      </div>
    </aside>
  );
}
