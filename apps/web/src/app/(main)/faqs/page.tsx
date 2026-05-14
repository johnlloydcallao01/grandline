import { FAQsPageContent } from '@encreasl/ui/faqs-page-content';

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <div className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[var(--card-background)]">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Find quick answers about our courses, enrollment process, and support options.
            </p>
          </div>
        </div>
      </div>

      <FAQsPageContent variant="app" />
    </div>
  );
}
