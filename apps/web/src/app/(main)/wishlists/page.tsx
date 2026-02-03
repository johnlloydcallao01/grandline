'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/types/course';
import { CourseCard } from '@encreasl/ui/course-card';
import { fetchWishlist, toggleWishlist } from '@/lib/wishlist';

function WishlistCardSkeleton() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        <div className="w-full h-full bg-gray-300"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export default function WishlistsPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const courses = await fetchWishlist();
        if (active) {
          setItems(courses);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-[10px]">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlists</h1>
                {isLoading ? (
                  <div className="mt-3 h-4 w-48 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <p className="mt-2 text-gray-600">
                    {items.length === 0
                      ? 'No courses saved yet'
                      : `${items.length} courses saved for later`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[10px] py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <WishlistCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fa fa-heart text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding courses you&apos;re interested in!</p>
            <Link
              href="/courses/available"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isWishlisted
                variant="grid"
                onToggleWishlist={async (courseId) => {
                  try {
                    const next = await toggleWishlist(courseId);
                    if (!next) {
                      setItems((prev) =>
                        prev.filter((c) => String(c.id) !== String(courseId))
                      );
                    }
                  } catch {
                    void 0;
                  }
                }}
                renderLink={({ href, className, children }) => (
                  <Link href={href as any} scroll className={className}>
                    {children}
                  </Link>
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
