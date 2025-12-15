'use client';

import { useEffect } from 'react';

/**
 * Client-side controller for the instant loading screen
 * Handles showing/hiding logic without causing hydration mismatches
 */
export function InstantLoadingController() {
  useEffect(() => {
    // Only show loading screen on manual browser reload (F5, Ctrl+R, refresh button)
    // Do NOT show on initial visits or SPA navigation
    const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isManualReload = navigationEntries[0]?.type === 'reload';

    const isAuthPage = window.location.pathname.includes('/signin') ||
      window.location.pathname.includes('/register');

    const loadingScreen = document.getElementById('instant-loading-screen');

    if (!loadingScreen) return;

    // Show loading screen ONLY on manual browser reload (not on auth pages)
    if (isManualReload && !isAuthPage) {
      // Show the loading screen for manual reloads
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
      // Hide loading screen for initial visits, SPA navigation, or auth pages
      loadingScreen.style.display = 'none';
    }
  }, []);

  return null; // This component doesn't render anything
}
