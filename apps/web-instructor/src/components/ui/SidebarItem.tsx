import React from 'react';
import Link from 'next/link';
import { InstructorIconName, getIcon } from '@/utils/icons';

interface SidebarItemProps {
  icon: InstructorIconName;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  href?: string;
}

export function SidebarItem({
  icon,
  label,
  active = false,
  collapsed = false,
  href,
}: SidebarItemProps) {
  const baseClasses = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
  const activeClasses = active
    ? 'bg-gray-100 text-gray-900'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  const content = (
    <>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
        {getIcon(icon)}
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
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
