import {
  termsPageDescription,
  termsPageTitle,
} from "@encreasl/ui/terms-content";
import { TermsPageContent } from "@encreasl/ui/terms-page-content";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <div className="border-b border-[var(--card-border)] bg-[var(--card-background)]">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {termsPageTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {termsPageDescription}
            </p>
          </div>
        </div>
      </div>

      <TermsPageContent variant="app" />
    </div>
  );
}
