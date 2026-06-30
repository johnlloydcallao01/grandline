import React, { Suspense } from "react";
import { HeroSection } from "@/components/sections";
import { HomeCoursesSection } from "@/components/sections/HomeCoursesSection";
import { getCourseCategories } from "@/server";
import { fetchPortalCourses } from "@/app/portal/courses/actions";
import { HomePageSkeleton } from "@/components/skeletons";

async function HomeCoursesContent() {
  const [categories, enrollments] = await Promise.all([
    getCourseCategories(50),
    fetchPortalCourses(),
  ]);
  return <HomeCoursesSection categories={categories} enrollments={enrollments} />;
}

export default function Home() {
  return (
    <div className="bg-[var(--background)] lg:min-h-screen home-no-min">
      <HeroSection />
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeCoursesContent />
      </Suspense>
    </div>
  );
}
