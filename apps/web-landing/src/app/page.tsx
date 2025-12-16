"use client";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useFeaturedCourses } from "@encreasl/ui/courses-hooks";
import { CourseCard, type CourseCardCourse } from "@encreasl/ui/course-card";

type LandingCourse = CourseCardCourse;

export default function Home() {
  const { courses, isLoading, error } = useFeaturedCourses<LandingCourse>(6);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-[#201a7c]/10 text-[#201a7c] rounded-full text-sm font-medium mb-4">
              Featured Courses
            </div>
            <h2 className="heading-primary text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
              Explore Our
              <span className="text-[#201a7c]"> Featured Courses</span>
            </h2>
          </div>

          {error ? (
            <div className="text-center text-gray-600">{error}</div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
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
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    href={`https://app.grandlinemaritime.com/view-course/${course.id}`}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/courses" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
                  <span>View All</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </main>
  );
}
