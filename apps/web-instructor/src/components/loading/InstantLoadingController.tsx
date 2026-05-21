'use client';

import { useEffect } from 'react';

/**
 * Client-side controller for the instant loading screen
 * Handles showing/hiding logic without causing hydration mismatches
 */
export function InstantLoadingController() {
  useEffect(() => {
    // Match apps/web: only show loading screen on manual browser reload
    const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isManualReload = navigationEntries[0]?.type === 'reload';

    const isAuthPage = window.location.pathname.includes('/signin') ||
                      window.location.pathname.includes('/register');

    const loadingScreen = document.getElementById('instant-loading-screen');
    
    if (!loadingScreen) return;

    if (isManualReload && !isAuthPage) {
      loadingScreen.style.display = 'block';

      // Auto-hide after 3 seconds max
      const autoHideTimeout = setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }, 3000);

      return () => {
        clearTimeout(autoHideTimeout);
      };
    } else {
      loadingScreen.style.display = 'none';
    }
  }, []);

  return null; // This component doesn't render anything
}
