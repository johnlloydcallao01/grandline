import { BlogsPageContent } from "@encreasl/ui/blogs-page-content";
import { fetchActiveAssignedPostCategories } from "@encreasl/ui/blogs-data";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const categories = await fetchActiveAssignedPostCategories();

  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <div className="border-b border-[var(--card-border)] bg-[var(--card-background)]">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Blogs
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Stay informed with the latest insights, industry news, and expert
              advice on maritime training and career development.
            </p>
          </div>
        </div>
      </div>

      <BlogsPageContent categories={categories} variant="app" />
    </div>
  );
}
