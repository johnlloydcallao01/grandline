import type { Course } from '@/types/course';
import {
  fetchWishlist as serverFetchWishlist,
  getWishlistState as serverGetWishlistState,
  isCourseWishlisted as serverIsWishlisted,
  toggleWishlist as serverToggleWishlist,
} from '@/server/wishlist';

export type WishlistState = {
  items: Course[];
  courseIds: string[];
  totalDocs: number;
};

export async function fetchWishlistState(): Promise<WishlistState> {
  return serverGetWishlistState();
}

export async function fetchWishlist(): Promise<Course[]> {
  return serverFetchWishlist();
}

export async function isCourseWishlisted(courseId: string | number): Promise<boolean> {
  return serverIsWishlisted(courseId);
}

export async function toggleWishlist(courseId: string | number): Promise<boolean> {
  return serverToggleWishlist(courseId);
}
