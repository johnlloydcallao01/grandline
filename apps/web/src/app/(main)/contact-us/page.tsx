import {
  contactPageDescription,
  contactPageTitle,
} from '@encreasl/ui/contact-us-content';
import { ContactUsPageContent } from '@encreasl/ui/contact-us-page-content';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-12">
      <div className="border-b border-[var(--card-border)] bg-[var(--card-background)]">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {contactPageTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {contactPageDescription}
            </p>
          </div>
        </div>
      </div>

      <ContactUsPageContent variant="app" />
    </div>
  );
}
