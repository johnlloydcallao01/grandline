'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Mobile app-like sticky footer navigation
 * Only visible on mobile devices (hidden on tablet and desktop)
 */
export function MobileFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <i className="fa fa-home text-lg"></i>,
      path: '/',
    },
    {
      id: 'services',
      label: 'Services',
      icon: <i className="fa fa-briefcase text-lg"></i>,
      path: '/marketing',
    },
    {
      id: 'help',
      label: '', // No label for help icon
      icon: <i className="fa fa-hand-paper text-lg text-white"></i>,
      path: '/help',
      isHelp: true,
    },
    {
      id: 'contents',
      label: 'Contents',
      icon: <i className="fa fa-file-alt text-lg"></i>,
      path: '/trending',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: <i className="fa fa-layer-group text-lg"></i>,
      path: '/dashboard',
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden h-[55px]">
      <div className="flex items-center justify-around h-full px-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              item.isHelp
                ? 'relative'
                : 'p-1'
            }`}
            aria-label={item.label || 'Help'}
          >
            {item.isHelp ? (
              // Brand color circle for help icon
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform -translate-y-1" style={{ backgroundColor: '#d41a10' }}>
                {item.icon}
              </div>
            ) : (
              <>
                <div className={`mb-1 ${
                  isActive(item.path) ? 'text-black' : 'text-gray-600'
                }`}>
                  {item.icon}
                </div>
                {item.label && (
                  <span className={`text-xs font-medium leading-none ${
                    isActive(item.path) ? 'text-black' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
