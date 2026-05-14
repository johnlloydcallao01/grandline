import {
  aboutPageDescription,
  aboutPageTitle,
} from "@encreasl/ui/about-content";
import { AboutPageContent } from "@encreasl/ui/about-page-content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <div className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[var(--card-background)]">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {aboutPageTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {aboutPageDescription}
            </p>
          </div>
        </div>
      </div>

      <AboutPageContent variant="app" />
    </div>
  );
}
