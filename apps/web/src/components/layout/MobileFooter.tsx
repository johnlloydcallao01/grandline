'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Mobile app-like sticky footer navigation
 * Only visible on mobile devices (hidden on tablet and desktop)
 */
interface MobileFooterProps {
  hideAt?: 'md' | 'lg'
}

export function MobileFooter({ hideAt = 'md' }: MobileFooterProps) {
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
      id: 'wishlists',
      label: 'Wishlists',
      icon: <i className="fa fa-heart text-lg"></i>,
      path: '/wishlists',
    },
    {
      id: 'portal',
      label: 'Portal', // Portal label for LMS
      icon: <i className="fa fa-book text-lg text-white"></i>,
      path: '/portal',
      isHelp: true,
    },
    {
      id: 'recents',
      label: 'Recents',
      icon: <i className="fa fa-history text-lg"></i>,
      path: '/history',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: <i className="fa fa-layer-group text-lg"></i>,
      path: '/menu',
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
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-[55px] ${hideAt === 'lg' ? 'lg:hidden' : 'md:hidden'}`}>
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
              // Brand color circle for help icon with Portal text
              <div className="flex flex-col items-center justify-center -mt-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#201a7c' }}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium leading-none text-gray-600 mt-1">
                  {item.label}
                </span>
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
