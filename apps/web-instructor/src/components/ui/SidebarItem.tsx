import React from 'react';
import Link from 'next/link';
import { InstructorIconName, getIcon } from '@/utils/icons';

interface SidebarItemProps {
  icon: InstructorIconName;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  href?: string;
  badge?: number;
}

export function SidebarItem({
  icon,
  label,
  active = false,
  collapsed = false,
  href,
  badge = 0,
}: SidebarItemProps) {
  const baseClasses = "relative w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const activeClasses = active
    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100';

  const content = (
    <>
      <div className="flex-shrink-0">
        {getIcon(icon)}
      </div>
      {!collapsed && <span className="ml-3 truncate">{label}</span>}
      {badge > 0 && (
        <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white leading-none ${collapsed ? "absolute -right-1 -top-1" : "ml-auto"}`}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </>
  );

  if (href) {
    const LinkComponent = Link as any;
    return (
      <LinkComponent
        href={href}
        className={`${baseClasses} ${activeClasses}`}
      >
        {content}
      </LinkComponent>
    );
  }

  return (
    <button className={`${baseClasses} ${activeClasses}`}>
      {content}
    </button>
  );
}
