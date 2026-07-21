'use client';

import React from 'react';
import type { IconName } from '@/types';
import { getIcon } from '@/utils';
import { ChevronDown } from '@/components/ui/IconWrapper';

interface SidebarDropdownGroupProps {
  icon: IconName;
  label: string;
  isOpen: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  active: boolean;
  children: React.ReactNode;
}

export function SidebarDropdownGroup({
  icon,
  label,
  isOpen,
  isExpanded,
  onToggle,
  active,
  children,
}: SidebarDropdownGroupProps) {
  const baseClasses = 'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  const activeClasses = active
    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100';

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className={`${baseClasses} ${activeClasses}`}
        aria-expanded={isExpanded}
      >
        <div className="flex-shrink-0">{getIcon(icon)}</div>
        {!isOpen ? null : (
          <>
            <span className="ml-3 flex-1 truncate text-left">{label}</span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${isExpanded ? 'rotate-180' : ''}`}
              />
          </>
        )}
      </button>

      {isOpen && isExpanded ? <div className="ml-4 space-y-1 border-l border-[var(--card-border)] pl-3">{children}</div> : null}
    </div>
  );
}
