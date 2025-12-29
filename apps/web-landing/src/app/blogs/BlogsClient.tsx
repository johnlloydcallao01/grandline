"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePhysicsCarousel } from "@encreasl/ui/physics-carousel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

type BlogCategory = {
    id: number;
    name: string;
};

type BlogPostDoc = {
    id: number | string;
    title?: string;
    excerpt?: string | null;
    slug?: string;
    isFeatured?: boolean;
    featuredImage?: {
        cloudinaryURL?: string | null;
        url?: string | null;
        thumbnailURL?: string | null;
        alt?: string | null;
    } | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    category?: unknown;
};

type PostsResponse = {
    docs?: BlogPostDoc[];
    hasNextPage?: boolean;
    nextPage?: number | null;
    page?: number;
    totalPages?: number;
};

function getImageUrl(post: BlogPostDoc): string | null {
    const img = post.featuredImage;
    if (!img) return null;
    return img.cloudinaryURL || img.thumbnailURL || img.url || null;
}

function getPrimaryCategoryName(post: BlogPostDoc): string | null {
    const value = post.category as unknown;
    if (!Array.isArray(value) || value.length === 0) return null;
    const first = value[0] as any;
    if (first && typeof first === "object" && typeof first.name === "string") {
        return first.name;
    }
    return null;
}

