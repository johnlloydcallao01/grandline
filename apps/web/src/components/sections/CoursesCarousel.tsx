"use client"
import React, { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
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
    <Link href={`/view-course/${course.id}`} scroll className="w-64 flex-shrink-0 block">
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
    </Link>
  )
}

export function CoursesCarousel({ courses, isLoading = false, skeletonCount = 8, title = 'Available Courses' }: { courses: Course[]; isLoading?: boolean; skeletonCount?: number; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [startTranslateX, setStartTranslateX] = useState(0)
  const [lastTime, setLastTime] = useState(0)
  const [velocityX, setVelocityX] = useState(0)
  const [maxTranslate, setMaxTranslate] = useState(0)
  const animationRef = useRef<number | null>(null)

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

  const animateToPosition = useCallback((targetX: number, duration = 400) => {
    const start = translateX
    const distance = targetX - start
    const startTs = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTs
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const curr = start + distance * easeOut
      setTranslateX(curr)
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      }
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    step()
  }, [translateX])

  const onStart = useCallback((clientX: number) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
    setStartTranslateX(translateX)
    setLastTime(Date.now())
    setVelocityX(0)
  }, [translateX])

  const onMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const now = Date.now()
    const dt = now - lastTime
    const dx = clientX - currentX
    if (dt > 0) setVelocityX(dx / dt)
    setCurrentX(clientX)
    setLastTime(now)
    const dragDistance = clientX - startX
    const newTranslateX = startTranslateX + dragDistance
    let bounded = newTranslateX
    if (newTranslateX > 0) {
      bounded = newTranslateX * 0.3
    } else if (newTranslateX < -maxTranslate) {
      const overflow = newTranslateX + maxTranslate
      bounded = -maxTranslate + overflow * 0.3
    }
    setTranslateX(bounded)
  }, [isDragging, lastTime, currentX, startX, startTranslateX, maxTranslate])

  const onEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const momentum = velocityX * 200
    let final = translateX + momentum
    final = Math.max(-maxTranslate, Math.min(0, final))
    animateToPosition(final, 400)
  }, [isDragging, velocityX, translateX, maxTranslate, animateToPosition])

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

  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: MouseEvent) => onMove(e.clientX)
    const handleUp = () => onEnd()
    document.addEventListener("mousemove", handleMove, { passive: false })
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [isDragging, onMove, onEnd])

  if (isLoading) {
    return (
      <div className="lg:hidden p-[10px]">
        <div className="mb-[10px]">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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
      <div className="mb-[10px]">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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
          {courses.filter((c) => c.status === 'published').map((course) => (
            <div key={course.id} className="flex-shrink-0" style={{ pointerEvents: "auto" }}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
