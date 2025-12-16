"use client";

import { type DependencyList, type RefObject, useCallback, useEffect, useRef, useState } from "react";

export type UsePhysicsCarouselOptions = {
  containerRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  momentumMultiplier?: number;
  rubberBandFactor?: number;
  defaultAnimationDurationMs?: number;
  measureDeps?: DependencyList;
};

export function usePhysicsCarousel({
  containerRef,
  trackRef,
  momentumMultiplier = 200,
  rubberBandFactor = 0.3,
  defaultAnimationDurationMs = 400,
  measureDeps = [],
}: UsePhysicsCarouselOptions) {
  const [translateX, setTranslateXState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const translateXRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const startTranslateXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityXRef = useRef(0);

  const setTranslateX = useCallback((next: number) => {
    translateXRef.current = next;
    setTranslateXState(next);
  }, []);

  const clamp = useCallback((x: number) => Math.max(-maxTranslate, Math.min(0, x)), [maxTranslate]);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const style = window.getComputedStyle(container);
    const paddingLeft = Number.parseFloat(style.paddingLeft || "0") || 0;
    const paddingRight = Number.parseFloat(style.paddingRight || "0") || 0;

    const containerWidth = container.getBoundingClientRect().width - paddingLeft - paddingRight;
    const contentWidth = track.scrollWidth;
    const max = Math.max(0, contentWidth - containerWidth);

    setMaxTranslate(max);
    setTranslateX(clamp(translateXRef.current));
  }, [clamp, containerRef, trackRef, setTranslateX]);

  const animateTo = useCallback(
    (targetX: number, durationMs = defaultAnimationDurationMs) => {
      cancelAnimation();

      const start = translateXRef.current;
      const distance = targetX - start;
      const startTs = Date.now();

      const step = () => {
        const elapsed = Date.now() - startTs;
        const progress = Math.min(elapsed / durationMs, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const curr = start + distance * easeOut;
        setTranslateX(curr);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
        }
      };

      step();
    },
    [cancelAnimation, defaultAnimationDurationMs, setTranslateX]
  );

  const onStart = useCallback(
    (clientX: number) => {
      cancelAnimation();
      setIsDragging(true);
      startXRef.current = clientX;
      currentXRef.current = clientX;
      startTranslateXRef.current = translateXRef.current;
      lastTimeRef.current = Date.now();
      velocityXRef.current = 0;
    },
    [cancelAnimation]
  );

  const onMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const now = Date.now();
      const dt = now - lastTimeRef.current;
      const dx = clientX - currentXRef.current;
      if (dt > 0) velocityXRef.current = dx / dt;

      currentXRef.current = clientX;
      lastTimeRef.current = now;

      const dragDistance = clientX - startXRef.current;
      const next = startTranslateXRef.current + dragDistance;

      let bounded = next;
      if (next > 0) {
        bounded = next * rubberBandFactor;
      } else if (next < -maxTranslate) {
        const overflow = next + maxTranslate;
        bounded = -maxTranslate + overflow * rubberBandFactor;
      }

      setTranslateX(bounded);
    },
    [isDragging, maxTranslate, rubberBandFactor, setTranslateX]
  );

  const onEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const momentum = velocityXRef.current * momentumMultiplier;
    const target = clamp(translateXRef.current + momentum);
    animateTo(target, defaultAnimationDurationMs);
  }, [animateTo, clamp, defaultAnimationDurationMs, isDragging, momentumMultiplier]);

  const scrollBy = useCallback(
    (deltaPx: number, durationMs = defaultAnimationDurationMs) => {
      const target = clamp(translateXRef.current + deltaPx);
      animateTo(target, durationMs);
    },
    [animateTo, clamp, defaultAnimationDurationMs]
  );

  useEffect(() => {
    measure();
  }, [measure, ...measureDeps]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(container);
    ro.observe(track);

    return () => ro.disconnect();
  }, [containerRef, trackRef, measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => onMove(e.clientX);
    const handleUp = () => onEnd();
    document.addEventListener("mousemove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, onMove, onEnd]);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    translateX,
    isDragging,
    maxTranslate,
    measure,
    animateTo,
    scrollBy,
    onStart,
    onMove,
    onEnd,
  };
}

