import { getCourseCategories } from "@encreasl/ui/course-categories-server";
import { CoursesClient } from "./CoursesClient";
import { Suspense } from "react";

export default async function CoursesPage() {
  const categories = await getCourseCategories(50);
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CoursesClient categories={categories} />
    </Suspense>
  );
}
