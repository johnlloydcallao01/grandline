"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ViewCourseClient from './ViewCourseClient';
import type { CourseWithInstructor } from '@/types/course';

export default function ViewCoursePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [course, setCourse] = useState<CourseWithInstructor | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof history !== 'undefined' && (history as any).scrollRestoration !== undefined) {
        (history as any).scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        let userIdParam: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('grandline_auth_user');
            if (raw) {
              const parsed = JSON.parse(raw) as { id?: string | number } | null;
              const value = parsed && parsed.id;
              if (value !== undefined && value !== null) {
                userIdParam = String(value);
              }
            }
          } catch {
            void 0;
          }
        }

        const params = new URLSearchParams();
        if (userIdParam) {
          params.set('userId', userIdParam);
        }

        const url =
          params.toString().length > 0
            ? `/api/courses/${id}?${params.toString()}`
            : `/api/courses/${id}`;

        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) {
          if (active) {
            setError('Failed to load course');
            setCourse(null);
            setEnrollmentStatus(null);
          }
          return;
        }
        const data = await res.json() as CourseWithInstructor & { enrollmentStatus?: string | null };
        if (active) {
          setCourse(data);
          const status =
            data && typeof data.enrollmentStatus === 'string'
              ? data.enrollmentStatus
              : null;
          setEnrollmentStatus(status);
        }
      } catch {
        if (active) {
          setError('Network error');
          setCourse(null);
          setEnrollmentStatus(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    if (id) fetchCourse();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full px-[10px] md:px-[15px] pt-4 pb-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-full bg-gray-50">
          <div className="max-w-7xl px-2.5 md:px-4 py-6">
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full px-[10px] py-10 text-center text-gray-600">Course not available</div>
      </div>
    );
  }

  return <ViewCourseClient course={course} initialEnrollmentStatus={enrollmentStatus} />;
}
