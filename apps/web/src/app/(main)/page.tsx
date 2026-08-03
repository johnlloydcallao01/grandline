import React, { Suspense } from "react";
import { HeroSection } from "@/components/sections";
import { HomeCoursesSection } from "@/components/sections/HomeCoursesSection";

export default function Home() {
  return (
    <div className="bg-[var(--background)] lg:min-h-screen home-no-min">
      <HeroSection />
      <Suspense fallback={null}>
        <HomeCoursesSection />
      </Suspense>
    </div>
  );
}
