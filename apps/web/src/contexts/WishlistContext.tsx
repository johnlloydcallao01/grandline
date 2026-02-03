'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchWishlist, toggleWishlist as toggleWishlistApi } from '@/lib/wishlist';

type WishlistMap = Record<string, boolean>;

type WishlistContextValue = {
  wishlistMap: WishlistMap;
  toggleWishlist: (courseId: string | number) => Promise<boolean>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'grandline_wishlist_state';

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [wishlistMap, setWishlistMap] = useState<WishlistMap>({});

  useEffect(() => {
    let active = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const next: WishlistMap = {};
          for (const id of parsed) {
            const key = String(id);
            if (key) {
              next[key] = true;
            }
          }
          if (active) {
            setWishlistMap(next);
          }
        }
      }
    } catch {
      void 0;
    }

    (async () => {
      try {
        const courses = await fetchWishlist();
        if (!active) return;
        const next: WishlistMap = {};
        for (const course of courses) {
          const key = String(course.id);
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

  useEffect(() => {
    try {
      const ids = Object.keys(wishlistMap).filter((key) => wishlistMap[key]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      void 0;
    }
  }, [wishlistMap]);

  const toggleWishlist = useCallback(
    async (courseId: string | number): Promise<boolean> => {
      const key = String(courseId);
      let optimisticNext = false;

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

