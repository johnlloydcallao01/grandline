"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CoursesResponse<TCourse> = {
  docs: TCourse[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPrevPage?: boolean;
};

export type CourseQueryParams = {
  status?: string;
  limit?: number;
  page?: number;
  category?: string;
  featured?: boolean;
  sort?: string;
};

export type UseCoursesOptions = CourseQueryParams & {
  enabled?: boolean;
  endpoint?: string;
  fetcher?: Fetcher;
  debug?: boolean;
};

export type UseCoursesReturn<TCourse> = {
  courses: TCourse[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  totalCourses: number;
  refetch: () => void;
  loadMore: () => void;
};

export type Fetcher = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
  }
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

const defaultFetcher: Fetcher = async (url, init) => {
  const f = globalThis.fetch;
  if (!f) {
    throw new Error("fetch is not available");
  }
  return (f as unknown as Fetcher)(url, init);
};

export function useCourses<TCourse = unknown>(options: UseCoursesOptions = {}): UseCoursesReturn<TCourse> {
  const {
    status = "published",
    limit = 10,
    page = 1,
    category,
    featured,
    sort,
    enabled = true,
    endpoint = "/api/courses",
    fetcher = defaultFetcher,
    debug = false,
  } = options;

  const fetcherRef = useRef<Fetcher>(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const [courses, setCourses] = useState<TCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCourses = useCallback(
    async (pageToFetch: number, replace: boolean, showLoading: boolean) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);

        const Params = globalThis.URLSearchParams;
        if (!Params) {
          throw new Error("URLSearchParams is not available");
        }

        const params = new Params({
          status,
          limit: String(limit),
          page: String(pageToFetch),
        });
        if (typeof category === "string" && category.length > 0) {
          params.set("course-category", category);
        }
        if (featured) {
          params.set("featured", "true");
        }
        if (typeof sort === "string" && sort.length > 0) {
          params.set("sort", sort);
        }

        const fullUrl = `${endpoint}?${params.toString()}`;
        if (debug) console.log("\ud83d\udd0d COURSES: Fetching from:", fullUrl);

        const response = await fetcherRef.current(fullUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (debug) console.log("\ud83d\udce1 COURSES: Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        const data = (await response.json()) as CoursesResponse<TCourse>;

        setCourses((prev) => (replace ? data.docs || [] : [...prev, ...(data.docs || [])]));
        setTotalCourses(data.totalDocs || 0);
        setHasMore(Boolean(data.hasNextPage));
        setCurrentPage(typeof data.page === "number" && Number.isFinite(data.page) ? data.page : pageToFetch);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch courses";
        if (debug) console.log("\u274c COURSES: Error fetching courses:", msg);
        setError(msg);
        if (replace) {
          setCourses([]);
          setTotalCourses(0);
          setHasMore(false);
          setCurrentPage(1);
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [status, limit, category, featured, sort, endpoint, debug]
  );

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    fetchCourses(page, true, true);
  }, [enabled, page, fetchCourses]);

  const loadMore = useCallback(async () => {
    if (!enabled) return;
    if (isLoading || isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = Math.max(1, currentPage) + 1;
      await fetchCourses(nextPage, false, false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [enabled, isLoading, isLoadingMore, hasMore, currentPage, fetchCourses]);

  return {
    courses,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    totalCourses,
    refetch: () => fetchCourses(page, true, true),
    loadMore,
  };
}

export function useFeaturedCourses<TCourse = unknown>(
  limit: number = 8,
  options?: Omit<UseCoursesOptions, "featured" | "limit"> & { enabled?: boolean }
): UseCoursesReturn<TCourse> {
  return useCourses<TCourse>({
    status: "published",
    limit,
    featured: true,
    enabled: options?.enabled,
    endpoint: options?.endpoint,
    fetcher: options?.fetcher,
    debug: options?.debug,
    category: options?.category,
    sort: options?.sort,
  });
}
