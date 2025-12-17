"use client";

import { CourseCard, type CourseCardCourse } from "@encreasl/ui/course-card";

type FeaturedCoursesClientProps = {
    courses: CourseCardCourse[];
};

/**
 * Client component wrapper for featured courses section
 * This handles the interactive parts (wishlist) while keeping the initial render server-side
 */
export function FeaturedCoursesClient({ courses }: FeaturedCoursesClientProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    href={`https://app.grandlinemaritime.com/view-course/${course.id}`}
                />
            ))}
        </div>
    );
}
