"use client";

import type { Route } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getDateLabel,
  getImageUrl,
  getPrimaryCategoryName,
  toSlug,
  type BlogCategory,
  type BlogPostDoc,
  type PostsResponse,
} from "./blogs-data";
import { usePhysicsCarousel } from "./physics-carousel";

function CategoryItem({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer select-none whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
        active
          ? "border-[#201a7c] bg-[#201a7c] text-white dark:border-[#7b75ef] dark:bg-[#7b75ef]"
          : "border-[#201a7c]/30 bg-white text-[#201a7c] hover:bg-[#201a7c]/5 dark:border-[#7b75ef]/40 dark:bg-[var(--card-background)] dark:text-[#7b75ef] dark:hover:bg-[#7b75ef]/10"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {name}
    </button>
  );
}

function CategoriesCarousel({
  categories,
  activeCategoryId,
  onCategoryChange,
}: {
  categories: BlogCategory[];
  activeCategoryId?: number;
  onCategoryChange: (id?: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const isUltraWide = viewportWidth >= 1500;
  const gapWidth = isUltraWide ? 56 : 48;

  const {
    translateX,
    isDragging,
    hasDragged,
    maxTranslate,
    scrollBy,
    onStart,
    onMove,
    onEnd,
  } = usePhysicsCarousel({
    containerRef,
    trackRef,
    momentumMultiplier: 200,
    rubberBandFactor: 0.3,
    defaultAnimationDurationMs: 400,
    measureDeps: [categories.length, viewportWidth, gapWidth],
  });

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollLeft = () => scrollBy(180, 350);
  const scrollRight = () => scrollBy(-180, 350);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    onStart(event.clientX);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    onMove(event.clientX);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    onStart(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isDragging) event.stopPropagation();
    onMove(event.touches[0].clientX);
  };

  return (
    <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
      {translateX < 0 && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-background)] shadow-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 lg:flex"
          aria-label="Scroll left"
        >
          <i className="fas fa-chevron-left text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {translateX > -maxTranslate && (
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-background)] shadow-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 lg:flex"
          aria-label="Scroll right"
        >
          <i className="fas fa-chevron-right text-gray-600 dark:text-gray-300" />
        </button>
      )}

      <div
        ref={containerRef}
        className="overflow-hidden px-4 py-4"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={onEnd}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? onEnd : undefined}
        style={{ touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          ref={trackRef}
          className="flex select-none"
          style={{
            transform: `translateX(${translateX}px)`,
            columnGap: `${gapWidth}px`,
            rowGap: `${gapWidth}px`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0"
              style={{ pointerEvents: "auto" }}
            >
              <CategoryItem
                name={category.name}
                active={activeCategoryId === category.id}
                onClick={() => {
                  if (hasDragged) return;
                  onCategoryChange(category.id);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedPostsCarousel({
  items,
}: {
  items: {
    post: BlogPostDoc;
    title: string;
    excerpt: string | null;
    imageUrl: string | null;
    categoryLabel: string | null;
    dateLabel: string | null;
    slug: string;
  }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const isUltraWide = viewportWidth >= 1500;
  const gapWidth = isUltraWide ? 32 : 24;

  const { translateX, isDragging, maxTranslate, scrollBy, onStart, onMove, onEnd } =
    usePhysicsCarousel({
      containerRef,
      trackRef,
      momentumMultiplier: 200,
      rubberBandFactor: 0.3,
      defaultAnimationDurationMs: 400,
      measureDeps: [items.length, viewportWidth, gapWidth],
    });

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollLeft = () => scrollBy(260, 350);
  const scrollRight = () => scrollBy(-260, 350);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    onStart(event.clientX);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    onMove(event.clientX);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    onStart(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isDragging) event.stopPropagation();
    onMove(event.touches[0].clientX);
  };

  if (items.length === 0) return null;

  return (
    <div className="relative mb-2.5 rounded-2xl bg-white pb-2.5">
      {translateX < 0 && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 lg:flex"
          aria-label="Previous featured article"
        >
          <i className="fas fa-chevron-left text-gray-600" />
        </button>
      )}

      {translateX > -maxTranslate && (
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 lg:flex"
          aria-label="Next featured article"
        >
          <i className="fas fa-chevron-right text-gray-600" />
        </button>
      )}

      <div
        ref={containerRef}
        className="overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={onEnd}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? onEnd : undefined}
        style={{ touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          ref={trackRef}
          className="flex select-none"
          style={{
            transform: `translateX(${translateX}px)`,
            columnGap: `${gapWidth}px`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          {items.map((item) => (
            <div
              key={item.post.id}
              className="w-full flex-shrink-0 lg:w-[820px]"
              style={{ pointerEvents: "auto" }}
            >
              <div className="card-hover mb-10 h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-2">
                  <div className="relative h-52 min-h-[320px] lg:h-full">
                    <Image
                      src={
                        item.imageUrl ||
                        "https://images.pexels.com/photos/163726/belgium-antwerp-shipping-container-163726.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
                      }
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute left-4 top-4">
                      <span className="rounded-lg bg-[#ab3b43] px-4 py-2 text-sm font-medium text-white">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="flex h-full flex-col justify-center p-6 lg:p-8">
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
                      {item.categoryLabel ? (
                        <>
                          <span className="font-medium text-[#201a7c]">
                            {item.categoryLabel}
                          </span>
                          <span>&bull;</span>
                        </>
                      ) : null}
                      {item.dateLabel ? <span>{item.dateLabel}</span> : null}
                    </div>
                    <h2 className="heading-primary mb-3 text-2xl text-gray-900 md:text-3xl">
                      {item.title}
                    </h2>
                    {item.excerpt ? (
                      <p className="mb-4 text-sm leading-relaxed text-gray-600 md:text-base">
                        {item.excerpt}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#201a7c] to-[#ab3b43] text-xs font-semibold text-white">
                          GL
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Grandline Editorial Team
                        </span>
                      </div>
                      <Link
                        href={`/blogs/${item.slug}` as Route}
                        className="inline-flex items-center gap-2 font-medium text-[#201a7c] hover:text-[#1a1569]"
                      >
                        Read Article
                        <i className="fas fa-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogsPageContent({
  categories,
  variant = "landing",
}: {
  categories: BlogCategory[];
  variant?: "landing" | "app";
}) {
  const isAppVariant = variant === "app";
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = useMemo(() => {
    const value = searchParams.get("post-category");
    const parsed = value ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [searchParams]);

  const [featuredPosts, setFeaturedPosts] = useState<BlogPostDoc[]>([]);
  const [posts, setPosts] = useState<BlogPostDoc[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCategoryChange = useCallback(
    (id?: number) => {
      const next = categoryId === id ? undefined : id;
      const params = new globalThis.URLSearchParams(searchParams.toString());
      if (typeof next === "number") {
        params.set("post-category", String(next));
      } else {
        params.delete("post-category");
      }
      const qs = params.toString();
      router.replace((qs ? `/blogs?${qs}` : "/blogs") as Route, { scroll: false });
    },
    [categoryId, router, searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      try {
        const params = new globalThis.URLSearchParams();
        params.set("status", "published");
        params.set("limit", "24");
        params.set("page", "1");
        params.set("sort", "-publishedAt");
        params.set("featured", "true");
        const response = await globalThis.fetch(`/api/posts?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const json = (await response.json()) as PostsResponse;
        if (cancelled) return;
        setFeaturedPosts(Array.isArray(json.docs) ? json.docs : []);
      } catch {
        if (!cancelled) {
          setFeaturedPosts([]);
        }
      }
    }

    loadFeatured();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      try {
        setIsLoading(true);
        setError(null);
        setPage(1);

        const params = new globalThis.URLSearchParams();
        params.set("status", "published");
        params.set("limit", "9");
        params.set("page", "1");
        params.set("sort", "-publishedAt");
        if (typeof categoryId === "number") {
          params.set("post-category", String(categoryId));
        }

        const response = await globalThis.fetch(`/api/posts?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const json = (await response.json()) as PostsResponse;
        if (cancelled) return;

        const docs = Array.isArray(json.docs) ? json.docs : [];
        setPosts(docs);
        setHasMore(
          Boolean(json.hasNextPage) ||
            (json.totalPages ?? 1) > (json.page ?? 1),
        );
        setPage(json.page ?? 1);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
        setPosts([]);
        setHasMore(false);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;

    try {
      setIsLoading(true);
      setError(null);

      const params = new globalThis.URLSearchParams();
      params.set("status", "published");
      params.set("limit", "9");
      params.set("page", String(nextPage));
      params.set("sort", "-publishedAt");
      if (typeof categoryId === "number") {
        params.set("post-category", String(categoryId));
      }

      const response = await globalThis.fetch(`/api/posts?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const json = (await response.json()) as PostsResponse;
      const docs = Array.isArray(json.docs) ? json.docs : [];

      setPosts((current) => [...current, ...docs]);
      setHasMore(
        Boolean(json.hasNextPage) ||
          (json.totalPages ?? nextPage) > (json.page ?? nextPage),
      );
      setPage(json.page ?? nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more posts");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, hasMore, isLoading, page]);

  const enrichedPosts = useMemo(
    () =>
      posts.map((post) => ({
        post,
        title: typeof post.title === "string" ? post.title : "",
        excerpt: typeof post.excerpt === "string" ? post.excerpt : null,
        imageUrl: getImageUrl(post),
        categoryLabel: getPrimaryCategoryName(post),
        dateLabel: getDateLabel(post),
        slug: toSlug(post),
      })),
    [posts],
  );

  const enrichedFeatured = useMemo(
    () =>
      featuredPosts.map((post) => ({
        post,
        title: typeof post.title === "string" ? post.title : "",
        excerpt: typeof post.excerpt === "string" ? post.excerpt : null,
        imageUrl: getImageUrl(post),
        categoryLabel: getPrimaryCategoryName(post),
        dateLabel: getDateLabel(post),
        slug: toSlug(post),
      })),
    [featuredPosts],
  );

  const allCategories = useMemo(() => {
    const base = categories.slice();
    base.sort((a, b) => a.name.localeCompare(b.name));
    return base;
  }, [categories]);

  const outerClassName = isAppVariant ? "w-full px-[10px] py-6 md:py-8" : "";
  const contentClassName = isAppVariant
    ? "space-y-6"
    : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
  const categoriesTitleClassName = isAppVariant
    ? "text-xl font-semibold text-gray-900 dark:text-gray-100"
    : "heading-secondary text-xl font-semibold text-gray-900";
  const emptyStateClassName = isAppVariant
    ? "text-center text-gray-500 dark:text-gray-400"
    : "text-gray-500";

  return (
    <div className={outerClassName}>
      <section className={isAppVariant ? "" : "py-20 bg-white"}>
        <div className={contentClassName}>
          {error ? <div className="text-center text-gray-600">{error}</div> : null}

          {enrichedFeatured.length > 0 ? (
            <FeaturedPostsCarousel items={enrichedFeatured} />
          ) : null}

          <div className="mb-10 mt-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className={categoriesTitleClassName}>Categories</h2>
              <button
                type="button"
                onClick={() => onCategoryChange(undefined)}
                className="rounded-full border border-[#201a7c] bg-[#201a7c] px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-[#1a1569] dark:border-[#201a7c] dark:bg-[#201a7c] dark:text-white dark:hover:bg-[#1a1569]"
              >
                All Posts
              </button>
            </div>

            <CategoriesCarousel
              categories={allCategories}
              activeCategoryId={categoryId}
              onCategoryChange={onCategoryChange}
            />
          </div>

          <section className={isAppVariant ? "" : "bg-gray-50 py-0"}>
            <div className={isAppVariant ? "" : "max-w-7xl mx-auto px-0 sm:px-0 lg:px-0"}>
              {isLoading && posts.length === 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-lg"
                    >
                      <div className="mb-3 aspect-video rounded-lg bg-gray-200" />
                      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                      <div className="mb-1 h-3 w-full rounded bg-gray-200" />
                      <div className="h-3 w-5/6 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {enrichedPosts.map((item) => (
                      <article
                        key={item.post.id}
                        className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
                      >
                        <div className="relative h-48">
                          <Image
                            src={
                              item.imageUrl ||
                              "https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop"
                            }
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-3 flex items-center gap-3 text-sm text-gray-600">
                            {item.categoryLabel ? (
                              <>
                                <span className="font-medium text-[#201a7c]">
                                  {item.categoryLabel}
                                </span>
                                <span>&bull;</span>
                              </>
                            ) : null}
                            {item.dateLabel ? <span>{item.dateLabel}</span> : null}
                          </div>
                          <h3 className="heading-secondary mb-3 text-xl font-semibold text-gray-900 transition-colors hover:text-[#201a7c]">
                            {item.title}
                          </h3>
                          {item.excerpt ? (
                            <p className="mb-4 leading-relaxed text-gray-600">
                              {item.excerpt}
                            </p>
                          ) : null}
                          <div className="mt-auto flex items-center justify-between text-sm">
                            {item.dateLabel ? (
                              <span className="text-gray-500">{item.dateLabel}</span>
                            ) : (
                              <span />
                            )}
                            <Link
                              href={`/blogs/${item.slug}` as Route}
                              className="inline-flex items-center gap-1 font-medium text-[#201a7c] hover:text-[#1a1569]"
                            >
                              Read More
                              <i className="fas fa-arrow-right text-xs" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-12 text-center">
                    {hasMore ? (
                      <button
                        type="button"
                        onClick={loadMore}
                        className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg disabled:opacity-60"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Articles</span>
                            <i className="fas fa-chevron-down" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className={emptyStateClassName}>You've reached the end.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
