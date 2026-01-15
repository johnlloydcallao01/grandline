"use client";

import { useCourses } from "@encreasl/ui/courses-hooks";
import { CourseCard, type CourseCardCourse } from "@encreasl/ui/course-card";
import { usePhysicsCarousel } from "@encreasl/ui/physics-carousel";
import type { CourseCategory } from "@encreasl/ui/course-categories-server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LandingCourse = CourseCardCourse;

function toCourseCardCourse(doc: unknown): LandingCourse | null {
  if (!doc || typeof doc !== "object") return null;

  const d = doc as Record<string, unknown>;
  const id = d.id as string | number | undefined;
  const title = d.title as string | undefined;

  if (id === undefined || typeof title !== "string" || title.length === 0) return null;

  const excerpt = typeof d.excerpt === "string" ? d.excerpt : null;
  const thumbnail = (d.thumbnail ?? null) as LandingCourse["thumbnail"];

  return {
    id,
    title,
    excerpt,
    thumbnail,
  };
}

function CategoryItem({
  name,
  icon,
  active,
  onClick,
}: {
  name: string;
  icon?: { cloudinaryURL?: string; url: string; alt?: string };
  active: boolean;
  onClick: () => void;
}) {
  const imageUrl = icon?.cloudinaryURL || icon?.url;
  const altText = icon?.alt || name;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center space-y-2 cursor-pointer select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden bg-gray-100 relative ${
          active ? "scale-110 shadow-lg ring-2 ring-[#201a7c]/40" : "hover:scale-105"
        }`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={altText} className="absolute inset-0 w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 text-xs font-medium">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <span
        className={`text-xs font-medium transition-colors text-center leading-tight ${
          active ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
        }`}
        style={{
          width: "72px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "break-word",
          hyphens: "auto",
        }}
      >
        {name}
      </span>
    </button>
  );
}

function CategoriesCarousel({
  categories,
  activeCategoryId,
  onCategoryChange,
}: {
  categories: CourseCategory[];
  activeCategoryId?: number;
  onCategoryChange: (id?: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const isUltraWide = viewportWidth >= 1500;
  const gapWidth = isUltraWide ? 56 : 48;

  const { translateX, isDragging, hasDragged, maxTranslate, scrollBy, onStart, onMove, onEnd } = usePhysicsCarousel({
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
                icon={cat.icon}
                active={activeCategoryId === cat.id}
                onClick={() => {
                  if (hasDragged) return;
                  onCategoryChange(cat.id);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CoursesClient({ categories }: { categories: CourseCategory[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = useMemo(() => {
    const v = searchParams.get("course-category");
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  }, [searchParams]);

  const { courses, isLoading, isLoadingMore, hasMore, loadMore, error } = useCourses<unknown>({
    status: "published",
    limit: 12,
    sort: "-updatedAt",
    category: typeof categoryId === "number" ? String(categoryId) : undefined,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const onCategoryChange = useCallback(
    (id?: number) => {
      const next = categoryId === id ? undefined : id;

      const params = new URLSearchParams(searchParams.toString());
      if (typeof next === "number") {
        params.set("course-category", String(next));
      } else {
        params.delete("course-category");
      }

      const qs = params.toString();
      router.replace(qs ? `/courses?${qs}` : "/courses", { scroll: false });
    },
    [categoryId, router, searchParams]
  );

  const cardCourses = useMemo(() => {
    const mapped: LandingCourse[] = [];
    for (const c of courses) {
      const m = toCourseCardCourse(c);
      if (m) mapped.push(m);
    }
    return mapped;
  }, [courses]);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">Explore</span> <span className="text-[#ab3b43]">Courses</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">Browse all available courses.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <CategoriesCarousel categories={categories} activeCategoryId={categoryId} onCategoryChange={onCategoryChange} />
          </div>

          {error ? <div className="text-center text-gray-600">{error}</div> : null}

          {!error && isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cardCourses.map((course) => (
                  <CourseCard key={course.id} course={course} href={`https://app.grandlinemaritime.com/view-course/${course.id}`} />
                ))}
              </div>

              <div ref={sentinelRef} className="h-1" />

              {hasMore || isLoadingMore ? (
                <div className="mt-10 flex items-center justify-center text-gray-600">
                  <i className={`fas ${isLoadingMore ? "fa-spinner fa-spin" : "fa-circle-notch"} mr-2`}></i>
                  <span>{isLoadingMore ? "Loading more..." : "Scroll to load more"}</span>
                </div>
              ) : (
                <div className="mt-10 text-center text-gray-500">You’ve reached the end.</div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
