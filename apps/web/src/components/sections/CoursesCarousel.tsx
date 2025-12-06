"use client"
import React, { useRef, useState, useEffect, useCallback } from "react"
import type { Course } from "@/types/course"

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

function CourseCard({ course }: { course: Course }) {
  const media = course.thumbnail
  const imageUrl = media?.cloudinaryURL || media?.url || media?.thumbnailURL || null
  const altText = media?.alt || `${course.title} thumbnail`

  return (
    <a href={`/view-course/${course.id}`} className="w-64 flex-shrink-0 block">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = "none"
              t.nextElementSibling?.classList.remove("hidden")
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${imageUrl ? "hidden" : ""}`}>
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Course Image</p>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{course.title}</h3>
        {course.excerpt ? (
          <p className="text-sm text-gray-600 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{course.excerpt}</p>
        ) : null}
      </div>
    </a>
  )
}

export function CoursesCarousel({ courses, isLoading = false, skeletonCount = 8 }: { courses: Course[]; isLoading?: boolean; skeletonCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startTranslate, setStartTranslate] = useState(0)
  const [maxTranslate, setMaxTranslate] = useState(0)
  const [lastX, setLastX] = useState(0)
  const [lastTime, setLastTime] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const rafRef = useRef<number | null>(null)

  const clamp = useCallback((x: number) => {
    return Math.max(-maxTranslate, Math.min(0, x))
  }, [maxTranslate])

  const measure = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return
    const containerWidth = containerRef.current.getBoundingClientRect().width
    const contentWidth = trackRef.current.scrollWidth
    const max = Math.max(0, contentWidth - containerWidth)
    setMaxTranslate(max)
    setTranslateX((x) => clamp(x))
  }, [clamp])

  useEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [measure, courses.length])

  const onStart = useCallback((clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setStartTranslate(translateX)
    setLastX(clientX)
    setLastTime(Date.now())
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [translateX])

  const onMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const dx = clientX - startX
    const next = clamp(startTranslate + dx)
    setTranslateX(next)
    const now = Date.now()
    const dt = Math.max(1, now - lastTime)
    const vx = (clientX - lastX) / dt
    setVelocity(vx)
    setLastX(clientX)
    setLastTime(now)
  }, [isDragging, startX, startTranslate, clamp, lastTime, lastX])

  const onEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const friction = 0.92
    const step = () => {
      const v = velocity * 16
      const next = clamp(translateX + v)
      setTranslateX(next)
      const nv = velocity * friction
      setVelocity(nv)
      if (Math.abs(nv) > 0.001 && next !== 0 && next !== -maxTranslate) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [isDragging, velocity, translateX, clamp, maxTranslate])

  const onMouseDown = (e: React.MouseEvent) => {
    onStart(e.clientX)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) onMove(e.clientX)
  }
  const onMouseUp = () => {
    onEnd()
  }
  const onMouseLeave = () => {
    if (isDragging) onEnd()
  }
  const onTouchStart = (e: React.TouchEvent) => {
    onStart(e.touches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    onMove(e.touches[0].clientX)
  }
  const onTouchEnd = () => {
    onEnd()
  }

  if (isLoading) {
    return (
      <div className="lg:hidden p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
          <p className="text-gray-600">Explore our published courses</p>
        </div>
        <div className="overflow-hidden" ref={containerRef}>
          <div className="flex gap-4" ref={trackRef} style={{ transform: `translateX(${translateX}px)` }}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:hidden p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Available Courses</h2>
        <p className="text-gray-600">Explore our published courses</p>
      </div>
      <div
        className="overflow-hidden select-none"
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex gap-4 will-change-transform" ref={trackRef} style={{ transform: `translateX(${translateX}px)` }}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  )
}