function getDateLabel(post: BlogPostDoc): string | null {
    const raw = post.publishedAt || post.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function toSlug(post: BlogPostDoc): string {
    if (post.slug && post.slug.length > 0) return post.slug;
    if (typeof post.title === "string" && post.title.length > 0) {
        return post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    return String(post.id);
}

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
            className={`px-4 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                active
                    ? "bg-[#201a7c] text-white border-[#201a7c]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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

    const { translateX, isDragging, maxTranslate, scrollBy, onStart, onMove, onEnd } = usePhysicsCarousel({
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        onStart(e.clientX);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        onMove(e.clientX);
    };
    const handleMouseUp = () => {
        onEnd();
    };
    const handleTouchStart = (e: React.TouchEvent) => {
        onStart(e.touches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) e.stopPropagation();
        onMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => {
        onEnd();
    };

    return (
        <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm">
            {translateX < 0 && (
                <button
                    type="button"
                    onClick={scrollLeft}
                    className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Scroll left"
                >
                    <i className="fas fa-chevron-left text-gray-600"></i>
                </button>
            )}

            {translateX > -maxTranslate && (
                <button
                    type="button"
                    onClick={scrollRight}
                    className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Scroll right"
                >
                    <i className="fas fa-chevron-right text-gray-600"></i>
                </button>
            )}

            <div
                ref={containerRef}
                className="overflow-hidden px-4 py-4"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseMove={isDragging ? handleMouseMove : undefined}
                onMouseUp={isDragging ? handleMouseUp : undefined}
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
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex-shrink-0" style={{ pointerEvents: "auto" }}>
                            <CategoryItem
                                name={cat.name}
                                active={activeCategoryId === cat.id}
                                onClick={() => onCategoryChange(cat.id)}
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

    const { translateX, isDragging, maxTranslate, scrollBy, onStart, onMove, onEnd } = usePhysicsCarousel({
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        onStart(e.clientX);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        onMove(e.clientX);
    };
    const handleMouseUp = () => {
        onEnd();
    };
    const handleTouchStart = (e: React.TouchEvent) => {
        onStart(e.touches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) e.stopPropagation();
        onMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => {
        onEnd();
    };

    if (items.length === 0) return null;

    return (
        <div className="relative bg-white rounded-2xl pb-2.5 mb-2.5">
            {translateX < 0 && (
                <button
                    type="button"
                    onClick={scrollLeft}
                    className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Previous featured article"
                >
                    <i className="fas fa-chevron-left text-gray-600"></i>
                </button>
            )}

            {translateX > -maxTranslate && (
                <button
                    type="button"
                    onClick={scrollRight}
                    className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Next featured article"
                >
                    <i className="fas fa-chevron-right text-gray-600"></i>
                </button>
            )}

            <div
                ref={containerRef}
                className="overflow-hidden"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseMove={isDragging ? handleMouseMove : undefined}
                onMouseUp={isDragging ? handleMouseUp : undefined}
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
                    {items.map((enriched) => (
                        <div
                            key={enriched.post.id}
                            className="flex-shrink-0 w-full lg:w-[820px]"
                            style={{ pointerEvents: "auto" }}
                        >
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover mb-10 h-full">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
                                    <div className="relative h-52 lg:h-full min-h-[320px]">
                                        <Image
                                            src={
                                                enriched.imageUrl ||
                                                "https://images.pexels.com/photos/163726/belgium-antwerp-shipping-container-163726.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
                                            }
                                            alt={enriched.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-[#ab3b43] text-white px-4 py-2 rounded-lg text-sm font-medium">
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 lg:p-8 flex flex-col justify-center h-full">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                                            {enriched.categoryLabel ? (
                                                <>
                                                    <span className="text-[#201a7c] font-medium">
                                                        {enriched.categoryLabel}
                                                    </span>
                                                    <span>•</span>
                                                </>
                                            ) : null}
                                            {enriched.dateLabel ? <span>{enriched.dateLabel}</span> : null}
                                        </div>
                                        <h2 className="heading-primary text-2xl md:text-3xl text-gray-900 mb-3">
                                            {enriched.title}
                                        </h2>
                                        {enriched.excerpt ? (
                                            <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
                                                {enriched.excerpt}
                                            </p>
                                        ) : null}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                    GL
                                                </div>
                                                <span className="text-gray-700 text-sm font-medium">
                                                    Grandline Editorial Team
                                                </span>
                                            </div>
                                            <Link
                                            href={`/blogs/${enriched.slug}`}
                                            className="text-[#201a7c] hover:text-[#1a1569] font-medium inline-flex items-center gap-2"
                                            >
                                                Read Article
                                                <i className="fas fa-arrow-right"></i>
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

export function BlogsClient({ categories }: { categories: BlogCategory[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryId = useMemo(() => {
        const v = searchParams.get("post-category");
        const n = v ? Number(v) : NaN;
        return Number.isFinite(n) ? n : undefined;
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
            const params = new URLSearchParams(searchParams.toString());
            if (typeof next === "number") {
                params.set("post-category", String(next));
            } else {
                params.delete("post-category");
            }
            const qs = params.toString();
            router.replace(qs ? `/blogs?${qs}` : "/blogs", { scroll: false });
        },
        [categoryId, router, searchParams]
    );

    useEffect(() => {
        let cancelled = false;
        async function loadFeatured() {
            try {
                const params = new URLSearchParams();
                params.set("status", "published");
                params.set("limit", "24");
                params.set("page", "1");
                params.set("sort", "-publishedAt");
                params.set("featured", "true");
                const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" });
                if (!res.ok) return;
                const json = (await res.json()) as PostsResponse;
                if (cancelled) return;
                const docs = Array.isArray(json.docs) ? json.docs : [];
                setFeaturedPosts(docs);
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

                const baseParams = new URLSearchParams();
                baseParams.set("status", "published");
                baseParams.set("limit", "9");
                baseParams.set("page", "1");
                baseParams.set("sort", "-publishedAt");
                if (typeof categoryId === "number") {
                    baseParams.set("post-category", String(categoryId));
                }

                const res = await fetch(`/api/posts?${baseParams.toString()}`, { cache: "no-store" });
                if (!res.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const json = (await res.json()) as PostsResponse;
                if (cancelled) return;

                const docs = Array.isArray(json.docs) ? json.docs : [];

                setPosts(docs);
                const hasNext = Boolean(json.hasNextPage) || (json.totalPages ?? 1) > (json.page ?? 1);
                setHasMore(hasNext);
                setPage(json.page ?? 1);
            } catch (e) {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : "Failed to fetch posts");
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

            const params = new URLSearchParams();
            params.set("status", "published");
            params.set("limit", "9");
            params.set("page", String(nextPage));
            params.set("sort", "-publishedAt");
            if (typeof categoryId === "number") {
                params.set("post-category", String(categoryId));
            }

            const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" });
            if (!res.ok) {
                throw new Error("Failed to fetch posts");
            }
            const json = (await res.json()) as PostsResponse;
            const docs = Array.isArray(json.docs) ? json.docs : [];

            setPosts((prev) => [...prev, ...docs]);
            const hasNext = Boolean(json.hasNextPage) || (json.totalPages ?? nextPage) > (json.page ?? nextPage);
            setHasMore(hasNext);
            setPage(json.page ?? nextPage);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load more posts");
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, hasMore, isLoading, page]);

    const enrichedPosts = useMemo(
        () =>
            posts.map((post) => {
                const title = typeof post.title === "string" ? post.title : "";
                const excerpt = typeof post.excerpt === "string" ? post.excerpt : null;
                const imageUrl = getImageUrl(post);
                const categoryLabel = getPrimaryCategoryName(post);
                const dateLabel = getDateLabel(post);
                const slug = toSlug(post);
                return { post, title, excerpt, imageUrl, categoryLabel, dateLabel, slug };
            }),
        [posts]
    );

    const enrichedFeatured = useMemo(
        () =>
            featuredPosts.map((post) => {
                const title = typeof post.title === "string" ? post.title : "";
                const excerpt = typeof post.excerpt === "string" ? post.excerpt : null;
                const imageUrl = getImageUrl(post);
                const categoryLabel = getPrimaryCategoryName(post);
                const dateLabel = getDateLabel(post);
                const slug = toSlug(post);
                return { post, title, excerpt, imageUrl, categoryLabel, dateLabel, slug };
            }),
        [featuredPosts]
    );

    const allCategories: BlogCategory[] = useMemo(() => {
        const base = categories.slice();
        base.sort((a, b) => a.name.localeCompare(b.name));
        return base;
    }, [categories]);

    return (
        <main className="min-h-screen">
            <Header />

            <section className="pt-24 pb-16 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="heading-primary text-4xl md:text-6xl mb-6">
                            <span className="text-[#F5F5F5]">Our</span> <span className="text-[#ab3b43]">Blog</span>
                        </h1>
                        <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
                            Stay informed with the latest insights, industry news, and expert advice on maritime training and career
                            development.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {error ? <div className="text-center text-gray-600">{error}</div> : null}

                    {enrichedFeatured.length > 0 ? <FeaturedPostsCarousel items={enrichedFeatured} /> : null}

                    <div className="mt-5 mb-10">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="heading-secondary text-xl font-semibold text-gray-900">Categories</h2>
                            <button
                                type="button"
                                onClick={() => onCategoryChange(undefined)}
                                className={`text-sm font-medium px-3 py-1 rounded-full border ${
                                    typeof categoryId === "number"
                                        ? "text-gray-700 border-gray-300 hover:bg-gray-50"
                                        : "text-white bg-[#201a7c] border-[#201a7c]"
                                }`}
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

                    <section className="py-0 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0">
                            {isLoading && posts.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 animate-pulse"
                                        >
                                            <div className="aspect-video bg-gray-200 rounded-lg mb-3" />
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                                            <div className="h-3 bg-gray-200 rounded w-5/6" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                                        {enrichedPosts.map((item) => (
                                            <article
                                                key={item.post.id}
                                                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover h-full flex flex-col"
                                            >
                                                <div className="relative h-48">
                                                    <Image
                                                        src={
                                                            item.imageUrl ||
                                                            "https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop"
                                                        }
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="p-6 flex flex-col flex-1">
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                                        {item.categoryLabel ? (
                                                            <>
                                                                <span className="text-[#201a7c] font-medium">
                                                                    {item.categoryLabel}
                                                                </span>
                                                                <span>•</span>
                                                            </>
                                                        ) : null}
                                                        {item.dateLabel ? <span>{item.dateLabel}</span> : null}
                                                    </div>
                                                    <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-3 hover:text-[#201a7c] transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    {item.excerpt ? (
                                                        <p className="text-gray-600 mb-4 leading-relaxed">{item.excerpt}</p>
                                                    ) : null}
                                                    <div className="flex items-center justify-between text-sm mt-auto">
                                                        {item.dateLabel ? (
                                                            <span className="text-gray-500">{item.dateLabel}</span>
                                                        ) : (
                                                            <span />
                                                        )}
                                                        <Link
                                                            href={`/blogs/${item.slug}`}
                                                            className="text-[#201a7c] hover:text-[#1a1569] font-medium inline-flex items-center gap-1"
                                                        >
                                                            Read More
                                                            <i className="fas fa-arrow-right text-xs"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="text-center mt-12">
                                        {hasMore ? (
                                            <button
                                                type="button"
                                                onClick={loadMore}
                                                className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2 disabled:opacity-60"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin"></i>
                                                        <span>Loading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Load More Articles</span>
                                                        <i className="fas fa-chevron-down"></i>
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="text-gray-500">You’ve reached the end.</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </section>

            <Footer />
        </main>
    );
}
