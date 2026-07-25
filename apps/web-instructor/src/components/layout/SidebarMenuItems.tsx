'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '@/components/ui';

interface SidebarMenuItemsProps {
  isOpen: boolean;
}

export function SidebarMenuItems({ isOpen }: SidebarMenuItemsProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Dashboard & Analytics */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Dashboard & Analytics
          </div>
        )}
        <SidebarItem
          icon="overview"
          label="Overview"
          href="/"
          active={pathname === '/' || pathname === '/dashboard'}
          collapsed={!isOpen}
        />
      </div>

      {isOpen && <hr className="my-3 border-gray-200" />}

      {/* Course Management */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Course Management
          </div>
        )}
        <SidebarItem
          icon="courses"
          label="Courses"
          href="/courses"
          active={pathname?.startsWith('/courses')}
          collapsed={!isOpen}
        />
        <SidebarItem
          icon="assessments"
          label="Assessments"
          href="/assessments"
          active={pathname?.startsWith('/assessments')}
          collapsed={!isOpen}
        />
      </div>

      {isOpen && <hr className="my-3 border-gray-200" />}

      {/* People */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            People
          </div>
        )}
        <SidebarItem
          icon="students"
          label="Students"
          href="/students"
          active={pathname?.startsWith('/students')}
          collapsed={!isOpen}
        />
      </div>

      {isOpen && <hr className="my-3 border-gray-200" />}

      {/* Schedule */}
      <div className="space-y-1">
        {isOpen && (
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Schedule
          </div>
        )}
        <SidebarItem
          icon="schedule"
          label="Schedule"
          href="/schedule"
          active={pathname?.startsWith('/schedule')}
          collapsed={!isOpen}
        />
      </div>
    </>
  );
}
