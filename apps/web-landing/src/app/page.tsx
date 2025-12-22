import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";
import { FeaturedCoursesClient } from "@/components/FeaturedCourses";
import { fetchCoursesServer, fetchTotalCoursesCount, type Course } from "@/lib/server-fetch-courses";
import Link from "next/link";

/**
 * Home page - Server-Side Rendered for SEO optimization
 * Courses are fetched on the server and rendered into HTML like WordPress
 */
export default async function Home() {
  let courses: Course[] = [];
  let error: string | null = null;
  let totalCoursesCount = 0;

  try {
    // Fetch both featured courses and total count in parallel
    const [coursesResponse, totalCount] = await Promise.all([
      fetchCoursesServer({
        status: "published",
        limit: 6,
        featured: true,
      }),
      fetchTotalCoursesCount(),
    ]);
    courses = coursesResponse.docs;
    totalCoursesCount = totalCount;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch courses";
    console.error("Error fetching courses:", error);
  }

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
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-600">No featured courses available</div>
          ) : (
            <>
              <FeaturedCoursesClient courses={courses} />
              {totalCoursesCount > 6 && (
                <div className="text-center mt-12">
                  <Link href="/courses" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
                    <span>View All</span>
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Features />
      <Stats />
      <Footer />
    </main>
  );
}
