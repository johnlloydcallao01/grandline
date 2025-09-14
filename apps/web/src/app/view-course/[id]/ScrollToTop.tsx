'use client';

import { useEffect } from 'react';

/**
 * Client component that ensures the page scrolls to top on mount
 * This fixes the issue where scroll position is preserved from previous pages
 */
export function ScrollToTop({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scroll to top immediately when component mounts
    window.scrollTo(0, 0);
    
    // Also reset scroll restoration to prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return <>{children}</>;
}