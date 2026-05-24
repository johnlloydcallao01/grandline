'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  fetchWishlistState,
  toggleWishlist as toggleWishlistApi,
} from '@/lib/wishlist';

type WishlistMap = Record<string, boolean>;

type WishlistContextValue = {
  wishlistMap: WishlistMap;
  toggleWishlist: (courseId: string | number) => Promise<boolean>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [wishlistMap, setWishlistMap] = useState<WishlistMap>({});
  const stateVersionRef = useRef(0);

  useEffect(() => {
    let active = true;
    const requestVersion = stateVersionRef.current;

    (async () => {
      try {
        const data = await fetchWishlistState();
        if (!active || stateVersionRef.current !== requestVersion) return;
        const next: WishlistMap = {};
        for (const courseId of data.courseIds) {
          const key = String(courseId);
          if (key) {
            next[key] = true;
          }
        }
        if (active) {
          setWishlistMap(next);
        }
      } catch {
        if (active) {
          setWishlistMap((prev) => prev);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const toggleWishlist = useCallback(
    async (courseId: string | number): Promise<boolean> => {
      const key = String(courseId);
      let optimisticNext = false;
      stateVersionRef.current += 1;

      setWishlistMap((prev) => {
        const current = !!prev[key];
        optimisticNext = !current;
        const next: WishlistMap = { ...prev };
        if (optimisticNext) {
          next[key] = true;
        } else {
          delete next[key];
        }
        return next;
      });

      try {
        const serverNext = await toggleWishlistApi(courseId);
        setWishlistMap((prev) => {
          const next: WishlistMap = { ...prev };
          if (serverNext) {
            next[key] = true;
          } else {
            delete next[key];
          }
          return next;
        });
        return serverNext;
      } catch {
        setWishlistMap((prev) => {
          const next: WishlistMap = { ...prev };
          if (!optimisticNext) {
            next[key] = true;
          } else {
            delete next[key];
          }
          return next;
        });
        return !optimisticNext;
      }
    },
    []
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistMap,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
