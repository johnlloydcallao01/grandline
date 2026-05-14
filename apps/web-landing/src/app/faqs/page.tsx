import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQsPageContent } from "@encreasl/ui/faqs-page-content";

export default function FAQSPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">Frequently Asked</span> <span className="text-[#ab3b43]">Questions</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto mb-8">
              Find answers to common questions about our platform, courses, and services. 
            </p>
          </div>
        </div>
      </section>

      <FAQsPageContent />

      <Footer />
    </main>
  );
}
