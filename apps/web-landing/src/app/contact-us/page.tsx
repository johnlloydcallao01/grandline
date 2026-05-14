"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  contactHeroDescription,
  contactHeroTitle,
} from "@encreasl/ui/contact-us-content";
import { ContactUsPageContent } from "@encreasl/ui/contact-us-page-content";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">{contactHeroTitle.first}</span>{" "}
              <span className="text-[#ab3b43]">{contactHeroTitle.second}</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
              {contactHeroDescription}
            </p>
          </div>
        </div>
      </section>

      <ContactUsPageContent />

      <Footer />
    </main>
  );
}
