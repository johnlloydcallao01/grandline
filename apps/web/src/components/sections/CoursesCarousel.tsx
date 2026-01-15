"use client"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { Course } from "@/types/course"
import { CourseCard } from "@encreasl/ui/course-card"
import { usePhysicsCarousel } from "@encreasl/ui/physics-carousel"
import { toggleWishlist, isCourseWishlisted } from "@/lib/wishlist"

function CourseCardSkeleton() {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="aspect-video bg-gray-200 rounded-lg animate-pulse mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  )
}

export function CoursesCarousel({ courses, isLoading = false, skeletonCount = 8, title = 'Available Courses', viewAllLink }: { courses: Course[]; isLoading?: boolean; skeletonCount?: number; title?: string; viewAllLink?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({})

  const { translateX, isDragging, onStart, onMove, onEnd } = usePhysicsCarousel({
    containerRef,
    trackRef,
    momentumMultiplier: 200,
    rubberBandFactor: 0.3,
    defaultAnimationDurationMs: 400,
    measureDeps: [courses.length, isLoading, skeletonCount]
  })

  useEffect(() => {
    let active = true

    async function loadWishlist() {
      try {
        const published = courses.filter((c) => c.status === "published")
        if (published.length === 0) {
          if (active) {
            setWishlistMap({})
          }
          return
        }

        const entries = await Promise.all(
          published.map(async (course) => {
            const id = String(course.id)
            const wishlisted = await isCourseWishlisted(course.id)
            return [id, wishlisted] as const
          })
        )

        if (!active) return

        const nextMap: Record<string, boolean> = {}
        for (const [id, wishlisted] of entries) {
          nextMap[id] = wishlisted
        }
        setWishlistMap(nextMap)
      } catch {
        if (active) {
          setWishlistMap({})
        }
      }
    }

    if (courses && courses.length > 0) {
      setWishlistMap({})
      loadWishlist()
    } else {
      setWishlistMap({})
    }

    return () => {
      active = false
    }
  }, [courses])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onStart(e.clientX)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) onMove(e.clientX)
  }
  const onMouseUp = () => {
    onEnd()
  }
  const onTouchStart = (e: React.TouchEvent) => {
    onStart(e.touches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) e.stopPropagation()
    onMove(e.touches[0].clientX)
  }
  const onTouchEnd = () => {
    onEnd()
  }

  if (isLoading && (!courses || courses.length === 0)) {
    return (
      <div className="lg:hidden p-[10px]">
        <div className="mb-[10px] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {viewAllLink && (
            <Link href={viewAllLink as any} className="lg:hidden text-gray-500 hover:text-gray-700">
              <i className="fa fa-chevron-right"></i>
            </Link>
          )}
        </div>
        <div
          className="overflow-hidden select-none"
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            className="flex gap-4"
            ref={trackRef}
            style={{ transform: `translateX(${translateX}px)`, willChange: "transform", pointerEvents: "none" }}
          >
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex-shrink-0" style={{ pointerEvents: "auto" }}>
                <CourseCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:hidden p-[10px]">
      <div className="mb-[10px] flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink as any} className="lg:hidden text-gray-500 hover:text-gray-700">
            <i className="fa fa-chevron-right"></i>
          </Link>
        )}
      </div>
      <div
        className="overflow-hidden select-none"
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="flex gap-4"
          ref={trackRef}
          style={{ transform: `translateX(${translateX}px)`, willChange: "transform", pointerEvents: "none" }}
        >
          {courses
            .filter((c) => c.status === "published")
            .map((course) => {
              const idKey = String(course.id)
              const isWishlisted = wishlistMap ? wishlistMap[idKey] ?? false : false

              return (
                <div key={course.id} className="flex-shrink-0" style={{ pointerEvents: "auto" }}>
                  <CourseCard
                    course={course}
                    variant="carousel"
                    isWishlisted={isWishlisted}
                    onToggleWishlist={async (courseId) => {
                      try {
                        const next = await toggleWishlist(courseId)
                        const key = String(courseId)
                        setWishlistMap((prev) => ({
                          ...prev,
                          [key]: next,
                        }))
                      } catch {
                        void 0
                      }
                    }}
                    renderLink={({ href, className, children }) => (
                      <Link href={href as any} scroll className={className}>
                        {children}
                      </Link>
                    )}
                  />
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
